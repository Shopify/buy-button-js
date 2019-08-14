import JSBuySDK from 'shopify-buy';
import ShopifyBuy from '../../src/buybutton';
import UI from '../../src/ui';
import shopFixture from '../fixtures/shop-info';

describe('ShopifyBuy.buildClient', () => {
  const mockClient = {client: true};
  let JSBuySDKBuildClientStub;

  beforeEach(() => {
    JSBuySDKBuildClientStub = sinon.stub(JSBuySDK, 'buildClient').returns(mockClient);
  });

  afterEach(() => {
    JSBuySDK.buildClient.restore();
  });

  it('calls JS Buy SDK buildClient function with additional source config and returns created client', () => {
    const config = {
      domain: 'tester.myshopify.com',
      storefrontAccessToken: 'fake-access-token-4567',
    };

    const client = ShopifyBuy.buildClient(config);

    const expectedConfig = {
      domain: config.domain,
      storefrontAccessToken: config.storefrontAccessToken,
      source: 'buy-button-js',
    };

    assert.calledOnce(JSBuySDKBuildClientStub);
    assert.calledWith(JSBuySDKBuildClientStub, expectedConfig);
    assert.equal(client, mockClient);
  });
});

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
