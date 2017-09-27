import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import shopFixture from '../fixtures/shop-info';

describe('ShopifyBuy.UI', () => {
  const config = {
    domain: 'embeds.myshopify.com',
    storefrontAccessToken: 'fake-access-token-12345',
  };
  let client;
  let ui;

  beforeEach(() => {
    client = ShopifyBuy.buildClient(config);
    sinon.stub(client.shop, 'fetchInfo').returns(Promise.resolve(shopFixture));
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
