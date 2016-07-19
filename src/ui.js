import Product from './components/product';
import Cart from './components/cart';
import hostStyles from './styles/host/main';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
const imageCache = {};

export default class UI {
  constructor(client) {
    this.client = client;
    this.components = {
      product: [],
      cart: [],
    };

    this.componentTypes = {
      product: Product,
      cart: Cart,
    };
    this._appendStyleTag();
  }

  createCart(config) {
    if (!this.components.cart.length) {
      const cart = new Cart(config, this._componentProps('cart'));
      this.components.cart.push(cart);
      return cart.init();
    } else {
      if (config.options && config.options.cart) {
        this.components.cart[0].updateConfig(config);
      }
      return Promise.resolve(this.components.cart[0]);
    }
  }

  createComponent(type, config) {
    config.node = config.node || this._queryEntryNode();
    const component = new this.componentTypes[type](config, this._componentProps(type));
    this.components[type].push(component);
    return component.init().then(() => component);
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

  _queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];
    this.entry.removeAttribute(DATA_ATTRIBUTE);

    const div = document.createElement('div');
    this.entry.parentNode.insertBefore(div, this.entry);
    return div;
  }

  _componentProps(type) {
    const typeProperties = {
      product: {
        createCart: this.createCart.bind(this),
      },
    }[type];
    return Object.assign({}, typeProperties, {
      client: this.client,
      imageCache,
    });
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
