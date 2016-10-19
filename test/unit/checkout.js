import Checkout from '../../src/components/checkout';

describe('Checkout class', () => {
  describe('get params', () => {
    it('puts together a big param string', () => {
      const checkout = new Checkout({window: { height: 100, width: 100}});
      const windowParams = 'height=100,width=100,';
      assert.include(checkout.params, windowParams);
    });
  });
});
