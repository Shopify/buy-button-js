import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Product from '../../src/components/product';
import Tracker from '../../src/utils/track';
import ProductSet from '../../src/components/product-set';
import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import shopFixture from '../fixtures/shop-info';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
const config = {
  domain: 'buckets-o-stuff.myshopify.com',
  storefrontAccessToken: 123,
};

describe('ui class', () => {
  let ui;
  let script;
  let client;
  let integrations;

  beforeEach(() => {
    integrations = {
      errorReporter: {notifyException: sinon.spy()},
      tracker: 'test',
    };
    client = ShopifyBuy.buildClient(config);
    client.config.domain = 'test-domain.myshopify.com';
    sinon.stub(client.shop, 'fetchInfo').resolves(shopFixture);
    script = document.createElement('script');
    script.setAttribute(DATA_ATTRIBUTE, true);
    document.body.appendChild(script);
  });

  afterEach(() => {
    document.body.removeChild(script);
  });

  describe('constructor', () => {
    let resizeStub;
    let hostClickStub;
    let escStub;
    let postMessageStub;
    let trackPageviewStub;
    let appendStyleTagStub;

    beforeEach(() => {
      resizeStub = sinon.stub(UI.prototype, '_bindResize');
      hostClickStub = sinon.stub(UI.prototype, '_bindHostClick');
      escStub = sinon.stub(UI.prototype, '_bindEsc');
      postMessageStub = sinon.stub(UI.prototype, '_bindPostMessage');
      trackPageviewStub = sinon.stub(Tracker.prototype, 'trackPageview');
      appendStyleTagStub = sinon.stub(UI.prototype, '_appendStyleTag');
      ui = new UI(client, integrations, 'test');
    });

    afterEach(() => {
      resizeStub.restore();
      hostClickStub.restore();
      escStub.restore();
      postMessageStub.restore();
      trackPageviewStub.restore();
      appendStyleTagStub.restore();
    });

    it('sets client and domain from client and client.config.domain params', () => {
      assert.equal(ui.client, client);
      assert.equal(ui.config.domain, client.config.domain);
    });

    it('creates an empty array for iframeComponents', () => {
      assert.deepEqual(ui.iframeComponents, []);
    });

    it('creates a components object holding empty arrays for product, cart, collection, productSet, modal, and toggle', () => {
      const expectedComponentsObj = {
        product: [],
        cart: [],
        collection: [],
        productSet: [],
        modal: [],
        toggle: [],
      };
      assert.deepEqual(ui.components, expectedComponentsObj);
    });

    it('creates a componentTypes object for product, cart, collection, productSet, modal, toggle', () => {
      const componentTypes = {
        product: Product,
        cart: Cart,
        collection: ProductSet,
        productSet: ProductSet,
        toggle: CartToggle,
      };
      assert.deepEqual(ui.componentTypes, componentTypes);
    });

    it('sets an errorReporter from integrations param', () => {
      assert.equal(ui.errorReporter, integrations.errorReporter);
    });

    it('creates a tracker instance', () => {
      assert.instanceOf(ui.tracker, Tracker);
    });

    it('sets stylesOverrides from params', () => {
      assert.equal(ui.styleOverrides, 'test');
    });

    it('calls tracker\'s trackPageview', () => {
      assert.calledOnce(trackPageviewStub);
    });

    it('sets active element to null', () => {
      assert.equal(ui.activeEl, null);
    });

    it('calls _appendStyleTag', () => {
      assert.calledOnce(appendStyleTagStub);
    });

    it('sets up event bindings', () => {
      assert.calledOnce(resizeStub);
      assert.calledOnce(hostClickStub);
      assert.calledWith(escStub, window);
      assert.calledOnce(postMessageStub);
    });
  });

  describe('prototype methods', () => {
    beforeEach(() => {
      ui = new UI(client, integrations);
    });

    describe('createCart', () => {
      let initStub;

      beforeEach(() => {
        initStub = sinon.stub(Cart.prototype, 'init').resolves();
      });

      afterEach(() => {
        initStub.restore();
      });

      describe('when no cart exists', () => {
        it('creates a new cart', () => {
          return ui.createCart({options: {}}).then(() => {
            assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
            ui.destroyComponent('cart', ui.components.cart[0].model.id);
          });
        });
      });

      describe('when a cart exists', () => {
        it('does not create a second cart', () => {
          return ui.createCart({options: {}}).then(() => ui.createCart({options: {}})).then(() => {
            assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
            ui.destroyComponent('cart', ui.components.cart[0].model.id);
          });
        });
      });
    });

    describe('createComponent', () => {
      let initStub;
      let trackStub;
      let productConfig;

      beforeEach(() => {
        productConfig = {
          id: 123,
          options: {},
        };
        initStub = sinon.stub(Product.prototype, 'init').resolves();
        trackStub = sinon.stub(ui, 'trackComponent');
      });

      afterEach(() => {
        initStub.restore();
        trackStub.restore();
      });

      it('creates new component of type', () => {
        return ui.createComponent('product', productConfig).then(() => {
          assert.equal(1, ui.components.product.length);
          ui.destroyComponent('product', ui.components.product[0].model.id);
        });
      });

      it('passes config to constructor', () => {
        productConfig.node = null;
        return ui.createComponent('product', productConfig).then(() => {
          assert.equal(null, ui.components.product[0].config.node);
          ui.destroyComponent('product', ui.components.product[0].model.id);
        });
      });
    });

    describe('destroyComponent', () => {
      it('removes component and calls its destroy method', () => {
        const testCart = {
          model: {
            id: 123,
          },
          destroy: sinon.spy(),
        };
        ui.components.cart.push(testCart);
        ui.destroyComponent('cart', 123);
        assert.equal(0, ui.components.cart.length);
        assert.calledOnce(testCart.destroy);
      });
    });
  });
});
