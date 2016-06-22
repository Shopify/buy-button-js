import ShopifyBuy from '../../src/shopify-buy-ui';
import Component from '../../src/components/component';
import Iframe from '../../src/components/iframe';
import componentDefaults from '../../src/defaults/components';

const { module, test } = QUnit;
const config = {
  id: 123,
  options: {
    product: {
      iframe: false,
      templates: {
        button: '<a>Fake button</a>'
      }
    }
  }
}

let component;

module('Unit | Component', {
  beforeEach() {
    component = new Component(config, {client: {}}, 'product');
  },
  afterEach() {
    component = null;
  }
});

test('it merges configuration options and defaults', (assert) => {
  assert.equal(component.config.product.templates.button, '<a>Fake button</a>');
  assert.equal(component.config.product.buttonTarget, 'cart');
});

test('it proxies commonly accessed attributes to config options for type', (assert) => {
  assert.ok(component.client);
  assert.equal(component.options.iframe, config.options.product.iframe);
  assert.equal(component.templates.button, config.options.product.templates.button);
  assert.equal(component.contents, componentDefaults.product.contents);
});

test('it instantiates an iframe if config.iframe is true', (assert) => {
  const iframeComponent = new Component({id: 123, options: { product: {iframe: true}}}, {client: {}}, 'product');
  assert.ok(iframeComponent.iframe instanceof Iframe);
});
