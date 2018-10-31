import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Tracker from '../../src/utils/track';
import Product from '../../src/components/product';
import Cart from '../../src/components/cart';
import shopFixture from '../fixtures/shop-info';

describe('ui class', () => {
  let ui;
  let script;

  let client;
  let config;
  const productConfig = {
    id: 123,
    options: {}
  };

  beforeEach(() => {
    config = {
      domain: 'buckets-o-stuff.myshopify.com',
      storefrontAccessToken: 123,
    };
    client = ShopifyBuy.buildClient(config);
    sinon.stub(client.shop, 'fetchInfo').resolves(shopFixture);
    ui = new UI(client, {});
    script = document.createElement('script');
    script.setAttribute('data-shopify-buy-ui', true);
    document.body.appendChild(script);
  });

  afterEach(() => {
    ui = null;
    document.body.removeChild(script);
  });

  describe('constructor', () => {
    it('uses the client.config.domain instead of making a network call', () => {
      const shopInfo = sinon.spy(client.shop.fetchInfo);
      client.config.domain = 'test-domain.myshopify.com';
      ui = new UI(client, {});
      assert.equal(ui.config.domain, client.config.domain);
      assert(shopInfo.notCalled);
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
      ui = new UI(client);

      assert.deepEqual(ui.components, emptyComponentsObj);
    });

    it('sets an error reporter from integrations props', () => {
      const integrations = {errorReporter: 'test'};
      ui = new UI(client, integrations);
      assert.equal(ui.errorReporter, integrations.errorReporter);
    });

    it('creates a tracker', () => {
      const integrations = {tracker: 'test'};
      ui = new UI(client, integrations);
      assert.instanceOf(ui.tracker, Tracker);
    });

    it('sets up event bindings', () => {
      const resizeSpy = sinon.spy(UI.prototype, '_bindResize');
      const hostClickSpy = sinon.spy(UI.prototype, '_bindHostClick');
      const escSpy = sinon.spy(UI.prototype, '_bindEsc');
      const postMessageSpy = sinon.spy(UI.prototype, '_bindPostMessage');
      ui = new UI(client);

      assert.calledOnce(resizeSpy);
      assert.calledOnce(hostClickSpy);
      assert.calledOnce(escSpy);
      assert.calledOnce(postMessageSpy);

      resizeSpy.restore();
      hostClickSpy.restore();
      escSpy.restore();
      postMessageSpy.restore();
    });
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

    beforeEach(() => {
      initStub = sinon.stub(Product.prototype, 'init').resolves();
      trackStub = sinon.stub(ui, 'trackComponent');
    });

    afterEach(() => {
      initStub.restore();
    });

    it('creates new component of type with tracker attached', () => {
      return ui.createComponent('product', productConfig).then(() => {
        assert.equal(1, ui.components.product.length);
        assert.calledOnce(initStub);
        assert.calledOnce(trackStub);
        ui.destroyComponent('product', ui.components.product[0].model.id);
      });
    });

    it('binds escape key on iframe if it exists', () => {
      productConfig.iframe = true;
      const escSpy = sinon.stub(UI.prototype, '_bindEsc');
      ui = new UI(client);

      return ui.createComponent('product', productConfig).then(() => {
        assert.calledOnce(escSpy);
        escSpy.restore();
        ui.components.product = []; // parentNode does not exist on product.node so .destroyComponent does not work here
      });
    });

    it('catches any error from component.init and notifies errorReporter', () => {
      initStub.restore(); // removes the regular initStub to replace with the initStub that throws an error
      const integrations = {errorReporter: {notifyException: sinon.spy()}};
      const errorInitStub = sinon.stub(Product.prototype, 'init').returns(Promise.reject({errors: [{message: 'rejected.'}]}));
      ui = new UI(client, integrations);

      return ui.createComponent('product', productConfig).then(() => {
        assert.throws(ui.createComponent, Error);
        assert.calledOnce(integrations.errorReporter.notifyException);
        errorInitStub.restore();
        ui.components.product = []; // parentNode does not exist on product.node so .destroyComponent does not work here
      });
    });

    it('grabs node from _queryEntryNode if no node is passed in from config', () => {
      const queryEntryNodeSpy = sinon.stub(UI.prototype, '_queryEntryNode').returns('testNode');
      productConfig.node = null;

      return ui.createComponent('product', productConfig).then(() => {
        assert.calledOnce(queryEntryNodeSpy);
        assert.equal(productConfig.node, 'testNode');
        queryEntryNodeSpy.restore();
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

  describe('trackComponent', () => {
    let trackComponentStub;

    beforeEach(() => {
      trackComponentStub = sinon.stub(Tracker.prototype, 'trackComponent');
    });

    afterEach(() => {
      trackComponentStub.restore();
    });

    it('if the component is productSet, track each product in set', () => {
      const productSet = {
        trackingInfo: [1, 2, 3, 4, 5],
      };

      ui.trackComponent('productSet', productSet);
      assert.callCount(trackComponentStub, 5);
    });

    it('calls trackComponent with the given component type', () => {
      const component = {
        trackingInfo: 'test',
      };

      ui.trackComponent('testType', component);
      assert.calledWith(trackComponentStub, 'testType');
    });
  });

  describe('cart methods', () => {
    describe('closeCart', () => {
      it('calls cart.close for every visible cart and calls restoreFocus after each close', () => {
        const spy = sinon.spy();
        const restoreFocusSpy = sinon.spy(UI.prototype, 'restoreFocus');
        ui.components.cart = [
          {isVisible: true, close: spy},
          {isVisible: true, close: spy},
          {isVisible: false, close: spy},
        ];
        ui.closeCart();
        assert.callCount(spy, 2);
        assert.callCount(restoreFocusSpy, 2);
        restoreFocusSpy.restore();
      });
    });

    describe('openCart', () => {
      it('calls cart.open for every cart', () => {
        const spy = sinon.spy();
        ui.components.cart = [
          {isVisible: true, open: spy},
          {isVisible: true, open: spy},
          {isVisible: false, open: spy},
        ];
        ui.openCart();
        assert.callCount(spy, 3);
      });
    });

    describe('toggleCart', () => {
      it('calls cart.toggleVisilbity for every cart', () => {
        const spy = sinon.spy();
        ui.components.cart = [
          {toggleVisibility: spy},
          {toggleVisibility: spy},
          {toggleVisibility: spy},
        ];
        ui.toggleCart(true);
        assert.callCount(spy, 3);
      });

      it('calls restoreFocus if cart is not visible', () => {
        const spy = sinon.spy();
        const restoreFocusSpy = sinon.spy(UI.prototype, 'restoreFocus');
        ui.components.cart = [
          {toggleVisibility: spy},
          {toggleVisibility: spy},
          {toggleVisibility: spy},
        ];
        ui.toggleCart(true);
        assert.notCalled(restoreFocusSpy);
        ui.toggleCart(false);
        assert.calledOnce(restoreFocusSpy);
        restoreFocusSpy.restore();
      });
    });
  });

  describe('createModal', () => {
    it('creates a new modal if one does not already exist', () => {
      ui.createModal({options: {}});
      assert.equal(1, ui.components.modal.length);
      ui.destroyComponent('modal', ui.components.modal[0].model.id);
    });

    it('does not create a modal if it already exists', () => {
      ui.createModal({options: {}});
      ui.createModal({options: {}});
      assert.equal(1, ui.components.modal.length);
      ui.destroyComponent('modal', ui.components.modal[0].model.id);
    });
  });

  describe('closeModal', () => {
    it('calls modal.close for every modal then restoreFocus once all is done', () => {
      const spy = sinon.spy();
      const restoreFocusSpy = sinon.spy(UI.prototype, 'restoreFocus');
      ui.components.modal = [
        {close: spy},
        {close: spy},
        {close: spy},
      ];
      ui.closeModal();
      assert.callCount(spy, 3);
      assert.calledOnce(restoreFocusSpy);
      restoreFocusSpy.restore();
    });
  });

  describe('setActiveEl', () => {
    it('sets active element to element passed in', () => {
      ui.setActiveEl('test');
      assert.equal(ui.activeEl, 'test');
    });
  });
});
