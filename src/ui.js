import Cart from './components/cart';
import Product from './components/product';
import Collection from './components/collection';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
export default class UI {
  constructor(client) {
    this.client = client;
    this.components = {
      cart: [],
      product: [],
      collection: [],
    };

    this.componentTypes = {
      product: Product,
      cart: Cart,
      collection: Collection,
    };
  }

  queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];
    this.entry.removeAttribute(DATA_ATTRIBUTE);
    const div = document.createElement('div');
    this.entry.appendChild(div);
    return div;
  }

  componentProps(type) {
    const typeProperties = {
      product: {
        addToCart: this.addToCart.bind(this),
      },
      cart: {},
      collection: {
        addToCart: this.addToCart.bind(this),
      },
    }[type];
    return Object.assign({}, typeProperties, {
      client: this.client,
    });
  }

  addToCart(product) {
    this.components.cart[0].addItem(product);
  }

  createComponent(type, config) {
    config.node = config.node || queryEntryNode();
    const component = new this.componentTypes[type](config, this.componentProps(type));
    this.components[type].push(component);
    component.init();

    if (!this.components.cart.length) {
      this.createComponent('cart', config);
    }

    return component;
  }
}
