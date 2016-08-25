import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';
import productJSON from '../fixtures/pretender/product';
import collectionJSON from '../fixtures/pretender/collection';
import Pretender from 'fetch-pretender';

const server = new Pretender();

server.get('https://embeds.myshopify.com/api/apps/6/product_listings/6640244678', (request) => {
  return [200, {"Content-Type": "application/json"}, JSON.stringify(productJSON)];
});

server.unhandledRequest = function(verb, path, request) {
  console.warn(`unhandled path: ${path}`);
}

const config = {
  id: 6640244678,
}

const client = ShopifyBuy.buildClient({
  apiKey: 'abc123',
  domain: 'embeds.myshopify.com',
  appId: '6'
});

const fancyOptions = {
  cart: {
    styles: {
      button: {
        'background-color': 'rgb(0, 0, 0)',
      }
    }
  },
  product: {
    buttonDestination: 'modal',
    contents: {
      image: false,
    },
    order: [
      'title',
      'variantTitle',
      'options',
      'quantity',
      'button',
      'price',
    ],
    templates: {
      button: '<button class="fancy-button {{data.classes.product.button}}">{{data.buttonText}}</button>'
    },
    text: {
      button: 'BUY SOCKS',
    },
    styles: {
      button: {
        'background-color': 'rgb(255, 0, 255)',
      },
      title: {
        'font-size': '88px',
        'margin-top': '200px',
      }
    }
  },
}

let product;
let ui;

describe('ShopifyBuy.UI', () => {
  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
  });

  afterEach(() => {
    document.body.removeChild(config.node);
    config.node = null;
    product = null;
    ShopifyBuy.UI.ui = null;
  });

  describe('init', () => {
    beforeEach(() => {
      ui = ShopifyBuy.UI.init(client);
    });

    afterEach(() => {
      ShopifyBuy.UI.ui = null;
    });

    it('creates an instance of ShopifyBuy.UI', () => {
      assert.instanceOf(ui, UI);
    });
  });

  describe('createComponent', () => {
    describe('with no customization', () => {
      beforeEach((done) => {
        ui = ShopifyBuy.UI.init(client);
        ui.createComponent('product', config).then((prod) => {
          product = prod;
          done();
        });
      });

      it('renders a product', () => {
        const fixture = document.getElementById('fixture');
        const iframe = fixture.children[0];
        assert.include(iframe.contentDocument.body.innerHTML, 'Ankle socks');
      });
    });

    describe('with much customization', () => {
      beforeEach((done) => {
        ui = ShopifyBuy.UI.init(client);
        config.options = fancyOptions;

        ui.createComponent('product', config).then((prod) => {
          product = prod;
          done();
        });
     });

      it('has the correct DOM', () => {
        const children = product.wrapper.children[0].children;
        const img = product.wrapper.getElementsByTagName('img');
        const button = product.wrapper.getElementsByClassName(product.classes.product.button)[0];
        const buttonColor = getComputedStyle(button, null).getPropertyValue('background-color');
        assert.lengthOf(img, 0, 'image is not present if contents.image is false');
        assert.include(children[children.length - 1].className, product.classes.product.prices, 'order is dictated by order array');
        assert.include(button.innerHTML, 'BUY SOCKS', 'button text is replaced by text.button');
        assert.include(button.className, 'fancy-button', 'button template is replaced by template.button');
        assert.include(buttonColor, '255, 0, 255', 'button styles are overridden by styles.button');
      });

      it('has a cart that has the correct DOM', () => {
        const button = product.cart.wrapper.getElementsByClassName(product.cart.classes.cart.button)[0];
        const buttonColor = getComputedStyle(button, null).getPropertyValue('background-color');
        assert.include(buttonColor, 'rgb(0, 0, 0)', 'cart button styles are overridden');
      });

      describe('with buttonDestination set to modal', () => {
        let modal;

        beforeEach((done) => {
          product.openModal().then((productModal) => {
            modal = product.modal;
            done();
          });
        });

        afterEach(() => {
          ui.closeModal();
          modal = null;
        });

        it('has a modal that has the correct DOM', () => {
          const title = modal.wrapper.getElementsByClassName(modal.classes.product.title)[0];
          const titleStyles = getComputedStyle(title, null);
          const titleSize = titleStyles.getPropertyValue('font-size');
          const marginSize = titleStyles.getPropertyValue('margin-top');
          assert.equal(titleSize, '88px', 'it transfers non-layout styles to modal product');
          assert.notEqual(marginSize, '200px', 'it does not transfer layout styles to modal product');
        });
      });
    });
  });
});

