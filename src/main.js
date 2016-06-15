import productTemplate from './templates/product';
import Collection from './components/collection';
import Product from './components/product';
import Cart from './components/cart';
import ShopifyBuy from 'shopify-buy';

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
    this.loadEmbedStyles(() => {
      this.cart = new Cart({}, {
        client: this.client
      });
      this.onReady();
    });
  }

  addVariantToCart(data) {
    this.cart.addItem(data);
  }

  get props() {
    return {
      collection: {
        'addVariantToCart': this.addVariantToCart.bind(this)
      },
      product: {
        'addVariantToCart': this.addVariantToCart.bind(this)
      }
    }
  }

  loadEmbedStyles(cb) {
    let cssURL = './styles/embeds.css';

    let link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssURL;

    let img = document.createElement('img');

    img.style.opacity = 0;
    document.body.appendChild(img);
    document.head.appendChild(link);


    img.src = cssURL;
    img.onerror = () => {
      document.body.removeChild(img);
      cb();
    }

}

  createComponent(type, config) {
    let props = {
      callbacks: this.props[type],
      client: this.client
    }
    this.components[type].push(new componentTypes[type](config, props));
  }
}

ShopifyBuy.UI = new UI();

ShopifyBuy.UI.onReady = () => {
  // ShopifyBuy.UI.createComponent('product', {
  //   id: 6640244678,
  //   styles: {
  //     button: {
  //       'background-color': 'red',
  //       'color': 'black'
  //     }
  //   }
  // });

ShopifyBuy.UI.createComponent('collection', {
    id: 244484358,
    productConfig: {
      contents: ['title', 'variantTitle', 'price', 'description', 'variantSelection', 'button'],
      templates: {
        title: '<h4>{{data.title}}</h4>',
        description: '<p>{{{data.attrs.body_html}}}</p>'
      },
      styles: {
        button: {
          'background-color': 'red',
          'color': 'yellow',
          'border': '0',
          'border-radius': '5px',
          'font-size': '16px'
        }
      },
      addVariantToCart: (product) => {
        console.log(`product ${product.id} added to cart`);
      }
    }
  });
};
