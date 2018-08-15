import Product from './components/product';
import Modal from './components/modal';
import ProductSet from './components/product-set';
import Cart from './components/cart';
import CartToggle from './components/toggle';
import Tracker from './utils/track';
import hostStyles from './styles/host/host';
import conditionalStyles from './styles/host/conditional';
import throttle from './utils/throttle';
import browserFeatures from './utils/detect-features';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
const ESC_KEY = 27;

/** Initializes and coordinates components. */
export default class UI {

  /**
   * create a UI instance
   * @param {Object} client - Instance of ShopifyBuy Client
   * @param {Object} integrations - optional tracker and logger integrations
   * @param {String} styleOverrides - additional CSS to be added to _host_ style tag
   */
  constructor(client, integrations = {}, styleOverrides = '') {
    this.client = client;
    this.config = {};
    this.config.domain = this.client.config.domain;
    this.iframeComponents = [];
    this.components = {
      product: [],
      cart: [],
      collection: [],
      productSet: [],
      modal: [],
      toggle: [],
    };
    this.componentTypes = {
      product: Product,
      cart: Cart,
      collection: ProductSet,
      productSet: ProductSet,
      toggle: CartToggle,
    };
    this.errorReporter = integrations.errorReporter;
    this.tracker = new Tracker(integrations.tracker, this.config);
    this.styleOverrides = styleOverrides;
    this.tracker.trackPageview();
    this.activeEl = null;
    this._appendStyleTag();
    this._bindResize();
    this._bindHostClick();
    this._bindEsc(window);
    this._bindPostMessage();
  }

  /**
   * create a component of a type.
   * @param {String} type - one of 'product', 'productSet', 'collection', 'cart'.
   * @param {Object} config - configuration object
   * @return {Promise} resolves to instance of newly created component.
   */
  createComponent(type, config) {
    config.node = config.node || this._queryEntryNode();
    const component = new this.componentTypes[type](config, this.componentProps);
    if (component.iframe) {
      this._bindEsc(component.iframe.el.contentWindow || component.iframe.el);
    }
    this.components[type].push(component);
    return component.init().then(() => {
      this.trackComponent(type, component);
      return component;
    }).catch((error) => {
      if (this.errorReporter) {
        this.errorReporter.notifyException(error);
      }

      // eslint-disable-next-line
      console.error(error);
    });
  }

  trackComponent(type, component) {
    if (type === 'productSet') {
      component.trackingInfo.forEach((product) => {
        this.tracker.trackComponent('product', product);
      });
    } else {
      this.tracker.trackComponent(type, component.trackingInfo);
    }
  }

  /**
   * destroy a component
   * @param {String} type - one of 'product', 'productSet', 'collection', 'cart'.
   * @param {Number} id - ID of the component's model.
   */
  destroyComponent(type, id) {
    this.components[type].forEach((component, index) => {
      if (id && !component.model.id === id) {
        return;
      }
      this.components[type][index].destroy();
      this.components[type].splice(index, 1);
    });
  }

  /**
   * create a cart object to be shared between components.
   * @param {Object} config - configuration object.
   * @return {Promise} a promise which resolves once the cart has been initialized.
   */
  createCart(config) {
    if (this.components.cart.length) {
      if (config.toggles && config.toggles.length > this.components.cart[0].toggles.length) {
        return this.components.cart[0].createToggles(config).then(() => {
          return this.components.cart[0];
        });
      }
      return Promise.resolve(this.components.cart[0]);
    } else {
      const cart = new Cart(config, this.componentProps);
      this.components.cart.push(cart);
      return cart.init();
    }
  }

  /**
   * close any cart.
   */
  closeCart() {
    if (!this.components.cart.length) {
      return;
    }
    this.components.cart.forEach((cart) => {
      if (!cart.isVisible) {
        return;
      }
      cart.close();
      this.restoreFocus();
    });
  }

  /**
   * open any cart.
   */
  openCart() {
    if (this.components.cart.length) {
      this.components.cart.forEach((cart) => {
        cart.open();
      });
    }
  }

