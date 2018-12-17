import Checkout from '../../src/components/checkout';

describe('Checkout class', () => {
  let checkout;
  const config = {
    window: {
      height: 100,
      width: 100,
    },
  };

  beforeEach(() => {
    checkout = new Checkout(config);
  });

  describe('constructor', () => {
    it('sets config to config param', () => {
      assert.equal(checkout.config, config);
    });
  });

  describe('prototype methods', () => {
    describe('open', () => {
      it('opens window to checkout if cart is popup', () => {
        const openStub = sinon.stub(window, 'open');
        checkout.config.cart = {
          popup: true,
        };
        checkout.open('test.com');
        assert.calledOnce(openStub);
        assert.calledWith(openStub, 'test.com', 'checkout', checkout.params);
      });
    });

    describe('getters', () => {
      describe('params', () => {
        it('returns a string including window config params', () => {
          const heightParam = 'height=100';
          const widthParam = 'width=100';

          assert.include(checkout.params, heightParam);
          assert.include(checkout.params, widthParam);
        });

        it('returns a string including left and top params that are calculated from window outer width and outer height', () => {
          const leftParam = `left=${(window.outerWidth / 2) - 200}`;
          const topParam = `top=${(window.outerHeight / 2) - 300}`;

          assert.include(checkout.params, leftParam);
          assert.include(checkout.params, topParam);
        });
      });
    });
  });
});
