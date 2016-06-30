import ShopifyBuy from '../../src/shopify-buy-ui';
import Component from '../../src/components/component';
import Iframe from '../../src/components/iframe';
import Template from '../../src/components/template';
import componentDefaults from '../../src/defaults/components';

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

let component;
let scriptNode

module('Unit | Component', {
  beforeEach() {
    component = new Component(config, {client: {}}, 'product');
  },
  afterEach() {
    component = null;
  }
});

test('it merges configuration options and defaults', (assert) => {
  assert.expect(2);
  assert.equal(component.config.product.templates.button, config.options.product.templates.button);
  assert.equal(component.config.product.buttonTarget, 'checkout');
});

test('it proxies commonly accessed attributes to config options for type', (assert) => {
  assert.expect(4);
  assert.ok(component.client);
  assert.equal(component.options.iframe, config.options.product.iframe);
  assert.equal(component.templates.button, config.options.product.templates.button);
  assert.equal(component.contents, componentDefaults.product.contents);
});

test('it instantiates an iframe if config.iframe is true', (assert) => {
  assert.expect(1);
  const iframeComponent = new Component({
    id: 123,
    node: document.getElementById('qunit-fixture'),
    options: { product: {iframe: true}}}, {client: {}},
    'product');
  assert.ok(iframeComponent.iframe instanceof Iframe);
});

test('it instantiates a template', (assert) => {
  assert.expect(1);
  assert.ok(component.template instanceof Template);
});

test('it fetches and renders data on #init', (assert) => {
  assert.expect(3);
  const done = assert.async();

  component.fetchData = function () {
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

  component.init().then(() => {
    assert.deepEqual(component.model, {title: 'test'});
    done();
  });
});

test('it sets data and renders on #initWithData', (assert) => {
  assert.expect(3);
  component.render = function () {
    assert.ok(true);
  }

  component.delegateEvents = function () {
    assert.ok(true);
  }

  component.initWithData({title: 'test'});
  assert.deepEqual(component.model, {title: 'test'});
});

test('it updates config on #updateConfig', (assert) => {
  const updateConfig = {
    id: 123,
    options: {
      product: {
        styles: {
          button: {
            'color': 'blue'
          }
        },
      }
    }
  }

  component.updateConfig(updateConfig);
  assert.equal(component.options.styles.button.color, 'blue');
});

test('it returns a div on #createWrapper', (assert) => {
  assert.expect(1);
  const wrapper = component.createWrapper();
  assert.equal(wrapper.tagName, 'DIV');
});

test('it adds a div to node if iframe is false on #createWrapper', (assert) => {
  assert.expect(1);
  component.createWrapper();
  assert.equal(component.node.children[0].tagName, 'DIV');
});

test('it adds a div to iframe if iframe is true on #createWrapper', (assert) => {
  assert.expect(1);
  const iframeComponent = new Component({
    node: document.getElementById('qunit-fixture'),
    id: 123,
    options: { product: {iframe: true}}}, {client: {}},
    'product');
  iframeComponent.createWrapper();
  assert.equal(iframeComponent.document.body.children[iframeComponent.document.body.children.length - 1].tagName, 'DIV');
});

test('it sets innerHTML of wrapper on initial #render', (assert) => {
  assert.expect(2);
  const testHTML = '<h1>THIS IS ONLY A TEST</h1>';
  component.template.render = function (data) {
    assert.ok(data.data);
    return testHTML;
  }

  component.render();
  assert.equal(component.wrapper.innerHTML, testHTML);
});

test('it updates innerHTML of wrapper on second #render', (assert) => {
  assert.expect(2);
  const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
  const testHTML = '<h1>THIS IS NOT A TEST</h1>'
  component.wrapper = component.createWrapper();
  component.wrapper.innerHTML = testBeforeHTML;
  component.template.render = function (data) {
    assert.ok(data.data);
    return testHTML;
  }

  component.render();
  assert.equal(component.wrapper.innerHTML, testHTML);
});

test('adds event listeners to nodes on #delegateEvents', (assert) => {
  assert.expect(2);
  function clickFakeButton(evt, comp) {
    assert.ok(evt instanceof Event);
    assert.ok(comp instanceof Component);
  }

  component.options.DOMEvents = {
    'click .button': clickFakeButton
  }

  component.render();
  component.delegateEvents();
  component.document.getElementById('button').click();
});
