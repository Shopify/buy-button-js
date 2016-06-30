import ShopifyBuy from '../../src/shopify-buy-ui';
import UI from '../../src/ui';
import Product from '../../src/components/product';

const { module, test } = QUnit;

import sinon from 'sinon';

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

test('it finds script element with data attribute on #queryEntryNode', (assert) => {
  assert.expect(3);
  const scriptNode = document.createElement('script');
  scriptNode.setAttribute('data-shopify-buy-ui', true);
  document.body.appendChild(scriptNode);
  const initialNodes = document.querySelectorAll('script[data-shopify-buy-ui');
  const div = ui.queryEntryNode();
  const remainingNodes = document.querySelectorAll('script[data-shopify-buy-ui');
  assert.equal(remainingNodes.length, initialNodes.length - 1);
  assert.equal(div.tagName, 'DIV');
  assert.equal(div.parentNode.tagName, 'SCRIPT');
});


test('it creates a component of appropriate type on #createComponent', (assert) => {
  const done = assert.async();
  assert.expect(1);
  const stub = sinon.stub(Product.prototype, 'init', () => {
    return Promise.resolve()
  });

  ui.createComponent('product',  productConfig).then((component) => {
    assert.ok(ui.components.product[0] instanceof Product);
    stub.restore();
    done();
  });
});

test('it returns type-specific properties on #componentProps', (assert) => {
  assert.expect(2);
  const props = ui.componentProps('product');
  assert.ok(props.addToCart);
  assert.deepEqual(props.client, ui.client);
});
