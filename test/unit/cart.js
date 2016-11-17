import Cart from '../../src/components/cart';
import Component from '../../src/component';
import defaults from '../../src/defaults/components';
import Updater from '../../src/updater';

let cart;
let fakeClient = {
  fetchRecentCart: () => {},
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
    cart = null;
  });

  describe('fetchData', () => {
    it('calls fetchRecentCart on client', () => {
      let fetchCart = sinon.stub(cart.props.client, 'fetchRecentCart').returns(Promise.resolve({id: 1234}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 1234});
        assert.calledOnce(fetchCart);
        fetchCart.restore();
      });
    });
  });

  describe('setQuantity', () => {
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

  describe('updateItem', () => {
    let updateLineItemStub;

    beforeEach(() => {
      cart.model = {
        updateLineItem: () => {}
      }
      updateLineItemStub = sinon.stub(cart.model, 'updateLineItem').returns(Promise.resolve({test: 'lol'}))
      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();
    });

    it('calls updateLineItem', () => {
      return cart.updateItem(123, 3).then(() => {
        assert.calledWith(updateLineItemStub, 123, 3);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
        assert.deepEqual(cart.model, {test: 'lol'});
      });
    });
  });


  describe('_animateRemoveNode', () => {
    let node;

    beforeEach(() => {
      node = cart.view.document.createElement('div');
      node.setAttribute('id', 123);
      cart.view.document.body.appendChild(node);
      node.addEventListener = sinon.spy();
    });

    afterEach(() => {
      cart.view.document.body.removeChild(node);
    });

    it('calls updateLineItem', () => {
      cart.view.animateRemoveNode(123);
      assert.calledWith(node.addEventListener, 'animationend');
    });
  });

  describe('get lineItemsHtml', () => {
    it('returns an html string', () => {
      cart.model = {
        lineItems: [
          {
            id: 123,
            title: 'test',
            variant_title: 'test2',
            line_price: 20,
            quantity: 1,
            imageVariants: []
          }
        ]
      }

      let render = sinon.spy(cart.childTemplate, 'render');

      assert.include(cart.lineItemsHtml, 'data-line-item-id="123"');
      assert.calledOnce(render);
    });
  });

  describe('addVariantToCart', () => {
    it('calls model createLineItemsFromVariants', () => {
      cart.view.setFocus = sinon.spy();
      cart.model.createLineItemsFromVariants= sinon.stub().returns(Promise.resolve());
      let render = sinon.stub(cart.view, 'render');
      let toggleRender = sinon.stub(cart.toggles[0].view, 'render');

      return cart.addVariantToCart({id: 123}).then(() => {
        assert.calledWith(cart.model.createLineItemsFromVariants, {variant: {id: 123 }, quantity: 1});
        assert.calledOnce(toggleRender);
        assert.called(cart.view.setFocus);
      });
    });
  });

  describe('get formattedTotal', () => {
    it('uses money helper to return formatted value', () => {
      cart.model = {
        subtotal: '20.00',
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
