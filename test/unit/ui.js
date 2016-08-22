import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';
import Product from '../../src/components/product';
import Cart from '../../src/components/cart';

const client = ShopifyBuy.buildClient({
  domain: 'buckets-o-stuff.myshopify.com',
  apiKey: 123,
  appId: 6
});

const productConfig = {
  id: 123,
  options: {}
}

describe('ui class', () => {
  let ui;
  let script;

  beforeEach(() => {
    ui = new UI(client);
    script = document.createElement('script');
    script.setAttribute('data-shopify-buy-ui', true);
    document.body.appendChild(script);
  });

  afterEach(() => {
    ui = null;
    document.body.removeChild(script);
  });

  describe('createCart', () => {

    let initStub;

    beforeEach(() => {
      initStub = sinon.stub(Cart.prototype, 'init', () => {
        return Promise.resolve();
      });
    });

    afterEach(() => {
      initStub.restore();
    });

    describe('when no cart exists', () => {
      it('creates a new cart', (done) => {
        ui.createCart({options: {}}).then(() => {
          assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
          ui.destroyComponent('cart', ui.components.cart[0].model.id);
          done();
        }).catch((e) => {
          done(e);
        });
      })
    });

    describe('when a cart exists', () => {
      it('does not create a second cart', (done) => {
        ui.createCart({options: {}}).then(() => ui.createCart({options: {}})).then(() => {
          assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
          ui.destroyComponent('cart', ui.components.cart[0].model.id);
          done();
        }).catch((e) => {
          done(e);
        });
      });
    });
  });

  describe('createComponent', () => {
    let initStub;

    beforeEach(() => {
      initStub = sinon.stub(Product.prototype, 'init', () => {
        return Promise.resolve();
      });
    });

    afterEach(() => {
      initStub.restore();
    });

    it('creates new component of type', (done) => {
      ui.createComponent('product', productConfig).then(() => {
        assert.equal(1, ui.components.product.length);
        ui.destroyComponent('product', ui.components.product[0].model.id);
        done()
      }).catch((e) => {
        done(e);
      });
    });

    it('passes config to constructor', (done) => {
      productConfig.node = null;
      const testConfig = {
        id: 123,
        options: {},
      }
      ui.createComponent('product', productConfig).then(() => {
        assert.equal(null, ui.components.product[0].config.node);
        ui.destroyComponent('product', ui.components.product[0].model.id);
        done()
      }).catch((e) => {
        done(e)
      });
    });
  });

  describe('destroyComponent', () => {
    it('removes component and calls its destroy method', () => {
      const testCart = {
        model: {
          id: 123
        },
        destroy: sinon.spy()
      }
      ui.components.cart.push(testCart);
      ui.destroyComponent('cart', 123);
      assert.equal(0, ui.components.cart.length);
      assert.calledOnce(testCart.destroy);
    });
  });
});
