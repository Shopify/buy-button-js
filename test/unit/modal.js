import Modal from '../../src/components/modal';
import Iframe from '../../src/iframe';
import Product from '../../src/components/product';

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
  createCart: function () {return Promise.resolve()}
}

const fakeProduct = {
  title: 'vapehat',
  options: [],
  variants: [],
  selectedVariant: {
    compareAtPrice: '1',
    attrs: {
      variant: {
        available: true,
      }
    }
  }
}

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

    it('initializes a Product', (done) => {
      modal.init(fakeProduct).then((what) => {
        assert.calledWith(initSpy, fakeProduct);
        done();
      }).catch((e) => {
        done(e);
      });
    });

    it('sets isVisible to true', (done) => {
      modal.init(fakeProduct).then((what) => {
        assert(modal.isVisible);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });

  describe('getters', () => {
    beforeEach((done) => {
      modal.init(fakeProduct).then(() => done());
    });

    describe('get productConfig', () => {
      it('returns product configuration', () => {
        assert.deepEqual(modal.productConfig.options, modal.config);
        assert.typeOf(modal.productConfig.node, 'HTMLDivElement');
      });
    });

    describe('get productTemplate', () => {
      it('instantiates a Template', () => {
        assert.deepEqual(modal.productTemplate.templates, modal.product.templates);
        assert.isFalse(modal.productTemplate.contents.img);
        assert.isFalse(modal.productTemplate.contents.button);
        assert.isFalse(modal.productTemplate.contents.quantity);
      });
    });

    describe('get productModalTemplates', () => {
      it('returns a hash of strings', () => {
        assert.typeOf(modal.productModalTemplates.img, 'string');
        assert.typeOf(modal.productModalTemplates.contents, 'string');
        assert.typeOf(modal.productModalTemplates.footer, 'string');
      });
    });

    describe('get productModalContents', () => {
      it('returns a hash of template keys', () => {
        assert.ok(modal.productModalContents.img);
        assert.ok(modal.productModalContents.contents);
        assert.ok(modal.productModalContents.footer);
      });
    });
  });

  describe('close', () => {
    it('sets isVisible to false', () => {
      modal.iframe = {
        removeClass: sinon.spy(),
        parent: {
          addEventListener: sinon.spy(),
        }
      }
      modal.wrapper = {
        classList: {
          remove: sinon.spy()
        }
      }
      modal.close();
      assert.notOk(modal.isVisible);
      assert.calledWith(modal.iframe.removeClass, 'is-active');
      assert.calledWith(modal.wrapper.classList.remove, 'is-active');
      assert.calledWith(modal.iframe.parent.addEventListener, 'transitionend', sinon.match.func);
    });
  });

  describe('render', () => {
    beforeEach((done) => {
      modal.model = fakeProduct;
      modal.isVisible = true;
      modal.setupView().then(() => modal.render()).then(() => done());
    });

    it('makes modal visible', () => {
      assert.match(modal.iframe.parent.className, 'is-active');
    });

    it('replaces product template', () => {
      assert.deepEqual(modal.product.template.templates, modal.productModalTemplates);
      assert.deepEqual(modal.product.template.contents, modal.productModalContents);
    });

    it('initializes product', () => {
      assert.deepEqual(modal.product.model, fakeProduct);
    });
  });
});

