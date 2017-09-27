import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';

describe('ShopifyBuy.UI', () => {
  const config = {
    domain: 'embeds.myshopify.com',
    storefrontAccessToken: 'fake-access-token-12345',
  };
  let client;
  let ui;

  beforeEach(() => {
     client = ShopifyBuy.buildClient(config);
     ui = ShopifyBuy.UI.init(client);
  });

  afterEach(() => {
    client = null;
    ui = null;
  });

  it('returns an instance of UI', () => {
     assert.isOk(ui instanceof UI);
  });

  it('adds to global namespace', () => {
    assert.isOk(window.ShopifyBuy.UI);
  });
});