  /**
   * toggle visibility of cart.
   * @param {Boolean} [visibility] - desired state of cart.
   */
  toggleCart(visibility) {
    if (this.components.cart.length) {
      this.components.cart.forEach((cart) => {
        cart.toggleVisibility(visibility);
      });
    }
    if (!visibility) {
      this.restoreFocus();
    }
  }

  /**
   * create a modal object to be shared between components.
   * @param {Object} config - configuration object.
   * @return {Modal} a Modal instance.
   */
  createModal(config) {
    if (this.components.modal.length) {
      return this.components.modal[0];
    } else {
      const modal = new Modal(config, this.componentProps);
      this.components.modal.push(modal);
      return modal;
    }
  }

  setActiveEl(el) {
    this.activeEl = el;
  }

  /**
   * close any modals.
   */
  closeModal() {
    if (!this.components.modal.length) {
      return;
    }
    this.components.modal.forEach((modal) => modal.close());
    this.restoreFocus();
  }

  get modalOpen() {
    return this.components.modal.reduce((isOpen, modal) => {
      return isOpen || modal.isVisible;
    }, false);
  }

  get cartOpen() {
    return this.components.cart.reduce((isOpen, cart) => {
      return isOpen || cart.isVisible;
    }, false);
  }

  restoreFocus() {
    if (this.activeEl && !this.modalOpen && !this.cartOpen) {
      this.activeEl.focus();
    }
  }

  /**
   * get properties to be passed to any component.
   * @return {Object} props object.
   */
  get componentProps() {
    return {
      client: this.client,
      createCart: this.createCart.bind(this),
      closeCart: this.closeCart.bind(this),
      toggleCart: this.toggleCart.bind(this),
      createModal: this.createModal.bind(this),
      closeModal: this.closeModal.bind(this),
      setActiveEl: this.setActiveEl.bind(this),
      destroyComponent: this.destroyComponent.bind(this),
      tracker: this.tracker,
      errorReporter: this.errorReporter,
      browserFeatures,
    };
  }

  /**
   * get string of CSS to be inserted into host style tag.
   */
  get styleText() {
    if (browserFeatures.transition && browserFeatures.transform && browserFeatures.animation) {
      return hostStyles + this.styleOverrides;
    }
    return hostStyles + conditionalStyles + this.styleOverrides;
  }

  _queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];

    const div = document.createElement('div');

    if (this.entry) {
      const parentNode = this.entry.parentNode;
      if (parentNode.tagName === 'HEAD' || parentNode.tagName === 'HTML') {
        this._appendToBody(div);
      } else {
        this.entry.removeAttribute(DATA_ATTRIBUTE);
        parentNode.insertBefore(div, this.entry);
      }
    } else {
      this._appendToBody(div);
    }
    return div;
  }

  _appendToBody(el) {
    if (!document.body) {
      document.body = document.createElement('body');
    }
    document.body.appendChild(el);
  }

  _appendStyleTag() {
    const styleTag = document.createElement('style');
    if (styleTag.styleSheet) {
      styleTag.styleSheet.cssText = this.styleText;
    } else {
      styleTag.appendChild(document.createTextNode(this.styleText));
    }
    document.head.appendChild(styleTag);
  }

  _bindHostClick() {
    document.addEventListener('click', (evt) => {
      if (this.components.cart.length < 1) {
        return;
      }
      const cartNode = this.components.cart[0].node;
      if (evt.target === cartNode || cartNode.contains(evt.target)) {
        return;
      }
      this.closeCart();
    });
  }

  _bindResize() {
    throttle('resize', 'safeResize');
    window.addEventListener('safeResize', () => {
      this.components.collection.forEach((collection) => collection.view.resize());
      this.components.productSet.forEach((set) => set.view.resize());
      this.components.product.forEach((product) => product.view.resize());
    });
  }

  _bindEsc(context) {
    context.addEventListener('keydown', (evt) => {
      if (evt.keyCode !== ESC_KEY) {
        return;
      }
      this.closeModal();
      this.closeCart();
    });
  }

  _bindPostMessage() {
    window.addEventListener('message', (msg) => {
      let data;
      try {
        data = JSON.parse(msg.data);
      } catch (err) {
        data = {};
      }
      if (data.syncCart || (data.current_checkout_page && data.current_checkout_page === '/checkout/thank_you')) {
        location.reload();
      }
    });
  }
}
