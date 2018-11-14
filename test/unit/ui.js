import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Product from '../../src/components/product';
import Modal from '../../src/components/modal';
import Tracker from '../../src/utils/track';
import ProductSet from '../../src/components/product-set';
import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import * as browserFeatures from '../../src/utils/detect-features';
import * as throttle from '../../src/utils/throttle';
import hostStyles from '../../src/styles/host/host';
import conditionalStyles from '../../src/styles/host/conditional';
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
  let notifyExceptionSpy;

  beforeEach(() => {
    notifyExceptionSpy = sinon.spy();
    integrations = {
      errorReporter: {notifyException: notifyExceptionSpy},
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
      ui = null;
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

    it('calls tracker.trackPageview()', () => {
      assert.calledOnce(trackPageviewStub);
    });

    it('sets activeEl to null', () => {
      assert.equal(ui.activeEl, null);
    });

    it('calls _appendStyleTag()', () => {
      assert.calledOnce(appendStyleTagStub);
    });

    it('calls private event binding methods', () => {
      assert.calledOnce(resizeStub);
      assert.calledOnce(hostClickStub);
      assert.calledOnce(escStub);
      assert.calledWith(escStub, window);
      assert.calledOnce(postMessageStub);
    });
  });

  describe('prototype methods', () => {
    beforeEach(() => {
      ui = new UI(client, integrations);
    });

    describe('component methods', () => {
      describe('createComponent()', () => {
        const productConfig = {
          id: 123,
          options: {},
          node: 'test',
        };

        describe('successful component initialization', () => {
          let initStub;
          let trackStub;
          let queryEntryNodeStub;

          beforeEach(() => {
            initStub = sinon.stub(Product.prototype, 'init').resolves();
            trackStub = sinon.stub(ui, 'trackComponent');
            queryEntryNodeStub = sinon.stub(ui, '_queryEntryNode').returns('testNode');
          });

          afterEach(() => {
            initStub.restore();
            trackStub.restore();
            queryEntryNodeStub.restore();
            ui.components.product = [];
          });

          it('creates new component of type with tracker attached', async () => {
            await ui.createComponent('product', productConfig);
            assert.equal(1, ui.components.product.length);
            assert.instanceOf(ui.components.product[0], Product);
            assert.calledOnce(initStub);
            assert.calledOnce(trackStub);
            assert.equal(trackStub.getCall(0).args[0], 'product');
            assert.instanceOf(trackStub.getCall(0).args[1], Product);
          });

          it('grabs node from _queryEntryNode() if no node is passed in from config', async () => {
            productConfig.node = null;

            await ui.createComponent('product', productConfig);
            assert.calledOnce(queryEntryNodeStub);
            assert.equal(productConfig.node, 'testNode');
          });

          it('returns the component', async () => {
            const response = await ui.createComponent('product', productConfig);
            assert.instanceOf(response, Product);
          });
        });

        describe('unsuccessful component initialization', () => {
          let errorInitStub;
          let consoleErrorStub;
          const error = {errors: [{message: 'rejected.'}]};

          beforeEach(() => {
            errorInitStub = sinon.stub(Product.prototype, 'init').rejects(error);
            consoleErrorStub = sinon.stub(console, 'error');
          });

          afterEach(() => {
            errorInitStub.restore();
            consoleErrorStub.restore();
          });

          it('catches any error from initialization and notifies errorReporter if it exists', async () => {
            await ui.createComponent('product', productConfig);
            assert.throws(ui.createComponent, Error);
            assert.calledOnce(notifyExceptionSpy);
            assert.calledWith(notifyExceptionSpy, error);
          });

          it('errors out the console with the error', async () => {
            await ui.createComponent('product', productConfig);
            assert.throws(ui.createComponent, Error);
            assert.calledOnce(consoleErrorStub);
            assert.calledWith(consoleErrorStub, error);
          });
        });
      });

      describe('destroyComponent()', () => {
        let destroySpy;
        let testCart;

        beforeEach(() => {
          destroySpy = sinon.spy();
          testCart = {
            model: {
              id: 123,
            },
            destroy: destroySpy,
          };
        });

        it('destroys component and removes component from components array if the id param matches with the component model\'s id', () => {
          ui.components.cart.push(testCart);
          assert.equal(ui.components.cart[0].model.id, 123);
          ui.destroyComponent('cart', 123);
          assert.equal(0, ui.components.cart.length);
          assert.calledOnce(destroySpy);
        });
      });

      describe('trackComponent()', () => {
        let trackComponentStub;

        beforeEach(() => {
          trackComponentStub = sinon.stub(Tracker.prototype, 'trackComponent');
        });

        afterEach(() => {
          trackComponentStub.restore();
        });

        it('tracks each product in set if the component is a productSet', () => {
          const productSet = {
            trackingInfo: [1, 2, 3],
          };

          ui.trackComponent('productSet', productSet);
          assert.callCount(trackComponentStub, 3);
          assert.calledWith(trackComponentStub.getCall(0), 'product', 1);
          assert.calledWith(trackComponentStub.getCall(1), 'product', 2);
          assert.calledWith(trackComponentStub.getCall(2), 'product', 3);
        });

        it('tracks component with the given component type if the component is not a productSet', () => {
          const component = {
            trackingInfo: 'test',
          };

          ui.trackComponent('testType', component);
          assert.calledOnce(trackComponentStub);
          assert.calledWith(trackComponentStub, 'testType', 'test');
        });
      });
    });

    describe('cart methods', () => {
      afterEach(() => {
        ui.components.cart = [];
      });

      describe('createCart()', () => {
        let initStub;
        let appendChildStub;

        beforeEach(() => {
          initStub = sinon.stub(Cart.prototype, 'init').resolves('test');
          appendChildStub = sinon.stub(document.body, 'appendChild').returns({
            parentNode: {
              insertBefore: sinon.spy(),
              removeChild: sinon.spy(),
            },
          });
        });

        afterEach(() => {
          initStub.restore();
          appendChildStub.restore();
        });

        describe('when no cart exists', () => {
          it('creates a new cart', async () => {
            await ui.createCart({options: {}});
            assert.equal(1, ui.components.cart.length);
            assert.instanceOf(ui.components.cart[0], Cart);
            assert.calledOnce(initStub);
          });

          it('returns the init value', async () => {
            const response = await ui.createCart({options: {}});
            assert.equal(response, 'test');
          });
        });

        describe('when a cart exists', () => {
          let createTogglesStub;

          beforeEach(() => {
            createTogglesStub = sinon.stub().resolves();
            ui.components.cart = [{
              toggles: [1, 2],
              createToggles: createTogglesStub,
            }];
          });

          it('does not create a second cart', async () => {
            await ui.createCart({options: {}});
            assert.equal(1, ui.components.cart.length);
            assert.notCalled(initStub);
          });

          it('creates toggles for the first cart if the first cart has less toggles than the config', async () => {
            const createCartConfig = {toggles: [1, 2, 3]};
            await ui.createCart(createCartConfig);
            assert.calledOnce(createTogglesStub);
            assert.calledWith(createTogglesStub, createCartConfig);
          });

          it('does not create toggles for the first cart if the first cart has an equal amount of toggles to the config', async () => {
            await ui.createCart({toggles: [1, 2]});
            assert.notCalled(createTogglesStub);
          });

          it('does not create toggles for the first cart if the first cart has more toggles than the config', async () => {
            await ui.createCart({toggles: [1]});
            assert.notCalled(createTogglesStub);
          });

          it('returns the first cart', async () => {
            const createCartConfig = {toggles: [1, 2, 3]};
            const response = await ui.createCart(createCartConfig);
            assert.equal(response, ui.components.cart[0]);
          });
        });
      });

      describe('closeCart()', () => {
        it('closes every visible cart and restores focus after each close', () => {
          const closeSpy1 = sinon.spy();
          const closeSpy2 = sinon.spy();
          const closeSpy3 = sinon.spy();
          const restoreFocusStub = sinon.stub(ui, 'restoreFocus');
          ui.components.cart = [
            {isVisible: true, close: closeSpy1},
            {isVisible: true, close: closeSpy2},
            {isVisible: false, close: closeSpy3},
          ];
          ui.closeCart();
          assert.calledOnce(closeSpy1);
          assert.calledOnce(closeSpy2);
          assert.notCalled(closeSpy3);
          assert.callCount(restoreFocusStub, 2);
          restoreFocusStub.restore();
        });
      });

      describe('openCart()', () => {
        it('opens every cart', () => {
          const openSpy1 = sinon.spy();
          const openSpy2 = sinon.spy();
          const openSpy3 = sinon.spy();
          const openSpy4 = sinon.spy();

          ui.components.cart = [
            {isVisible: true, open: openSpy1},
            {isVisible: true, open: openSpy2},
            {isVisible: false, open: openSpy3},
            {isVisible: false, open: openSpy4},
          ];
          ui.openCart();
          assert.calledOnce(openSpy1);
          assert.calledOnce(openSpy2);
          assert.calledOnce(openSpy3);
          assert.calledOnce(openSpy4);
        });
      });

      describe('toggleCart()', () => {
        it('toggles visibility of every cart to visibility param', () => {
          const toggleSpy1 = sinon.spy();
          const toggleSpy2 = sinon.spy();
          const toggleSpy3 = sinon.spy();
          ui.components.cart = [
            {toggleVisibility: toggleSpy1},
            {toggleVisibility: toggleSpy2},
            {toggleVisibility: toggleSpy3},
          ];
          ui.toggleCart(true);

          assert.calledOnce(toggleSpy1);
          assert.calledWith(toggleSpy1, true);

          assert.calledOnce(toggleSpy2);
          assert.calledWith(toggleSpy2, true);

          assert.calledOnce(toggleSpy3);
          assert.calledWith(toggleSpy3, true);
        });

        it('restores focus only if visibility param is false', () => {
          const restoreFocusStub = sinon.stub(ui, 'restoreFocus');
          ui.toggleCart(true);
          assert.notCalled(restoreFocusStub);
          ui.toggleCart(false);
          assert.calledOnce(restoreFocusStub);
          restoreFocusStub.restore();
        });
      });
    });

    describe('modal methods', () => {
      afterEach(() => {
        ui.components.modal = [];
      });

      describe('createModal()', () => {
        let appendChildStub;

        beforeEach(() => {
          appendChildStub = sinon.stub(document.body, 'appendChild').returns({
            parentNode: {
              insertBefore: sinon.spy(),
              removeChild: sinon.spy(),
            },
          });
        });

        afterEach(() => {
          appendChildStub.restore();
        });

        it('creates and returns a new modal if one does not already exist', () => {
          const modal = ui.createModal({options: {}});
          assert.equal(1, ui.components.modal.length);
          assert.instanceOf(ui.components.modal[0], Modal);
          assert.instanceOf(modal, Modal);
        });

        it('does not create a modal and returns first modal if it already exists', () => {
          ui.components.modal = [{options: {}}];
          const modal = ui.createModal({options: {}});
          assert.equal(1, ui.components.modal.length);
          assert.equal(modal, ui.components.modal[0]);
        });
      });

      describe('closeModal()', () => {
        let restoreFocusStub;

        beforeEach(() => {
          restoreFocusStub = sinon.stub(ui, 'restoreFocus');
        });

        afterEach(() => {
          restoreFocusStub.restore();
        });

        it('closes every modal then restores focus once all is done', () => {
          const closeSpy1 = sinon.spy();
          const closeSpy2 = sinon.spy();
          const closeSpy3 = sinon.spy();
          ui.components.modal = [
            {close: closeSpy1},
            {close: closeSpy2},
            {close: closeSpy3},
          ];

          ui.closeModal();
          assert.calledOnce(closeSpy1);
          assert.calledOnce(closeSpy2);
          assert.calledOnce(closeSpy3);
          assert.calledOnce(restoreFocusStub);
        });

        it('does not restore focus if there are no modals', () => {
          ui.components.modal = [];
          ui.closeModal();
          assert.notCalled(restoreFocusStub);
        });
      });
    });

    describe('setActiveEl()', () => {
      it('sets activeEl to element param', () => {
        ui.setActiveEl('test');
        assert.equal(ui.activeEl, 'test');
      });
    });

    describe('restoreFocus()', () => {
      let focusSpy;

      beforeEach(() => {
        focusSpy = sinon.spy();
        ui.activeEl = {focus: focusSpy};
        ui = Object.defineProperty(ui, 'modalOpen', {
          writable: true,
        });
        ui = Object.defineProperty(ui, 'cartOpen', {
          writable: true,
        });
      });

      it('focuses on activeEl if activeEl exists and both modal and cart are closed', () => {
        ui.modalOpen = false;
        ui.cartOpen = false;

        ui.restoreFocus();
        assert.calledOnce(focusSpy);
      });

      it('does not focus on activeEl if modal is open', () => {
        ui.modalOpen = true;
        ui.cartOpen = false;

        ui.restoreFocus();
        assert.notCalled(focusSpy);
      });

      it('does not focus on activeEl if cart is open', () => {
        ui.modalOpen = false;
        ui.cartOpen = true;

        ui.restoreFocus();
        assert.notCalled(focusSpy);
      });
    });

    describe('getters', () => {
      describe('modalOpen', () => {
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

      describe('cartOpen', () => {
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

      describe('componentProps', () => {
        it('contains the client', () => {
          assert.equal(ui.componentProps.client, ui.client);
        });

        it('contains createCart()', () => {
          const createCartStub = sinon.stub(ui, 'createCart');
          ui.componentProps.createCart();
          assert.calledOnce(createCartStub);
          createCartStub.restore();
        });

        it('contains closeCart()', () => {
          const closeCartStub = sinon.stub(ui, 'closeCart');
          ui.componentProps.closeCart();
          assert.calledOnce(closeCartStub);
          closeCartStub.restore();
        });

        it('contains toggleCart()', () => {
          const toggleCartStub = sinon.stub(ui, 'toggleCart');
          ui.componentProps.toggleCart();
          assert.calledOnce(toggleCartStub);
          toggleCartStub.restore();
        });

        it('contains createModal()', () => {
          const createModalStub = sinon.stub(ui, 'createModal');
          ui.componentProps.createModal();
          assert.calledOnce(createModalStub);
          createModalStub.restore();
        });

        it('contains closeModal()', () => {
          const closeModalStub = sinon.stub(ui, 'closeModal');
          ui.componentProps.closeModal();
          assert.calledOnce(closeModalStub);
          closeModalStub.restore();
        });

        it('contains setActiveEl()', () => {
          const setActiveElStub = sinon.stub(ui, 'setActiveEl');
          ui.componentProps.setActiveEl();
          assert.calledOnce(setActiveElStub);
          setActiveElStub.restore();
        });

        it('contains destroyComponent()', () => {
          const destroyComponentStub = sinon.stub(ui, 'destroyComponent');
          ui.componentProps.destroyComponent();
          assert.calledOnce(destroyComponentStub);
          destroyComponentStub.restore();
        });

        it('contains tracker', () => {
          assert.equal(ui.componentProps.tracker, ui.tracker);
        });

        it('contains error reporter', () => {
          assert.equal(ui.componentProps.errorReporter, ui.errorReporter);
        });

        it('contains browser features', () => {
          assert.equal(ui.componentProps.browserFeatures, browserFeatures.default);
        });
      });

      describe('styleText', () => {
        let browserFeaturesStub;

        afterEach(() => {
          browserFeaturesStub.restore();
        });

        it('returns string of CSS with host styles and style overrides if browser features include transition, transform, and animation', () => {
          browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
            transition: true,
            transform: true,
            animation: true,
          });
          assert.equal(ui.styleText, hostStyles + ui.styleOverrides);
        });

        describe('missing browser features', () => {
          let expectedString;

          beforeEach(() => {
            expectedString = hostStyles + conditionalStyles + ui.styleOverrides;
          });

          it('returns string of CSS with host styles, conditional styles, and style overrides if browser features does not have transition', () => {
            browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
              transition: false,
              transform: true,
              animation: true,
            });
            assert.equal(ui.styleText, expectedString);
          });

          it('returns string of CSS with host styles, conditional styles, and style overrides if browser features does not have transform', () => {
            browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
              transition: true,
              transform: false,
              animation: true,
            });
            assert.equal(ui.styleText, expectedString);
          });

          it('returns string of CSS with host styles, conditional styles, and style overrides if browser features does not have animation', () => {
            browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
              transition: true,
              transform: true,
              animation: false,
            });
            assert.equal(ui.styleText, expectedString);
          });
        });
      });
    });

    describe('"private" methods', () => {
      describe('_queryEntryNode', () => {
        let appendToBodyStub;
        let createElementStub;
        const div = document.createElement('div');

        beforeEach(() => {
          appendToBodyStub = sinon.stub(ui, '_appendToBody');
          createElementStub = sinon.stub(document, 'createElement').returns(div);
        });

        afterEach(() => {
          appendToBodyStub.restore();
          createElementStub.restore();
        });

        it('sets entry to data-shopify-buy-ui script if entry does not exist', () => {
          ui.entry = null;
          ui._queryEntryNode();
          assert.equal(ui.entry, script);
        });

        it('appends to body if the entry\'s parent node is head', () => {
          ui.entry = {
            parentNode: {
              tagName: 'HEAD',
            },
          };
          ui._queryEntryNode();
          assert.calledOnce(appendToBodyStub);
          assert.calledWith(appendToBodyStub, div);
        });

        it('appends to body if the entry\'s parent node is HTML', () => {
          ui.entry = {
            parentNode: {
              tagName: 'HTML',
            },
          };
          ui._queryEntryNode();
          assert.calledOnce(appendToBodyStub);
          assert.calledWith(appendToBodyStub, div);
        });

        it('appends to body if there is no entry', () => {
          const querySelectorAllStub = sinon.stub(window.document, 'querySelectorAll').returns([null]);
          ui.entry = null;
          ui._queryEntryNode();
          assert.calledOnce(appendToBodyStub);
          assert.calledWith(appendToBodyStub, div);
          querySelectorAllStub.restore();
        });

        it('appends to body, removes attribute from entry then calls insertBefore on parentNode if entry\'s parent node is not head or html', () => {
          const insertBeforeSpy = sinon.spy();
          const removeAttributeSpy = sinon.spy();
          ui.entry = {
            parentNode: {
              tagName: 'not HEAD or HTML',
              insertBefore: insertBeforeSpy,
            },
            removeAttribute: removeAttributeSpy,
          };

          ui._queryEntryNode();
          assert.calledOnce(removeAttributeSpy);
          assert.calledWith(removeAttributeSpy, DATA_ATTRIBUTE);
          assert.calledOnce(insertBeforeSpy);
          assert.calledWith(insertBeforeSpy, div, ui.entry);
        });

        it('returns the created div', () => {
          assert.equal(ui._queryEntryNode(), div);
        });
      });

      describe('_appendToBody', () => {
        it('appends element to body', () => {
          const appendChildStub = sinon.stub(document.body, 'appendChild');
          const pElement = document.createElement('P');
          ui._appendToBody(pElement);
          assert.calledOnce(appendChildStub);
          assert.calledWith(appendChildStub, pElement);
          appendChildStub.restore();
        });
      });

      describe('_appendStyleTag', () => {
        let styleTag;
        let styleTagAppendChildSpy;

        beforeEach(() => {
          styleTagAppendChildSpy = sinon.spy();
          styleTag = {
            appendChild: styleTagAppendChildSpy,
          };
        });

        it('appends styletag to document head', () => {
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const headAppendChildStub = sinon.stub(document.head, 'appendChild');

          ui._appendStyleTag();
          assert.calledOnce(headAppendChildStub);
          assert.calledWith(headAppendChildStub, styleTag);
          headAppendChildStub.restore();
          createElementStub.restore();
        });

        it('sets styleTag\'s cssText to styleText if styleSheet exists in styleTag', () => {
          styleTag.styleSheet = {cssText: {}};
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const headAppendChildStub = sinon.stub(document.head, 'appendChild');
          ui._appendStyleTag();

          assert.calledOnce(headAppendChildStub);
          assert.equal(headAppendChildStub.getCall(0).args[0].styleSheet.cssText, ui.styleText);
          headAppendChildStub.restore();
          createElementStub.restore();
        });

        it('appends text node to style tag if stylesheet does not exist', () => {
          const createElementStub = sinon.stub(document, 'createElement').returns(styleTag);
          const headAppendChildStub = sinon.stub(document.head, 'appendChild');
          const createTextNode = sinon.stub(document, 'createTextNode').returnsArg(0);
          ui._appendStyleTag();
          assert.calledOnce(styleTagAppendChildSpy);
          assert.calledWith(styleTagAppendChildSpy, ui.styleText);
          headAppendChildStub.restore();
          createElementStub.restore();
          createTextNode.restore();
        });
      });

      // event bindings were called in the constructor so these just need to dispatch the event
      describe('event bindings', () => {
        describe('_bindHostClick', () => {
          let closeCartStub;
          let initStub;
          let event;

          beforeEach(() => {
            closeCartStub = sinon.stub(ui, 'closeCart');
            initStub = sinon.stub(Cart.prototype, 'init').resolves();
            event = new Event('click', {bubbles: true});
          });

          afterEach(() => {
            closeCartStub.restore();
            initStub.restore();
          });

          it('does nothing if cart is clicked', () => {
            const node = document.createElement('div');
            ui.components.cart = [{node}];
            ui.components.cart[0].node.dispatchEvent(event);
            assert.notCalled(closeCartStub);
          });

          it('does nothing if cart does not exist', () => {
            ui.components.cart = [];
            document.dispatchEvent(event);
            assert.equal(ui.components.cart.length, 0);
            assert.notCalled(closeCartStub);
          });

          it('closes cart if it exists and a click happened outside of the cart', () => {
            const node = document.createElement('div');
            ui.components.cart = [{node}];
            document.dispatchEvent(event);
            assert.calledOnce(closeCartStub);
          });
        });

        describe('_bindResize', () => {
          it('throttles with resize and safeResize params', () => {
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

            it('resizes view for each collection on safeResize', () => {
              const resizeSpy1 = sinon.spy();
              const resizeSpy2 = sinon.spy();

              ui.components.collection = [
                {view: {resize: resizeSpy1}},
                {view: {resize: resizeSpy2}},
              ];

              window.dispatchEvent(event);
              assert.calledOnce(resizeSpy1);
              assert.calledOnce(resizeSpy2);
              ui.components.collection = [];
            });

            it('resizes view for each productSet', () => {
              const resizeSpy1 = sinon.spy();
              const resizeSpy2 = sinon.spy();
              const resizeSpy3 = sinon.spy();
              ui.components.productSet = [
                {view: {resize: resizeSpy1}},
                {view: {resize: resizeSpy2}},
                {view: {resize: resizeSpy3}},
              ];

              window.dispatchEvent(event);
              assert.calledOnce(resizeSpy1);
              assert.calledOnce(resizeSpy2);
              assert.calledOnce(resizeSpy3);
              ui.components.productSet = [];
            });

            it('resizes view for each product', () => {
              const resizeSpy1 = sinon.spy();
              const resizeSpy2 = sinon.spy();
              ui.components.product = [
                {view: {resize: resizeSpy1}},
                {view: {resize: resizeSpy2}},
              ];

              window.dispatchEvent(event);
              assert.calledOnce(resizeSpy1);
              assert.calledOnce(resizeSpy2);
              ui.components.product = [];
            });
          });
        });

        describe('_bindEsc', () => {
          let closeModalStub;
          let closeCartStub;
          let event;

          beforeEach(() => {
            closeModalStub = sinon.stub(ui, 'closeModal');
            closeCartStub = sinon.stub(ui, 'closeCart');
            event = new Event('keydown', {bubbles: true});
          });

          afterEach(() => {
            closeModalStub.restore();
            closeCartStub.restore();
          });

          it('closes modal and cart if escape key is pressed', () => {
            event.keyCode = 27; // escape key
            window.dispatchEvent(event);
            assert.calledOnce(closeModalStub);
            assert.calledOnce(closeCartStub);
          });

          it('does nothing if escape key was not pressed', () => {
            event.keyCode = 99999;
            window.dispatchEvent(event);

            assert.notCalled(closeModalStub);
            assert.notCalled(closeCartStub);
          });
        });

        describe('_bindPostMessage', () => {
          let event;
          let parseStub;

          beforeEach(() => {
            parseStub = sinon.stub(JSON, 'parse').returns({});
            event = new Event('message');
            event.data = 'test';
          });

          afterEach(() => {
            parseStub.restore();
          });

          it('parses data from message', () => {
            window.dispatchEvent(event);
            // called once is not tested because the stub is on the global JSON instance rather than the class instance
            assert.calledWith(parseStub, 'test');
          });
        });
      });
    });
  });
});
