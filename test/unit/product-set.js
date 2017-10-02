import ProductSet from '../../src/components/product-set';
import Component from '../../src/component';
import Updater from '../../src/updater';
import Product from '../../src/components/product';
import testProduct from '../fixtures/product-fixture';
import ShopifyBuy from '../../src/buybutton';

const config = {
  id: 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzEyMzQ1',
  options: {
    product: {
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      }
    }
  }
}

const fakeProduct = testProduct;

describe('ProductSet class', () => {
  let client;
  let set;

  beforeEach(() => {
    client = ShopifyBuy.buildClient({
      domain: 'test.myshopify.com',
      storefrontAccessToken: 123
    });
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    set = new ProductSet(config, {
      client,
      createCart: () => Promise.resolve(),
      destroyComponent: () => Promise.resolve()
    });
    sinon.stub(set.props.client.collection, 'fetchWithProducts').returns(Promise.resolve({
      products: [
        {title: 'vapehat'},
        {title: 'vapeshoe'}
      ]
    }));
  });

  afterEach(() => {
    set = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('fetchData', () => {
    it('returns product data', () => {
      return set.fetchData().then((data) => {
        assert.deepEqual(data, {
          products: [{title: 'vapehat'}, {title: 'vapeshoe'}]
        });
      });
    });
  });

  describe('sdkFetch', () => {
    describe('when passed a collection ID', () => {
      let collection;
      let fetchWithProductsStub;

      beforeEach(() => {
        client = ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123
        });
        collection = new ProductSet({
          id: 1234,
          options: config.options,
        }, {
          client,
          createCart: () => Promise.resolve()
        });
        fetchWithProductsStub = sinon.stub(collection.props.client.collection, 'fetchWithProducts').returns(Promise.resolve({}));
      });

      it('calls collection.fetchWithProducts with collection id', () => {
        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchWithProductsStub);
      });
    });

    describe('when passed a collection handle', () => {
      let collection;
      let fetchWithProductsStub;
      let fetchByHandleStub;

      beforeEach(() => {
        client = ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123
        });
        collection = new ProductSet({
          handle: 'hats',
          options: config.options,
        }, {
          client,
          createCart: () => Promise.resolve()
        });
        fetchWithProductsStub = sinon.stub(collection.props.client.collection, 'fetchWithProducts').returns(Promise.resolve({}));
        fetchByHandleStub = sinon.stub(collection.props.client.collection, 'fetchByHandle').returns(Promise.resolve({id: 2345}));
      });

      it('calls fetchByHandle and fetchWithProducts with collection id', () => {
        return collection.sdkFetch().then(() => {
          assert.calledWith(fetchByHandleStub, 'hats');
          assert.calledWith(fetchWithProductsStub, 2345);
        });
      });
    });

    describe('when passed an array of product IDs', () => {
      let collection;
      let fetchMultipleStub;
      let ids;

      beforeEach(() => {
        ids = [1234, 2345];
        client = ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123
        });
        collection = new ProductSet({
          id: ids,
          options: config.options,
        }, {
          client,
          createCart: () => Promise.resolve()
        });
        fetchMultipleStub = sinon.stub(client.product, 'fetchMultiple').returns(Promise.resolve({}));
      });

      it('calls fetchMultiple with an array of ids', () => {
        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchMultipleStub, ids);
      });
    });
  });

  describe('renderProducts', () => {
    let initSpy;

    beforeEach(() => {
      initSpy = sinon.spy(Product.prototype, 'init');
      set.view.render();
    });

    afterEach(() => {
      initSpy.restore();
    });

    it('initializes an array of products', () => {
      set.model.products = [fakeProduct];

      return set.renderProducts().then((data) => {
        assert.calledWith(initSpy, fakeProduct);
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
    let renderProductsSpy;

    beforeEach(() => {
      superSpy = sinon.stub(Updater.prototype, 'updateConfig');
      renderProductsSpy = sinon.stub(set, 'renderProducts');
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
    let renderChildStub;
    let resizeSpy;
    const newCollection = [{title: 'vapebelt'}, {title: 'vapeglasses'}];

    beforeEach(() => {
      set.id = 1234;
      sdkFetchSpy = sinon.stub(set, 'sdkFetch').returns(Promise.resolve(newCollection));
      renderChildStub = sinon.stub(set.view, 'renderChild');
      resizeSpy = sinon.stub(set.view, 'resize');
    });

    it('sets nextModel and rerenders pagintaiton button', () => {
      return set.showPagination().then(() => {
        assert.deepEqual(set.nextModel, {products: newCollection});
        assert.calledWith(sdkFetchSpy, {page: 2});
        assert.calledWith(renderChildStub, set.classes.productSet.paginationButton, set.paginationTemplate);
      });
    });
  });
});

