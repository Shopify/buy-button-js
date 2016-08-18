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
      it('calls fetchCart on client', (done) => {
        let getItem = sinon.stub(fakeLocalStorage, 'getItem').returns('1234');
        let fetchCart = sinon.stub(cart.props.client, 'fetchCart').returns(Promise.resolve({id: 1234}));

        cart.fetchData().then((data) => {
          assert.deepEqual(data, {id: 1234});
          assert.calledWith(getItem, 'lastCartId');
          assert.calledWith(fetchCart, '1234');
          getItem.restore();
          fetchCart.restore();
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });

    describe('if lastCart is not set in localStorage', () => {
      it('sets cart in localStorage', (done) => {
        let createCart = sinon.stub(cart.props.client, 'createCart').returns(Promise.resolve({id: 1234}));
        let getItem = sinon.stub(fakeLocalStorage, 'getItem').returns(null);
        let setItem = sinon.stub(fakeLocalStorage, 'setItem');

        cart.fetchData().then((data) => {
          assert.deepEqual(data, {id: 1234});
          assert.calledWith(setItem, 'lastCartId', 1234);
          getItem.restore();
          setItem.restore();
          createCart.restore();
          done();
        }).catch((e) => {
          done(e);
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
      cart.removeItem = sinon.spy();
    });

    describe('when setting quantity > 0', () => {
      it('calls updateItem', () => {
        cart.setQuantity(node, (n) => n + 1);
        assert.calledWith(cart.updateItem, 1234, 2);
      });
    });

    describe('when setting quantity == 0', () => {
      it('calls removeItem', () => {
        cart.setQuantity(node, (n) => n - 1);
        assert.calledWith(cart.removeItem, 1234, node);
      });
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

    it('calls updateLineItem', (done) => {
      cart.updateItem(123, 3).then(() => {
        assert.calledWith(updateLineItemStub, 123, 3);
        assert.calledOnce(cart.render);
        assert.calledOnce(cart.toggle.render);
        assert.deepEqual(cart.model, {test: 'lol'});
        done();
      }).catch((e) => {
        done(e);
      });
    });
  });


  describe('removeItem', () => {
    let updateLineItemStub;
    let node;

    beforeEach(() => {
      cart.model = {
        updateLineItem: () => {}
      }
      updateLineItemStub = sinon.stub(cart.model, 'updateLineItem').returns(Promise.resolve({test: 'lol'}))
      cart.toggle.render = sinon.spy();

      node = {
        parentNode: {
          parentNode: {
            addEventListener: sinon.spy(),
            classList: {
              add: sinon.spy(),
            },
            parentNode: {

            }
          },
        },
      };
    });

    it('calls updateLineItem', (done) => {
      cart.removeItem(123, node).then(() => {
        assert.calledWith(updateLineItemStub, 123, 0);
        assert.deepEqual(cart.model, {test: 'lol'});
        assert.calledOnce(cart.toggle.render);
        assert.calledWith(node.parentNode.parentNode.addEventListener, 'transitionend');
        done();
      }).catch((e) => {
        done(e);
      });
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
    it('calls model addVariants', (done) => {
      cart.model.addVariants = sinon.stub().returns(Promise.resolve());
      let render = sinon.stub(cart, 'render');
      let toggleRender = sinon.stub(cart.toggle, 'render');

      cart.addVariantToCart({id: 123}).then(() => {
        assert.calledWith(cart.model.addVariants, {variant: {id: 123 }, quantity: 1});
        assert.calledOnce(toggleRender);
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
});

