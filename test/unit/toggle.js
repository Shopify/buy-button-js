import Toggle from '../../src/components/toggle';

let toggle;
let fakeClient = {
  fetchCart: () => {},
  createCart: () => {},
}

const cart = {
  model: {
    lineItems: [
      {
        id: 1,
        quantity: 1,
      },
      {
        id: 2,
        quantity: 2,
      },
    ]
  }
}

describe('Toggle class', () => {
  beforeEach(() => {
    cart.node = document.createElement('div');
    cart.node.setAttribute('id', 'fixture');
    document.body.appendChild(cart.node);
    toggle = new Toggle({}, {client: fakeClient, cart});
  });

  afterEach(() => {
    toggle = null;
    document.body.removeChild(cart.node);
    cart.node = null;
  })

  describe('get count', () => {
    it('returns total quantity of variants in cart', () => {
      assert.equal(toggle.count, 3);
    });
  });

  describe('get isVisible', () => {
    it('returns true if greater than 0', () => {
      assert(toggle.frame.isVisible);
    });
  });
});

