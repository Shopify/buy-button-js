import Product from './components/product';
import ProductSet from './components/product-set';
import Cart from './components/cart';
import Collection from './components/collection';
import hostStyles from './styles/host/main';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
const imageCache = {};

export default class UI {
  constructor(client) {
    this.client = client;
    this.iframeComponents = [];
    this.components = {
      product: [],
      cart: [],
      collection: [],
      productSet: [],
    };
    this.componentTypes = {
      product: Product,
      cart: Cart,
      collection: Collection,
      productSet: ProductSet,
    };
    this._appendStyleTag();
  }

  createCart(config) {
    if (this.components.cart.length) {
      if (config.options && config.options.cart) {
        this.components.cart[0].updateConfig(config);
      }
      return Promise.resolve(this.components.cart[0]);
    } else {
      const cart = new Cart(config, this.componentProps);
      this.components.cart.push(cart);
      return cart.init();
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
      imageCache,
      createCart: this.createCart.bind(this),
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
}

