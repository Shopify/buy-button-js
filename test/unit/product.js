import Product from '../../src/components/product';
import Checkout from '../../src/components/checkout';
import Cart from '../../src/components/cart';
import Modal from '../../src/components/modal';
import Template from '../../src/template';
import Component from '../../src/component';
import windowUtils from '../../src/utils/window-utils';
import ShopifyBuy from '../../src/buybutton';
import shopFixture from '../fixtures/shop-info';
import productFixture from '../fixtures/product-fixture';

const rootImageURI = 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/';

const config = {
  id: 123,
  node: document.getElementById('qunit-fixture'),
  options: {
    product: {
      iframe: false,
      templates: {
        button: '<button id="button" class="button">Fake button</button>',
      },
      viewData: {
        test: 'test string',
      },
    },
  },
};
let product;
let testProductCopy;
let configCopy;

describe('Product class', () => {
  let props;
  let closeModalSpy;

  beforeEach(() => {
    closeModalSpy = sinon.spy();
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
        trackMethod: (fn) => {
          return function(...params) {
            fn(...params);
          };
        },
        track: sinon.stub(),
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
      createModal() {
        return new Modal(config, props);
      },
      closeModal: closeModalSpy,
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

  it('converts shopify product id to storefrontId', () => {
    product = new Product({
      id: 123,
    }, props);
    assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
  });

  describe('Component', () => {
    describe('constructor', () => {
      it('has a childTemplate for options', () => {
        assert.instanceOf(product.childTemplate, Template);
      });
    });

    describe('prototype methods', () => {
      describe('init()', () => {
        it('calls createCart', async () => {
          const createCart = sinon.stub(product.props, 'createCart').resolves('test');
          const superInit = sinon.stub(Component.prototype, 'init').resolves();
          const render = sinon.stub(product.view, 'render');

          await product.init('test');
          assert.equal(product.cart, 'test');
          assert.calledOnce(createCart);
          assert.calledWith(superInit, 'test');
          createCart.restore();
          superInit.restore();
          render.restore();
        });
      });

      describe('updateVariant()', () => {
        it('it updates selected variant', async () => {
          await product.init(testProductCopy);
          product.updateVariant('Size', 'large');
          assert.equal(product.selectedOptions.Size, 'large');
        });
      });

      describe('sdkFetch()', () => {
        describe('when passed a product ID', () => {
          let idProduct;
          let productFetchStub;

          beforeEach(() => {
            idProduct = new Product({
              storefrontId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1',
              options: configCopy.options,
            }, {
              client: ShopifyBuy.buildClient({
                domain: 'test.myshopify.com',
                storefrontAccessToken: 123,
              }),
            });
            productFetchStub = sinon.stub(idProduct.props.client.product, 'fetch').resolves({});
          });

          afterEach(() => {
            productFetchStub.restore();
          });

          it('calls fetchProduct with product storefront id', () => {
            idProduct.sdkFetch();
            assert.calledWith(productFetchStub, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1');
          });

          it('calls fetchProduct with product storefront id if storefront id is passed in as an array', () => {
            idProduct.storefrontId = [idProduct.storefrontId];
            idProduct.sdkFetch();
            assert.calledWith(productFetchStub, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1');
          });
        });

        describe('when passed a product handle', () => {
          let handleProduct;
          let productFetchByHandleStub;

          beforeEach(() => {
            handleProduct = new Product({
              handle: 'hat',
              options: configCopy.options,
            }, {
              client: ShopifyBuy.buildClient({
                domain: 'test.myshopify.com',
                storefrontAccessToken: 123,
              }),
            });
            productFetchByHandleStub = sinon.stub(handleProduct.props.client.product, 'fetchByHandle').resolves({});
          });

          afterEach(() => {
            productFetchByHandleStub.restore();
          });

          it('calls fetchProductByHandle with product handle', () => {
            handleProduct.sdkFetch();
            assert.calledWith(productFetchByHandleStub, 'hat');
          });
        });
      });

      describe('onButtonClick()', () => {
        beforeEach(async () => {
          const newProduct = await product.init(testProductCopy);
          newProduct.cart.model.lineItems = [];
          newProduct.cart.props.client = newProduct.props.client;
        });

        it('add variant to cart is called with the right quantity of selected variant', () => {
          product.selectedQuantity = 1111;
          const addToCartStub = sinon.stub(product.cart, 'addVariantToCart');
          const evt = new Event('click shopify-buy__btn--parent');
          const target = 'shopify-buy__btn--parent';

          product.onButtonClick(evt, target);
          assert.calledOnce(addToCartStub);
          assert.calledWith(addToCartStub, product.selectedVariant, 1111);
          addToCartStub.restore();
        });

        it('create checkout and add line items are called when destination is checkout', async () => {
          const selectedQuantity = 2;
          product.config.product.buttonDestination = 'checkout';
          product.selectedQuantity = selectedQuantity;
          const openWindowStub = sinon.stub(window, 'open').returns({location: ''});
          const checkoutMock = {id: 1, webUrl: ''};
          let createCheckout;
          const createCheckoutPromise = new Promise((resolve) => {
            createCheckout = sinon.stub(product.props.client.checkout, 'create').callsFake(() => {
              resolve();
              return Promise.resolve(checkoutMock);
            });
          });

          let addLineItems;
          const addLineItemsPromise = new Promise((resolve) => {
            addLineItems = sinon.stub(product.props.client.checkout, 'addLineItems').callsFake(() => {
              resolve();
              return Promise.resolve(checkoutMock);
            });
          });

          const checkout = new Checkout(product.config);
          const evt = new Event('click shopify-buy__btn--parent');
          const target = 'shopify-buy__btn--parent';

          product.onButtonClick(evt, target);
          await Promise.all([createCheckoutPromise, addLineItemsPromise]);
          assert.calledOnce(openWindowStub);
          assert.calledWith(openWindowStub, '', 'checkout', checkout.params);

          assert.calledOnce(createCheckout);
          assert.calledOnce(addLineItems);
          assert.calledWith(addLineItems, checkoutMock.id, [{
            variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
            quantity: selectedQuantity,
          }]);

          openWindowStub.restore();
          createCheckout.restore();
          addLineItems.restore();
          assert.calledWith(product.props.tracker.track, 'Direct Checkout', {});
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
        it('sets selectedVariant\'s id to product.defaultVariantId', () => {
          product.defaultStorefrontVariantId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==';
          product.setDefaultVariant(productFixture);
          assert.equal(product.selectedOptions.Print, 'shark');
          assert.equal(product.selectedOptions.Size, 'large');
        });

        it('falls back to first variantId if invalid variantId was provided', () => {
          product.defaultStorefrontVariantId = 'this is an invalid variant id';
          product.setDefaultVariant(productFixture);
          assert.equal(product.selectedOptions.Print, 'sloth');
          assert.equal(product.selectedOptions.Size, 'small');
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
            product.selectedVariant = {id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ=='}
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

      it('returns a srcOriginal image option', () => {
        product.config.product.width = undefined;
        assert.equal(product.image.srcOriginal, rootImageURI + 'image-one.jpg');
      });
    });
  });

  describe('View', () => {
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

<<<<<<< HEAD
      describe('if selected variant and its product don\'t have an image', () => {
        it('returns no image', () => {
          product.model.images = [];
          assert.equal(product.image.src, '');
          assert.equal(product.image.srcLarge, '');
          assert.equal(product.image.srcOriginal, '');
=======
      describe('when isButton() is true', () => {
        it('wraps html in a button', () => {
          product.config.product.isButton = true;
          product.config.product.contents.button = false;
          product.config.product.contents.buttonWithQuantity = false;
          const string = product.view.wrapTemplate('test');
          assert.equal(string, '<div class="has-image shopify-buy__layout-vertical shopify-buy__product"><div tabindex="0" role="button" aria-label="Add to cart" class="shopify-buy__btn--parent">test</div></div>');
>>>>>>> 31a1fcf... cleaned up product tests
        });
      });
    });

<<<<<<< HEAD
    describe('if width explicitly set and layout vertical', () => {
      beforeEach(() => {
        product.config.product.width = '160px';
        return product.init(testProductCopy);
      });
      it('returns smallest image larger than explicit width', () => {
        assert.equal(product.image.src, rootImageURI + 'image-one_160x240.jpg');
      });
      it('returns the original image source', () => {
        assert.equal(product.image.srcOriginal, rootImageURI + 'image-one.jpg')
      });
    });
=======
    describe('getters', () => {
      describe('outerHeight', () => {
        beforeEach(async () => {
          const newProduct = await product.init(testProductCopy);
          newProduct.cart.model.lineItems = [];
          newProduct.cart.props.client = newProduct.props.client;
        });
>>>>>>> 31a1fcf... cleaned up product tests

        it('returns the wrapper\'s client height in px', () => {
          const wrapperHeight = product.view.wrapper.clientHeight;
          assert.equal(product.view.outerHeight, `${wrapperHeight}px`);
        });
      });
<<<<<<< HEAD
      it('returns selected image', () => {
        assert.equal(product.image.src, rootImageURI + 'image-three_280x420.jpg');
      });
      it('returns selected image of appropriate size if set', () => {
        product.config.product.width = '480px';
        assert.equal(product.image.src, rootImageURI + 'image-three_480x720.jpg');
      })
      it('returns the original image source when width is set explicitly', () => {
        product.config.product.width = '480px';
        assert.equal(product.image.srcOriginal, rootImageURI + 'image-three.jpg')
      });
=======
>>>>>>> 31a1fcf... cleaned up product tests
    });
  });

  describe('Updater', () => {
    describe('updateConfig()', () => {
      const newConfig = {
        options: {
          modalProduct: {
            layout: 'vertical',
          },
        },
      };

      beforeEach(async () => {
        await product.init(testProductCopy);
      });

      it('calls updateConfig on cart', () => {
        const cartUpdateConfigSpy = sinon.stub(product.cart, 'updateConfig');
        product.updateConfig(newConfig);
        assert.calledWith(cartUpdateConfigSpy, newConfig);
      });

      it('calls updateConfig on modal if modal exists', async () => {
        const modalProduct = new Product({
          node: configCopy.node,
          options: Object.assign({}, configCopy.options, {
            product: Object.assign({}, configCopy.options.product, {
              buttonDestination: 'modal',
            }),
          }),
        }, props);
        await modalProduct.init(testProductCopy);
        await modalProduct.openModal();
        const cartUpdateConfigSpy = sinon.spy();
        modalProduct.cart = {
          updateConfig: cartUpdateConfigSpy,
        };
        const modalUpdateConfigSpy = sinon.spy(modalProduct.modal, 'updateConfig');
        modalProduct.updateConfig(newConfig);
        assert.calledWith(modalUpdateConfigSpy, sinon.match.object);
        assert.equal(modalProduct.modal.config.product.layout, 'vertical');
        assert.calledWith(cartUpdateConfigSpy, newConfig);
        modalUpdateConfigSpy.restore();
        modalProduct.modal.destroy();
      });

      describe('when updating ID, storefront ID, variant ID, or storefront variant ID', () => {
        let initSpy;

        beforeEach(() => {
          initSpy = sinon.spy(product, 'init');
        });

        it('calls init if ID updated', () => {
          product.updateConfig({id: 123});
          assert.calledOnce(initSpy);
          assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
        });

        it('calls init if storefront ID updated', () => {
          product.updateConfig({storefrontId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw=='});
          assert.calledOnce(initSpy);
          assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
        });

        it('calls init if variant ID updated', () => {
          product.updateConfig({variantId: 12347});
          assert.calledOnce(initSpy);
          assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==');
        });

        it('calls init if storefront variant ID updated', () => {
          product.updateConfig({storefrontVariantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng=='});
          assert.calledOnce(initSpy);
          assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng==');
        });
      });
    });
  });
});
