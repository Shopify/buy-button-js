import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import Product from '../../src/components/product';
import Cart from '../../src/components/cart';

describe.skip('ui class', () => {
  let ui;
  let script;

  let client;
  const productConfig = {
    id: 123,
    options: {}
  };

  beforeEach(() => {
    client = ShopifyBuy.buildClient({
      domain: 'buckets-o-stuff.myshopify.com',
      apiKey: 123,
      appId: 6
    });
    ui = new UI(client, {});
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
      it('creates a new cart', () => {
        return ui.createCart({options: {}}).then(() => {
          assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
          ui.destroyComponent('cart', ui.components.cart[0].model.id);
        });
      })
    });

    describe('when a cart exists', () => {
      it('does not create a second cart', () => {
        return ui.createCart({options: {}}).then(() => ui.createCart({options: {}})).then(() => {
          assert.equal(1, ui.components.cart.length, 'cart array has 1 item');
          ui.destroyComponent('cart', ui.components.cart[0].model.id);
        });
      });
    });
  });

  describe('createComponent', () => {
    let initStub;
    let trackStub;

    beforeEach(() => {
      initStub = sinon.stub(Product.prototype, 'init', () => {
        return Promise.resolve();
      });
      trackStub = sinon.stub(ui, 'trackComponent');
    });

    afterEach(() => {
      initStub.restore();
    });

    it('creates new component of type', () => {
      return ui.createComponent('product', productConfig).then(() => {
        assert.equal(1, ui.components.product.length);
        ui.destroyComponent('product', ui.components.product[0].model.id);
      });
    });

    it('passes config to constructor', () => {
      productConfig.node = null;
      const testConfig = {
        id: 123,
        options: {},
      }
      return ui.createComponent('product', productConfig).then(() => {
        assert.equal(null, ui.components.product[0].config.node);
        ui.destroyComponent('product', ui.components.product[0].model.id);
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
