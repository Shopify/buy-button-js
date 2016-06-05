import ShopifyBuy from 'shopify-buy';
import Product from './components/product';
import ProductIframe from './components/product-iframe';
import Collection from './components/collection';
import Cart from './components/cart';


const componentTypes = {
  'product': ProductIframe,
  'cart': Cart,
  'collection': Collection
}

class Container {
  constructor() {
    this.components = {
      products: [],
      cart: null,
      collections: []
    }
  }

  addToCart(data) {
    console.log(data);
  }

  get productProps() {
    return {
      addToCart: this.addToCart.bind(this)
    }
  }

  createComponent(type, config) {
    let component = new componentTypes[type](config, {}, this.productProps);
    this.components[`${type}s`].push(component);
    component.render();
  }
}

let ShopifyBuyUI = new Container();

ShopifyBuyUI.createComponent('collection', {});
