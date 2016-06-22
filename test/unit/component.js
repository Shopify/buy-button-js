import ShopifyBuy from '../../src/shopify-buy-ui';
import Component from '../../src/components/component';
import Iframe from '../../src/components/iframe';
import View from '../../src/components/view';
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

test('it instantiates a view', (assert) => {
  assert.ok(component.view instanceof View);
});

test('it fetches and renders data on #initFetch', (assert) => {
  assert.expect(3);
  const done = assert.async();

  component.fetch = function () {
    return new Promise(resolve => {
      return resolve({title: 'test'});
    });
  }

  component.render = function () {
    assert.ok(true);
  }

  component.delegateEvents = function () {
    assert.ok(true);
  }

  component.initFetch().then(() => {
    assert.deepEqual(component.model, {title: 'test'});
    done();
  });
});

test('it sets data and renders on #init', (assert) => {
  component.render = function () {
    assert.ok(true);
  }

  component.delegateEvents = function () {
    assert.ok(true);
  }

  component.init({title: 'test'});
  assert.deepEqual(component.model, {title: 'test'});
});

test('it returns a div on #createWrapper', (assert) => {
  const wrapper = component.createWrapper();
  assert.equal(wrapper.tagName, 'DIV');
});

test('it adds a div to el if iframe is false on #createWrapper', (assert) => {
  component.createWrapper();
  assert.equal(component.el.children[0].tagName, 'DIV');
});

test('it adds a div to iframe if iframe is true on #createWrapper', (assert) => {
  const iframeComponent = new Component({id: 123, options: { product: {iframe: true}}}, {client: {}}, 'product');
  iframeComponent.createWrapper();
  assert.equal(iframeComponent.document.body.children[0].tagName, 'DIV');
});

test('it sets innerHTML of wrapper on initial #render', (assert) => {
  const testHTML = '<h1>THIS IS ONLY A TEST</h1>';
  component.view.html = function (data) {
    assert.ok(data.data);
    return testHTML;
  }

  component.render();
  assert.equal(component.wrapper.innerHTML, testHTML);
});

test('updates innerHTML of wrapper on second #render', (assert) => {
  const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
  const testHTML = '<h1>THIS IS NOT A TEST</h1>'
  component.wrapper = component.createWrapper();
  component.wrapper.innerHTML = testBeforeHTML;
  component.view.html = function (data) {
    assert.ok(data.data);
    return testHTML;
  }

  component.render();
  assert.equal(component.wrapper.innerHTML, testHTML);
});
