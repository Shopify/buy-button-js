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
    this.tracker = new Tracker(integrations.tracker);
    this.styleOverrides = styleOverrides;
    this.tracker.trackPageview();
    this._appendStyleTag();
    this._bindResize();
    this._bindHostClick();
    this._bindEsc();
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
    this.components[type].push(component);
    return component.init();
  }

  /**
   * destroy a component
   * @param {String} type - one of 'product', 'productSet', 'collection', 'cart'.
   * @param {Number} id - ID of the component's model.
   */
  destroyComponent(type, id) {
    this.components[type].forEach((component, index) => {
      if (!component.model.id === id) {
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
    if (this.components.cart.length) {
      this.components.cart.forEach((cart) => {
        if (cart.isVisible) {
          cart.close();
        }
      });
    }
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

  /**
   * close any modals.
   */
  closeModal() {
    if (this.components.modal.length) {
      this.components.modal.forEach((modal) => modal.close());
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
    this.entry.removeAttribute(DATA_ATTRIBUTE);

    const div = document.createElement('div');
    this.entry.parentNode.insertBefore(div, this.entry);
    return div;
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
    document.addEventListener('click', () => {
      this.closeCart();
    });
  }

  _bindResize() {
    throttle('resize', 'safeResize');
    window.addEventListener('safeResize', () => {
      this.components.collection.forEach((collection) => collection.resize());
      this.components.productSet.forEach((set) => set.resize());
      this.components.product.forEach((product) => product._resizeY());
    });
  }

  _bindEsc() {
    window.addEventListener('keydown', (evt) => {
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
        this.components.cart.forEach((cart) => {
          cart.clear();
        });
      }
    });
  }
}

