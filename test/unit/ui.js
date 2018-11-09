import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Product from '../../src/components/product';
import Tracker from '../../src/utils/track';
import ProductSet from '../../src/components/product-set';
import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import shopFixture from '../fixtures/shop-info';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';

describe('ui class', () => {
  let ui;
  let script;

  let client;
  let integrations;
  let config;

  beforeEach(() => {
    integrations = {
      errorReporter: {notifyException: sinon.spy()},
      tracker: 'test',
    };
    config = {
      domain: 'buckets-o-stuff.myshopify.com',
      storefrontAccessToken: 123,
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
    let resizeSpy;
    let hostClickSpy;
    let escSpy;
    let postMessageSpy;
    let appendStyleTagSpy;

    beforeEach(() => {
      resizeSpy = sinon.spy(UI.prototype, '_bindResize');
      hostClickSpy = sinon.spy(UI.prototype, '_bindHostClick');
      escSpy = sinon.spy(UI.prototype, '_bindEsc');
      postMessageSpy = sinon.spy(UI.prototype, '_bindPostMessage');
      appendStyleTagSpy = sinon.spy(UI.prototype, '_appendStyleTag');
      ui = new UI(client, integrations, 'test');
    });

    afterEach(() => {
      resizeSpy.restore();
      hostClickSpy.restore();
      escSpy.restore();
      postMessageSpy.restore();
      appendStyleTagSpy.restore();
    });

    it('sets client and domain from passed in client and client.config.domain', () => {
      assert.equal(ui.client, client);
      assert.equal(ui.config.domain, client.config.domain);
    });

    it('creates an empty array for iframeComponents', () => {
      assert.deepEqual(ui.iframeComponents, []);
    });

    it('creates an empty components object holding product, cart, collection, productSet, modal, and toggle', () => {
      const emptyComponentsObj = {
        product: [],
        cart: [],
        collection: [],
        productSet: [],
        modal: [],
        toggle: [],
      };
      assert.deepEqual(ui.components, emptyComponentsObj);
    });

    it('creates component types object for product, cart, collection, productSet, modal, toggle', () => {
      const componentTypes = {
        product: Product,
        cart: Cart,
        collection: ProductSet,
        productSet: ProductSet,
        toggle: CartToggle,
      };
      assert.deepEqual(ui.componentTypes, componentTypes);
    });

    it('sets an error reporter from integrations props', () => {
      assert.equal(ui.errorReporter, integrations.errorReporter);
    });

    it('creates a tracker instance', () => {
      assert.instanceOf(ui.tracker, Tracker);
    });

    it('sets stylesOverrides from params', () => {
      assert.equal(ui.styleOverrides, 'test');
    });

    it('sets active element to null', () => {
      assert.equal(ui.activeEl, null);
    });

    it('calls _appendStyleTag', () => {
      assert.calledOnce(appendStyleTagSpy);
    });

    it('sets up event bindings', () => {
      assert.calledOnce(resizeSpy);
      assert.calledOnce(hostClickSpy);
      assert.calledWith(escSpy, window);
      assert.calledOnce(postMessageSpy);
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
