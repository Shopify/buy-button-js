import productTemplate from './templates/product';
import ShopifyBuy from 'shopify-buy';
import Collection from './components/collection';
import Product from './components/product';
import Cart from './components/cart';

window.ShopifyBuy = ShopifyBuy;

const componentTypes = {
  'product': Product,
  'collection': Collection
}

class UI {
  constructor() {
    this.cart = new Cart();
    this.components = {
      'collection': [],
      'product': []
    };
  }

  addVariantToCart(data) {
    this.cart.addItem(data);
  }

  get props() {
    return {
      collection: {
        addVariantToCart: this.addVariantToCart.bind(this)
      },
      product: {
        addVariantToCart: this.addVariantToCart.bind(this)
      }
    }
  }

  createComponent(type, config) {
    this.components[type].push(new componentTypes[type](config, this.props[type]));
  }
}

ShopifyBuy.UI = new UI();

ShopifyBuy.UI.createComponent('collection', {});
