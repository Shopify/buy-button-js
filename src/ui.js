import Cart from './components/cart';
import Product from './components/product';
import Collection from './components/collection';

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
    const component = new this.componentTypes[type](config, this.componentProps(type));
    this.components[type].push(component);
    return component;
  }
}
