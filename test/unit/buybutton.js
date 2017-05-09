import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';

describe.skip('ShopifyBuy.UI', () => {
  const configAttrs = {
    domain: 'embeds.myshopify.com',
    apiKey: 123,
    appId: 6
  };
  let client;
  let ui;

  beforeEach(() => {
     client = ShopifyBuy.buildClient(configAttrs);
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
