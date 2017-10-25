import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import Component from '../../src/component';
import Checkout from '../../src/components/checkout';
import Template from '../../src/template';
import defaults from '../../src/defaults/components';
import CartUpdater from '../../src/updaters/cart';
import CartView from '../../src/views/cart';

let cart;
let fakeClient = {
  fetchCheckout: () => {},
  fetchRecentCart: () => {},
  updateLineItems: () => {},
  addLineItems: () => {},
  fetchShopInfo: () => {}
}

describe('Cart class', () => {
  beforeEach(() => {
    cart = new Cart({}, {
      client: fakeClient,
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

  describe('fetchData()', () => {
    it('calls fetchRecentCart on client', () => {
      localStorage.setItem('checkoutId', 12345)
      const fetchCart = sinon.stub(cart.props.client, 'fetchCheckout').returns(Promise.resolve({id: 12345, lineItems: []}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 12345, lineItems: []});
        assert.calledOnce(fetchCart);
        fetchCart.restore();
      });
    });
  });

  describe('fetchMoneyFormat()', () => {
    it('calls fetchShopInfo on client', () => {
      localStorage.setItem('checkoutId', 12345)
      const fetchMoneyFormat = sinon.stub(cart.props.client, 'fetchShopInfo').returns(Promise.resolve({ moneyFormat: '₿{{amount}}'}));

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
      updateLineItemsStub = sinon.stub(cart.props.client, 'updateLineItems').returns(Promise.resolve({lineItems: [{id: 123, quantity: 5}]}))
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
      const addLineItemsStub = sinon.stub(cart.props.client, 'addLineItems').returns(Promise.resolve({lineItems: [{id: 123, quantity: 1}]}));
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
      cart.model = {
        clearLineItems: sinon.stub().returns(Promise.resolve())
      }
      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();

      return cart.empty().then(() => {
        assert.calledOnce(cart.model.clearLineItems);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
      });
    });
  });
});
