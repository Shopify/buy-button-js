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

export default class UI {
  constructor(client, trackingLib) {
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
    this.tracker = new Tracker(trackingLib);
    this._appendStyleTag();
    this._bindResize();
    this._bindHostClick();
    this._bindEsc();
  }

  createCart(config) {
    if (this.components.cart.length) {
      return Promise.resolve(this.components.cart[0]);
    } else {
      const cart = new Cart(config, this.componentProps);
      this.components.cart.push(cart);
      return cart.init();
    }
  }

  closeCart() {
    if (this.components.cart.length) {
      this.components.cart.forEach((cart) => {
        if (cart.isVisible) {
          cart.close();
        }
      });
    }
  }

  createModal(config) {
    if (this.components.modal.length) {
      return this.components.modal[0];
    } else {
      const modal = new Modal(config, this.componentProps);
      this.components.modal.push(modal);
      return modal;
    }
  }

  closeModal() {
    if (this.components.modal.length) {
      this.components.modal.forEach((modal) => modal.close());
    }
  }

  createComponent(type, config) {
    config.node = config.node || this._queryEntryNode();
    const component = new this.componentTypes[type](config, this.componentProps);
    this.components[type].push(component);
    return component.init();
  }

  destroyComponent(type, id) {
    this.components[type].forEach((component, index) => {
      if (!component.model.id === id) {
        return;
      }
      this.components[type][index].destroy();
      this.components[type].splice(index, 1);
    });
  }

  get componentProps() {
    return {
      client: this.client,
      createCart: this.createCart.bind(this),
      closeCart: this.closeCart.bind(this),
      createModal: this.createModal.bind(this),
      closeModal: this.closeModal.bind(this),
      tracker: this.tracker,
      browserFeatures,
    };
  }

  get styleText() {
    if (browserFeatures.transition && browserFeatures.transform && browserFeatures.animation) {
      return hostStyles;
    }
    return hostStyles + conditionalStyles;
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
}

