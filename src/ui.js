import Product from './components/product';
import Cart from './components/cart';

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
  }

  queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];
    this.entry.removeAttribute(DATA_ATTRIBUTE);

    const div = document.createElement('div');
    this.entry.parentNode.insertBefore(div, this.entry);
    return div;
  }

  componentProps(type) {
    const typeProperties = {
      product: {
        createCart: this.createCart.bind(this)
      },
    }[type];
    return Object.assign({}, typeProperties, {
      client: this.client,
      imageCache,
    });
  }

  createCart(config) {
    if (!this.components.cart.length) {
      const cart = new Cart(config, this.componentProps('cart'));
      this.components.cart.push(cart);
      return cart.init();
    } else {
      this.components.cart[0].updateConfig(config);
      return Promise.resolve(this.components.cart[0]);
    }
  }

  createComponent(type, config) {
    config.node = config.node || this.queryEntryNode();
    const component = new this.componentTypes[type](config, this.componentProps(type));
    this.components[type].push(component);
    return component.init().then(() => component);
  }

  destroyComponent(type, id) {
    const component = this.components[type].forEach((component, index) => {
      if (component.model.id === id) {
        this.components[type][index].node.removeChild(this.components[type][index].iframe.div);
        this.components[type].splice(index, 1);
      }
    });
  }
}
