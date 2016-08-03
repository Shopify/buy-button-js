import Modal from '../../src/components/modal';
import Iframe from '../../src/iframe';
import Product from '../../src/components/product';

const config = {
  options: {
    product: {
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
    compareAtPrice: '1'
  }
}

describe('Modal class', () => {
  let modal;

  beforeEach(() => {
    modal = new Modal(config, props);
  });

  afterEach(() => {
    modal = null;
    document.body.removeChild(document.querySelector('.shopify-buy-frame'));
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
  });
});

