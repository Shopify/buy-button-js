import Cart from '../../src/components/cart';
import Component from '../../src/component';
import defaults from '../../src/defaults/components';

let cart;
let fakeLocalStorage = {
  getItem: () => {},
  setItem: () => {},
};

let fakeClient = {
  fetchCart: () => {},
  createCart: () => {},
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
    },
    fakeLocalStorage);
  });
  afterEach(() => {
    cart.destroy();
    cart = null;
  });

  describe('fetchData', () => {
    describe('if lastCart is set in localStorage', () => {
      it('calls fetchCart on client', () => {
        let getItem = sinon.stub(fakeLocalStorage, 'getItem').returns('1234');
        let fetchCart = sinon.stub(cart.props.client, 'fetchCart').returns(Promise.resolve({id: 1234}));

        return cart.fetchData().then((data) => {
          assert.deepEqual(data, {id: 1234});
          assert.calledWith(getItem, 'lastCartId');
          assert.calledWith(fetchCart, '1234');
          getItem.restore();
          fetchCart.restore();
        });
      });
    });

    describe('if lastCart is not set in localStorage', () => {
      it('sets cart in localStorage', () => {
        let createCart = sinon.stub(cart.props.client, 'createCart').returns(Promise.resolve({id: 1234}));
        let getItem = sinon.stub(fakeLocalStorage, 'getItem').returns(null);
        let setItem = sinon.stub(fakeLocalStorage, 'setItem');

        return cart.fetchData().then((data) => {
          assert.deepEqual(data, {id: 1234});
          assert.calledWith(setItem, 'lastCartId', 1234);
          getItem.restore();
          setItem.restore();
          createCart.restore();
        });
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
      cart.render = sinon.spy();
      cart.toggle.render = sinon.spy();
    });

    it('calls updateLineItem', () => {
      return cart.updateItem(123, 3).then(() => {
        assert.calledWith(updateLineItemStub, 123, 3);
        assert.calledOnce(cart.render);
        assert.calledOnce(cart.toggle.render);
        assert.deepEqual(cart.model, {test: 'lol'});
      });
    });
  });


  describe('_animateRemoveItem', () => {
    let node;

    beforeEach(() => {
      node = cart.document.createElement('div');
      node.setAttribute('id', 123);
      cart.document.body.appendChild(node);
      node.addEventListener = sinon.spy();
    });

    afterEach(() => {
      cart.document.body.removeChild(node);
    });

    it('calls updateLineItem', () => {
      cart._animateRemoveItem(123);
      assert.calledWith(node.addEventListener, 'transitionend');
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
            quantity: 1
          }
        ]
      }

      let render = sinon.spy(cart.childTemplate, 'render');

      assert.include(cart.lineItemsHtml, 'data-line-item-id="123"');
      assert.calledOnce(render);
    });
  });

  describe('addVariantToCart', () => {
    it('calls model addVariants', () => {
      cart.model.addVariants = sinon.stub().returns(Promise.resolve());
      let render = sinon.stub(cart, 'render');
      let toggleRender = sinon.stub(cart.toggle, 'render');

      return cart.addVariantToCart({id: 123}).then(() => {
        assert.calledWith(cart.model.addVariants, {variant: {id: 123 }, quantity: 1});
        assert.calledOnce(toggleRender);
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
      cart.toggle.updateConfig = sinon.spy();
    });

    afterEach(() => {
      superSpy.restore();
    });

    it('calls updateConfig on toggle', () => {
      cart.updateConfig(newConfig);
      assert.calledWith(cart.toggle.updateConfig, newConfig);
      assert.calledWith(superSpy, newConfig);
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
});

