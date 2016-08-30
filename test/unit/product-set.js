import ProductSet from '../../src/components/product-set';
import Component from '../../src/component';
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

describe('ProductSet class', () => {
  let set;

  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    set = new ProductSet(config, {
      client: {},
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

  describe('sdkFetch', () => {
    describe('when passed a colleciton ID', () => {
      let collection;

      beforeEach(() => {
        collection = new ProductSet({
          id: 1234,
          options: config.options,
        }, {
          client: {
            fetchQueryProducts: sinon.spy()
          },
          createCart: () => Promise.resolve()
        });
      });

      it('calls fetchQueryProducts with collection id', () => {
        collection.sdkFetch();
        assert.calledWith(collection.client.fetchQueryProducts, {collection_id: 1234, page: 1, limit: 30, sort_by: 'title-ascending'});
      });
    });

    describe('when passed a colleciton handle', () => {
      let collection;

      beforeEach(() => {
        collection = new ProductSet({
          handle: 'hats',
          options: config.options,
        }, {
          client: {
            fetchQueryProducts: sinon.spy(),
            fetchQueryCollections: sinon.stub().returns(Promise.resolve([{attrs: {collection_id: 2345}}]))
          },
          createCart: () => Promise.resolve()
        });
      });

      it('calls fetchQueryProducts with collection id', (done) => {
        collection.sdkFetch().then(() => {
          assert.calledWith(collection.client.fetchQueryCollections, {handle: 'hats'});
          assert.calledWith(collection.client.fetchQueryProducts, {collection_id: 2345, page: 1, limit: 30, sort_by: 'title-ascending'});
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });

    describe('when passed an array of product IDs', () => {
      let collection;

      beforeEach(() => {
        collection = new ProductSet({
          id: [1234, 2345],
          options: config.options,
        }, {
          client: {
            fetchQueryProducts: sinon.spy()
          },
          createCart: () => Promise.resolve()
        });
      });

      it('calls fetchQueryProducts with collection id', () => {
        collection.sdkFetch();
        assert.calledWith(collection.client.fetchQueryProducts, {product_ids: [1234, 2345], page: 1, limit: 30, sort_by: 'title-ascending'});
      });
    });
  });

  describe('renderProducts', () => {
    let initSpy;

    beforeEach(() => {
      initSpy = sinon.spy(Product.prototype, 'init');
      set.render();
    });

    afterEach(() => {
      initSpy.restore();
    });

    it('initializes an array of products', (done) => {
      set.model.products = [fakeProduct];

      set.renderProducts().then((data) => {
        assert.calledWith(initSpy, fakeProduct);
        done();
      }).catch((e) => {
        done(e);
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
      set.cart = {
        updateConfig: sinon.spy()
      }
    });

    afterEach(() => {
      superSpy.restore();
    });

    it('calls updateConfig on cart', () => {
      set.updateConfig(newConfig);
      assert.calledWith(set.cart.updateConfig, newConfig);
      assert.calledWith(superSpy, newConfig);
    });
  });

  describe('showPagination', () => {
    let sdkFetchSpy;
    let updateNodeSpy;
    let resizeSpy;
    const newCollection = [{title: 'vapebelt'}, {title: 'vapeglasses'}];

    beforeEach(() => {
      set.id = 1234;
      sdkFetchSpy = sinon.stub(set, 'sdkFetch').returns(Promise.resolve(newCollection));
      updateNodeSpy = sinon.stub(set, 'updateNode');
      resizeSpy = sinon.stub(set, 'resize');
    });

    it('sets nextModel and rerenders pagintaiton button', (done) => {
      set.showPagination().then(() => {
        assert.deepEqual(set.nextModel, {products: newCollection});
        assert.calledWith(sdkFetchSpy, {page: 2});
        assert.calledWith(updateNodeSpy, set.classes.productSet.paginationButton, set.paginationTemplate);
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });
});

