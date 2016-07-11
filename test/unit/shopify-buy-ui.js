import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';

const { module, test } = QUnit;
let uiClient;

const configAttrs = {
  domain: 'buckets-o-stuff.myshopify.com',
  apiKey: 123,
  appId: 6
};

module('ShopifyBuy.UI', {
  beforeEach() {
    uiClient = ShopifyBuy.UI.buildClient(configAttrs);
  },
  afterEach() {
    uiClient = null;
  }
});

test('it returns an instance of UI', (assert) => {
  assert.expect(1);
  assert.ok(uiClient instanceof UI);
});
