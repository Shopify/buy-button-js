import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';
import Product from '../../src/components/product';

const { module, test } = QUnit;

const client = ShopifyBuy.buildClient({
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 123,
  appId: 6
});

const productConfig = {
  id: 123,
  node: document.getElementById('qunit-fixture'),
  options: {}
}

let ui;

module('Unit | UI', {
  beforeEach() {
    ui = new UI(client);
  },
  afterEach() {
    ui = null;
  }
});

test('it creates a client', (assert) => {
  assert.expect(1);
  assert.deepEqual(client, ui.client);
});

test('it creates a component of appropriate type on #createComponent', (assert) => {
  assert.expect(1);
  ui.createComponent('product',  productConfig);
  assert.ok(ui.components.product[0] instanceof Product);
});

test('it returns type-specific properties on #componentProps', (assert) => {
  assert.expect(2);
  const props = ui.componentProps('product');
  assert.ok(props.addToCart);
  assert.deepEqual(props.client, ui.client);
});
