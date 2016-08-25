import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';

describe('ShopifyBuy.UI', () => {
  const configAttrs = {
    domain: 'embeds.myshopify.com',
    apiKey: 123,
    appId: 6
  };

  const client = ShopifyBuy.buildClient(configAttrs);
  let ui;

  beforeEach(() => {
     ui = ShopifyBuy.UI.init(client);
  });

  afterEach(() => {
    ui = null;
  });

  it('returns an instance of UI', () => {
     assert.isOk(ui instanceof UI);
  });

  it('adds to global namespace', () => {
    assert.isOk(window.ShopifyBuy.UI);
  });
});
