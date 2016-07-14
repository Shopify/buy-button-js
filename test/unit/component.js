import ShopifyBuy from '../../src/shopify-buy-ui';
import Component from '../../src/component';
import Iframe from '../../src/iframe';
import Template from '../../src/template';

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
    component = new Component(config, {client: {}, imageCache: {}}, 'product');
  },
  afterEach() {
    component = null;
  }
});

test('it merges configuration options and defaults', (assert) => {
  assert.expect(2);
  assert.equal(component.config.product.templates.button, config.options.product.templates.button);
  assert.equal(component.config.product.buttonDestination, 'cart');
});

test('it proxies commonly accessed attributes to config options for type', (assert) => {
  assert.expect(4);
  assert.ok(component.client);
  assert.equal(component.options.iframe, config.options.product.iframe);
  assert.equal(component.templates.button, config.options.product.templates.button);
  assert.equal(component.contents, componentDefaults.product.contents);
});

test('it instantiates a template', (assert) => {
  assert.expect(1);
  assert.ok(component.template instanceof Template);
});

test('it fetches and renders data on #init', (assert) => {
  assert.expect(4);
  const done = assert.async();

  component.setupView = function () {
    assert.ok(true);
    return Promise.resolve();
  }

  component.setupModel = function () {
    return Promise.resolve({title: 'test'});
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
  component.delegateEvents = function () {
    assert.ok(true);
  }

  component.updateConfig(updateConfig);
  assert.equal(component.options.styles.button.color, 'blue');
});

test('it creates an iframe if iframe is true on #setupView', (assert) => {
  const done = assert.async();
  const iframeComponent = new Component({
    node: document.getElementById('qunit-fixture'),
    id: 123,
    options: { product: {iframe: true}}}, {client: {}},
    'product');
  iframeComponent.setupView().then(() => {
    assert.ok(iframeComponent.iframe);
    done();
  });
});

test('it calls fetchData if no data passed on #setupModel', (assert) => {
  const done = assert.async();
  component.fetchData = function () {
    return Promise.resolve({title: 'test'});
  }

  component.setupModel().then((data) => {
    assert.deepEqual(data, {title: 'test'});
    done();
  });
});

test('it sets data if data is passed on #setupModel', (assert) => {
  const done = assert.async();
  component.setupModel({title: 'test'}).then((data) => {
    assert.deepEqual(data, {title: 'test'});
    done();
  });
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
  const done = assert.async();
  assert.expect(1);
  const iframeComponent = new Component({
    node: document.getElementById('qunit-fixture'),
    id: 123,
    options: { product: {iframe: true}}}, {client: {}},
    'product');
  iframeComponent.setupView().then(() => {
    iframeComponent.createWrapper();
    assert.equal(iframeComponent.document.body.children[iframeComponent.document.body.children.length - 1].tagName, 'DIV');
    done();
  });
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
  const done = assert.async();
  assert.expect(2);
  function clickFakeButton(evt, target) {
    assert.ok(evt instanceof Event);
    assert.ok(target instanceof window.Node);
  }

  component.options.DOMEvents = {
    'click .button': clickFakeButton
  }

  component.setupView().then(() => {
    component.render();
    component.delegateEvents();
    component.document.getElementById('button').click();
    done();
  });
});

test('it returns a method wrapped by user methods on #wrapMethod', (assert) => {
  const eventConfig = config;
  eventConfig.events = {
    'beforeTestMethod': function (c) {
      assert.ok(c instanceof Component);
    },
    'afterTestMethod': function (c) {
      assert.ok(c instanceof Component);
    },
  }
  const eventsComponent = new Component(eventConfig, {client: {}}, 'product');

  eventsComponent.testMethod = function (string) {
    assert.equal(string, 'an argument');
  }

  const wrapped = eventsComponent.wrapMethod(eventsComponent.testMethod);

  wrapped.call(eventsComponent, 'an argument');
});
