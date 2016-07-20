import chai from 'chai';
import sinon from 'sinon';
import Collection from '../../src/components/collection';
import Component from '../../src/component';
import Product from '../../src/components/product';

sinon.assert.expose(chai.assert, {prefix: ''});

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
  variants: []
}

describe('Collection class', () => {
  let collection;

  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    collection = new Collection(config, {client: {
      fetchQueryProducts: () => {},
      fetchCollection: () => {},
    }, imageCache: {}, createCart: () => Promise.resolve()});
  });

  afterEach(() => {
    collection = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('fetchData', () => {
    it('returns collection and product data', (done) => {
      sinon.stub(collection.props.client, 'fetchCollection').returns(Promise.resolve({title: 'vapes'}));
      sinon.stub(collection.props.client, 'fetchQueryProducts').returns(Promise.resolve([{title: 'vapehat'}]));
      collection.fetchData().then((data) => {
        chai.assert.deepEqual(data, {
          products: [{title: 'vapehat'}],
          collection: {title: 'vapes'}
        });
        done();
      });
    });
  });

  describe('render', () => {
    it('renders array of products', (done) => {
      collection.model.products = [fakeProduct];
      const initSpy = sinon.spy(Product.prototype, 'init');

      collection.render().then((data) => {
        chai.assert.calledWith(initSpy, fakeProduct);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });
});

