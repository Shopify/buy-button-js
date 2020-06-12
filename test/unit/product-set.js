import ProductSet from '../../src/components/product-set';
import Component from '../../src/component';
import Updater from '../../src/updater';
import Product from '../../src/components/product';
import testProduct from '../fixtures/product-fixture';
import ShopifyBuy from '../../src/buybutton';

const config = {
  storefrontId: 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzEyMzQ1',
  options: {
    product: {
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      }
    }
  },
};

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
      set.model.products = [fakeProduct];
      set.view.render();
    });

    afterEach(() => {
      initSpy.restore();
      showPaginationStub.restore();
    });

    it('initializes an array of products', () => {
      return set.renderProducts().then(() => {
        assert.calledWith(initSpy, fakeProduct);
      });
    });

    it('calls showPagination if pagination is set to true in contents and products have connections', () => {
      set.config.productSet.contents.pagination = true;
      const updatedFakeProduct = Object.assign({}, fakeProduct);
      updatedFakeProduct.hasNextPage = true;
      set.model.products = [updatedFakeProduct];

      return set.renderProducts().then(() => {
        assert.calledOnce(showPaginationStub);
      });
    });

    it('does not call showPagination if pagination is set to true in contents and products do not have connections', () => {
      set.config.productSet.contents.pagination = true;

      return set.renderProducts().then(() => {
        assert.notCalled(showPaginationStub);
      });
    });

    it('does not call showPagination if pagination is set to false in contents and products have connections', () => {
      set.config.productSet.contents.pagination = false;
      const updatedFakeProduct = Object.assign({}, fakeProduct);
      updatedFakeProduct.hasNextPage = true;
      set.model.products = [updatedFakeProduct];

      return set.renderProducts().then(() => {
        assert.notCalled(showPaginationStub);
      });
    });

    it('does not call showPagination if pagination is set to false in contents and products do not have connections', () => {
      set.config.productSet.contents.pagination = false;

      return set.renderProducts().then(() => {
        assert.notCalled(showPaginationStub);
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
      set.products = [{
        updateConfig: sinon.spy()
      }];
      set.cart = {
        updateConfig: sinon.spy()
      }
    });

    afterEach(() => {
      superSpy.restore();
    });

    it('calls updateConfig on super, cart and first product', () => {
      set.updateConfig(newConfig);
      assert.calledWith(set.cart.updateConfig, newConfig);
      assert.calledWith(set.products[0].updateConfig, {options: newConfig.options});
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

  describe('trackingInfo', () => {
    let expectedContentString;

    beforeEach(() => {
      expectedContentString = Object.keys(set.config.product.contents).filter((key) => set.config.product.contents[key]).toString();
    });

    it('returns an object with the collection id and button destination when an the product set id is not an array', () => {
      const info = set.trackingInfo;
      assert.deepEqual(info, {
        id: config.storefrontId,
        destination: set.config.product.buttonDestination,
        layout: set.config.product.layout,
        contents: expectedContentString,
        checkoutPopup: set.config.cart.popup,
      });
    });

    it('returns an array of product info objects when the product set id is an array of ids', () => {
      const fakeProduct2 = {
        title: 'test2',
        id: 4567,
        storefrontId: 'GTYlkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==',
        images: [
          {
            id: '1',
            src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-one.jpg',
          },
          {
            id: '2',
            src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-two.jpeg',
          },
          {
            id: '3',
            src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-three.jpg',
          },
          {
            id: '4',
            src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-four.jpeg',
          },
        ],
        options: [
          {
            name: 'Print',
            values: [
              {value: 'sloth'},
              {value: 'shark'},
              {value: 'cat'},
            ],
          },
          {
            name: 'Size',
            selected: 'small',
            values: [
              {value: 'small'},
              {value: 'large'},
            ],
          },
        ],
        variants: [
          {
            id: 'GTYOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0NQ==',
            productId: 1245,
            price: '20.00',
            priceV2: {
              amount: '20.00',
              currencyCode: 'CAD',
            },
            title: 'sloth / small',
            available: true,
            image: {
              id: 100,
              src: 'https://cdn.shopify.com/s/files/1/0014/8583/2214/products/image-one.jpg',
            },
            selectedOptions: [
              {
                name: 'Print',
                value: 'sloth',
              },
              {
                name: 'Size',
                value: 'small',
              },
            ],
          },
        ],
      };

      set.id = [1234, 4567];
      set.model.products = [fakeProduct, fakeProduct2];
      const info = set.trackingInfo;
      assert.deepEqual(info, [{
        id: fakeProduct.id,
        name: fakeProduct.title,
        variantId: fakeProduct.variants[0].id,
        variantName: fakeProduct.variants[0].title,
        price: fakeProduct.variants[0].priceV2.amount,
        destination: set.config.product.buttonDestination,
        layout: set.config.product.layout,
        contents: expectedContentString,
        checkoutPopup: set.config.cart.popup,
        sku: null,
        isProductSet: true,
      },
      {
        id: fakeProduct2.id,
        name: fakeProduct2.title,
        variantId: fakeProduct2.variants[0].id,
        variantName: fakeProduct2.variants[0].title,
        price: fakeProduct2.variants[0].priceV2.amount,
        destination: set.config.product.buttonDestination,
        layout: set.config.product.layout,
        contents: expectedContentString,
        checkoutPopup: set.config.cart.popup,
        sku: null,
        isProductSet: true,
      }]);
    });
  });


});
