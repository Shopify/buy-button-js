import Product from './components/product';
import Modal from './components/modal';
import ProductSet from './components/product-set';
import Cart from './components/cart';
import Collection from './components/collection';
import hostStyles from './styles/host/main';
import throttle from './utils/throttle';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
const ESC_KEY = 27;

export default class UI {
  constructor(client) {
    this.client = client;
    this.iframeComponents = [];
    this.components = {
      product: [],
      cart: [],
      collection: [],
      productSet: [],
      modal: [],
    };
    this.componentTypes = {
      product: Product,
      cart: Cart,
      collection: Collection,
      productSet: ProductSet,
    };
    this._appendStyleTag();
    this._bindResize();
    this._bindHostClick();
    this._bindEsc();
  }

  createCart(config) {
    if (this.components.cart.length) {
      if (config.options && config.options.cart) {
        this.components.cart.forEach((cart) => cart.updateConfig(config));
      }
      return Promise.resolve(this.components.cart[0]);
    } else {
      const cart = new Cart(config, this.componentProps);
      this.components.cart.push(cart);
      return cart.init();
    }
  }

  closeCart() {
    if (this.components.cart.length) {
      this.components.cart.forEach((cart) => cart.close());
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
    };
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
      styleTag.styleSheet.cssText = hostStyles;
    } else {
      styleTag.appendChild(document.createTextNode(hostStyles));
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
      if (evt.keyCode === ESC_KEY) {
        this.closeModal();
        this.closeCart();
      }
    });
  }
}

