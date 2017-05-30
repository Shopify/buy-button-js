import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';

describe('ShopifyBuy.UI', () => {
  const config = new Config({
    domain: 'embeds.myshopify.com',
    storefrontAccessToken: 'meow',
  });
  let client;
  let ui;

  beforeEach(() => {
     client = new ShopifyBuy(config);
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
