import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';
import { assert } from 'chai';

describe('ShopifyBuy.UI', () => {
  const configAttrs = {
    domain: 'buckets-o-stuff.myshopify.com',
    apiKey: 123,
    appId: 6
  };

  let uiClient;

  beforeEach(() => {
     uiClient = ShopifyBuy.UI.buildClient(configAttrs);
  });

  afterEach(() => {
    uiClient = null;
  });

  it('returns an instance of UI', () => {
     assert.isOk(uiClient instanceof UI);
  });

  it('adds to global namespace', () => {
    assert.isOk(window.ShopifyBuy.UI);
  });
});
