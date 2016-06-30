import sinon from 'sinon';
import componentDefaults from '../../src/defaults/components';
import Product from '../../src/components/product';
import Template from '../../src/components/template';
import Component from '../../src/components/component';
import testProduct from '../fixtures/product-fixture';
import hogan from 'hogan.js';

const { module, test } = QUnit;
const config = {
  id: 123,
  node: document.getElementById('qunit-fixture'),
  options: {
    product: {
      iframe: false,
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      }
    }
  }
}

let product;

module('Unit | Product', {
  beforeEach() {
    product = new Product(config, {client: {}});
  },
  afterEach() {
    product = null;
  }
});

test('it has a childTemplate for options', (assert) => {
  assert.ok(product.childTemplate instanceof Template);
});

test('it passes ID on #fetchData', (assert) => {
  const done = assert.async();
  product.props.client.fetchProduct = function (id) {
    assert.equal(id, 123);
    return Promise.resolve({});
  }

  product.fetchData().then((data) => {
    done();
  });
});

test('it calls super on #render', (assert) => {
  const stub = sinon.stub(Component.prototype, 'render', () => {});
  product.model = testProduct;
  product.render();
  assert.ok(stub.called);
  stub.restore();
});

test('it returns event object on #DOMEvents', (assert) => {
  assert.ok(product.DOMEvents['change .select'] instanceof Function)
  assert.ok(product.DOMEvents['click .btn'] instanceof Function)
});

test('it puts together a big param string on #windowParams', (assert) => {
  product.config.window = {
    height: 100,
    width: 100
  }
  const windowParams = 'height=100,width=100,';
  assert.equal(product.windowParams, windowParams);
});

test('it updates selected variant on #updateVariant', (assert) => {
  product.initWithData(testProduct);
  const updated = product.updateVariant('Size', 'large');
  assert.equal(updated.selected, 'large');
});

test('it returns an html string on #childrenHtml', (assert) => {
  product.initWithData(testProduct);
  assert.ok(product.childrenHtml.match(/\<select/));
});
