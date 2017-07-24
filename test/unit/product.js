import componentDefaults from '../../src/defaults/components';
import Product from '../../src/components/product';
import Cart from '../../src/components/cart';
import Modal from '../../src/components/modal';
import Template from '../../src/template';
import Component from '../../src/component';
import testProduct from '../fixtures/product-fixture';
import windowUtils from '../../src/utils/window-utils';

const rootImageURI = 'https://cdn.shopify.com/s/';

const config = {
  id: 123,
  node: document.getElementById('qunit-fixture'),
  options: {
    product: {
      iframe: false,
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      },
      viewData: {
        test: 'test string',
      }
    }
  }
}

const props = {
  client: {
    config: {
      domain: 'test.myshopify.com'
    }
  },
  browserFeatures: {
    transition: true,
    animation: true,
    transform: true,
  },
  createCart: function () {return Promise.resolve(new Cart(config))},
}

props.createModal = function () {return new Modal(config, props)}

let product;
let testProductCopy;
let configCopy;

describe('Product class', () => {
  beforeEach(() => {
    configCopy = Object.assign({}, config)
    configCopy.node = document.createElement('div');
    configCopy.node.setAttribute('id', 'fixture');
    document.body.appendChild(configCopy.node);
    testProductCopy = Object.assign({}, testProduct);
    product = new Product(configCopy, props);
  });
  afterEach(() => {
    product = null;
    testProductCopy = null;
    document.body.removeChild(configCopy.node);
    configCopy.node = null;
  });

  it('has a childTemplate for options', () => {
    assert.instanceOf(product.childTemplate, Template);
  });

  describe('init', () => {
    it('calls createCart', () => {
      const createCart = sinon.stub(product.props, 'createCart').returns(Promise.resolve('test'));
      const superInit = sinon.stub(Component.prototype, 'init').returns(Promise.resolve());
      const render = sinon.stub(product.view, 'render');

      return product.init('test').then(() => {
        assert.equal(product.cart, 'test');
        assert.calledOnce(createCart);
        assert.calledWith(superInit, 'test');
        createCart.restore();
        superInit.restore();
      });
    });
  });

  describe('get DOMEvents', () => {
    it('returns functions for bindings', () => {
      assert.isFunction(product.DOMEvents['change .shopify-buy__option-select__select']);
      assert.isFunction(product.DOMEvents['click .shopify-buy__btn']);
    });
  });

  describe('get optionsHtml', () => {
    it('it returns an html string', () => {
      return product.init(testProductCopy).then(() => {
        assert.match(product.optionsHtml, /\<select/);
      });
    });
  });

  describe('get variantExists', () => {
    describe('if variant exists for selected options', () => {
      it('returns true', () => {
        return product.init(testProductCopy).then(() => {
          product.selectedVariant = { id: 12345 };
          assert.isOk(product.variantExists);
        });
      });
    });

    describe('if variant does not exist for selected options', () => {
      it('returns false', () => {
        return product.init(testProductCopy).then(() => {
          product.selectedVariant = null;
          assert.isNotOk(product.variantExists);
        });
      });
    });
  });

  describe('get requiresCart', () => {
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

  describe('get buttonActionAvailable', () => {
    describe('if requriesCart is true', () => {
      describe('if cart is not initialized', () => {
        it('returns false', () => {
          product.config.product.buttonDestination = 'cart';
          assert.notOk(product.buttonActionAvailable);
        });
      });
      describe('if cart is initialized', () => {
        it('returns true', () => {
          return product.init(testProductCopy).then(() => {
            assert.ok(product.buttonActionAvailable);
          });
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

  describe('get buttonEnabled', () => {
    describe('if buttonActionAvailable is false', () => {
      it('returns false', () => {
        product.cart = null;
        assert.notOk(product.buttonEnabled);
      });
    });
    describe('if buttonActionAvailable is true', () => {
      beforeEach(() => {
        return product.init(testProductCopy);
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
          }
          assert.notOk(product.buttonEnabled);
        });
      });
    });
  });

  describe('get buttonText', () => {
    beforeEach(() => {
      return product.init(testProductCopy);
    });
    describe('if variant is in stock', () => {
      it('returns "buy now"', () => {
        assert.equal(product.buttonText, product.options.text.button);
      });
    });
    describe('if variant is not in stock', () => {
      it('returns "out of stock"', () => {
        product.selectedVariant = {
          id: 12345,
          available: false,
        }
        assert.equal(product.buttonText, product.options.text.outOfStock);
      });
    });
  });

  describe('get hasVariants', () => {
    describe('if multiple variants', () => {
      it('returns true', () => {
        return product.init(testProductCopy).then(() => {
          product.model.variants = [{id: 123}, {id: 234}];
          assert.ok(product.hasVariants);
        });
      });
    });

    describe('if single variant', () => {
      it('returns false on #hasVariants if single variant', () => {
        return product.init(testProductCopy).then(() => {
          product.model.variants = [{id: 123}];
          assert.notOk(product.hasVariants);
        });
      });
    });
  });

  describe('get currentImage', () => {
    describe('if variant exists', () => {
      it('returns selected image', () => {
        return product.init(testProductCopy).then(() => {
          assert.equal(product.currentImage.src, rootImageURI + 'image-one_280x280.jpg');
        });
      });
    });

    describe('if variant does not exist', () => {
      it('returns cached image', () => {
        return product.init(testProductCopy).then(() => {
          product.selectedVariant = {};
          assert.equal(product.currentImage.src, rootImageURI + 'image-one_280x280.jpg');
        });
      });
    });
  });


  describe('get decoratedOptions', () => {
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
          }
        ]
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
          }
        ]
      }
    ];
    it('it returns options with selected', () => {
      return product.init(testProductCopy).then(() => {
        product.updateVariant('Size', 'small');
        assert.deepEqual(product.decoratedOptions, expectedArray);
      });
    });
  });

  describe('get viewData', () => {
    it('returns supplemental view info', () => {
      return product.init(testProductCopy).then(() => {
        const viewData = product.viewData;
        assert.equal(viewData.buttonText, 'ADD TO CART');
        assert.ok(viewData.optionsHtml);
        assert.equal(viewData.currentImage.src, rootImageURI + 'image-one_280x280.jpg');
        assert.ok(viewData.hasVariants);
        assert.equal(viewData.test, 'test string');
      });
    });
  });

  describe('get isButton', () => {
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

  describe('updateVariant', () => {
    it('it updates selected variant', () => {
      return product.init(testProductCopy).then(() => {
        let updated = product.updateVariant('Size', 'large');
        assert.equal(product.selectedOptions.Size, 'large');
      });
    });
  });

  describe('sdkFetch', () => {
    describe('when passed a product ID', () => {
      let idProduct;

      beforeEach(() => {
        idProduct = new Product({
          id: '12345',
          options: configCopy.options,
        }, {
          client: {
            fetchProduct: sinon.spy(),
          }
        });
      });

      it('calls fetchProduct with product id', () => {
        idProduct.sdkFetch();
        assert.calledWith(idProduct.props.client.fetchProduct, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMzQ1');
      });
    });

    describe('when passed a product handle', () => {
      let handleProduct;

      beforeEach(() => {
        handleProduct = new Product({
          handle: 'hat',
          options: configCopy.options,
        }, {
          client: {
            fetchQueryProducts: sinon.stub().returns(Promise.resolve([{}])),
          }
        });
      });

      it('calls fetchQueryProducts with product handle', () => {
        handleProduct.sdkFetch()
        assert.calledWith(handleProduct.props.client.fetchQueryProducts, {handle: 'hat'});
      });
    });
  });
  describe('updateConfig', () => {
    const newConfig = {
      options: {
        modalProduct: {
          layout: 'vertical'
        },
      },
    }

    beforeEach(() => {
      return product.init(testProductCopy);
    });

    it('calls updateConfig on cart', () => {
      const cartUpdateConfigSpy = sinon.stub(product.cart, 'updateConfig');
      product.updateConfig(newConfig);
      assert.calledWith(cartUpdateConfigSpy, newConfig);
    });

    it.skip('calls updateConfig on modal if modal exists', () => {
      const modalProduct = new Product({
        node: configCopy.node,
        options: Object.assign({}, configCopy.options, {
          product: Object.assign({}, configCopy.options.product, {
            buttonDestination: 'modal'
          })
        }),
      }, props);
      return modalProduct.init(testProductCopy).then(() => {
        modalProduct.openModal().then(() => {
          modalProduct.cart = {
            updateConfig: sinon.spy()
          }
          modalProduct.modal.updateConfig = sinon.spy();
          modalProduct.updateConfig(newConfig);
          assert.calledWith(modalProduct.modal.updateConfig, sinon.match.object);
          assert.equal(modalProduct.modal.config.product.layout, 'vertical');
          assert.calledWith(superSpy, newConfig);
        });
      });
    });
  });

  describe('when updating ID or variant ID', () => {
    let initSpy;

    beforeEach(() => {
      initSpy = sinon.spy(product, 'init');
    });

    it('calls init if ID updated', () => {
      product.updateConfig({id: 7777});
      assert.calledOnce(initSpy);
      assert.equal(product.id, 7777);
    });

    it('calls init if variant ID updated', () => {
      product.updateConfig({variantId: 7777});
      assert.calledOnce(initSpy);
      assert.equal(product.defaultVariantId, 7777);
    });
  });

  describe('setDefaultVariant', () => {
    it('sets selectedVariant to product.defalutVariantId', () => {
      product.defaultVariantId = 12347;
      const model = product.setDefaultVariant(testProduct);
      assert.equal(product.selectedOptions.Print, 'shark');
      assert.equal(product.selectedOptions.Size, 'large');
    });
  });

  describe('get buttonText', () => {
    beforeEach(() => {
      return product.init(testProductCopy);
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
          id: 12345,
          available: false,
        };
        assert.equal(product.buttonText, product.options.text.outOfStock);
      });
    });
    describe('when variant is available', () => {
      it('returns button text', () => {
        product.selectedVariant = {
          id: 12345,
          available: true,
        };
        assert.equal(product.buttonText, product.options.text.button);
      });
    });
  });
  describe('wrapTemplate', () => {
    beforeEach(() => {
      return product.init(testProductCopy);
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

  describe('openModal', () => {

    describe('if modal exists', () => {
      beforeEach(() => {
        product.modal = {
          init: sinon.spy(),
        }
      });

      it('re-initializes modal with model', () => {
        product.openModal();
        assert.calledWith(product.modal.init, product.model);
      });
    });

    describe('if modal does not exist', () => {
      let initSpy;

      beforeEach(() => {
        initSpy = sinon.spy();
        product.modal = null;
        product.props.createModal = sinon.stub().returns({
          init: initSpy,
        });
      });

      it('creates Modal and initializes modal with model', () => {
        product.openModal();
        assert.calledWith(product.props.createModal, sinon.match.object, product.props);
        assert.calledWith(initSpy, product.model);
      });
    });
  });

  describe('get modalProductConfig', () => {
    it('returns an object with whitelisted styles', () => {
      product.config.product.styles = {
        button: {
          'background': 'red',
          'margin-top': '100px',
          ':hover': {
            'background': 'red',
          }
        }
      }

      const expectedStyles = Object.assign({}, product.config.modalProduct.styles, {
        button: {
          'background': 'red',
          ':hover': {
            'background': 'red',
          }
        }
      });

      assert.deepEqual(product.modalProductConfig, Object.assign({}, product.config.modalProduct, {
        layout: 'horizontal',
        styles: expectedStyles,
      }));
    });
  });

  describe('onlineStore methods', () => {
    let windowStub;
    const expectedQs = '?channel=buy_button&referrer=http%3A%2F%2Ftest.com&variant=123&';

    beforeEach(() => {
      windowStub = sinon.stub(windowUtils, 'location').returns('http://test.com');
      product.selectedVariant = {id: 123}
    });

    afterEach(() => {
      windowStub.restore();
    });

    describe('get onlineStoreParams', () => {
      it('returns an object with url params', () => {
        assert.deepEqual(product.onlineStoreParams, {
          channel: 'buy_button',
          referrer: 'http%3A%2F%2Ftest.com',
          variant: 123,
        });
      });
      describe('get onlineStoreQueryString', () => {
        it('returns query string from online store params', () => {
          assert.equal(product.onlineStoreQueryString, expectedQs);
        });
      });

      describe('get onlineStoreURL', () => {
        it('returns URL for a product ID on online store', () => {
          assert.equal(product.onlineStoreURL, `https://test.myshopify.com/products/123${expectedQs}`);
        });

        it('returns URL for a product handle on online store', () => {
          product.handle = 'fancy-product';
          assert.equal(product.onlineStoreURL, `https://test.myshopify.com/products/fancy-product${expectedQs}`);
        });
      });
    });
  });

  describe('get shouldUpdateImage', () => {
    describe('if no cached image', () => {
      it('returns true', () => {
        product.cachedImage = null;
        assert.ok(product.shouldUpdateImage);
      });
    });

    describe('if image and cached image are different', () => {
      beforeEach(() => {
        product.config.product.width = '100px';
        return product.init(testProductCopy);
      });

      it('returns true', () => {
        product.cachedImage = 'bar.jpg'
        assert.ok(product.shouldUpdateImage);
      });
    });

    describe('if image and cached image are same', () => {
      beforeEach(() => {
        product.config.product.width = '240px';
        return product.init(testProductCopy);
      });

      it('returns true', () => {
        product.cachedImage = rootImageURI + 'image-one_240x240.jpg'
        assert.notOk(product.shouldUpdateImage);
      });
    });
  });

  describe('get image', () => {
    describe('default', () => {
      beforeEach(() => {
        return product.init(testProductCopy);
      });

      it('returns 480x480 image', () => {
        product.config.product.width = undefined;
        assert.equal(product.image.src, rootImageURI + 'image-one_480x480.jpg');
      });
    });

    describe('if width explicitly set and layout vertical', () => {
      beforeEach(() => {
        product.config.product.width = '160px';
        return product.init(testProductCopy);
      });
      it('returns smallest image larger than explicit width', () => {
        assert.equal(product.image.src, rootImageURI + 'image-one_160x160.jpg');
      });
    });

    describe('when user selects an image from thumbnails', () => {
      beforeEach(() => {
        return product.init(testProductCopy).then(() => {
          product.selectedImage = product.model.images[2];
          return Promise.resolve();
        });
      });
      it('returns selected image', () => {
        assert.equal(product.image.src, rootImageURI + 'image-three_280x280.jpg');
      });
      it('returns selected image of appropriate size if set', () => {
        product.config.product.width = '480px';
        assert.equal(product.image.src, rootImageURI + 'image-three_480x480.jpg');
      })
    });
  });

  describe('onCarouselChange', () => {
    beforeEach(() => {
      return product.init(testProductCopy).then(() => {
        return Promise.resolve();
      });
    });
    it('sets selected image based on various offsets', () => {
      product.onCarouselChange(-1);
      assert.equal(product.image.src, rootImageURI + 'image-four_280x280.jpg');
      product.onCarouselChange(-1);
      assert.equal(product.image.src, rootImageURI + 'image-three_280x280.jpg');
      product.onCarouselChange(1);
      assert.equal(product.image.src, rootImageURI + 'image-four_280x280.jpg');
      product.onCarouselChange(1);
      assert.equal(product.image.src, rootImageURI + 'image-one_280x280.jpg');
    });
  });
});
