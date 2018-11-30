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
        let createCheckoutPromise;
        let addLineItemsStub;
        let addLineItemsPromise;
        let openWindowStub;
        const checkoutMock = {id: 1, webUrl: window.location};

        beforeEach(() => {
          product.config.product.buttonDestination = 'checkout';
          createCheckoutPromise = new Promise((resolve) => {
            createCheckoutStub = sinon.stub(product.props.client.checkout, 'create').callsFake(() => {
              resolve();
              return Promise.resolve(checkoutMock);
            });
          });
          addLineItemsPromise = new Promise((resolve) => {
            addLineItemsStub = sinon.stub(product.props.client.checkout, 'addLineItems').callsFake(() => {
              resolve(checkoutMock);
              return Promise.resolve(checkoutMock);
            });
          });
          openWindowStub = sinon.stub(window, 'open').returns({location: ''});

        });

        afterEach(() => {
          openWindowStub.restore();
          createCheckoutStub.restore();
          addLineItemsStub.restore();
        });

        it('calls userEvent with openCheckout', async () => {
          product.onButtonClick(evt, target);
          await Promise.all([createCheckoutPromise, addLineItemsPromise]);
          assert.calledOnce(userEventStub);
          assert.calledWith(userEventStub, 'openCheckout');
        });

        it('tracks Direct Checkout', async () => {
          product.onButtonClick(evt, target);
          await Promise.all([createCheckoutPromise, addLineItemsPromise]);
          assert.calledOnce(trackSpy);
          assert.calledWith(trackSpy, 'Direct Checkout', {});
        });

        it('opens checkout in a new window if cart popup in config is true', async () => {
          product.config.cart.popup = true;
          const checkout = new Checkout(product.config);
          product.onButtonClick(evt, target);
          await Promise.all([createCheckoutPromise, addLineItemsPromise]);
          assert.calledOnce(openWindowStub);
          assert.calledWith(openWindowStub, '', 'checkout', checkout.params);
        });

        it('creates checkout and adds line items', async () => {
          const selectedQuantity = 2;
          product.selectedQuantity = selectedQuantity;

          product.onButtonClick(evt, target);
          await Promise.all([createCheckoutPromise, addLineItemsPromise]);

          assert.calledOnce(createCheckoutStub);
          assert.calledOnce(addLineItemsStub);
          assert.calledWith(addLineItemsStub, checkoutMock.id, [{
            variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
            quantity: selectedQuantity,
          }]);
        });
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

          it('sets active element to target', () => {
            assert.calledOnce(setActiveElSpy);
            assert.calledWith(setActiveElSpy, target);
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
          let createCheckout;
          let createCheckoutPromise;
          let addLineItems;
          let addLineItemsPromise;
          let openWindowStub;
          const checkoutMock = {id: 1, webUrl: 'testUrl'};

          beforeEach(() => {
            product.config.product.buttonDestination = 'checkout';
            createCheckoutPromise = new Promise((resolve) => {
              createCheckout = sinon.stub(product.props.client.checkout, 'create').callsFake(() => {
                resolve();
                return Promise.resolve(checkoutMock);
              });
            });
            addLineItemsPromise = new Promise((resolve) => {
              addLineItems = sinon.stub(product.props.client.checkout, 'addLineItems').callsFake(() => {
                resolve();
                return Promise.resolve(checkoutMock);
              });
            });
            openWindowStub = sinon.stub(window, 'open').returns({location: ''});

          });

          afterEach(() => {
            openWindowStub.restore();
            createCheckout.restore();
            addLineItems.restore();
          });

          it('calls userEvent with openCheckout', async () => {
            product.onButtonClick(evt, target);
            await Promise.all([createCheckoutPromise, addLineItemsPromise]);
            assert.calledOnce(userEventStub);
            assert.calledWith(userEventStub, 'openCheckout');
          });

          it('tracks Direct Checkout', async () => {
            product.onButtonClick(evt, target);
            await Promise.all([createCheckoutPromise, addLineItemsPromise]);
            assert.calledOnce(trackSpy);
            assert.calledWith(trackSpy, 'Direct Checkout', {});
          });

          it('opens checkout in a new window if cart popup in config is true', async () => {
            product.config.cart.popup = true;
            const checkout = new Checkout(product.config);
            product.onButtonClick(evt, target);
            await Promise.all([createCheckoutPromise, addLineItemsPromise]);
            assert.calledOnce(openWindowStub);
            assert.calledWith(openWindowStub, '', 'checkout', checkout.params);
          });

          it('sets checkoutWindow to current window if cart popup in config is false', async () => {
            product.config.cart.popup = true;
            product.onButtonClick(evt, target);
            await Promise.all([createCheckoutPromise, addLineItemsPromise]);
            assert.equal(window.location, checkoutMock.webUrl);
          });

          it('create checkout and add line items are called when destination is checkout', async () => {
            const selectedQuantity = 2;
            product.selectedQuantity = selectedQuantity;

            product.onButtonClick(evt, target);
            await Promise.all([createCheckoutPromise, addLineItemsPromise]);

            assert.calledOnce(createCheckout);
            assert.calledOnce(addLineItems);
            assert.calledWith(addLineItems, checkoutMock.id, [{
              variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
              quantity: selectedQuantity,
            }]);
          });
        });
      });

      describe('onCarouselChange()', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        it('sets selected image based on various offsets', () => {
          product.onCarouselChange(-1);
          assert.equal(product.image.src, `${rootImageURI}image-four_280x420.jpeg`);
          product.onCarouselChange(-1);
          assert.equal(product.image.src, `${rootImageURI}image-three_280x420.jpg`);
          product.onCarouselChange(1);
          assert.equal(product.image.src, `${rootImageURI}image-four_280x420.jpeg`);
          product.onCarouselChange(1);
          assert.equal(product.image.src, `${rootImageURI}image-one_280x420.jpg`);
        });
      });

      describe('openModal()', () => {
        describe('if modal exists', () => {
          let modalInitSpy;

          beforeEach(() => {
            modalInitSpy = sinon.spy();
            product.modal = {
              init: modalInitSpy,
            };
          });

          it('re-initializes modal with model', () => {
            product.openModal();
            assert.calledWith(modalInitSpy, product.model);
          });
        });

        describe('if modal does not exist', () => {
          let initSpy;
          let createModalStub;

          beforeEach(() => {
            initSpy = sinon.spy();
            createModalStub = sinon.stub().returns({
              init: initSpy,
            });
            product.modal = null;
            product.props.createModal = createModalStub;
          });

          it('creates Modal and initializes modal with model', () => {
            product.openModal();
            assert.calledWith(createModalStub, sinon.match.object, product.props);
            assert.calledWith(initSpy, product.model);
          });
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
        const expectedImage = {
          id: 1,
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

    describe('getters', () => {
      describe('shouldUpdateImage', () => {
        describe('if no cached image', () => {
          it('returns true', () => {
            product.cachedImage = null;
            assert.ok(product.shouldUpdateImage);
          });
        });

        describe('if image and cached image are different', () => {
          beforeEach(async () => {
            product.config.product.width = '100px';
            await product.init(testProductCopy);
          });

          it('returns true', () => {
            product.cachedImage = 'bar.jpg';
            assert.ok(product.shouldUpdateImage);
          });
        });

        describe('if image and cached image are same', () => {
          beforeEach(async () => {
            product.config.product.width = '240px';
            await product.init(testProductCopy);
          });

          it('returns true', () => {
            product.cachedImage = `${rootImageURI}image-one_240x360.jpg`;
            assert.notOk(product.shouldUpdateImage);
          });
        });
      });

      describe('currentImage', () => {
        describe('if variant exists', () => {
          it('returns selected image', async () => {
            await product.init(testProductCopy);
            assert.equal(product.currentImage.src, `${rootImageURI}image-one_280x420.jpg`);
          });
        });

        describe('if variant does not exist', () => {
          it('returns cached image', async () => {
            await product.init(testProductCopy);
            product.selectedVariant = {};
            assert.equal(product.currentImage.src, `${rootImageURI}image-one_280x420.jpg`);
          });
        });
      });

      describe('image', () => {
        describe('default', () => {
          beforeEach(async () => {
            await product.init(testProductCopy);
          });

          it('returns 480x720 default image', () => {
            product.config.product.width = null;
            assert.equal(product.image.src, `${rootImageURI}image-one_480x720.jpg`);
          });

          it('returns a srcLarge image option', () => {
            product.config.product.width = null;
            assert.equal(product.image.srcLarge, `${rootImageURI}image-one_550x825.jpg`);
          });
        });

        describe('if selected variant doesn\'t have an image', () => {
          beforeEach(async () => {
            testProductCopy.variants[0].image = null;
            await product.init(testProductCopy);
            product.selectedImage = null;
            product.defaultStorefrontVariantId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==';
          });

          it('returns the default product image', () => {
            assert.equal(product.image.src, `${rootImageURI}image-one.jpg`);
          });

          describe('if selected variant and its product don\'t have an image', () => {
            it('returns no image', () => {
              product.model.images = [];
              assert.equal(product.image.src, '');
            });
          });
        });

        describe('if width explicitly set and layout vertical', () => {
          beforeEach(async () => {
            product.config.product.width = '160px';
            await product.init(testProductCopy);
          });

          it('returns smallest image larger than explicit width', () => {
            assert.equal(product.image.src, `${rootImageURI}image-one_160x240.jpg`);
          });
        });

        describe('when user selects an image from thumbnails', () => {
          beforeEach(async () => {
            await product.init(testProductCopy);
            product.selectedImage = product.model.images[2];
          });

          it('returns selected image', () => {
            assert.equal(product.image.src, `${rootImageURI}image-three_280x420.jpg`);
          });

          it('returns selected image of appropriate size if set', () => {
            product.config.product.width = '480px';
            assert.equal(product.image.src, `${rootImageURI}image-three_480x720.jpg`);
          });
        });
      });

      describe('viewData', () => {
        it('returns supplemental view info', async () => {
          await product.init(testProductCopy);
          const viewData = product.viewData;
          assert.equal(viewData.buttonText, 'ADD TO CART');
          assert.ok(viewData.optionsHtml);
          assert.equal(viewData.currentImage.src, `${rootImageURI}image-one_280x420.jpg`);
          assert.ok(viewData.hasVariants);
          assert.equal(viewData.test, 'test string');
        });
      });

      describe('buttonText', () => {
        beforeEach(async () => {
          await product.init(testProductCopy);
        });

        describe('when variant does not exist', () => {
          it('returns unavailable text', () => {
            product.selectedVariant = null;
            assert.equal(product.buttonText, product.options.text.unavailable);
          });
        });

        describe('when variant is out of stock', () => {
          it('returns out of stock text', () => {
            product.selectedVariant = {
              id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
              available: false,
            };
            assert.equal(product.buttonText, product.options.text.outOfStock);
          });
        });

        describe('when variant is available', () => {
          it('returns button text', () => {
            product.selectedVariant = {
              id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
              available: true,
            };
            assert.equal(product.buttonText, product.options.text.button);
          });
        });
      });

      describe('buttonEnabled', () => {
        describe('if buttonActionAvailable is false', () => {
          it('returns false', () => {
            product.cart = null;
            assert.notOk(product.buttonEnabled);
          });
        });

        describe('if buttonActionAvailable is true', () => {
          beforeEach(async () => {
            await product.init(testProductCopy);
          });

          describe('if variant is in stock', () => {
            it('returns true', () => {
              assert.ok(product.buttonEnabled);
            });
          });

          describe('if variant is not in stock', () => {
            it('returns false', () => {
              product.selectedVariant = {
                available: false,
              };
              assert.notOk(product.buttonEnabled);
            });
          });
        });
      });

      describe('variantExists', () => {
        describe('if variant exists for selected options', () => {
          it('returns true', async () => {
            await product.init(testProductCopy);
            product.selectedVariant = {id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ=='};
            assert.isOk(product.variantExists);
          });
        });

        describe('if variant does not exist for selected options', () => {
          it('returns false', async () => {
            await product.init(testProductCopy);
            product.selectedVariant = null;
            assert.isNotOk(product.variantExists);
          });
        });
      });

      describe('hasVariants', () => {
        describe('if multiple variants', () => {
          it('returns true', async () => {
            await product.init(testProductCopy);
            product.model.variants = [{id: 123}, {id: 234}];
            assert.ok(product.hasVariants);
          });
        });

        describe('if single variant', () => {
          it('returns false on #hasVariants if single variant', async () => {
            await product.init(testProductCopy);
            product.model.variants = [{id: 123}];
            assert.notOk(product.hasVariants);
          });
        });
      });

      describe('requiresCart', () => {
        describe('if buttonDestination is cart', () => {
          it('returns true', () => {
            assert.ok(product.requiresCart);
          });
        });

        describe('if buttonDestination is not cart', () => {
          it('returns false', () => {
            product.config.product.buttonDestination = 'checkout';
            assert.notOk(product.requiresCart);
          });
        });
      });

      describe('buttonActionAvailable', () => {
        describe('if requriesCart is true', () => {
          describe('if cart is not initialized', () => {
            it('returns false', () => {
              product.config.product.buttonDestination = 'cart';
              assert.notOk(product.buttonActionAvailable);
            });
          });

          describe('if cart is initialized', () => {
            it('returns true', async () => {
              await product.init(testProductCopy);
              assert.ok(product.buttonActionAvailable);
            });
          });
        });

        describe('if requiresCart is false', () => {
          it('returns true', () => {
            product.config.product.buttonDestination = 'checkout';
            assert.ok(product.buttonActionAvailable);
          });
        });
      });

      describe('isButton', () => {
        it('is true when isButton is turn on and there is no button', () => {
          product.config.product.isButton = true;
          product.config.product.contents.button = false;
          product.config.product.contents.buttonWithQuantity = false;
          const isButton = product.isButton;
          assert.equal(isButton, true);
        });

        it('is false when there is a button', () => {
          product.config.product.isButton = true;
          product.config.product.contents.button = true;
          product.config.product.contents.buttonWithQuantity = false;
          const isButton = product.isButton;
          assert.equal(isButton, false);
        });

        it('is false when there is a buttonWithQuantity', () => {
          product.config.product.isButton = true;
          product.config.product.contents.button = false;
          product.config.product.contents.buttonWithQuantity = true;
          const isButton = product.isButton;
          assert.equal(isButton, false);
        });

        it('is false when isButton is turn off', () => {
          product.config.product.isButton = false;
          const isButton = product.isButton;
          assert.equal(isButton, false);
        });
      });

      describe('DOMEvents', () => {
        it('returns functions for bindings', () => {
          assert.isFunction(product.DOMEvents['change .shopify-buy__option-select__select']);
          assert.isFunction(product.DOMEvents['click .shopify-buy__btn']);
        });
      });

      describe('optionsHtml', () => {
        it('it returns an html string', async () => {
          await product.init(testProductCopy);
          assert.match(product.optionsHtml, /<select/);
        });
      });

      describe('decoratedOptions', () => {
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

        it('it returns options with selected', async () => {
          await product.init(testProductCopy);
          product.updateVariant('Size', 'small');
          assert.deepEqual(product.decoratedOptions, expectedArray);
        });

        it('it does not return options with multiple selected values in the same option name', async () => {
          expectedArray[0].values.push({name: 'something', selected: true});
          expectedArray[0].values[0].selected = false;
          expectedArray[1].values.push({name: 'something', selected: false});

          await product.init(testProductCopy);
          product.model.options[0].values.push({value: 'something'});
          product.model.options[1].values.push({value: 'something'});

          product.updateVariant('Print', 'something');
          assert.deepEqual(product.decoratedOptions, expectedArray);
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
          beforeEach(() => {
            product.model.onlineStoreUrl = 'https://test.myshopify.com/products/123';
          });

          it('returns URL for a product on online store', () => {
            assert.equal(product.onlineStoreURL, `https://test.myshopify.com/products/123${expectedQs}`);
          });
        });
      });
    });

  });
});
