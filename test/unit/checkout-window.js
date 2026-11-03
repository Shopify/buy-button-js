import {trackCheckoutUrl, clearCheckoutOrigins, isCheckoutPopupMessage} from '../../src/utils/checkout-window';

describe('checkout window messages', () => {
  const checkoutUrl = 'https://checkout.example.com/1/checkouts/abc?key=1';
  const checkoutOrigin = 'https://checkout.example.com';
  let popup;

  beforeEach(() => {
    popup = {opener: window};
  });

  afterEach(() => {
    clearCheckoutOrigins();
  });

  it('trusts a popup that this window opened on a recorded checkout origin', () => {
    trackCheckoutUrl(checkoutUrl);
    assert.isTrue(isCheckoutPopupMessage({source: popup, origin: checkoutOrigin}));
  });

  it('trusts a popup that this window opened on the configured shop domain', () => {
    assert.isTrue(isCheckoutPopupMessage({source: popup, origin: 'https://shop.myshopify.com'}, 'shop.myshopify.com'));
  });

  it('keeps the checkout origin in sessionStorage, so it is still known after a reload', () => {
    trackCheckoutUrl(checkoutUrl);
    assert.include(JSON.parse(window.sessionStorage.getItem('shopify-buy-ui-checkout-origins')), checkoutOrigin);
  });

  it('normalizes default ports on the checkout URL', () => {
    trackCheckoutUrl('https://checkout.example.com:443/1/checkouts/abc');
    assert.isTrue(isCheckoutPopupMessage({source: popup, origin: checkoutOrigin}));
  });

  it('rejects a popup that this window opened on another origin', () => {
    trackCheckoutUrl(checkoutUrl);
    assert.isFalse(isCheckoutPopupMessage({source: popup, origin: 'https://login.example.com'}, 'shop.myshopify.com'));
    assert.isFalse(isCheckoutPopupMessage({source: popup, origin: 'http://checkout.example.com'}));
  });

  it('rejects a window that this window did not open, even on the checkout origin', () => {
    trackCheckoutUrl(checkoutUrl);
    assert.isFalse(isCheckoutPopupMessage({source: {}, origin: checkoutOrigin}));
    assert.isFalse(isCheckoutPopupMessage({source: {opener: {}}, origin: checkoutOrigin}));
    assert.isFalse(isCheckoutPopupMessage({source: window, origin: checkoutOrigin}));
  });

  it('rejects a message without a source or origin', () => {
    trackCheckoutUrl(checkoutUrl);
    assert.isFalse(isCheckoutPopupMessage({source: null, origin: checkoutOrigin}));
    assert.isFalse(isCheckoutPopupMessage({source: popup, origin: ''}));
    assert.isFalse(isCheckoutPopupMessage(null));
  });

  it('ignores a checkout URL without an origin', () => {
    trackCheckoutUrl('');
    trackCheckoutUrl(null);
    assert.isNull(window.sessionStorage.getItem('shopify-buy-ui-checkout-origins'));
  });
});
