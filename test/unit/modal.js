import Modal from '../../src/components/modal';
import Iframe from '../../src/iframe';
import Product from '../../src/components/product';
import testProduct from '../fixtures/product-fixture';

const config = {
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
  createCart: function () {return Promise.resolve()},
  closeModal: function () {return Promise.resolve()},
  browserFeatures: {
    transition: true,
    animation: true,
    transform: true,
  }
}

const fakeProduct = testProduct;

describe('Modal class', () => {
  let modal;

  beforeEach(() => {
    modal = new Modal(config, props);
  });

  afterEach(() => {
    modal = null;
    document.body.removeChild(document.querySelector('.shopify-buy-modal-wrapper'));
  });

  describe('init', () => {
    let initSpy;

    beforeEach(() => {
      initSpy = sinon.spy(Product.prototype, 'init');
    });

    afterEach(() => {
      initSpy.restore();
    });

    it('initializes a Product', () => {
      return modal.init(fakeProduct).then((what) => {
        assert.calledWith(initSpy, fakeProduct);
        assert.deepEqual(modal.product.model, fakeProduct);
      });
    });

    it('sets isVisible to true', () => {
      return modal.init(fakeProduct).then((what) => {
        assert(modal.isVisible);
      });
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      return modal.init(fakeProduct);
    });

    describe('get productConfig', () => {
      it('returns product configuration', () => {
        assert.deepEqual(modal.productConfig.options, modal.config);
        assert.typeOf(modal.productConfig.node, 'HTMLDivElement');
      });
    });
  });

  describe('close', () => {
    it('sets isVisible to false', () => {
      modal.view.iframe = {
        removeClass: sinon.spy(),
        parent: document.createElement('div'),
        document: {
          body: document.createElement('body'),
        }
      }
      modal.view.wrapper = document.createElement('div');
      modal.close();
      assert.notOk(modal.view.isVisible);
      assert.calledWith(modal.view.iframe.removeClass, 'is-block');
      assert(modal.view.iframe.document.body.className.length < 1);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      modal.model = fakeProduct;
      modal.isVisible = true;
      return modal.view.init().then(() => modal.view.render());
    });

    it('makes modal visible', () => {
      assert.match(modal.view.iframe.parent.className, 'is-active');
    });
  });

  describe('updateConfig', () => {
    it('updates product', () => {
      return modal.init(fakeProduct).then((modal) => {
        return modal.updateConfig({
          options: {
            product: {
              buttonDestination: 'checkout',
            }
          }
        }).then(() => {
          assert.equal(modal.product.config.options.product.buttonDestination, 'checkout');
        });
      });
    });
  });
});
