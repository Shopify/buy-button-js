function setupBrowser() {
  browser.url('http://localhost:8080/test/browser/product.html');
  browser.execute(function () {
    window.localStorage.clear()
  });
  var iframe = browser.element('iframe[name=frame-product-6640244678]');
  iframe.waitForExist(1000);
  browser.frame('frame-product-6640244678');
  browser.waitForText('.shopify-buy__product__title', 'Ankle socks');
}

describe('product', function () {
  beforeEach(function() {
    setupBrowser();
  });

  describe('single product embed', function () {
    it('renders a product', function () {
      assert.equal(browser.getText('.shopify-buy__product__title'), 'Ankle socks');
      assert.equal(browser.getText('.shopify-buy__product__compare-price'), '$14.99');
      assert.equal(browser.getValue('select[name=Print]'), 'sloth');
    });

    it('updates variant by changing option values', function () {
      browser.selectByValue('select[name=Print]', 'shark');
      assert.equal(browser.getText('.shopify-buy__btn'), 'Unavailable');
      browser.selectByValue('select[name=Size]', 'medium');
      assert.equal(browser.getText('.shopify-buy__product__compare-price'), '$10.00');
    });
  });

  describe('product modal', function () {
    beforeEach(function () {
      browser.click('.shopify-buy__btn');
      browser.frame(null);
      var modalFrame = browser.element('iframe[name=frame-modal]');
      modalFrame.waitForExist(1000);
      browser.frame('frame-modal');
      browser.waitForText('.shopify-buy__product-description', 'Sockness Monster');
    });

    it('opens', function () {
      assert.equal(browser.getText('.shopify-buy__product__title'), 'Ankle socks');
      assert.equal(browser.getText('.shopify-buy__product__compare-price'), '$14.99');
      assert.equal(browser.getValue('select[name=Print]'), 'sloth');
    });

    it('updates variant by changing option values', function () {
      browser.selectByValue('select[name=Print]', 'shark');
      assert.equal(browser.getText('.shopify-buy__btn'), 'Unavailable');
      browser.selectByValue('select[name=Size]', 'medium');
      assert.equal(browser.getText('.shopify-buy__product__compare-price'), '$10.00');
    });

    it('updates quantity by changing quantity value', function () {
      browser.setValue('input.shopify-buy__quantity', 3);
      assert.equal(browser.getValue('input.shopify-buy__quantity'), 3);
    });

    it('adds item to cart on click', function () {
      browser.selectByValue('select[name=Print]', 'sloth');
      browser.selectByValue('select[name=Size]', 'large');
      browser.setValue('input.shopify-buy__quantity', 2);
      browser.click('.shopify-buy__btn');
      browser.frame(null);
      browser.frame('frame-cart');
      assert.equal(browser.getText('.shopify-buy__cart-item__title'), 'Ankle socks');
      assert.equal(browser.getText('.shopify-buy__cart-item__variant-title'), 'sloth / large');
    });
  });
});

describe('cart', function () {
  beforeEach(function () {
    setupBrowser();
    browser.waitForText('.shopify-buy__product__title', 'Ankle socks');
    browser.frame(null);
    browser.frame('frame-product-3614411907');
    browser.click('.shopify-buy__btn');
    browser.frame(null);
    browser.frame('frame-cart');
  });

  it('updates quantity and price on plus button', function () {
    browser.click('.shopify-buy__quantity-increment');
    assert.equal(browser.getValue('input.shopify-buy__quantity'), 2);
    assert.equal(browser.getText('.shopify-buy__cart-item__price'), '$64.00');
    assert.include(browser.getText('.shopify-buy__cart__subtotal__price'), '$64.00');
  });

  it('updates quantity and price on input', function () {
    browser.setValue('input.shopify-buy__quantity', 3);
    assert.equal(browser.getValue('input.shopify-buy__quantity'), 3);
    browser.click('.shopify-buy__cart');
    assert.equal(browser.getText('.shopify-buy__cart-item__price'), '$96.00');
    assert.include(browser.getText('.shopify-buy__cart__subtotal__price'), '$96.00');
  });

  it('removes item from cart when quantity is 0', function () {
    browser.setValue('input.shopify-buy__quantity', 0);
    browser.click('.shopify-buy__cart');
    browser.waitForExist('.shopify-buy__cart-item', 800, true);
    assert.notOk(browser.element('.shopify-buy__cart-item').value);
    assert.include(browser.getText('.shopify-buy__cart__subtotal__price'), '$0.00');
  });
});
