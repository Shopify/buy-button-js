import Cart from '../../src/components/cart';
import defaults from '../../src/defaults/components';

const { module, test } = QUnit;

let cart;
let fakeLocalStorage = {};

module('Unit | Cart', {
  beforeEach() {
    cart = new Cart({}, {client: {}});
  },
  afterEach() {
    cart = null;
    fakeLocalStorage = {};
  }
});

test('it calls fetchCart if localStorage is set on #fetchData', (assert) => {
  const done = assert.async();
  window.localStorage.getItem = function(id) {
    assert.equal(id, 'lastCartId');
    return '1234';
  };

  cart.props.client.fetchCart = function(id) {
    assert.equal(id, '1234');
    return Promise.resolve({id: 1234});
  }

  cart.fetchData().then((data) => {
    assert.deepEqual(data, {id: 1234});
    done();
  });
});

test('it sets cart in localStorage if localstorage is not set on #fetchData', (assert) => {
  const done = assert.async();

  cart.props.client.createCart = function(id) {
    return Promise.resolve({id: 1234});
  }

  window.localStorage.getItem = function(id) {
    assert.equal(id, 'lastCartId');
    return null;
  };

  window.localStorage.setItem = function(id, cart) {
    assert.equal(id, 'lastCartId');
    fakeLocalStorage[id] = JSON.stringify(cart);
  };

  cart.fetchData().then((data) => {
    assert.deepEqual(data, {id: 1234});
    assert.equal('1234', fakeLocalStorage['lastCartId']);
    done();
  });
});

test('it sets line item quantity on #updateQuantity', (assert) => {
  const done = assert.async();
  cart.model = {
    lineItems: [{
      id: 1234,
      quantity: 1
    }],
    updateLineItem: function (id, qty) {
      assert.equal(id, 1234);
      assert.equal(qty, 6);
      return Promise.resolve({
        id: 1,
        lineItems: [{
          id: 1234,
          quantity: qty
        }]
      });
    }
  }

  cart.render = function () {
    assert.ok(true);
  }


  cart.updateQuantity(1234, (qty) => qty + 5).then((c) => {
    assert.deepEqual(cart.model, {
      id: 1,
      lineItems: [{
        id: 1234,
        quantity: 6
      }]
    });
    done();
  });
});

test('it returns an html string on #childrenHtml', (assert) => {
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

  assert.ok(cart.childrenHtml.match('<input class="cart-item__quantity" type="number" min="0" aria-label="Quantity" data-line-item-id="123" value="1">'));
});

test('it combines model with view data on #viewData', (assert) => {
  cart.model = {
    id: 1234,
    lineItems: []
  }

  assert.deepEqual(cart.viewData, {
    id: 1234,
    lineItems: [],
    text: defaults.cart.text,
    classes: Object.assign({}, defaults.cart.classes, defaults.lineItem.classes),
    childrenHtml: ''
  });
});

test('it adds a variant on #addVariantToCart', (assert) => {
  const done = assert.async();

  cart.model.addVariants = function (variant) {
    assert.deepEqual(variant, {variant: {id: 123}, quantity: 1});
    return Promise.resolve();
  }

  cart.render = function () {
    assert.ok(true);
  }

  cart.addVariantToCart({id: 123}).then(() => {
    done();
  });
});
