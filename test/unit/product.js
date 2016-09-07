import componentDefaults from '../../src/defaults/components';
import Product from '../../src/components/product';
import Cart from '../../src/components/cart';
import Template from '../../src/template';
import Component from '../../src/component';
import testProduct from '../fixtures/product-fixture';
import windowUtils from '../../src/utils/window-utils';
import hogan from 'hogan.js';

const config = {
  id: 123,
  node: document.getElementById('qunit-fixture'),
  options: {
    product: {
      iframe: false,
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
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
  createCart: function () {return Promise.resolve(new Cart(config))}
}

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
    it('calls createCart', (done) => {
      const createCart = sinon.stub(product.props, 'createCart').returns(Promise.resolve('test'));
      const superInit = sinon.stub(Component.prototype, 'init').returns(Promise.resolve());
      const render = sinon.stub(product, 'render');

      product.init('test').then(() => {
        assert.equal(product.cart, 'test');
        assert.calledOnce(createCart);
        assert.calledWith(superInit, 'test');
        superInit.restore();
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('get DOMEvents', () => {
    it('returns functions for bindings', () => {
      assert.isFunction(product.DOMEvents['change .option-select__select']);
      assert.isFunction(product.DOMEvents['click .btn']);
    });
  });

  describe('get optionsHtml', () => {
    it('it returns an html string', (done) => {
      product.init(testProductCopy).then(() => {
        assert.match(product.optionsHtml, /\<select/);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('get variantExists', () => {
    describe('if variant exists for selected options', (done) => {
      it('returns true', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.selectedVariant = {id: 123};
          assert.isOk(product.variantExists);
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });

    describe('if variant does not exist for selected options', () => {
      it('returns false', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.selectedVariant = null;
          assert.isNotOk(product.variantExists);
          done();
        }).catch((e) => {
          done(e);
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
        it('returns true', (done) => {
          product.init(testProductCopy).then(() => {
            assert.ok(product.buttonActionAvailable);
            done();
          }).catch((e) => {
            done(e);
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
      beforeEach((done) => {
        product.init(testProductCopy).then(() => {
          done();
        }).catch((e) => {
          done(e);
        });
      });
      describe('if variant is in stock', () => {
        it('returns true', () => {
          assert.ok(product.buttonEnabled);
        });
      });
      describe('if variant is not in stock', () => {
        it('returns false', () => {
          product.model.selectedVariant = {
            available: false,
          }
          assert.notOk(product.buttonEnabled);
        });
      });
    });
  });

  describe('get buttonText', () => {
    beforeEach((done) => {
      product.init(testProductCopy).then(() => {
        done();
      }).catch((e) => {
        done(e);
      });
    });
    describe('if variant is in stock', () => {
      it('returns "buy now"', () => {
        assert.equal(product.buttonText, product.text.button);
      });
    });
    describe('if variant is not in stock', () => {
      it('returns "out of stock"', () => {
        product.model.selectedVariant = {
          available: false,
        }
        assert.equal(product.buttonText, product.text.outOfStock);
      });
    });
  });

  describe('get hasVariants', () => {
    describe('if multiple variants', () => {
      it('returns true', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.variants = [{id: 123}, {id: 234}];
          assert.ok(product.hasVariants);
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });

    describe('if single variant', () => {
      it('returns false on #hasVariants if single variant', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.variants = [{id: 123}];
          assert.notOk(product.hasVariants);
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });
  });

  describe('get currentImage', () => {
    describe('if variant exists', () => {
      it('returns selected image', (done) => {
        product.init(testProductCopy).then(() => {
          assert.equal(product.currentImage.img, 'http://test.com/test.jpg');
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });

    describe('if variant does not exist', () => {
      it('returns cached image', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.selectedVariant = null;
          product.model.selectedVariantImage = null;
          assert.equal(product.currentImage.img, 'http://test.com/test.jpg');
          done();
        }).catch((e) => {
          done(e);
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
    it('it returns options with selected', (done) => {
      product.init(testProductCopy).then(() => {
        product.updateVariant('Size', 'small');
        assert.deepEqual(product.decoratedOptions, expectedArray);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('get viewData', () => {
    it('returns supplemental view info', (done) => {
      product.init(testProductCopy).then(() => {
        const viewData = product.viewData;
        assert.equal(viewData.buttonText, 'SHOP NOW');
        assert.ok(viewData.optionsHtml);
        assert.equal(viewData.currentImage.img, 'http://test.com/test.jpg');
        assert.ok(viewData.hasVariants);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('updateVariant', () => {
    it('it updates selected variant', (done) => {
      product.init(testProductCopy).then(() => {
        let updated = product.updateVariant('Size', 'large');
        assert.equal(updated.selected, 'large');
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('sdkFetch', () => {
    describe('when passed a product ID', () => {
      let idProduct;

      beforeEach(() => {
        idProduct = new Product({
          id: 1234,
          options: configCopy.options,
        }, {
          client: {
            fetchProduct: sinon.spy(),
          }
        });
      });

      it('calls fetchProduct with product id', () => {
        idProduct.sdkFetch();
        assert.calledWith(idProduct.client.fetchProduct, 1234);
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
        assert.calledWith(handleProduct.client.fetchQueryProducts, {handle: 'hat'});
      });
    });
  });
  describe('updateConfig', () => {
    const newConfig = {
      options: {
        styles: {
          button: {
            'color': 'red',
          },
        },
      },
    }

    let superSpy;

    beforeEach(() => {
      superSpy = sinon.stub(Component.prototype, 'updateConfig');
      product.cart = {
        updateConfig: sinon.spy()
      }
    });

    afterEach(() => {
      superSpy.restore();
    });

    it('calls updateConfig on cart', () => {
      product.updateConfig(newConfig);
      assert.calledWith(product.cart.updateConfig, newConfig);
      assert.calledWith(superSpy, newConfig);
    });

    it('calls updateConfig on modal if modal exists', () => {
      product.modal = {
        updateConfig: sinon.spy()
      }
      product.updateConfig(newConfig);
      assert.calledWith(product.cart.updateConfig, newConfig);
      assert.calledWith(superSpy, newConfig);
    });
  });

  describe('setDefaultVariant', () => {
    it('sets selectedVariant to product.defalutVariantId', () => {
      product.defaultVariantId = 12347;
      const model = product.setDefaultVariant(testProduct);
      assert.equal(model.options[0].selected, 'shark');
      assert.equal(model.options[1].selected, 'large');
    });
  });

  describe('get buttonText', () => {
    beforeEach((done) => {
      product.init(testProductCopy).then(() => {
        done();
      }).catch((e) => {
        done(e);
      });
    });

    describe('when variant does not exist', () => {
      it('returns unavailable text', () => {
        product.model.selectedVariant = null;
        assert.equal(product.buttonText, product.text.unavailable);
      });
    });
    describe('when variant is out of stock', () => {
      it('returns out of stock text', () => {
        product.model.selectedVariant = {
          available: false,
        };
        assert.equal(product.buttonText, product.text.outOfStock);
      });
    });
    describe('when variant is available', () => {
      it('returns button text', () => {
        product.model.selectedVariant = {
          available: true,
        };
        assert.equal(product.buttonText, product.text.button);
      });
    });
  });
  describe('wrapTemplate', () => {
    describe('when button exists', () => {
      it('calls super', () => {
        const string = product.wrapTemplate('test');
        assert.equal(string, '<div class="no-image layout-vertical product">test</div>');
      });
    });

    describe('when button does not exist', () => {
      it('wraps html in a button', () => {
        product.config.product.contents.button = false;
        const string = product.wrapTemplate('test');
        assert.equal(string, '<div class="no-image layout-vertical product"><button class="btn--parent">test</button></div>');
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
        styles: expectedStyles,
      }));
    });
  });

  describe('onlineStore methods', () => {
    let windowStub;
    const expectedQs = '?channel=buy_button&referrer=http%3A%2F%2Ftest.com&variant=123&';

    beforeEach(() => {
      windowStub = sinon.stub(windowUtils, 'location').returns('http://test.com');
      product.model.selectedVariant = {id: 123};
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
        it('returns URL for a product on online store', () => {
          assert.equal(product.onlineStoreURL, `https://test.myshopify.com/products/123${expectedQs}`);
        });
      });
    });
  });
});
