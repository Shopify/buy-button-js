import componentDefaults from '../../src/defaults/components';
import Product from '../../src/components/product';
import Template from '../../src/template';
import Component from '../../src/component';
import testProduct from '../fixtures/product-fixture';
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
  client: {},
  createCart: function () {return Promise.resolve()}
}

let product;
let testProductCopy;

describe('Product class', () => {
  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    testProductCopy = Object.assign({}, testProduct);
    product = new Product(config, props);
  });
  afterEach(() => {
    product = null;
    testProductCopy = null;
    document.body.removeChild(config.node);
    config.node = null;
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

  describe('get variantAvailable', () => {
    describe('if variant exists for selected options', (done) => {
      it('returns true', (done) => {
        product.init(testProductCopy).then(() => {
          product.model.selectedVariant = {id: 123};
          assert.isOk(product.variantAvailable);
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
          assert.isNotOk(product.variantAvailable);
          done();
        }).catch((e) => {
          done(e);
        });
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
            disabled: false
          },
          {
            name: 'shark',
            selected: false,
            disabled: false
          }
        ]
      },
      {
        name: 'Size',
        values: [
          {
            name: 'small',
            selected: true,
            disabled: false
          },
          {
            name: 'large',
            selected: false,
            disabled: true
          }
        ]
      }
    ];
    it('it returns options with selected and disabled values', (done) => {
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
        assert.equal(viewData.buttonText, 'Add to cart');
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
          options: config.options,
        }, {
          client: {
            fetchProduct: sinon.spy()
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
          options: config.options,
        }, {
          client: {
            fetchQueryProducts: sinon.stub().returns(Promise.resolve()),
          }
        });
      });

      it('calls fetchQueryProducts with product handel', () => {
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

  describe('wrapTemplate', () => {
    describe('when button exists', () => {
      it('calls super', () => {
        const string = product.wrapTemplate('test');
        assert.equal(string, '<div class="product">test</div>');
      });
    });

    describe('when button does not exist', () => {
      it('wraps html in a button', () => {
        product.config.product.contents.button = false;
        const string = product.wrapTemplate('test');
        assert.equal(string, '<button class="btn--parent product">test</button>');
      });
    });
  });
});
