import Product from '../../../src/components/product';
import Checkout from '../../../src/components/checkout';
import Cart from '../../../src/components/cart';
import Template from '../../../src/template';
import Component from '../../../src/component';
import ProductView from '../../../src/views/product';
import ProductUpdater from '../../../src/updaters/product';
import windowUtils from '../../../src/utils/window-utils';
import ShopifyBuy from '../../../src/buybutton';
import shopFixture from '../../fixtures/shop-info';
import productFixture from '../../fixtures/product-fixture';
import * as normalizeConfig from '../../../src/utils/normalize-config';
import * as formatMoney from '../../../src/utils/money';
import * as browserFeatures from '../../../src/utils/detect-features';
import * as getUnitPriceBaseUnit from '../../../src/utils/unit-price';

const rootImageURI = 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/';

describe('Product Component class', () => {
  let product;

  describe('constructor', () => {
    let normalizeConfigStub;
    const props = {};
    const constructorConfig = {
      id: 123,
      node: document.createElement('div'),
      storefrontVariantId: 456,
      option: {
        templates: '<div>div</div>',
        contents: {},
        order: {},
      },
    };

    beforeEach(() => {
      normalizeConfigStub = sinon.stub(normalizeConfig, 'default').callsFake((oldConfig) => {
        oldConfig.storefrontId = 'normalizedId';
        return oldConfig;
      });
      product = new Product(constructorConfig, props);
    });

    afterEach(() => {
      normalizeConfigStub.restore();
    });

    it('normalizes config', () => {
      assert.calledOnce(normalizeConfigStub);
      assert.calledWith(normalizeConfigStub, constructorConfig);
      assert.equal(constructorConfig.storefrontId, 'normalizedId');
    });

    it('sets typeKey to product', () => {
      assert.equal(product.typeKey, 'product');
    });

    it('sets defaultStorefrontVariantId to config\'s storefrontVariantId', () => {
      assert.equal(product.defaultStorefrontVariantId, constructorConfig.storefrontVariantId);
    });

    it('sets cachedImage, cart, modal, and selectedImage to null', () => {
      assert.isNull(product.cachedImage);
      assert.isNull(product.cart);
      assert.isNull(product.modal);
      assert.isNull(product.selectedImage);
    });

    it('creates a childTemplate for options', () => {
      assert.instanceOf(product.childTemplate, Template);
    });

    it('sets imgStyle to an empty string', () => {
      assert.equal(product.imgStyle, '');
    });

    it('sets selectedQuantity to 1', () => {
      assert.equal(product.selectedQuantity, 1);
    });

    it('sets selectedVariant and selectedOptions to an empty object', () => {
      assert.deepEqual(product.selectedVariant, {});
      assert.deepEqual(product.selectedOptions, {});
    });

    it('creates a new updater', () => {
      assert.instanceOf(product.updater, ProductUpdater);
    });

    it('creates a new view', () => {
      assert.instanceOf(product.view, ProductView);
    });
  });

  describe('prototype methods', () => {
    let props;
    const config = {
      id: 123,
      node: document.getElementById('qunit-fixture'),
      options: {
        product: {
          viewData: {
            test: 'test string',
          },
        },
      },
    };
    const fetchData = {};
    const fetchHandleData = {};
    let testProductCopy;
    let configCopy;
    let trackSpy;
    let trackMethodStub;
    let closeModalSpy;
    let setActiveElSpy;
    let fetchInfoStub;
    let fetchStub;
    let fetchByHandleStub;

    beforeEach(() => {
      trackSpy = sinon.spy();
      trackMethodStub = sinon.stub().callsFake((fn) => {
        return function(...params) {
          fn(...params);
        };
      });
      closeModalSpy = sinon.spy();
      setActiveElSpy = sinon.spy();
      props = {
        client: ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123,
        }),
        browserFeatures: {
          transition: true,
          animation: true,
          transform: true,
        },
        tracker: {
          trackMethod: trackMethodStub,
          track: trackSpy,
        },
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
        closeModal: closeModalSpy,
        setActiveEl: setActiveElSpy,
      };
      configCopy = Object.assign({}, config);
      configCopy.node = document.createElement('div');
      configCopy.node.setAttribute('id', 'fixture');
      document.body.appendChild(configCopy.node);
      testProductCopy = Object.assign({}, productFixture);
      product = new Product(configCopy, props);
      fetchInfoStub = sinon.stub(props.client.shop, 'fetchInfo').resolves(shopFixture);
      fetchStub = sinon.stub(product.props.client.product, 'fetch').resolves(fetchData);
      fetchByHandleStub = sinon.stub(product.props.client.product, 'fetchByHandle').resolves(fetchHandleData);
    });

    afterEach(() => {
      fetchInfoStub.restore();
      fetchStub.restore();
      fetchByHandleStub.restore();
      document.body.removeChild(configCopy.node);
    });

    describe('stopPropagation()', () => {
      let event;
      let stopImmediatePropagationSpy;

      beforeEach(() => {
        stopImmediatePropagationSpy = sinon.spy();
        event = {
          stopImmediatePropagation: stopImmediatePropagationSpy,
        };
      });

      it('stops propagation of event if component is a button', () => {
        product = Object.defineProperty(product, 'isButton', {
          value: true,
        });
        product.stopPropagation(event);
        assert.calledOnce(stopImmediatePropagationSpy);
      });

      it('does not stop propagation of event if component is not a button', () => {
        product = Object.defineProperty(product, 'isButton', {
          value: false,
        });
        product.stopPropagation(event);
        assert.notCalled(stopImmediatePropagationSpy);
      });
    });

    describe('openOnlineStore()', () => {
      let userEventStub;
      let windowOpenStub;

      beforeEach(() => {
        product = Object.defineProperty(product, 'onlineStoreURL', {
          value: 'test.com',
        });
        userEventStub = sinon.stub(product, '_userEvent');
        windowOpenStub = sinon.stub(window, 'open');
        product.openOnlineStore();
      });

      afterEach(() => {
        userEventStub.restore();
        windowOpenStub.restore();
      });

      it('calls userEvent with openOnlineStore', () => {
        assert.calledOnce(userEventStub);
        assert.calledWith(userEventStub, 'openOnlineStore');
      });

      it('opens window with online store url', () => {
        assert.calledOnce(windowOpenStub);
        assert.calledWith(windowOpenStub, product.onlineStoreURL);
      });
    });

    describe('init()', () => {
      let createCartStub;
      let renderStub;
      const cartMock = {
        node: {},
        view: {},
        template: {},
      };

      beforeEach(() => {
        createCartStub = sinon.stub(product.props, 'createCart').resolves(cartMock);
        renderStub = sinon.stub(product.view, 'render');
      });

      afterEach(() => {
        createCartStub.restore();
        renderStub.restore();
      });

      describe('successful model', () => {
        let superInitStub;
        const modelMock = {model: {}};

        beforeEach(async () => {
          superInitStub = sinon.stub(Component.prototype, 'init').resolves(modelMock);
          await product.init('test');
        });

        afterEach(() => {
          superInitStub.restore();
        });

        it('creates a cart then initializes component', () => {
          assert.equal(product.cart, cartMock);
          assert.calledOnce(createCartStub);
          assert.calledOnce(superInitStub);
          assert.calledWith(superInitStub, 'test');
        });

        it('renders view if model is returned from init', () => {
          assert.calledOnce(renderStub);
        });

        it('returns the model', async () => {
          assert.equal(await product.init('test'), modelMock);
        });
      });

      it('does not render view if model is not returned from init', async () => {
        const superInitStub = sinon.stub(Component.prototype, 'init').resolves(null);
        await product.init('test');
        assert.notCalled(renderStub);
        superInitStub.restore();
      });
    });

    describe('createCart()', () => {
      let createCartStub;

      beforeEach(() => {
        createCartStub = sinon.stub(props, 'createCart').returns('cart');
      });

      afterEach(() => {
        createCartStub.restore();
      });

      it('calls props createCart with correct config', () => {
        product.globalConfig = {
          globalConfig: 'globalConfig',
        };
        const expectedObj = {
          globalConfig: product.globalConfig.globalConfig,
          node: product.globalConfig.cartNode,
          options: product.config,
        };
        product.createCart();
        assert.calledOnce(createCartStub);
        assert.calledWith(createCartStub, expectedObj);
      });

      it('returns props createCart return value', () => {
        assert.equal(product.createCart(), 'cart');
      });
    });

    describe('setupModel()', () => {
      let superSetupModelStub;
      let setDefaultVariantStub;
      let modelMock;
      let data;

      beforeEach(() => {
        data = {
          id: '1',
          title: 'hat',
        };
        modelMock = {
          id: '2',
          title: 'top',
        };
        superSetupModelStub = sinon.stub(Component.prototype, 'setupModel').resolves(modelMock);
        setDefaultVariantStub = sinon.stub(product, 'setDefaultVariant').resolves(productFixture);
      });

      afterEach(() => {
        superSetupModelStub.restore();
        setDefaultVariantStub.restore();
      });

      it('calls parents setupModel and sets default varint with returned model', async () => {
        await product.setupModel(data);
        assert.calledOnce(superSetupModelStub);
        assert.calledWith(superSetupModelStub, data);
        assert.calledOnce(setDefaultVariantStub);
        assert.calledWith(setDefaultVariantStub, modelMock);
      });

      it('returns setDefaultVariant value', async () => {
        assert.equal(await product.setupModel(data), productFixture);
      });
    });

    describe('sdkFetch()', () => {
      it('fetches and returns data with fetch using the first product storefront id if storefront id is passed in as an array', async () => {
        product.storefrontId = ['Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1'];
        const data = await product.sdkFetch();
        assert.calledOnce(fetchStub);
        assert.calledWith(fetchStub, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1');
        assert.equal(data, fetchData);
      });

      it('fetches and returns data with fetch using product storefront id', async () => {
        product.storefrontId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1';
        const data = await product.sdkFetch();
        assert.calledOnce(fetchStub);
        assert.calledWith(fetchStub, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1');
        assert.equal(data, fetchData);
      });

      it('fetches and returns data with fetchByHandle using product handle', async () => {
        product.storefrontId = null;
        product.handle = 'hat';
        const data = await product.sdkFetch();
        assert.calledOnce(fetchByHandleStub);
        assert.calledWith(fetchByHandleStub, 'hat');
        assert.equal(data, fetchHandleData);
      });

      it('rejects if there is an empty storefrontId array and no handle', async () => {
        product.storefrontId = [];
        product.handle = null;
        try {
          await product.sdkFetch();
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'SDK Fetch Failed');
        }
      });

      it('rejects if there is a falsey storefrontId array [null] and no handle', async () => {
        product.storefrontId = [null];
        product.handle = null;
        try {
          await product.sdkFetch();
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'SDK Fetch Failed');
        }
      });

      it('rejects if there is a falsey storefrontId array [""] and no handle', async () => {
        product.storefrontId = [""];
        product.handle = null;
        try {
          await product.sdkFetch();
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'SDK Fetch Failed');
        }
      });

      it('rejects if there is a falsey storefrontId array [0] and no handle', async () => {
        product.storefrontId = [0];
        product.handle = null;
        try {
          await product.sdkFetch();
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'SDK Fetch Failed');
        }
      });

      it('rejects if there is no storefrontId or handle', async () => {
        product.storefrontId = null;
        product.handle = null;
        try {
          await product.sdkFetch();
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'SDK Fetch Failed');
        }
      });
    });

    describe('fetchData', () => {
      describe('if sdkFetch returns a model', () => {
        let sdkFetchStub;
        const modelMock = {
          id: '1',
          handle: 'hat',
        };

        beforeEach(() => {
          sdkFetchStub = sinon.stub(product, 'sdkFetch').resolves(modelMock);
        });

        afterEach(() => {
          sdkFetchStub.restore();
        });

        it('sets storefront id and handle to the respective params in the model returned by sdkFetch', async () => {
          await product.fetchData();
          assert.equal(product.storefrontId, modelMock.id);
          assert.equal(product.handle, modelMock.handle);
        });

        it('returns the model returned by sdkFetch', async () => {
          assert.equal(await product.fetchData(), modelMock);
        });
      });

      it('throws a Not Found error if sdkFetch does not return a model', async () => {
        const sdkFetchStub = sinon.stub(product, 'sdkFetch').resolves();
        try {
          await product.fetchData();
        } catch (error) {
          assert.equal(error, 'Error: Not Found');
        }
        assert.throws(product.fetchData, Error);
        sdkFetchStub.restore();
      });
    });

    describe('onButtonClick()', () => {
      let stopPropagationStub;
      let userEventStub;
      const evt = new Event('click shopify-buy__btn--parent');
      const target = 'shopify-buy__btn--parent';

      beforeEach(async () => {
        const newProduct = await product.init(testProductCopy);
        newProduct.cart.model.lineItems = [];
        newProduct.cart.props.client = newProduct.props.client;
        stopPropagationStub = sinon.stub(Event.prototype, 'stopPropagation');
        userEventStub = sinon.stub(product, '_userEvent');
      });

      afterEach(() => {
        stopPropagationStub.restore();
        userEventStub.restore();
      });

      it('stops propagation', () => {
        product.config.product.buttonDestination = () => { return; };
        product.onButtonClick(evt, target);
        assert.calledOnce(stopPropagationStub);
      });

      it('calls buttonDestination if it is a function', () => {
        const buttonDestinationSpy = sinon.spy();
        product.config.product.buttonDestination = buttonDestinationSpy;
        product.onButtonClick(evt, target);
        assert.calledOnce(buttonDestinationSpy);
        assert.calledWith(buttonDestinationSpy, product);
      });

      describe('if button destination is cart', () => {
        let addToCartStub;

        beforeEach(() => {
          product.config.product.buttonDestination = 'cart';
          addToCartStub = sinon.stub(product.cart, 'addVariantToCart');
        });

        it('closes modal', () => {
          product.onButtonClick(evt, target);
          assert.calledOnce(closeModalSpy);
        });

        it('calls userEvent with addVariantToCart', () => {
          product.onButtonClick(evt, target);
          assert.calledOnce(userEventStub);
          assert.calledWith(userEventStub, 'addVariantToCart');
        });

        it('tracks addVariantToCart', () => {
          product.onButtonClick(evt, target);
          assert.calledOnce(trackMethodStub);
          assert.calledWith(trackMethodStub, sinon.match.func, 'Update Cart', product.selectedVariantTrackingInfo);
          assert.calledOnce(addToCartStub);
          trackMethodStub.getCall(0).args[0]();
          assert.calledTwice(addToCartStub);
        });

        it('adds variant to cart with the right quantity of selected variant', () => {
          product.selectedQuantity = 1111;

          product.onButtonClick(evt, target);
          assert.calledOnce(addToCartStub);
          assert.calledWith(addToCartStub, product.selectedVariant, 1111);
          addToCartStub.restore();
        });

        it('sets target to active el if iframe exists', () => {
          product.iframe = {};
          product.onButtonClick(evt, target);
          assert.calledOnce(setActiveElSpy);
          assert.calledWith(setActiveElSpy, target);
        });
      });

      describe('if button destination is modal', () => {
        let openModalStub;

        beforeEach(() => {
          product.config.product.buttonDestination = 'modal';
          openModalStub = sinon.stub(product, 'openModal');
          product.onButtonClick(evt, target);
        });

        afterEach(() => {
          openModalStub.restore();
        });

        it('sets active element to target', () => {
          assert.calledOnce(setActiveElSpy);
          assert.calledWith(setActiveElSpy, target);
        });

        it('tracks open modal', () => {
          assert.calledOnce(trackSpy);
          assert.calledWith(trackSpy, 'Open modal', product.productTrackingInfo);
        });

        it('opens modal', () => {
          assert.calledOnce(openModalStub);
        });
      });

      it('opens online store if button destination is online store', () => {
        const openOnlineStoreStub = sinon.stub(product, 'openOnlineStore');
        product.config.product.buttonDestination = 'onlineStore';
        product.onButtonClick(evt, target);
        assert.calledOnce(openOnlineStoreStub);
        openOnlineStoreStub.restore();
      });

      describe('if button destination is checkout', () => {
        let createCheckoutStub;
        let openWindowStub;
        const checkoutMock = {id: 1, webUrl: window.location.href};

        beforeEach(() => {
          product.config.product.buttonDestination = 'checkout';
          createCheckoutStub = sinon.stub(product.props.client.checkout, 'create').returns(Promise.resolve(checkoutMock));
          openWindowStub = sinon.stub(window, 'open').returns({location: ''});
        });

        afterEach(() => {
          openWindowStub.restore();
          createCheckoutStub.restore();
        });

        it('calls userEvent with openCheckout', () => {
          product.onButtonClick(evt, target);
          assert.calledOnce(userEventStub);
          assert.calledWith(userEventStub, 'openCheckout');
        });

        it('tracks Direct Checkout', () => {
          product.onButtonClick(evt, target);
          assert.calledOnce(trackSpy);
          assert.calledWith(trackSpy, 'Direct Checkout', {});
        });

        it('opens checkout in a new window if cart popup in config is true and browser supports window.open', () => {
          product.config.cart.popup = true;
          const browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
            windowOpen: () => true,
          });
          const checkout = new Checkout(product.config);
          product.onButtonClick(evt, target);
          assert.calledOnce(openWindowStub);
          assert.calledWith(openWindowStub, '', 'checkout', checkout.params);
          browserFeaturesStub.restore();
        });

        it('does not open checkout in a new window if browser does not support window.open', () => {
          product.config.cart.popup = true;
          const browserFeaturesStub = sinon.stub(browserFeatures, 'default').value({
            windowOpen: () => false,
          });
          createCheckoutStub.rejects();
          product.onButtonClick(evt, target);
          assert.notCalled(openWindowStub);
          browserFeaturesStub.restore();
        });

        it('creates checkout with line items', () => {
          const selectedQuantity = 2;
          product.selectedQuantity = selectedQuantity;

          product.onButtonClick(evt, target);

          assert.calledOnce(createCheckoutStub);
          assert.calledWith(createCheckoutStub, {lineItems: [{
            variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
            quantity: selectedQuantity,
          }]});
        });
      });
    });

    describe('onBlockButtonKeyup()', () => {
      let event;
      let onButtonClickStub;
      const target = {};

      beforeEach(() => {
        event = {};
        onButtonClickStub = sinon.stub(product, 'onButtonClick');
      });

      afterEach(() => {
        onButtonClickStub.restore();
      });

      it('calls onButtonClick if event keycode is the enter key', () => {
        event.keyCode = 13; // enter key
        product.onBlockButtonKeyup(event, target);
        assert.calledOnce(onButtonClickStub);
        assert.calledWith(onButtonClickStub, event, target);
      });

      it('does not call onButtonClick if event keycode is not the enter key', () => {
        event.keyCode = 99;
        product.onBlockButtonKeyup(event, target);
        assert.notCalled(onButtonClickStub);
      });
    });

    describe('onOptionSelect()', () => {
      it('calls updateVariant with event target name and value', () => {
        const updateVariantStub = sinon.stub(product, 'updateVariant');
        const event = {
          target: {
            getAttribute(arg) {
              return arg;
            },
            selectedIndex: 'index',
            options: {
              index: {
                value: 'targetValue',
              },
            },
          },
        };
        product.onOptionSelect(event);
        assert.calledOnce(updateVariantStub);
        assert.calledWith(updateVariantStub, 'name', 'targetValue');
        updateVariantStub.restore();
      });
    });

    describe('onQuantityBlur()', () => {
      it('calls updateQuantity with function to parse target value', () => {
        const target = {
          value: '10',
        };
        const event = {};
        const updateQuantityStub = sinon.stub(product, 'updateQuantity');
        product.onQuantityBlur(event, target);
        assert.calledOnce(updateQuantityStub);
        const callbackValue = updateQuantityStub.getCall(0).args[0]();
        assert.equal(callbackValue, 10);
        updateQuantityStub.restore();
      });
    });

    describe('onQuantityIncrement()', () => {
      it('calls updateQuantity with function to add previous quantity with quantity param', () => {
        const updateQuantityStub = sinon.stub(product, 'updateQuantity');
        product.onQuantityIncrement(3);
        assert.calledOnce(updateQuantityStub);
        const callbackValue = updateQuantityStub.getCall(0).args[0](2);
        assert.equal(callbackValue, 5);
        updateQuantityStub.restore();
      });
    });

    describe('closeCartOnBgClick()', () => {
      let closeSpy;

      beforeEach(() => {
        closeSpy = sinon.spy();
        product.cart = {
          close: closeSpy,
        };
      });

      it('closes cart if it is visible', () => {
        product.cart.isVisible = true;
        product.closeCartOnBgClick();
        assert.calledOnce(closeSpy);
      });

      it('does not close cart if is not visible', () => {
        product.cart.isVisible = false;
        product.closeCartOnBgClick();
        assert.notCalled(closeSpy);
      });
    });

    describe('onCarouselItemClick()', () => {
      let preventDefaultStub;
      let renderStub;
      let event;
      let target;

      beforeEach(() => {
        event = new Event('click');
        target = document.createElement('div');
        preventDefaultStub = sinon.stub(event, 'preventDefault');
        renderStub = sinon.stub(product.view, 'render');
        product.model = productFixture;
      });

      afterEach(() => {
        renderStub.restore();
      });

      it('prevents the event\'s default', () => {
        product.onCarouselItemClick(event, target);
        assert.calledOnce(preventDefaultStub);
      });

      it('sets selected and cached image to image if the image clicked exists in the model', () => {
        target.setAttribute('data-image-id', '1');
        const expectedImage = {
          id: '1',
          src: `${rootImageURI}image-one.jpg`,
        };

        product.onCarouselItemClick(event, target);
        assert.deepEqual(product.selectedImage, expectedImage);
        assert.deepEqual(product.cachedImage, expectedImage);
      });

      it('keeps old selected and cached image if the image clicked does not exist in model', () => {
        target.setAttribute('data-image-id', 'not a valid id');
        const expectedImage = {
          id: '2',
          src: `${rootImageURI}image-two.jpeg`,
        };

        product.selectedImage = expectedImage;
        product.cachedImage = expectedImage;
        product.onCarouselItemClick(event, target);
        assert.equal(product.selectedImage, expectedImage);
        assert.equal(product.cachedImage, expectedImage);
      });

      it('renders the view', () => {
        product.onCarouselItemClick(event, target);
        assert.calledOnce(renderStub);
      });
    });

    describe('nextIndex()', () => {
      beforeEach(() => {
        product.model = {
          images: [1, 2, 3, 4, 5, 6],
        };
      });

      it('returns the sum of the two params if it is above zero and less than the number of images in the model', () => {
        assert.equal(product.nextIndex(2, 3), 5);
      });

      it('returns 0 if the sum of the two params is equal to the number of images in the model', () => {
        assert.equal(product.nextIndex(3, 3), 0);
      });

      it('returns 0 if the sum of the two params is greater than the number of images in the model', () => {
        assert.equal(product.nextIndex(3, 4), 0);
      });

      it('returns one less than the number of images in the model if the sum of the two params is below zero', () => {
        assert.equal(product.nextIndex(-3, 2), product.model.images.length - 1);
      });
    });

    describe('onCarouselChange()', () => {
      let renderStub;
      let nextIndexStub;

      beforeEach(async () => {
        await product.init(testProductCopy);
        renderStub = sinon.stub(product.view, 'render');
        nextIndexStub = sinon.stub(product, 'nextIndex').returns(1);
      });

      afterEach(() => {
        renderStub.restore();
        nextIndexStub.restore();
      });

      it('sets selected image based on offset determined by nextIndex()', () => {
        assert.equal(product.selectedImage.id, 1);
        product.onCarouselChange(3);
        assert.calledOnce(nextIndexStub);
        assert.calledWith(nextIndexStub, 0, 3);
        assert.equal(product.selectedImage.id, 2);
      });

      it('renders the view', () => {
        product.onCarouselChange(1);
        assert.calledOnce(renderStub);
      });

      it('sets cached image to selected image', () => {
        product.onCarouselChange(1);
        assert.equal(product.cachedImage, product.selectedImage);
      });
    });

    describe('openModal()', () => {
      let userEventStub;
      let modalInitStub;
      let createModalStub;
      const modalMock = {};

      beforeEach(() => {
        modalInitStub = sinon.stub().returns(modalMock);
        createModalStub = sinon.stub().returns({
          init: modalInitStub,
        });
        userEventStub = sinon.stub(product, '_userEvent');
        product.props.createModal = createModalStub;
      });

      afterEach(() => {
        userEventStub.restore();
      });

      describe('if modal exists', () => {
        beforeEach(() => {
          product.modal = {
            init: modalInitStub,
          };
        });

        it('re-initializes modal with model', () => {
          product.openModal();
          assert.calledOnce(modalInitStub);
          assert.calledWith(modalInitStub, product.model);
        });
      });

      describe('if modal does not exist', () => {
        beforeEach(() => {
          product.modal = null;
        });

        it('creates a new modal with correct config', () => {
          product.globalConfig = {
            globalConfig: 'config',
            modalNode: 'node',
          };
          product.config = {
            config: 'config',
            modal: {
              modal: 'modal',
            },
          };
          product = Object.defineProperty(product, 'modalProductConfig', {
            value: {},
          });
          const expectedObj = {
            globalConfig: product.globalConfig.globalConfig,
            node: product.globalConfig.modalNode,
            modalNode: product.globalConfig.modalNode,
            options: {
              config: product.config.config,
              product: product.modalProductConfig,
              modal: {
                modal: product.config.modal.modal,
                googleFonts: product.options.googleFonts,
              },
            },
          };
          product.openModal();
          assert.calledOnce(createModalStub);
          assert.calledWith(createModalStub, expectedObj, product.props);
        });

        it('initializes the newly created modal using the product model', () => {
          product.openModal();
          assert.calledOnce(modalInitStub);
          assert.calledWith(modalInitStub, product.model);
        });
      });

      it('calls userEvent with openModal', () => {
        product.modal = {
          init: modalInitStub,
        };
        product.openModal();
        assert.calledOnce(userEventStub);
        assert.calledWith(userEventStub, 'openModal');
      });

      it('returns the init value', () => {
        assert.equal(product.openModal(), modalMock);
      });
    });

    describe('updateQuantity()', () => {
      let funcStub;
      let userEventStub;
      let renderStub;

      beforeEach(() => {
        funcStub = sinon.stub().callsFake((oldQty) => oldQty + 1);
        userEventStub = sinon.stub(product, '_userEvent');
        renderStub = sinon.stub(product.view, 'render');
      });

      afterEach(() => {
        userEventStub.restore();
        renderStub.restore();
      });

      it('calls function param and sets selected quantity to the functions return value', () => {
        product.selectedQuantity = 1;
        product.updateQuantity(funcStub);
        assert.calledOnce(funcStub);
        assert.calledWith(funcStub, 1);
        assert.equal(product.selectedQuantity, 2);
      });

      it('sets selected quantity to zero if quantity after the function param is below zero', () => {
        product.selectedQuantity = -5;
        product.updateQuantity(funcStub);
        assert.equal(product.selectedQuantity, 0);
      });

      it('calls userEvent() with updateQuantity', () => {
        product.updateQuantity(funcStub);
        assert.calledOnce(userEventStub);
        assert.calledWith(userEventStub, 'updateQuantity');
      });

      it('renders the view', () => {
        product.updateQuantity(funcStub);
        assert.calledOnce(renderStub);
      });
    });

    describe('updateVariant()', () => {
      let renderStub;
      let userEventStub;

      beforeEach(async () => {
        await product.init(testProductCopy);
        renderStub = sinon.stub(product.view, 'render');
        userEventStub = sinon.stub(product, '_userEvent');
      });

      afterEach(() => {
        renderStub.restore();
        userEventStub.restore();
      });

      it('updates selected option with the value of the updated option if found in model', () => {
        product.updateVariant('Size', 'large');
        assert.equal(product.selectedOptions.Size, 'large');
      });

      it('sets selected variant to the variant with the selected options', () => {
        const selectedVariant = {id: 'variant', selectedOptions: {}};
        const variantForOptionsStub = sinon.stub(props.client.product.helpers, 'variantForOptions').returns(selectedVariant);
        product.updateVariant('Size', 'large');
        assert.equal(product.selectedVariant, selectedVariant);
        variantForOptionsStub.restore();
      });

      it('does not update selected options or selected variant if option is not found in model', () => {
        product.selectedVariant = 'oldVariant';
        product.updateVariant('fakeName', 'large');
        assert.isUndefined(product.selectedOptions.fakeName);
        assert.equal(product.selectedVariant, 'oldVariant');
      });

      describe('if variant exists', () => {
        let variantForOptionsStub;

        beforeEach(() => {
          product = Object.defineProperty(product, 'variantExists', {
            value: true,
          });
        });

        afterEach(() => {
          if (variantForOptionsStub.restore) {
            variantForOptionsStub.restore();
          }
        });

        it('caches image', () => {
          variantForOptionsStub = sinon.stub(props.client.product.helpers, 'variantForOptions').returns({image: 'test-image'});
          product.updateVariant('Size', 'large');
          assert.equal(product.cachedImage, 'test-image');
        });

        it('sets the selected image to null if selected variant has an image', () => {
          variantForOptionsStub = sinon.stub(props.client.product.helpers, 'variantForOptions').returns({image: 'test-image'});
          product.updateVariant('Size', 'large');
          assert.isNull(product.selectedImage);
        });

        it('sets the selected image to the first image in model if selected variant does not have an image', () => {
          variantForOptionsStub = sinon.stub(props.client.product.helpers, 'variantForOptions').returns({});
          product.updateVariant('Size', 'large');
          assert.equal(product.selectedImage, product.model.images[0]);
        });
      });

      it('sets selected image to the cached image in model if variant does not exist', () => {
        product = Object.defineProperty(product, 'variantExists', {
          value: false,
        });
        const expectedImage = {
          id: '1',
          src: `${rootImageURI}image-one.jpg`,
        };
        product.updateVariant('Size', 'large');
        assert.deepEqual(product.selectedImage, expectedImage);
      });

      it('renders the view', () => {
        product.updateVariant('Size', 'large');
        assert.calledOnce(renderStub);
      });

      it('calls userEvent with updateVariant', () => {
        product.updateVariant('Size', 'large');
        assert.calledOnce(userEventStub);
        assert.calledWith(userEventStub, 'updateVariant');
      });

      it('returns the updated option', () => {
        const updatedOption = product.updateVariant('Size', 'large');
        const expectedObj = {
          name: 'Size',
          selected: 'small',
          values: [{value: 'small'}, {value: 'large'}],
        };
        assert.deepEqual(updatedOption, expectedObj);
      });
    });

    describe('setDefaultVariant()', () => {
      it('sets selected variant and options to matching product.defaultVariantId', () => {
        product.defaultStorefrontVariantId = productFixture.variants[1].id;
        product.setDefaultVariant(productFixture);
        assert.equal(product.selectedVariant, productFixture.variants[1]);
        assert.equal(product.selectedOptions.Print, 'shark');
        assert.equal(product.selectedOptions.Size, 'small');
      });

      it('falls back to first variant and options if an invalid variantId was provided', () => {
        product.defaultStorefrontVariantId = 'this is an invalid variant id';
        product.setDefaultVariant(productFixture);
        assert.equal(product.selectedVariant, productFixture.variants[0]);
        assert.equal(product.selectedOptions.Print, 'sloth');
        assert.equal(product.selectedOptions.Size, 'small');
      });

      it('sets id, selected variant, and selected image to first in model if there is no default storefront variant id', () => {
        product.defaultStorefrontVariantId = null;
        product.setDefaultVariant(productFixture);
        assert.equal(product.defaultStorefrontVariantId, productFixture.variants[0].id);
        assert.equal(product.selectedVariant, productFixture.variants[0]);
        assert.equal(product.selectedImage, productFixture.images[0]);
      });

      it('returns the param', () => {
        assert.equal(product.setDefaultVariant(productFixture), productFixture);
      });
    });


    describe('imageAltText()', () => {
      beforeEach(async () => {
        await product.init(testProductCopy);
      });

      it('returns the passed in image alt text if it is valid', () => {
        assert.equal(product.imageAltText('test alt'), 'test alt');
      })

      it('returns the image title when alt text passed in is null', () => {
        assert.equal(product.imageAltText(null), product.model.title);
      })
    });

    describe('getters', () => {
      describe('shouldUpdateImage', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        it('returns true if there is no cached image', () => {
          product.cachedImage = null;
          assert.isTrue(product.shouldUpdateImage);
        });

        it('returns true if image and cached image are different', () => {
          product = Object.defineProperty(product, 'image', {
            value: {src: 'hat.jpg'},
          });
          product.cachedImage = 'bar.jpg';
          assert.isTrue(product.shouldUpdateImage);
        });

        it('returns false if image and cached image are the same', () => {
          product = Object.defineProperty(product, 'image', {
            value: {src: 'hat.jpg'},
          });
          product.cachedImage = 'hat.jpg';
          assert.isFalse(product.shouldUpdateImage);
        });
      });

      describe('currentImage', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        it('sets cached image to product.image if image should update', () => {
          product = Object.defineProperty(product, 'shouldUpateImage', {
            value: true,
          });
          assert.deepEqual(product.cachedImage, product.image);
        });

        it('does not set cached image to product.image if image should not update', () => {
          product = Object.defineProperty(product, 'shouldUpateImage', {
            value: false,
          });
          product.cachedImage = {
            src: 'not-image-src',
          };
          assert.notDeepEqual(product.cachedImage, product.image);
        });

        it('returns cached image', () => {
          assert.equal(product.currentImage, product.cachedImage);
        });
      });

      describe('image', () => {
        let imageForSizeStub;
        let imageAltTextStub;
        const mockAltText = 'mock alt text';

        beforeEach(async () => {
          await product.init(testProductCopy);
          imageForSizeStub = sinon.stub(product.props.client.image.helpers, 'imageForSize').callsFake((image, dimensions) => {
            return dimensions;
          });
          imageAltTextStub = sinon.stub(product, 'imageAltText').returns(mockAltText);
        });

        afterEach(() => {
          imageForSizeStub.restore();
          imageAltTextStub.restore();
        });

        it('returns null if there is no selected variant and no image with carousel in options', () => {
          product.selectedVariant = null;
          product.config.product.contents.imgWithCarousel = null;
          assert.isNull(product.image);
        });

        it('sets max width to 1000 if width in options is a percent', () => {
          product.config.product.width = '5%';
          assert.equal(product.image.src.maxWidth, 1000);
        });

        it('sets max width to width in options if it is a number', () => {
          product.config.product.width = '5';
          assert.equal(product.image.src.maxWidth, 5);
        });

        it('sets max width to 480 if there is no width in options', () => {
          product.config.product.width = null;
          assert.equal(product.image.src.maxWidth, 480);
        });

        it('sets max width of large image options to 550', () => {
          assert.equal(product.image.srcLarge.maxWidth, 550);
        });

        it('sets max height to 1.5 times the max width', () => {
          const image = product.image;
          assert.equal(image.src.maxHeight, image.src.maxWidth * 1.5);
          assert.equal(image.srcLarge.maxHeight, image.srcLarge.maxWidth * 1.5);
        });

        describe('return object', () => {
          let expectedSrc;
          let expectedSrcLarge;

          beforeEach(() => {
            const maxWidth = parseInt(product.options.width, 10);
            expectedSrc = {maxWidth, maxHeight: maxWidth * 1.5};
            expectedSrcLarge = {maxWidth: 550, maxHeight: 550 * 1.5};
          });

          it('returns object with id, src, srcLarge, srcOriginal, and altText from selected image if selected image exists', () => {
            product.selectedImage = {
              id: '123',
              src: 'hat.jpg',
              altText: 'red hat',
            };

            const expectedObject = {
              id: product.selectedImage.id,
              src: expectedSrc,
              srcLarge: expectedSrcLarge,
              srcOriginal: product.selectedImage.src,
              altText: mockAltText,
            };

            assert.deepEqual(product.image, expectedObject);
            assert.calledTwice(imageForSizeStub);
            assert.calledWith(imageForSizeStub.getCall(0), product.selectedImage, expectedSrc);
            assert.calledWith(imageForSizeStub.getCall(1), product.selectedImage, expectedSrcLarge);
            assert.calledOnce(imageAltTextStub);
            assert.calledWith(imageAltTextStub, product.selectedImage.altText);
          });

          it('returns object with id to null and src, srcLarge, srcOriginal, and altText to empty string if selected variant does not have an image and there are no images in the model', () => {
            product.selectedImage = null;
            product.selectedVariant = {image: null};
            product.model.images = [];
            const expectedObject = {
              id: null,
              src: '',
              srcLarge: '',
              srcOriginal: '',
              altText: '',
            };
            assert.deepEqual(product.image, expectedObject);
            assert.notCalled(imageAltTextStub);
          });

          it('returns object with id, src, srcLarge, srcOriginal, and altText from first image in model if selected variant does not have an image', () => {
            product.selectedImage = null;
            product.selectedVariant = {image: null};
            const firstImage = product.model.images[0];
            const expectedObject = {
              id: firstImage.id,
              src: firstImage.src,
              srcLarge: expectedSrcLarge,
              srcOriginal: firstImage.src,
              altText: mockAltText,
            };

            assert.deepEqual(product.image, expectedObject);
            assert.calledOnce(imageForSizeStub);
            assert.calledWith(imageForSizeStub, firstImage, expectedSrcLarge);
            assert.calledOnce(imageAltTextStub);
            assert.calledWith(imageAltTextStub, firstImage.altText);
          });

          it('returns object with id, src, srcLarge, srcOriginal, and altText from selected variant as default', () => {
            product.selectedImage = null;
            product.selectedVariant = {
              image: {
                id: '456',
                src: 'top.jpg',
                altText: 'tip top',
              },
            };
            const expectedObject = {
              id: product.selectedVariant.image.id,
              src: expectedSrc,
              srcLarge: expectedSrcLarge,
              srcOriginal: product.selectedVariant.image.src,
              altText: mockAltText,
            };
            assert.deepEqual(product.image, expectedObject);
            assert.calledTwice(imageForSizeStub);
            assert.calledWith(imageForSizeStub.getCall(0), product.selectedVariant.image, expectedSrc);
            assert.calledWith(imageForSizeStub.getCall(1), product.selectedVariant.image, expectedSrcLarge);
            assert.calledOnce(imageAltTextStub);
            assert.calledWith(imageAltTextStub, product.selectedVariant.image.altText);
          });
        });
      });

      describe('formatMoney getters', () => {
        let formatMoneyStub;
        let formattedMoney;

        beforeEach(() => {
          formattedMoney = '$5.00';
          formatMoneyStub = sinon.stub(formatMoney, 'default').returns(formattedMoney);
        });

        afterEach(() => {
          formatMoneyStub.restore();
        });

        describe('formattedPrice', () => {
          it('returns empty string if there is no selected variant', () => {
            product.selectedVariant = null;
            assert.equal(product.formattedPrice, '');
          });

          it('returns formatted money with selected variant price and money format from global config if there is a selected variant', () => {
            product.selectedVariant = {
              priceV2: {
                amount: '5.00',
                currencyCode: 'CAD',
              },
            };
            product.globalConfig = {moneyFormat: 'CAD'};
            assert.equal(product.formattedPrice, formattedMoney);
            assert.calledOnce(formatMoneyStub);
            assert.calledWith(formatMoneyStub, product.selectedVariant.priceV2.amount, product.globalConfig.moneyFormat);
          });
        });

        describe('formattedCompareAtPrice', () => {
          it('returns empty string if there is no selected variant', () => {
            product.selectedVariant = null;
            assert.equal(product.formattedCompareAtPrice, '');
          });

          it('returns empty string if there is no compare at price', () => {
            product.selectedVariant.compareAtPriceV2 = null;
            assert.equal(product.formattedCompareAtPrice, '');
          });

          it('returns formatted money with selected variant compare at price and money format from global config if there is a selected variant', () => {
            product.selectedVariant = {
              compareAtPriceV2: {
                amount: '5.00',
                currencyCode: 'CAD',
              },
            };
            product.globalConfig = {moneyFormat: 'CAD'};
            assert.equal(product.formattedCompareAtPrice, formattedMoney);
            assert.calledOnce(formatMoneyStub);
            assert.calledWith(formatMoneyStub, product.selectedVariant.compareAtPriceV2.amount, product.globalConfig.moneyFormat);
          });
        });

        describe('formattedUnitPrice', () => {
          it('returns an empty string if showUnitPrice is false', () => {
            const showUnitPriceStub = sinon.stub(product, 'showUnitPrice').get(() => false);

            assert.equal(product.formattedUnitPrice, '');

            showUnitPriceStub.restore();
          });

          it('returns formatted money with the variant`s unit price and money format from global config if there is a selected variant with a unit price', () => {
            const showUnitPriceStub = sinon.stub(product, 'showUnitPrice').get(() => true);
            product.selectedVariant = {
              unitPrice: {
                amount: '10.00',
                currencyCode: 'CAD',
              },
            };
            product.globalConfig = {moneyFormat: 'CAD'};

            assert.equal(product.formattedUnitPrice, formattedMoney);
            assert.calledOnce(formatMoneyStub);
            assert.calledWith(formatMoneyStub, product.selectedVariant.unitPrice.amount, product.globalConfig.moneyFormat);

            showUnitPriceStub.restore();
          });
        });
      });

      describe('formattedUnitPriceBaseUnit', () => {
        it('returns an empty string if showUnitPrice is false', () => {
          const showUnitPriceStub = sinon.stub(product, 'showUnitPrice').get(() => false);

          assert.equal(product.formattedUnitPriceBaseUnit, '');

          showUnitPriceStub.restore();
        });

        it('returns a formatted base unit from the selected variant`s unit price measurement', () => {
          const mockUnitPriceBaseUnit = '100ml';
          product.selectedVariant = {
            unitPriceMeasurement: {
              referenceValue: '100',
              referenceUnit: 'ML',
            },
          };

          const showUnitPriceStub = sinon.stub(product, 'showUnitPrice').get(() => true);
          const getUnitPriceBaseUnitStub = sinon.stub(getUnitPriceBaseUnit, 'default').returns(mockUnitPriceBaseUnit);
          
          assert.equal(product.formattedUnitPriceBaseUnit, mockUnitPriceBaseUnit);
          assert.calledOnce(getUnitPriceBaseUnitStub);
          assert.calledWith(getUnitPriceBaseUnitStub, product.selectedVariant.unitPriceMeasurement.referenceValue, product.selectedVariant.unitPriceMeasurement.referenceUnit);

          showUnitPriceStub.restore();
          getUnitPriceBaseUnitStub.restore();
        });
      });

      describe('showUnitPrice', () => {
        it('returns false if there is no selected variant', () => {
          product.selectedVariant = null;

          assert.equal(product.showUnitPrice, false);
        });

        it('returns false if the selected variant`s unit price is null', () => {
          product.selectedVariant = {
            unitPrice: null,
          };

          assert.equal(product.showUnitPrice, false);
        });

        it('returns false if the selected variant has a unit price and the unit price content option is false', () => {
          product.selectedVariant = {
            unitPrice: {
              amount: '5.00',
              currencyCode: 'CAD',
            },
          };
          product.config.product.contents.unitPrice = false;

          assert.equal(product.showUnitPrice, false);
        });

        it('returns true if the selected variant has a unit price and the unit price content option is true', () => {
          product.selectedVariant = {
            unitPrice: {
              amount: '5.00',
              currencyCode: 'CAD',
            },
          };

          assert.equal(product.showUnitPrice, true);
        });
      });

      describe('viewData', () => {
        let viewData;

        beforeEach(async () => {
          await product.init(testProductCopy);
          viewData = product.viewData;
        });

        it('returns an object merged with model', () => {
          assert.equal(viewData.title, product.model.title);
          assert.equal(viewData.id, product.model.id);
          assert.equal(viewData.images, product.model.images);
          assert.equal(viewData.options, product.model.options);
          assert.equal(viewData.storeFrontId, product.model.storeFrontId);
          assert.equal(viewData.variants, product.model.variants);
        });

        it('returns an object merged with option\'s viewData', () => {
          assert.equal(viewData.test, product.options.viewData.test);
        });

        it('returns an object with classes', () => {
          assert.deepEqual(viewData.classes, product.classes);
        });

        it('returns an object with contents', () => {
          assert.deepEqual(viewData.contents, product.options.contents);
        });

        it('returns an object with text', () => {
          assert.deepEqual(viewData.text, product.options.text);
        });

        it('returns an object with optionsHtml', () => {
          assert.equal(viewData.optionsHtml, product.optionsHtml);
        });

        it('returns an object with decoratedOptions', () => {
          assert.deepEqual(viewData.decoratedOptions, product.decoratedOptions);
        });

        it('returns an object with currentImage', () => {
          assert.deepEqual(viewData.currentImage, product.currentImage);
        });

        it('returns an object with buttonClass', () => {
          assert.equal(viewData.buttonClass, product.buttonClass);
        });

        it('returns an object with hasVariants', () => {
          assert.equal(viewData.hasVariants, product.hasVariants);
        });

        it('returns an object with buttonDisabled', () => {
          assert.equal(viewData.buttonDisabled, !product.buttonEnabled);
        });

        it('returns an object with selectedVariant', () => {
          assert.equal(viewData.selectedVariant, product.selectedVariant);
        });

        it('returns an object with selectedQuantity', () => {
          assert.equal(viewData.selectedQuantity, product.selectedQuantity);
        });

        it('returns an object with buttonText', () => {
          assert.deepEqual(viewData.buttonText, product.buttonText);
        });

        it('returns an object with imgStyle', () => {
          assert.equal(viewData.imgStyle, product.imgStyle);
        });

        it('returns an object with quantityClass', () => {
          assert.equal(viewData.quantityClass, product.quantityClass);
        });

        it('returns an object with priceClass', () => {
          assert.equal(viewData.priceClass, product.priceClass);
        });

        it('returns an object with formattedPrice', () => {
          assert.equal(viewData.formattedPrice, product.formattedPrice);
        });

        it('returns an object with formattedCompareAtPrice', () => {
          assert.equal(viewData.formattedCompareAtPrice, product.formattedCompareAtPrice);
        });

        it('returns an object with carouslIndex', () => {
          assert.equal(viewData.carouselIndex, 0);
        });

        it('returns an object with carouselImages', () => {
          assert.deepEqual(viewData.carouselImages, product.carouselImages);
        });
      });

      describe('carouselImages', () => {
        let imageForSizeStub;
        let carouselImages;

        beforeEach(async () => {
          await product.init(testProductCopy);
          imageForSizeStub = sinon.stub(product.props.client.image.helpers, 'imageForSize').callsFake((image, dimensions) => {
            return dimensions;
          });
          product = Object.defineProperty(product, 'currentImage', {
            value: testProductCopy.images[0],
          });
          carouselImages = product.carouselImages;
        });

        afterEach(() => {
          imageForSizeStub.restore();
        });

        it('returns an array of objects holding the id and src of each item in the model', () => {
          assert.equal(carouselImages[0].id, testProductCopy.images[0].id);
          assert.equal(carouselImages[0].src, testProductCopy.images[0].src);

          assert.equal(carouselImages[1].id, testProductCopy.images[1].id);
          assert.equal(carouselImages[1].src, testProductCopy.images[1].src);

          assert.equal(carouselImages[2].id, testProductCopy.images[2].id);
          assert.equal(carouselImages[2].src, testProductCopy.images[2].src);

          assert.equal(carouselImages[3].id, testProductCopy.images[3].id);
          assert.equal(carouselImages[3].src, testProductCopy.images[3].src);
        });

        it('sets carouselSrc in returned array to imageForSize return value for each model image', () => {
          const expectedParam = {maxWidth: 100, maxHeight: 100};
          assert.callCount(imageForSizeStub, testProductCopy.images.length);

          assert.calledWith(imageForSizeStub.getCall(0), testProductCopy.images[0], expectedParam);
          assert.deepEqual(carouselImages[0].carouselSrc, expectedParam);

          assert.calledWith(imageForSizeStub.getCall(1), testProductCopy.images[1], expectedParam);
          assert.deepEqual(carouselImages[1].carouselSrc, expectedParam);

          assert.calledWith(imageForSizeStub.getCall(2), testProductCopy.images[2], expectedParam);
          assert.deepEqual(carouselImages[2].carouselSrc, expectedParam);

          assert.calledWith(imageForSizeStub.getCall(3), testProductCopy.images[3], expectedParam);
          assert.deepEqual(carouselImages[3].carouselSrc, expectedParam);
        });

        it('sets isSelected in returned array to true if the image id is equal to the current image id', () => {
          assert.isTrue(carouselImages[0].isSelected);
          assert.isFalse(carouselImages[1].isSelected);
          assert.isFalse(carouselImages[2].isSelected);
          assert.isFalse(carouselImages[3].isSelected);
        });
      });

      describe('buttonClass', () => {
        beforeEach(() => {
          Object.defineProperties(product, {
            buttonEnabled: {
              writable: true,
            },
            options: {
              writable: true,
              value: {
                contents: {},
              },
            },
            classes: {
              value: {
                disabled: 'disabled',
                product: {
                  buttonBesideQty: 'buttonBesideQty',
                },
              },
            },
          });
        });

        it('contains disabled class if button is not enabled', () => {
          product.buttonEnabled = false;
          assert.include(product.buttonClass, product.classes.product.disabled);
        });

        it('does not contain disabled class if button is enabled', () => {
          product.buttonEnabled = true;
          assert.notInclude(product.buttonClass, product.classes.product.disabled);
        });

        it('contains buttonBesideQty class if button has quantity', () => {
          product.options = {
            contents: {buttonWithQuantity: true},
          };
          assert.include(product.buttonClass, product.classes.product.buttonBesideQty);
        });

        it('does not contain buttonBesideQty class if button does not have quantity', () => {
          product.options = {
            contents: {buttonWithQuantity: false},
          };
          assert.notInclude(product.buttonClass, product.classes.product.buttonBesideQty);
        });
      });

      describe('quantityClass', () => {
        beforeEach(() => {
          product = Object.defineProperty(product, 'classes', {
            value: {
              product: {
                quantityWithButtons: 'quantityWithButtons',
              },
            },
          });
        });

        it('returns quantityWithButtons class if quantityIncrement in options is true', () => {
          product.config.product.contents.quantityIncrement = true;
          product.config.product.contents.quantityDecrement = false;
          assert.equal(product.quantityClass, product.classes.product.quantityWithButtons);
        });

        it('returns quantityWithButtons class if quantityDecrement in options is true', () => {
          product.config.product.contents.quantityIncrement = false;
          product.config.product.contents.quantityDecrement = true;
          assert.equal(product.quantityClass, product.classes.product.quantityWithButtons);
        });

        it('returns an empty string if quantityIncrement and quantityDecrement in options are both false', () => {
          product.config.product.contents.quantityIncrement = false;
          product.config.product.contents.quantityDecrement = false;
          assert.equal(product.quantityClass, '');
        });
      });

      describe('buttonText', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
          Object.defineProperties(product, {
            variantExists: {
              writable: true,
            },
            variantInStock: {
              writable: true,
            },
          });
        });

        it('returns button text if button destination is modal', () => {
          product.config.product.buttonDestination = 'modal';
          assert.equal(product.buttonText, product.options.text.button);
        });

        it('returns unavailable text if variant does not exist', () => {
          product.variantExists = false;
          assert.equal(product.buttonText, product.options.text.unavailable);
        });

        it('returns out of stock text if variant is out of stock', () => {
          product.variantExists = true;
          product.variantInStock = false;
          assert.equal(product.buttonText, product.options.text.outOfStock);
        });

        it('returns button text if variant is available', () => {
          product.variantExists = true;
          product.variantInStock = true;
          assert.equal(product.buttonText, product.options.text.button);
        });
      });

      describe('buttonEnabled', () => {
        it('returns true if button destination is modal', () => {
          product.config.product.buttonDestination = 'modal';
          assert.isTrue(product.buttonEnabled);
        });

        describe('when button destination is not modal', () => {
          beforeEach(() => {
            product.config.product.buttonDestination = 'cart';
            Object.defineProperties(product, {
              buttonActionAvailable: {
                writable: true,
              },
              variantExists: {
                writable: true,
              },
              variantInStock: {
                writable: true,
              },
            });
          });

          it('returns false if button action is not available', () => {
            product.buttonActionAvailable = false;
            product.variantExists = true;
            product.variantInStock = true;
            assert.isFalse(product.buttonEnabled);
          });

          it('returns false if variant does not exist', () => {
            product.buttonActionAvailable = true;
            product.variantExists = false;
            product.variantInStock = true;
            assert.isFalse(product.buttonEnabled);
          });

          it('returns false if variant is not in stock', () => {
            product.buttonActionAvailable = true;
            product.variantExists = true;
            product.variantInStock = false;
            assert.isFalse(product.buttonEnabled);
          });

          it('returns true if button action is available, product exists, and product is in stock', () => {
            product.buttonActionAvailable = true;
            product.variantExists = true;
            product.variantInStock = true;
            assert.isTrue(product.buttonEnabled);
          });
        });
      });

      describe('variantExists', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        it('returns true if variant exists in model', () => {
          product.selectedVariant = {id: testProductCopy.variants[0].id};
          assert.isTrue(product.variantExists);
        });

        it('returns false if selected variant does not exist', () => {
          product.selectedVariant = null;
          assert.isFalse(product.variantExists);
        });

        it('returns false if selected variant is not in model', () => {
          product.selectedVariant = {id: 'non-existent-id'};
          assert.isFalse(product.variantExists);
        });
      });

      describe('variantInStock', () => {
        beforeEach(() => {
          product = Object.defineProperty(product, 'variantExists', {
            writable: true,
          });
        });

        it('returns true if variant exists and selected variant is available', () => {
          product.variantExists = true;
          product.selectedVariant = {available: true};
          assert.isTrue(product.variantInStock);
        });

        it('returns false if variant does not exist', () => {
          product.variantExists = false;
          product.selectedVariant = {available: true};
          assert.isFalse(product.variantInStock);
        });

        it('returns false if selected variant is not available', () => {
          product.variantExists = true;
          product.selectedVariant = {available: false};
          assert.isFalse(product.variantInStock);
        });
      });

      describe('hasVariants', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        it('returns true if there are multiple variants in model', () => {
          product.model.variants = [{id: 123}, {id: 234}];
          assert.isTrue(product.hasVariants);
        });

        it('returns false if there is one variant in model', () => {
          product.model.variants = [{id: 123}];
          assert.isFalse(product.hasVariants);
        });

        it('returns false if there is no variant in model', () => {
          product.model.variants = [];
          assert.isFalse(product.hasVariants);
        });
      });

      describe('requiresCart', () => {
        it('returns true if button destination is cart', () => {
          product.config.product.buttonDestination = 'cart';
          assert.isTrue(product.requiresCart);
        });

        it('returns false if button destination is not cart', () => {
          product.config.product.buttonDestination = 'checkout';
          assert.isFalse(product.requiresCart);
        });
      });

      describe('buttonActionAvailable', () => {
        beforeEach(() => {
          Object.defineProperty(product, 'requiresCart', {
            writable: true,
          });
        });

        it('returns true if product does not require cart', () => {
          product.requiresCart = false;
          assert.isTrue(product.buttonActionAvailable);
        });

        it('returns true if a cart exists', () => {
          product.cart = {};
          assert.isTrue(product.buttonActionAvailable);
        });

        it('returns false if product requires cart and cart does not exist', () => {
          product.requiresCart = true;
          assert.isFalse(product.buttonActionAvailable);
        });
      });

      describe('hasQuantity', () => {
        it('returns quantityInput from options.contents', () => {
          product.config.product.contents = {quantityInput: 'quantityInput'};
          assert.equal(product.hasQuantity, product.options.contents.quantityInput);
        });
      });

      describe('priceClass', () => {
        it('returns loweredPrice class if selected variant has a compare at price', () => {
          product = Object.defineProperty(product, 'classes', {
            value: {
              product: {
                loweredPrice: 'loweredPrice',
              },
            },
          });
          product.selectedVariant = {
            compareAtPriceV2: {
              amount: '5.00',
              currencyCode: 'CAD',
            },
          };
          assert.equal(product.priceClass, product.classes.product.loweredPrice);
        });

        it('returns empty string if selected variant does not have a compare at price', () => {
          product.selectedVariant = {compareAtPriceV2: null};
          assert.equal(product.priceClass, '');
        });
      });

      describe('isButton', () => {
        it('returns false if option\'s isButton is false', () => {
          product.config.product.isButton = false;
          assert.isFalse(product.isButton);
        });

        describe('when option\'s isButton is true', () => {
          beforeEach(() => {
            product.config.product.isButton = true;
          });

          it('returns false if a button exists', () => {
            product.config.product.contents.button = true;
            assert.isFalse(product.isButton);
          });

          it('returns false if a button with quantity exists', () => {
            product.config.product.contents.buttonWithQuantity = true;
            assert.isFalse(product.isButton);
          });

          it('returns true if there is no button or button with quantity', () => {
            product.config.product.contents.button = false;
            product.config.product.contents.buttonWithQuantity = false;
            assert.isTrue(product.isButton);
          });
        });
      });

      describe('DOMEvents', () => {
        it('binds closeCartOnBgClick to click', () => {
          const closeCartOnBgClickStub = sinon.stub(product, 'closeCartOnBgClick');
          product.DOMEvents.click();
          assert.calledOnce(closeCartOnBgClickStub);
          closeCartOnBgClickStub.restore();
        });

        describe('stopPropagation bindings', () => {
          let stopPropagationStub;

          beforeEach(() => {
            stopPropagationStub = sinon.stub(product, 'stopPropagation');
          });

          afterEach(() => {
            stopPropagationStub.restore();
          });

          it('binds stopPropagation to select click', () => {
            product.DOMEvents[`click ${product.selectors.option.select}`]();
            assert.calledOnce(stopPropagationStub);
          });

          it('binds stopPropagation to select focus', () => {
            product.DOMEvents[`focus ${product.selectors.option.select}`]();
            assert.calledOnce(stopPropagationStub);
          });

          it('binds stopPropagation to wrapper click', () => {
            product.DOMEvents[`click ${product.selectors.option.wrapper}`]();
            assert.calledOnce(stopPropagationStub);
          });

          it('binds stopPropagation to quantityInput click', () => {
            product.DOMEvents[`click ${product.selectors.product.quantityInput}`]();
            assert.calledOnce(stopPropagationStub);
          });

          it('binds stopPropagation to quantityButton click', () => {
            product.DOMEvents[`click ${product.selectors.product.quantityButton}`]();
            assert.calledOnce(stopPropagationStub);
          });
        });

        it('binds onOptionSelect to select change', () => {
          const onOptionSelectStub = sinon.stub(product, 'onOptionSelect');
          product.DOMEvents[`change ${product.selectors.option.select}`]();
          assert.calledOnce(onOptionSelectStub);
          onOptionSelectStub.restore();
        });

        describe('onButtonClick bindings', () => {
          let onButtonClickStub;

          beforeEach(() => {
            onButtonClickStub = sinon.stub(product, 'onButtonClick');
          });

          afterEach(() => {
            onButtonClickStub.restore();
          });

          it('binds onButtonClick to button click', () => {
            product.DOMEvents[`click ${product.selectors.product.button}`]();
            assert.calledOnce(onButtonClickStub);
          });

          it('binds onButtonClick to blockButton click', () => {
            product.DOMEvents[`click ${product.selectors.product.blockButton}`]();
            assert.calledOnce(onButtonClickStub);
          });
        });

        it('binds onBlockButtonKeyup to blockButton keyup', () => {
          const onBlockButtonKeyupStub = sinon.stub(product, 'onBlockButtonKeyup');
          product.DOMEvents[`keyup ${product.selectors.product.blockButton}`]();
          assert.calledOnce(onBlockButtonKeyupStub);
          onBlockButtonKeyupStub.restore();
        });

        describe('onQuantityIncrement bindngs', () => {
          let onQuantityIncrementStub;

          beforeEach(() => {
            onQuantityIncrementStub = sinon.stub(product, 'onQuantityIncrement');
          });

          afterEach(() => {
            onQuantityIncrementStub.restore();
          });

          it('binds onQuantityIncrement to quantityIncrement click', () => {
            product.DOMEvents[`click ${product.selectors.product.quantityIncrement}`]();
            assert.calledOnce(onQuantityIncrementStub);
            assert.calledWith(onQuantityIncrementStub, 1);
          });

          it('binds onQuantityIncrement to quantityDecrement click', () => {
            product.DOMEvents[`click ${product.selectors.product.quantityDecrement}`]();
            assert.calledOnce(onQuantityIncrementStub);
            assert.calledWith(onQuantityIncrementStub, -1);
          });
        });

        it('binds onQuantityBlur to quantityInput blur', () => {
          const onQuantityBlurStub = sinon.stub(product, 'onQuantityBlur');
          product.DOMEvents[`blur ${product.selectors.product.quantityInput}`]();
          assert.calledOnce(onQuantityBlurStub);
          onQuantityBlurStub.restore();
        });

        it('binds onCarouselItemClick to carouselItem click', () => {
          const onCarouselItemClickStub = sinon.stub(product, 'onCarouselItemClick');
          product.DOMEvents[`click ${product.selectors.product.carouselItem}`]();
          assert.calledOnce(onCarouselItemClickStub);
          onCarouselItemClickStub.restore();
        });

        describe('onCarouselChange bindings', () => {
          let onCarouselChangeStub;

          beforeEach(() => {
            onCarouselChangeStub = sinon.stub(product, 'onCarouselChange');
          });

          afterEach(() => {
            onCarouselChangeStub.restore();
          });

          it('binds onCarouselChange to carouselNext click', () => {
            product.DOMEvents[`click ${product.selectors.product.carouselNext}`]();
            assert.calledOnce(onCarouselChangeStub);
            assert.calledWith(onCarouselChangeStub, 1);
          });

          it('binds onCarouselChange to carouselPrevious click', () => {
            product.DOMEvents[`click ${product.selectors.product.carouselPrevious}`]();
            assert.calledOnce(onCarouselChangeStub);
            assert.calledWith(onCarouselChangeStub, -1);
          });
        });

        it('merges DOMEvents from options', () => {
          const DOMEventSpy = sinon.spy();
          product.config.product.DOMEvents = {DOMEvent: DOMEventSpy};
          product.DOMEvents.DOMEvent();
          assert.calledOnce(DOMEventSpy);
        });
      });

      describe('optionsHtml', () => {
        let renderStub;
        const template = '<div></div>';

        beforeEach(() => {
          renderStub = sinon.stub(product.childTemplate, 'render').returns(template);
          product = Object.defineProperty(product, 'decoratedOptions', {
            writable: true,
            value: [{
              name: 'Print',
              values: [{name: 'sloth', selected: true}],
            }],
          });
          product.model = {
            options: [{
              name: 'Print',
              values: [
                {value: 'sloth'},
              ],
            }],
          };
        });

        afterEach(() => {
          renderStub.restore();
        });

        it('returns empty string if there are no options in contents', () => {
          product.config.product.contents = {options: null};
          assert.equal(product.optionsHtml, '');
        });

        it('renders object that merged decorated option with view data', () => {
          const optionsHtml = product.optionsHtml;
          const renderedData = renderStub.getCall(0).args[0].data;
          assert.include(renderedData, product.decoratedOptions[0]);
          assert.include(renderedData, product.options.viewData);
          assert.isString(optionsHtml);
        });

        it('adds product classes to rendered data object', () => {
          const optionsHtml = product.optionsHtml;
          const renderedData = renderStub.getCall(0).args[0].data;
          assert.deepEqual(renderedData.classes, product.classes);
          assert.isString(optionsHtml);
        });

        it('sets onlyOption in rendered data to true if there is only one option in model', () => {
          const optionsHtml = product.optionsHtml;
          const renderedData = renderStub.getCall(0).args[0].data;
          assert.equal(product.model.options.length, 1);
          assert.isTrue(renderedData.onlyOption);
          assert.isString(optionsHtml);
        });

        it('sets onlyOption in rendered data to false if there is more than one option in model', () => {
          product.model.options.push({
            name: 'Size',
            values: [
              {value: 'small'},
            ],
          });
          const optionsHtml = product.optionsHtml;
          const renderedData = renderStub.getCall(0).args[0].data;
          assert.isFalse(renderedData.onlyOption);
          assert.isString(optionsHtml);
        });

        it('renders data for each option in decorated options', () => {
          product.decoratedOptions.push({
            name: 'Size',
            values: [{name: 'small', selected: true}],
          });
          const optionsHtml = product.optionsHtml;
          const firstExpectedObject = {
            data: {
              name: 'Print',
              values: [{name: 'sloth', selected: true}],
              test: 'test string',
              classes: product.classes,
              onlyOption: true,
            },
          };
          const secondExpectedObject = {
            data: {
              name: 'Size',
              values: [{name: 'small', selected: true}],
              test: 'test string',
              classes: product.classes,
              onlyOption: true,
            },
          };
          assert.calledTwice(renderStub);
          assert.calledWith(renderStub.getCall(0), firstExpectedObject);
          assert.calledWith(renderStub.getCall(1), secondExpectedObject);
          assert.isString(optionsHtml);
        });

        it('returns rendered template', () => {
          assert.equal(product.optionsHtml, template);
          product.decoratedOptions.push({
            name: 'Size',
            values: [{name: 'small', selected: true}],
          });
          assert.equal(product.optionsHtml, template + template);
        });
      });

      describe('decoratedOptions', () => {
        it('it returns an array of options with correctly selected value', async () => {
          const expectedArray = [
            {
              name: 'Print',
              values: [
                {
                  name: 'sloth',
                  selected: true,
                },
                {
                  name: 'shark',
                  selected: false,
                },
                {
                  name: 'cat',
                  selected: false,
                },
              ],
            },
            {
              name: 'Size',
              values: [
                {
                  name: 'small',
                  selected: true,
                },
                {
                  name: 'large',
                  selected: false,
                },
              ],
            },
          ];
          await product.init(testProductCopy);
          product.selectedOptions = {
            Print: 'sloth',
            Size: 'small',
          };
          assert.deepEqual(product.decoratedOptions, expectedArray);
        });
      });


      describe('modalProductConfig', () => {
        beforeEach(() => {
          product.config.modalProduct = {
            buttonDestination: 'cart',
          };
        });

        it('return an object that includes modal product from config', () => {
          assert.deepInclude(product.modalProductConfig, product.config.modalProduct);
        });

        it('returns a styles object with only whitelisted properties from styles in product config', () => {
          const expectedObject = {
            style1: {
              background: 'background',
              'background-color': 'background-color',
              border: 'border',
              'border-radius': 'border-radius',
              ':hover': {
                color: 'color',
                'border-color': 'border-color',
                'border-width': 'border-width',
              },
            },
            style2: {
              'border-style': 'border-style',
              transition: 'transition',
              'text-transform': 'text-transform',
              'text-shadow': 'text-shadow',
              '@media': {
                'box-shadow': 'box-shadow',
                'font-size': 'font-size',
                'font-family': 'font-family',
              },
            },
          };
          product.config.product.styles = JSON.parse(JSON.stringify(expectedObject));
          product.config.product.styles.style1['non-whitelist-style'] = 'not-in-whitelist';
          product.config.product.styles.style1[':hover']['non-whitelist-style2'] = 'also-not-in-whitelist';
          product.config.product.styles.style2['non-whitelist-style3'] = 'still-not-in-whitelist';
          product.config.product.styles.style2['@media']['non-whitelist-style4'] = 'does-not-exist-in-whitelist';
          assert.deepEqual(product.modalProductConfig.styles, expectedObject);
        });

        it('returns object with an empty object for styles if there is no styles in product config', () => {
          assert.deepInclude(product.modalProductConfig, {styles: {}});
        });
      });

      describe('trackingInfo', () => {
        let expectedContentString;

        beforeEach(() => {
          product.config.product.buttonDestination = 'cart';
          product.model.id = 'lakjjk3ls3546lslsdkjf==';
          product.model.variants = [
            {
              id: 'Xkdljlejkskskl3Zsike',
              title: 'variant 1',
              priceV2: {
                amount: '6.0',
              },
            },
          ];
          expectedContentString = Object.keys(product.options.contents).filter((key) => product.options.contents[key]).toString();
        });

        it('returns a tracking info object with first variant\'s info if there is no selected variant', () => {
          product.selectedVariant = null;

          const expectedObject = {
            id: product.model.id,
            name: product.model.title,
            variantId: product.model.variants[0].id,
            variantName: product.model.variants[0].title,
            price: product.model.variants[0].priceV2.amount,
            destination: product.options.buttonDestination,
            layout: product.options.layout,
            contents: expectedContentString,
            checkoutPopup: product.config.cart.popup,
            sku: null,
          };

          assert.deepEqual(product.trackingInfo, expectedObject);
        });

        it('returns a tracking info object with the selected variant\'s info if selected variant exists', () => {
          product.selectedVariant = {
            title: 'hat',
            id: 'AAkdlfjljwijk3j35j3ljksLqQkslj',
            priceV2: {
              amount: '5.00',
              currencyCode: 'CAD',
            },
          };
          const expectedObject = {
            id: product.model.id,
            name: product.model.title,
            variantId: product.selectedVariant.id,
            variantName: product.selectedVariant.title,
            price: product.selectedVariant.priceV2.amount,
            destination: product.options.buttonDestination,
            layout: product.options.layout,
            contents: expectedContentString,
            checkoutPopup: product.config.cart.popup,
            sku: null,
          };
          assert.deepEqual(product.trackingInfo, expectedObject);
        });
      });

      describe('selectedVariantTrackingInfo', () => {
        it('returns a tracking info object with selected variant info', () => {
          product.selectedVariant = {
            id: '456',
            title: 'hat',
            priceV2: {
              amount: '5.00',
              currencyCode: 'CAD',
            },
          };
          product.selectedQuantity = 5;
          const expectedObject = {
            id: product.selectedVariant.id,
            name: product.selectedVariant.title,
            productId: product.model.id,
            productName: product.model.title,
            quantity: product.selectedQuantity,
            sku: null,
            price: product.selectedVariant.priceV2.amount,
          };
          assert.deepEqual(product.selectedVariantTrackingInfo, expectedObject);
        });
      });

      describe('productTrackingInfo', () => {
        beforeEach(() => {
          product.model.id = 'Xkldjfjkej3l4jl3j5ljsodjflll';
        });

        it('returns a tracking info object with product id', () => {
          const expectedObject = {
            id: product.model.id,
          };
          assert.deepEqual(product.productTrackingInfo, expectedObject);
        });
      });

      describe('onlineStore getters', () => {
        let windowStub;
        const expectedQs = '?channel=buy_button&referrer=http%3A%2F%2Ftest.com&variant=12345&';

        beforeEach(() => {
          windowStub = sinon.stub(windowUtils, 'location').returns('http://test.com');
          product.selectedVariant = {id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ=='};
        });

        afterEach(() => {
          windowStub.restore();
        });

        describe('onlineStoreParams', () => {
          it('returns an object with url params', () => {
            assert.deepEqual(product.onlineStoreParams, {
              channel: 'buy_button',
              referrer: 'http%3A%2F%2Ftest.com',
              variant: '12345',
            });
          });
        });

        describe('onlineStoreQueryString', () => {
          it('returns query string from online store params', () => {
            assert.equal(product.onlineStoreQueryString, expectedQs);
          });
        });

        describe('onlineStoreURL', () => {
          it('returns URL for a product on online store', () => {
            product.model.onlineStoreUrl = 'https://test.myshopify.com/products/123';
            assert.equal(product.onlineStoreURL, `https://test.myshopify.com/products/123${expectedQs}`);
          });
        });
      });
    });
  });
});
