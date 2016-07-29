import Cart from '../../src/components/cart';
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
      imageCache: {}
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

  describe('updateQuantity', () => {
    it('sets line item quantity', (done) => {
      cart.model = {
        lineItems: [{
          id: 1234,
          quantity: 1
        }],
        updateLineItem: () => {}
      }

      let render = sinon.stub(cart, 'render');
      let updateLineItem = sinon.stub(cart.model, 'updateLineItem').returns(Promise.resolve({
        id: 1,
        lineItems: [{
          id: 1234,
          quantity: 6
        }]
      }));

      cart.updateQuantity(1234, (qty) => qty + 5).then((c) => {
        assert.deepEqual(cart.model, {
          id: 1,
          lineItems: [{
            id: 1234,
            quantity: 6
          }]
        });
        assert.calledWith(updateLineItem, 1234, 6);
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
});

