var Pretender = require('fetch-pretender');

describe('it loads', function () {
  beforeEach(function() {
    browser.url('http://localhost:8080/test/browser/product.html');
    browser.execute(function () {
      window.localStorage.clear()
    });
    var iframe = browser.element('iframe[name=frame-product-6640244678]');
    iframe.waitForExist(500);
    browser.frame('frame-product-6640244678');
    browser.waitForText('.product__title', 'Ankle socks');
  });

  it('renders a product', function () {
    assert.equal(browser.getText('.product__title'), 'Ankle socks');
    assert.equal(browser.getText('.product__compare-price'), '$14.99');
    assert.equal(browser.getValue('select[name=Print]'), 'sloth');
  });

  it('updates variant by changing option values', function () {
    browser.selectByValue('select[name=Print]', 'shark');
    assert.equal(browser.getText('.btn'), 'Unavailable');
    browser.selectByValue('select[name=Size]', 'medium');
    assert.equal(browser.getText('.product__compare-price'), '$10.00');
  });

  it('updates quantity by changing quantity value', function () {
    browser.setValue('input.quantity', 3);
    assert.equal(browser.getValue('input.quantity'), 3);
  });

  describe('product modal', function () {
    beforeEach(function () {
      browser.click('.btn');
      browser.frame(null);
      var modalFrame = browser.element('iframe[name=frame-modal]');
      modalFrame.waitForExist(500);
      browser.frame('frame-modal');
      browser.waitForText('.product-description', 'Sockness Monster');
    });

    it('opens', function () {
      assert.equal(browser.getText('.product__title'), 'Ankle socks');
      assert.equal(browser.getText('.product__compare-price'), '$14.99');
      assert.equal(browser.getValue('select[name=Print]'), 'sloth');
    });

    it('updates variant by changing option values', function () {
      browser.selectByValue('select[name=Print]', 'shark');
      assert.equal(browser.getText('.btn'), 'Unavailable');
      browser.selectByValue('select[name=Size]', 'medium');
      assert.equal(browser.getText('.product__compare-price'), '$10.00');
    });

    it('updates quantity by changing quantity value', function () {
      browser.setValue('input.quantity', 3);
      assert.equal(browser.getValue('input.quantity'), 3);
    });

    it('adds item to cart on click', function () {
      browser.selectByValue('select[name=Print]', 'sloth');
      browser.selectByValue('select[name=Size]', 'large');
      browser.setValue('input.quantity', 2);
      browser.click('.btn');
      browser.frame(null);
      browser.frame('frame-cart');
      assert.equal(browser.getText('.cart-item__title'), 'Ankle socks');
      assert.equal(browser.getText('.cart-item__variant-title'), 'sloth / large');
    });
  });

  describe('cart', function () {
    beforeEach(function () {
      browser.frame(null);
      browser.frame('frame-product-3614411907');
      browser.click('.btn');
      browser.frame(null);
      browser.frame('frame-cart');
    });

    it('updates quantity and price on plus button', function () {
      browser.click('.quantity-increment');
      assert.equal(browser.getValue('input.quantity'), 2);
      assert.equal(browser.getText('.cart-item__price'), '$64.00');
      assert.include(browser.getText('.cart__subtotal__price'), '$64.00');
    });

    it('updates quantity and price on input', function () {
      browser.setValue('input.quantity', 3);
      assert.equal(browser.getValue('input.quantity'), 3);
      browser.click('.cart');
      assert.equal(browser.getText('.cart-item__price'), '$96.00');
      assert.include(browser.getText('.cart__subtotal__price'), '$96.00');
    });

    it('removes item from cart when quantity is 0', function () {
      browser.setValue('input.quantity', 0);
      browser.click('.cart');
      browser.waitForExist('.cart-item', 800, true);
      assert.notOk(browser.element('.cart-item').value);
      assert.include(browser.getText('.cart__subtotal__price'), '$0.00');
    });
  });
});
