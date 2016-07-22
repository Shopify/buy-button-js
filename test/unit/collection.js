import Collection from '../../src/components/collection';
import Product from '../../src/components/product';

const config = {
  id: 123,
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
  variants: [],
  selectedVariant: {
    compareAtPrice: '1'
  }
}

describe('Collection class', () => {
  let collection;

  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    collection = new Collection(config, {
      client: {},
      imageCache: {},
      createCart: () => Promise.resolve()
    });
    collection.props.client.fetchCollection = () => Promise.resolve({title: 'vapes'});
    collection.props.client.fetchQueryProducts = () => Promise.resolve([{title: 'vapehat'}]);
  });

  afterEach(() => {
    collection = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('fetchData', () => {
    it('returns collection and product data', (done) => {
      collection.fetchData().then((data) => {
        assert.deepEqual(data, {
          products: [{title: 'vapehat'}],
          collection: {title: 'vapes'}
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
      collection.model.products = [fakeProduct];

      collection.render().then((data) => {
        assert.calledWith(initSpy, fakeProduct);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });
});

