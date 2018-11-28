import Product from '../../../src/components/product';
import Cart from '../../../src/components/cart';
import ShopifyBuy from '../../../src/buybutton';
import shopFixture from '../../fixtures/shop-info';
import productFixture from '../../fixtures/product-fixture';

const config = {
  id: 123,
  options: {
    product: {
      iframe: false,
    },
  },
};
let product;
let testProductCopy;
let configCopy;

describe('Product View class', () => {
  let props;

  beforeEach(() => {
    props = {
      client: ShopifyBuy.buildClient({
        domain: 'test.myshopify.com',
        storefrontAccessToken: 123,
      }),
      createCart() {
        return Promise.resolve(new Cart(config, {
          tracker: {
            trackMethod: (fn) => {
              return function(...params) {
                fn(...params);
              };
            },
          },
        }));
      },
    };
    sinon.stub(props.client.shop, 'fetchInfo').resolves(shopFixture);
    sinon.stub(props.client.product, 'fetch').resolves(productFixture);
    configCopy = Object.assign({}, config);
    configCopy.node = document.createElement('div');
    configCopy.node.setAttribute('id', 'fixture');
    document.body.appendChild(configCopy.node);
    testProductCopy = Object.assign({}, productFixture);
    product = new Product(configCopy, props);
  });

  afterEach(() => {
    document.body.removeChild(configCopy.node);
  });

  describe('wrapTemplate()', () => {
    beforeEach(async () => {
      await product.init(testProductCopy);
    });

    describe('when isButton() is false', () => {
      it('calls super', () => {
        const string = product.view.wrapTemplate('test');
        assert.equal(string, '<div class="has-image shopify-buy__layout-vertical shopify-buy__product">test</div>');
      });
    });

    describe('when isButton() is true', () => {
      it('wraps html in a button', () => {
        product.config.product.isButton = true;
        product.config.product.contents.button = false;
        product.config.product.contents.buttonWithQuantity = false;
        const string = product.view.wrapTemplate('test');
        assert.equal(string, '<div class="has-image shopify-buy__layout-vertical shopify-buy__product"><div tabindex="0" role="button" aria-label="Add to cart" class="shopify-buy__btn--parent">test</div></div>');
      });
    });
  });

  describe('getters', () => {
    describe('outerHeight', () => {
      beforeEach(async () => {
        const newProduct = await product.init(testProductCopy);
        newProduct.cart.model.lineItems = [];
        newProduct.cart.props.client = newProduct.props.client;
      });

      it('returns the wrapper\'s client height in px', () => {
        const wrapperHeight = product.view.wrapper.clientHeight;
        assert.equal(product.view.outerHeight, `${wrapperHeight}px`);
      });
    });
  });
});
