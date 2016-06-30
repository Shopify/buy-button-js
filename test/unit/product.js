import sinon from 'sinon';
import componentDefaults from '../../src/defaults/components';
import Product from '../../src/components/product';
import Template from '../../src/template';
import Component from '../../src/component';
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
let testProductCopy;

module('Unit | Product', {
  beforeEach() {
    testProductCopy = Object.assign({}, testProduct);
    product = new Product(config, {client: {}});
  },
  afterEach() {
    product = null;
    testProductCopy = null;
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
  product.model = testProductCopy;
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
  product.initWithData(testProductCopy);
  const updated = product.updateVariant('Size', 'large');
  assert.equal(updated.selected, 'large');
});

test('it returns an html string on #childrenHtml', (assert) => {
  product.initWithData(testProductCopy);
  assert.ok(product.childrenHtml.match(/\<select/));
});

test('it returns true on #variantAvailable if variant exists for selected options', (assert) => {
  product.initWithData(testProductCopy);
  product.model.selectedVariant = {id: 123};
  assert.ok(product.variantAvailable);
});

test('it returns false on #variantAvailable if variant does not exist for selected options', (assert) => {
  product.initWithData(testProductCopy);
  product.model.selectedVariant = null;
  assert.notOk(product.variantAvailable);
});

test('it returns true on #hasVariants if multiple variants', (assert) => {
  product.initWithData(testProductCopy);
  product.model.variants = [{id: 123}, {id: 234}];
  assert.ok(product.hasVariants);
});

test('it returns false on #hasVariants if single variant', (assert) => {
  product.initWithData(testProductCopy);
  product.model.variants = [{id: 123}];
  assert.notOk(product.hasVariants);
});

test('it returns selected image on #currentImage if variant exists', (assert) => {
  product.initWithData(testProductCopy);
  assert.equal(product.currentImage.img, 'http://test.com/test.jpg');
});

test('it returns cached image on #currentImage if variant does not exist', (assert) => {
  product.initWithData(testProductCopy);
  product.model.selectedVariant = null;
  product.model.selectedVariantImage = null;
  assert.equal(product.currentImage.img, 'http://test.com/test.jpg');
});

test('it transforms array of strings to array of objects on #decorateValues', (assert) => {
  product.initWithData(testProductCopy);
  const array = product.decorateValues(testProductCopy.options[0])
  const expectedArray = [
    {
      name: 'sloth',
      selected: true
    },
    {
      name: 'shark',
      selected: false
    }
  ]

  assert.deepEqual(array, expectedArray);
});

test('it returns supplemental view info on #viewData', (assert) => {
  product.initWithData(testProductCopy);
  const viewData = product.viewData();
  assert.equal(viewData.buttonText, 'Add to cart');
  assert.ok(viewData.childrenHtml);
  assert.equal(viewData.currentImage.img, 'http://test.com/test.jpg');
  assert.ok(viewData.hasVariants);
});
