import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import Component from '../../src/component';
import Checkout from '../../src/components/checkout';
import Template from '../../src/template';
import defaults from '../../src/defaults/components';
import CartUpdater from '../../src/updaters/cart';
import CartView from '../../src/views/cart';
import ShopifyBuy from '../../src/buybutton';

let cart;

describe('Cart class', () => {
  beforeEach(() => {
    cart = new Cart({}, {
      client: ShopifyBuy.buildClient({
        domain: 'test.myshopify.com',
        storefrontAccessToken: 123
      }),
      browserFeatures: {
        transition: true,
        animation: true,
        transform: true,
      },
      tracker: {
        trackMethod: (fn) => {
          return function () {
            fn(...arguments);
          }
        }
      }
    });
  });
  afterEach(() => {
    cart.destroy();
  });

  describe('constructor', () => {
    it('instantiates child template, checkout, toggles, updater, view', () => {
      assert.instanceOf(cart.childTemplate, Template);
      assert.instanceOf(cart.checkout, Checkout);
      assert.instanceOf(cart.updater, CartUpdater);
      assert.instanceOf(cart.view, CartView);
      assert.instanceOf(cart.toggles[0], CartToggle);
    });
  });

  describe('createToggles()', () => {
    it('creates toggle instances for passed nodes', () => {
      cart.model.lineItems = [{}]
      const config = {
        toggles: [{
          node: document.body.appendChild(document.createElement('div'))
        }]
      }
      return cart.createToggles(config).then(() => {
        assert.equal(cart.toggles.length, 2);
      });
    });
  });

  describe('get lineItemsHtml', () => {
    it('returns an html string', () => {
      cart.lineItemCache = [
        {
          id: 123,
          title: 'test',
          variant_title: 'test2',
          line_price: 20,
          quantity: 1,
          variant: {image: {src: 'cdn.shopify.com/image.jpg'}},
        }
      ]

      const render = sinon.spy(cart.childTemplate, 'render');
      assert.include(cart.lineItemsHtml, 'data-line-item-id="123"');
      assert.calledOnce(render);
    });
  });

  describe('imageForLineItem', () => {
    beforeEach(() => {
      cart.lineItem = {
        id: 123,
        title: 'Line Item',
        variant_title: 'Line Item title',
        line_price: 20,
        quantity: 1,
        variant: {
          image: { src: 'cdn.shopify.com/variant_image.jpg'},
          product: {
            images: [{ src: 'cdn.shopify.com/product_image.jpg'}],
          },
        },
      }
    });

    it('returns the first product image if variant has no image', () => {
      cart.lineItem.variant.image = null;
      const clientReturn = sinon.stub(cart.props.client.image.helpers, 'imageForSize').returns('cdn.shopify.com/product_image.jpg');
      const productImage = cart.lineItem.variant.product.images[0];
      const sourceReturned = cart.imageForLineItem(cart.lineItem);

      assert.calledOnce(clientReturn);
      assert.calledWith(clientReturn, productImage);
      assert.equal(productImage.src, sourceReturned);
    });

    it('returns the variant image if it exists', () => {
      const clientReturn = sinon.stub(cart.props.client.image.helpers, 'imageForSize').returns('cdn.shopify.com/variant_image.jpg');
      const variantImage = cart.lineItem.variant.image;
      const sourceReturned = cart.imageForLineItem(cart.lineItem);

      assert.calledOnce(clientReturn);
      assert.calledWith(clientReturn, variantImage);
      assert.equal(variantImage.src, sourceReturned);
    });

    afterEach(() => {
      cart.props.client.image.helpers.imageForSize.restore();
    });
  });

  describe('fetchData()', () => {
    it('calls fetchRecentCart on client', () => {
      localStorage.setItem('checkoutId', 12345)
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.resolve({id: 12345, lineItems: []}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 12345, lineItems: []});
        assert.calledOnce(fetchCart);
        fetchCart.restore();
      });
    });

    it('calls createCart on client if localStorage is invalid', () => {
      localStorage.setItem('checkoutId', 1);
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.reject({errors: [{ message: 'rejected.' }]}));
      const createCheckout = sinon.stub(cart.props.client.checkout, 'create').returns(Promise.resolve({id: 12345, lineItems: []}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 12345, lineItems: []});
        assert.calledOnce(fetchCart);
        assert.calledOnce(createCheckout);
        assert.equal(localStorage.getItem('checkoutId'), 12345);
      });
    });

    it('calls createCart on client if checkout is completed', () => {
      const checkout = {id: 1111, lineItems: []};
      localStorage.setItem('checkoutId', 123);
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.resolve({ completedAt: "04-12-2018", lineItems: []}));
      const createCheckout = sinon.stub(cart.props.client.checkout, 'create').returns(Promise.resolve(checkout));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, checkout);
        assert.calledOnce(fetchCart);
        assert.calledOnce(createCheckout);
        assert.equal(localStorage.getItem('checkoutId'), checkout.id);
      });
    });
  });

  describe('fetchMoneyFormat()', () => {
    it('calls fetchShopInfo on client', () => {
      localStorage.setItem('checkoutId', 12345)
      const fetchMoneyFormat = sinon.stub(cart.props.client.shop, 'fetchInfo').returns(Promise.resolve({ moneyFormat: '₿{{amount}}'}));

      return cart.fetchMoneyFormat().then((data) => {
        assert.deepEqual(data, '₿{{amount}}');
        assert.calledOnce(fetchMoneyFormat);
        fetchMoneyFormat.restore();
      });
    });
  });

  describe('setQuantity()', () => {
    const node = {
      getAttribute: () => 1234
    };

    beforeEach(() => {
      cart.model = {
        lineItems: [{
          id: 1234,
          quantity: 1
        }],
      }
      cart.updateItem = sinon.spy();
    });

    it('calls updateItem', () => {
      cart.setQuantity(node, (n) => n + 1);
      assert.calledWith(cart.updateItem, 1234, 2);
    });
  });

  describe('updateItem()', () => {
    let updateLineItemsStub;

    beforeEach(() => {
      cart.model = {
        id: 123456,
      }
      updateLineItemsStub = sinon.stub(cart.props.client.checkout, 'updateLineItems').returns(Promise.resolve({lineItems: [{id: 123, quantity: 5}]}))
      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();
    });

    it('calls updateLineItem', () => {
      return cart.updateItem(123, 5).then(() => {
        assert.calledWith(updateLineItemsStub, 123456, [{id: 123, quantity:5}]);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
        assert.deepEqual(cart.model, {lineItems: [{id: 123, quantity: 5}]});
      });
    });
  });


  describe('addVariantToCart', () => {
    it('calls addLineItems on client', () => {
      cart.model = {
        id: 123456,
      }
      cart.view.setFocus = sinon.spy();
      const addLineItemsStub = sinon.stub(cart.props.client.checkout, 'addLineItems').returns(Promise.resolve({lineItems: [{id: 123, quantity: 1}]}));
      const render = sinon.stub(cart.view, 'render');
      const toggleRender = sinon.stub(cart.toggles[0].view, 'render');

      return cart.addVariantToCart({id: 123}).then(() => {
        assert.calledWith(addLineItemsStub, 123456, [{variantId: 123, quantity:1}]);
        assert.calledOnce(toggleRender);
        assert.called(cart.view.setFocus);
        assert.deepEqual(cart.model, {lineItems: [{id: 123, quantity: 1}]});
      });
    });
  });

  describe('get formattedTotal', () => {
    it('uses money helper to return formatted value', () => {
      cart.model = {
        subtotalPrice: '20.00',
      }
      assert.equal(cart.formattedTotal, '$20.00');
    });
  });

  describe('empty', () => {
    it('empties and rerenders the cart', () => {
      const removeLineItemsStub = sinon.stub(cart.props.client.checkout, 'removeLineItems').returns(Promise.resolve());
      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();

      return cart.empty().then(() => {
        assert.calledOnce(removeLineItemsStub);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
      });
    });
  });
});
