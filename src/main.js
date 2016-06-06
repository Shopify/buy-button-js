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
    this.components = {
      'collection': [],
      'product': []
    };
    this.client = ShopifyBuy.buildClient({
      apiKey: 'bf081e860bc9dc1ce0654fdfbc20892d',
      myShopifyDomain: 'embeds',
      appId: '6'
    });
    this.cart = new Cart({}, {
      client: this.client
    });
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
    let props = Object.assign({}, this.props[type]);
    props.client = this.client;
    this.components[type].push(new componentTypes[type](config, props));
  }
}

ShopifyBuy.UI = new UI();

ShopifyBuy.UI.createComponent('collection', {
  id: 154868035
});
