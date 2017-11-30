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

  it('converts database collection id to storefrontId', () => {
    const id = 12345
    const collection = new ProductSet({id}, {});

    assert.equal(collection.storefrontId, btoa(`gid://shopify/Collection/${id}`))
  }),

  it('converts a list of database product ids to storefrontId', () => {
    const id = [12345, 34567];
    const collection = new ProductSet({id}, {});

    assert.deepEqual(collection.storefrontId, [
      btoa(`gid://shopify/Product/${id[0]}`),
      btoa(`gid://shopify/Product/${id[1]}`),
    ]);
  }),

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
      const id = 12345;
      const storefrontId = btoa(`gid://shopify/Collection/${id}`);
      let productSetOpts;

      beforeEach(() => {
        client = ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123
        });
        productSetOpts = {
          client,
          createCart: () => Promise.resolve()
        };
      });

      it('calls collection.fetchWithProducts with collection storefrontId when passed a storefrontId', () => {
        collection = new ProductSet({
          storefrontId,
          options: config.options,
        }, productSetOpts);
        fetchWithProductsStub = sinon.stub(
          collection.props.client.collection,
          'fetchWithProducts'
        ).returns(Promise.resolve([]));

        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchWithProductsStub, storefrontId);
      });

      it('calls collection.fetchWithProducts with collection storefrontId when passed a database id', () => {
        collection = new ProductSet({
          id,
          options: config.options,
        }, productSetOpts);
        fetchWithProductsStub = sinon.stub(
          collection.props.client.collection,
          'fetchWithProducts'
        ).returns(Promise.resolve({}));

        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchWithProductsStub, storefrontId);
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
        fetchByHandleStub = sinon.stub(collection.props.client.collection, 'fetchByHandle').returns(Promise.resolve({id: 'an-id'}));
      });

      it('calls fetchByHandle and fetchWithProducts with collection id', () => {
        return collection.sdkFetch().then(() => {
          assert.calledWith(fetchByHandleStub, 'hats');
          assert.calledWith(fetchWithProductsStub, 'an-id');
        });
      });
    });

    describe('when passed an array of database product IDs', () => {
      let collection;
      let fetchMultipleStub;
      let productSetOpts;
      const id = [1234, 2345];
      const storefrontId = [
        btoa(`gid://shopify/Product/${id[0]}`),
        btoa(`gid://shopify/Product/${id[1]}`),
      ];

      beforeEach(() => {
        client = ShopifyBuy.buildClient({
          domain: 'test.myshopify.com',
          storefrontAccessToken: 123
        });
        productSetOpts = {
          client,
          createCart: () => Promise.resolve()
        };
        fetchMultipleStub = sinon.stub(client.product, 'fetchMultiple').returns(Promise.resolve({}));
      });

      it('calls fetchMultiple with an array of storefront ids when passed database ids', () => {
        collection = new ProductSet({
          id,
          options: config.options,
        }, productSetOpts);
        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchMultipleStub, storefrontId);
      });

      it('calls fetchMultiple with an array of storefront ids when passed storefront ids', () => {
        collection = new ProductSet({
          storefrontId,
          options: config.options,
        }, productSetOpts);
        const result = collection.sdkFetch();
        assert.ok(result.then);
        assert.calledWith(fetchMultipleStub, storefrontId);
      });
    });
  });

  describe('renderProducts', () => {
    let initSpy;
    let showPaginationStub;

    beforeEach(() => {
      initSpy = sinon.spy(Product.prototype, 'init');
      showPaginationStub = sinon.stub(set, 'showPagination').returns(Promise.resolve());
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
    let fetchNextPageSpy;

    const nextPageData = {
      model: [
        {title: 'vapebelt'},
        {title: 'vapeglasses'},
      ],
    };

    beforeEach(() => {
      set.id = 1234;
      set.model.products = [{title: 'product1'}, {title: 'product2'}];
      renderChildStub = sinon.stub(set.view, 'renderChild');
      resizeSpy = sinon.stub(set.view, 'resize');
      fetchNextPageSpy = sinon.stub(set.props.client, 'fetchNextPage').returns(Promise.resolve(nextPageData));
    });

    it('sets nextModel and rerenders pagination button', () => {
      return set.showPagination().then(() => {
        assert.deepEqual(set.nextModel, {products: nextPageData.model});
        assert.calledWith(renderChildStub, set.classes.productSet.paginationButton, set.paginationTemplate);
      });
    });
  });
});
