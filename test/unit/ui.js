import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Tracker from '../../src/utils/track';
import Product from '../../src/components/product';
import Modal from '../../src/components/modal';
import ProductSet from '../../src/components/product-set';
import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import * as browserFeatures from '../../src/utils/detect-features';
import * as throttle from '../../src/utils/throttle';
import hostStyles from '../../src/styles/host/host';
import conditionalStyles from '../../src/styles/host/conditional';

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

    beforeEach(() => {
      ui = new UI(client, integrations, 'test');
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
      ui = new UI(client);

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
      const appendStyleTagSpy = sinon.spy(UI.prototype, '_appendStyleTag');
      ui = new UI(client);
      assert.calledOnce(appendStyleTagSpy);
      appendStyleTagSpy.restore();
    });

    it('sets up event bindings', () => {
      const resizeSpy = sinon.spy(UI.prototype, '_bindResize');
      const hostClickSpy = sinon.spy(UI.prototype, '_bindHostClick');
      const escSpy = sinon.spy(UI.prototype, '_bindEsc');
      const postMessageSpy = sinon.spy(UI.prototype, '_bindPostMessage');
      ui = new UI(client);

      assert.calledOnce(resizeSpy);
      assert.calledOnce(hostClickSpy);
      assert.calledWith(escSpy, window);
      assert.calledOnce(postMessageSpy);

      resizeSpy.restore();
      hostClickSpy.restore();
      escSpy.restore();
      postMessageSpy.restore();
    });
  });

  describe('prototype methods', () => {

    beforeEach(() => {
      ui = new UI(client, integrations);
    });

    describe('createComponent', () => {
      const productConfig = {
        id: 123,
        options: {},
      };

      describe('successful functionalities', () => {
        let initStub;
        let trackStub;

        beforeEach(() => {
          initStub = sinon.stub(Product.prototype, 'init').resolves();
          trackStub = sinon.stub(ui, 'trackComponent');
        });

        afterEach(() => {
          initStub.restore();
          trackStub.restore();
        });

        it('creates new component of type with tracker attached', () => {
          return ui.createComponent('product', productConfig).then(() => {
            assert.equal(1, ui.components.product.length);
            assert.calledOnce(initStub);
            assert.calledOnce(trackStub);
            ui.destroyComponent('product', ui.components.product[0].model.id);
          });
        });

        it('grabs node from _queryEntryNode if no node is passed in from config', () => {
          const queryEntryNodeSpy = sinon.stub(UI.prototype, '_queryEntryNode').returns('testNode');
          productConfig.node = null;

          return ui.createComponent('product', productConfig).then(() => {
            assert.calledOnce(queryEntryNodeSpy);
            assert.equal(productConfig.node, 'testNode');
            ui.components.product = [];
            queryEntryNodeSpy.restore();
          });
        });
      });

      describe('error handling', () => {
        let errorInitStub;
        let error;

        beforeEach(() => {
          error = {errors: [{message: 'rejected.'}]};
          errorInitStub = sinon.stub(Product.prototype, 'init').returns(Promise.reject(error));
        });

        afterEach(() => {
          errorInitStub.restore();
        });

        it('catches any error from component.init and notifies errorReporter if it exists', () => {
          return ui.createComponent('product', productConfig).then(() => {
            assert.throws(ui.createComponent, Error);
            assert.calledWith(integrations.errorReporter.notifyException, error);
            ui.components.product = [];
          });
        });

        it('errors out the console with the error', () => {
          const consoleErrorSpy = sinon.spy(console, 'error');
          return ui.createComponent('product', productConfig).then(() => {
            assert.throws(ui.createComponent, Error);
            assert.calledWith(consoleErrorSpy, error);
            consoleErrorSpy.restore();
            ui.components.product = [];
          });
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
        assert.calledWith(trackComponentStub, 'testType', 'test');
      });
    });

    describe('cart methods', () => {
      afterEach(() => {
        ui.components.cart = [];
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
              assert.instanceOf(ui.components.cart[0], Cart);
              assert.calledOnce(initStub);
              ui.destroyComponent('cart', ui.components.cart[0].model.id);
            });
          });
        });

        describe('when a cart exists', () => {
          it('does not create a second cart', () => {
            return ui.createCart({options: {}}).then(() => ui.createCart({options: {}})).then(() => {
              assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
              assert.calledOnce(initStub); // checks it was called once and not twice
              ui.destroyComponent('cart', ui.components.cart[0].model.id);
            });
          });
        });
      });

      describe('closeCart', () => {
        it('calls cart.close for every visible cart and calls restoreFocus after each close', () => {
          const closeSpy = sinon.spy();
          const restoreFocusSpy = sinon.spy(UI.prototype, 'restoreFocus');
          ui.components.cart = [
            {isVisible: true, close: closeSpy},
            {isVisible: true, close: closeSpy},
            {isVisible: false, close: closeSpy},
          ];
          ui.closeCart();
          assert.callCount(closeSpy, 2);
          assert.callCount(restoreFocusSpy, 2);
          restoreFocusSpy.restore();
        });
      });

      describe('openCart', () => {
        it('calls cart.open for every cart', () => {
          const openSpy = sinon.spy();
          ui.components.cart = [
            {isVisible: true, open: openSpy},
            {isVisible: true, open: openSpy},
            {isVisible: false, open: openSpy},
          ];
          ui.openCart();
          assert.callCount(openSpy, 3);
        });
      });

      describe('toggleCart', () => {
        it('calls cart.toggleVisilbity for every cart', () => {
          const toggleSpy = sinon.spy();
          ui.components.cart = [
            {toggleVisibility: toggleSpy},
            {toggleVisibility: toggleSpy},
            {toggleVisibility: toggleSpy},
          ];
          ui.toggleCart(true);
          assert.callCount(toggleSpy, 3);
        });

        it('calls restoreFocus if cart is not visible', () => {
          const restoreFocusSpy = sinon.spy(UI.prototype, 'restoreFocus');
          ui.components.cart = [];
          ui.toggleCart(true);
          assert.notCalled(restoreFocusSpy);
          ui.toggleCart(false);
          assert.calledOnce(restoreFocusSpy);
          restoreFocusSpy.restore();
        });
      });
    });

    describe('modal methods', () => {
      describe('createModal', () => {
        it('creates a new modal if one does not already exist', () => {
          ui.createModal({options: {}});
          assert.equal(1, ui.components.modal.length);
          assert.instanceOf(ui.components.modal[0], Modal);
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
    });

    describe('setActiveEl', () => {
      it('sets active element to element passed in', () => {
        ui.setActiveEl('test');
        assert.equal(ui.activeEl, 'test');
      });
    });

    describe('getters', () => {
      describe('get modalOpen', () => {
        afterEach(() => {
          ui.components.modal = [];
        });

        it('returns true if at least one modal is visible', () => {
          ui.components.modal = [
            {isVisible: false},
            {isVisible: false},
            {isVisible: true},
          ];
          assert.equal(ui.modalOpen, true);
        });

        it('returns false if all modals are not visible', () => {
          ui.components.modal = [
            {isVisible: false},
            {isVisible: false},
            {isVisible: false},
          ];
          assert.equal(ui.modalOpen, false);
        });
      });

      describe('get cartOpen', () => {
        afterEach(() => {
          ui.components.cart = [];
        });

        it('returns true if at least one cart is visible', () => {
          ui.components.cart = [
            {isVisible: false},
            {isVisible: false},
            {isVisible: true},
          ];
          assert.equal(ui.cartOpen, true);
        });

        it('returns false if all carts are not visible', () => {
          ui.components.cart = [
            {isVisible: false},
            {isVisible: false},
            {isVisible: false},
          ];
          assert.equal(ui.cartOpen, false);
        });
      });

      describe('get componentProps', () => {
        it('contains the client', () => {
          assert.equal(ui.componentProps.client, ui.client);
        });

        it('contains createCart', () => {
          const createCartStub = sinon.stub(ui, 'createCart');
          ui.componentProps.createCart();
          assert.calledOnce(createCartStub);
          createCartStub.restore();
        });

        it('contains closeCart', () => {
          const closeCartStub = sinon.stub(ui, 'closeCart');
          ui.componentProps.closeCart();
          assert.calledOnce(closeCartStub);
          closeCartStub.restore();
        });

        it('contains toggleCart', () => {
          const toggleCartStub = sinon.stub(ui, 'toggleCart');
          ui.componentProps.toggleCart();
          assert.calledOnce(toggleCartStub);
          toggleCartStub.restore();
        });

        it('contains createModal', () => {
          const createModalStub = sinon.stub(ui, 'createModal');
          ui.componentProps.createModal();
          assert.calledOnce(createModalStub);
          createModalStub.restore();
        });

        it('contains closeModal', () => {
          const closeModalStub = sinon.stub(ui, 'closeModal');
          ui.componentProps.closeModal();
          assert.calledOnce(closeModalStub);
          closeModalStub.restore();
        });

        it('contains setActiveEl', () => {
          const setActiveElStub = sinon.stub(ui, 'setActiveEl');
          ui.componentProps.setActiveEl();
          assert.calledOnce(setActiveElStub);
          setActiveElStub.restore();
        });

        it('contains destroyComponent', () => {
          const destroyComponentStub = sinon.stub(ui, 'destroyComponent');
          ui.componentProps.destroyComponent();
          assert.calledOnce(destroyComponentStub);
          destroyComponentStub.restore();
        });

        it('contains tracker', () => {
          assert.equal(ui.componentProps.tracker, ui.tracker);
        });

        it('contains errorReporter', () => {
          assert.equal(ui.componentProps.errorReporter, ui.errorReporter);
        });

        it('contains browser features', () => {
          assert.equal(ui.componentProps.browserFeatures, browserFeatures.default);
        });
      });

      describe('get styleText', () => {
        it('returns string of CSS without conditional styles if browser features include transition, transform, and animation', () => {
          const browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
            transition: true,
            transform: true,
            animation: true,
          });
          assert.equal(ui.styleText, hostStyles + ui.styleOverrides);
          browserFeaturesStub.restore();
        });

        it('returns string of CSS with conditional styles if browser features does not have transition, transform, or animation', () => {
          const browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
            transition: false,
            transform: false,
            animation: false,
          });
          assert.equal(ui.styleText, hostStyles + conditionalStyles + ui.styleOverrides);
          browserFeaturesStub.restore();
        });
      });
    });

    // these technically aren't really private but use the naming convention ._methodName
    describe('private methods', () => {
      describe('_queryEntryNode', () => {
        it('sets entry to data-shopify-buy-ui script if entry does not exist', () => {
          ui.entry = null;
          ui._queryEntryNode();
          assert.equal(ui.entry, script);
        });

        describe('calls _appendToBody if', () => {
          let appendToBodySpy;

          beforeEach(() => {
            appendToBodySpy = sinon.spy(ui, '_appendToBody');
          });

          afterEach(() => {
            appendToBodySpy.restore();
          });

          it('the entry\'s parent node is head', () => {
            ui.entry = {
              parentNode: {
                tagName: 'HEAD',
              },
            };
            ui._queryEntryNode();
            assert.calledOnce(appendToBodySpy);
            assert.equal(appendToBodySpy.args[0][0].tagName, 'DIV');
          });

          it('the entry\'s parent node is HTML', () => {
            ui.entry = {
              parentNode: {
                tagName: 'HTML',
              },
            };
            ui._queryEntryNode();
            assert.calledOnce(appendToBodySpy);
            assert.equal(appendToBodySpy.args[0][0].tagName, 'DIV');
          });

          it('there is no entry', () => {
            ui.entry = null;
            document.body.removeChild(script);
            ui._queryEntryNode();
            assert.calledOnce(appendToBodySpy);
            assert.equal(appendToBodySpy.args[0][0].tagName, 'DIV');
            document.body.appendChild(script);
          });
        });

        it('if entry\'s parent node is not head or html, removes attribute from entry then calls insertBefore on parentNode', () => {
          ui.entry = {
            parentNode: {
              tagName: 'not HEAD or HTML',
              insertBefore: sinon.spy(),
            },
            removeAttribute: sinon.spy(),
          };

          ui._queryEntryNode();
          const insertBeforeArgs = ui.entry.parentNode.insertBefore.args;
          assert.calledWith(ui.entry.removeAttribute, DATA_ATTRIBUTE);
          assert.calledOnce(ui.entry.parentNode.insertBefore);
          assert.equal(insertBeforeArgs[0][0].tagName, 'DIV');
          assert.equal(insertBeforeArgs[0][1], ui.entry);
        });
      });

      describe('_appendToBody', () => {
        it('appends element to body', () => {
          const appendChildSpy = sinon.spy(document.body, 'appendChild');
          const pElement = document.createElement('P');
          ui._appendToBody(pElement);
          assert.calledWith(appendChildSpy, pElement);
          appendChildSpy.restore();
        });
      });

      describe('_appendStyleTag', () => {
        it('appends styletag to document head', () => {
          const styleTag = {
            appendChild: sinon.spy(),
          };
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const appendChildStub = sinon.stub(document.head, 'appendChild');

          ui._appendStyleTag();
          assert.calledWith(appendChildStub, styleTag);
          appendChildStub.restore();
          createElementStub.restore();
        });

        it('sets styleTag cssText to styleText if styleSheet exists in styleTag', () => {
          const styleTag = {
            appendChild: sinon.spy(),
            styleSheet: {cssText: {}},
          };
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const appendChildStub = sinon.stub(document.head, 'appendChild');
          ui._appendStyleTag();
          assert.equal(appendChildStub.args[0][0].styleSheet.cssText, ui.styleText);
          appendChildStub.restore();
          createElementStub.restore();
        });

        it('appends text node to style tag if stylesheet doesnt exist', () => {
          const styleTag = {
            appendChild: sinon.spy(),
          };
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const appendChildStub = sinon.stub(document.head, 'appendChild');
          const createTextNode = sinon.stub(document, 'createTextNode').returnsArg(0);
          ui._appendStyleTag();
          assert.calledWith(styleTag.appendChild, ui.styleText);
          appendChildStub.restore();
          createElementStub.restore();
          createTextNode.restore();
        });
      });

      // event bindings were called in the constructor so these just need to dispatch the event
      describe('event bindings', () => {
        describe('_bindHostClick', () => {
          let closeCartStub;
          let initStub;
          const event = new Event('click');

          beforeEach(() => {
            closeCartStub = sinon.stub(ui, 'closeCart');
            initStub = sinon.stub(Cart.prototype, 'init').resolves();
          });

          afterEach(() => {
            closeCartStub.restore();
            initStub.restore();
            ui.components.cart = [];
          });

          it('does nothing if cart exists and is clicked', () => {
            return ui.createCart({options: {}}).then(() => {
              ui.components.cart[0].node.click();
              assert.notCalled(closeCartStub);
            });
          });

          it('does nothing if cart does not exist', () => {
            document.dispatchEvent(event);
            assert.equal(ui.components.cart.length, 0);
            assert.notCalled(closeCartStub);
          });

          it('calls closeCart if cart exists and a click happened outside of the cart', () => {
            return ui.createCart({options: {}}).then(() => {
              document.dispatchEvent(event);
              assert.calledOnce(closeCartStub);
            });
          });
        });

        describe('_bindResize', () => {
          it('calls throttle with resize and safeResize', () => {
            const throttleStub = sinon.stub(throttle, 'default');
            ui._bindResize();
            assert.calledWith(throttleStub, 'resize', 'safeResize');
            throttleStub.restore();
          });

          describe('on safeResize event', () => {
            let event;

            beforeEach(() => {
              event = new Event('safeResize');
            });

            it('calls view.resize for each collection on safeResize', () => {
              const resizeSpy = sinon.spy();
              ui.components.collection = [
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
              ];

              window.dispatchEvent(event);
              assert.callCount(resizeSpy, 4);
              ui.components.collection = [];
            });

            it('calls view.resize for each productSet on safeResize', () => {
              const resizeSpy = sinon.spy();
              ui.components.productSet = [
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
              ];

              window.dispatchEvent(event);
              assert.callCount(resizeSpy, 3);
              ui.components.productSet = [];
            });

            it('calls view.resize for each product on safeResize', () => {
              const resizeSpy = sinon.spy();
              ui.components.product = [
                {view: {resize: resizeSpy}},
                {view: {resize: resizeSpy}},
              ];

              window.dispatchEvent(event);
              assert.callCount(resizeSpy, 2);
              ui.components.product = [];
            });
          });
        });

        describe('_bindEsc', () => {
          let closeModalSpy;
          let closeCartSpy;
          let event;

          beforeEach(() => {
            closeModalSpy = sinon.spy(ui, 'closeModal');
            closeCartSpy = sinon.spy(ui, 'closeCart');
            event = new Event('keydown');
          });

          afterEach(() => {
            closeModalSpy.restore();
            closeCartSpy.restore();
          });

          it('calls closeModal and closeCart if escape key is pressed', () => {
            event.keyCode = 27; // escape key
            window.dispatchEvent(event);

            assert.calledOnce(closeModalSpy);
            assert.calledOnce(closeCartSpy);
          });

          it('does nothing if escape key was not pressed', () => {
            event.keyCode = 99999;
            window.dispatchEvent(event);

            assert.notCalled(closeModalSpy);
            assert.notCalled(closeCartSpy);
          });
        });

        describe('_bindPostMessage', () => {
          let event;

          beforeEach(() => {
            event = new Event('message');
            event.data = 'test';
          });

          it('parses data from message', () => {
            const parseStub = sinon.stub(JSON, 'parse').returns({});
            window.dispatchEvent(event);
            assert.calledWith(parseStub, 'test');
            parseStub.restore();
          });
        });
      });
    });
  });
});
