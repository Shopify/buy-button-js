import ProductSet from '../../src/components/product-set';
import Product from '../../src/components/product';

const config = {
  id: [123, 234],
  options: {
    product: {
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      }
    }
  }
}

const fakeProduct = {
  title: 'vapehat',
  options: [],
  variants: []
}

describe('ProductSet class', () => {
  let set;

  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    set = new ProductSet(config, {
      client: {},
      imageCache: {},
      createCart: () => Promise.resolve()
    });
    set.props.client.fetchQueryProducts = () => Promise.resolve([{title: 'vapehat'}, {title: 'vapeshoe'}]);
  });

  afterEach(() => {
    set = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('fetchData', () => {
    it('returns product data', (done) => {
      set.fetchData().then((data) => {
        assert.deepEqual(data, {
          products: [{title: 'vapehat'}, {title: 'vapeshoe'}]
        });
        done();
      });
    });
  });

  describe('render', () => {
    let initSpy;

    beforeEach(() => {
      initSpy = sinon.spy(Product.prototype, 'init');
    });

    afterEach(() => {
      initSpy.restore();
    });

    it('initializes an array of products', (done) => {
      set.model.products = [fakeProduct];

      set.render().then((data) => {
        assert.calledWith(initSpy, fakeProduct);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });
});

