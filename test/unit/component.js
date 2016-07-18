import chai from 'chai';
import sinon from 'sinon';

sinon.assert.expose(chai.assert, {prefix: ''});

import ShopifyBuy from '../../src/shopify-buy-ui';
import Component from '../../src/component';
import Iframe from '../../src/iframe';
import Template from '../../src/template';

import componentDefaults from '../../src/defaults/components';

const config = {
  id: 123,
  node: document.getElementById('fixture'),
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
let scriptNode;
let parent;

describe('Component class', () => {
  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    component = new Component(config, {client: {}, imageCache: {}}, 'product');
  });

  afterEach(() => {
    component = null;
    document.body.removeChild(config.node);
    config.node = null;
  })

  it('it merges configuration options and defaults', () => {
    chai.assert.equal(component.config.product.templates.button, config.options.product.templates.button);
    chai.assert.equal(component.config.product.buttonDestination, 'cart');
  });

  it('it proxies commonly accessed attributes to config options for type', () => {
    chai.assert.isOk(component.client);
    chai.assert.equal(component.options.iframe, config.options.product.iframe);
    chai.assert.equal(component.templates.button, config.options.product.templates.button);
    chai.assert.equal(component.contents, componentDefaults.product.contents);
  });

  it('it instantiates a template', () => {
    chai.assert.isOk(component.template instanceof Template);
  });

  it('it fetches and renders data on #init', (done) => {
    component.setupView = function () {
      chai.assert.isOk(true);
      return Promise.resolve();
    }

    component.setupModel = function () {
      return Promise.resolve({title: 'test'});
    }

    component.render = function () {
      chai.assert.isOk(true);
    }

    component.delegateEvents = function () {
      chai.assert.isOk(true);
    }

    component.init().then(() => {
      chai.assert.deepEqual(component.model, {title: 'test'});
      done();
    });
  });

  it('it updates config on #updateConfig', () => {
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
      chai.assert.isOk(true);
    }

    component.updateConfig(updateConfig);
    chai.assert.equal(component.options.styles.button.color, 'blue');
  });

  it('it creates an iframe if iframe is true on #setupView', (done) => {
    const iframeComponent = new Component({
      node: document.getElementById('fixture'),
      id: 123,
      options: { product: {iframe: true}}}, {client: {}},
      'product');
    iframeComponent.setupView().then(() => {
      chai.assert.isOk(iframeComponent.iframe);
      done();
    });
  });

  it('it calls fetchData if no data passed on #setupModel', (done) => {
    component.fetchData = function () {
      return Promise.resolve({title: 'test'});
    }

    component.setupModel().then((data) => {
      chai.assert.deepEqual(data, {title: 'test'});
      done();
    });
  });

  it('it sets data if data is passed on #setupModel', (done) => {
    component.setupModel({title: 'test'}).then((data) => {
      chai.assert.deepEqual(data, {title: 'test'});
      done();
    });
  });

  it('it returns a div on #createWrapper', () => {
    const wrapper = component.createWrapper();
    chai.assert.equal(wrapper.tagName, 'DIV');
  });

  it('it adds a div to node if iframe is false on #createWrapper', () => {
    component.createWrapper();
    chai.assert.equal(component.node.children[0].tagName, 'DIV');
  });

  it('it adds a div to iframe if iframe is true on #createWrapper', (done) => {
    const iframeComponent = new Component({
      node: document.getElementById('fixture'),
      id: 123,
      options: { product: {iframe: true}}}, {client: {}},
      'product');
    iframeComponent.setupView().then(() => {
      iframeComponent.createWrapper();
      chai.assert.equal(iframeComponent.document.body.children[iframeComponent.document.body.children.length - 1].tagName, 'DIV');
      done();
    });
  });

  it('it sets innerHTML of wrapper on initial #render', () => {
    const testHTML = '<h1>THIS IS ONLY A TEST</h1>';
    component.template.render = function (data) {
      chai.assert.isOk(data.data);
      return testHTML;
    }

    component.render();
    chai.assert.equal(component.wrapper.innerHTML, testHTML);
  });

  it('it updates innerHTML of wrapper on second #render', () => {
    const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
    const testHTML = '<h1>THIS IS NOT A TEST</h1>'
    component.wrapper = component.createWrapper();
    component.wrapper.innerHTML = testBeforeHTML;
    component.template.render = function (data) {
      chai.assert.isOk(data.data);
      return testHTML;
    }

    component.render();
    chai.assert.equal(component.wrapper.innerHTML, testHTML);
  });

  it('adds event listeners to nodes on #delegateEvents', (done) => {
    function clickFakeButton(evt, target) {
      chai.assert.isOk(evt instanceof Event);
      chai.assert.isOk(target instanceof window.Node);
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

  it('it returns a method wrapped by user methods on #wrapMethod', () => {
    const eventConfig = config;
    eventConfig.events = {
      'beforeTestMethod': function (c) {
        chai.assert.isOk(c instanceof Component);
      },
      'afterTestMethod': function (c) {
        chai.assert.isOk(c instanceof Component);
      },
    }
    const eventsComponent = new Component(eventConfig, {client: {}}, 'product');

    eventsComponent.testMethod = function (string) {
      chai.assert.equal(string, 'an argument');
    }

    const wrapped = eventsComponent.wrapMethod(eventsComponent.testMethod);

    wrapped.call(eventsComponent, 'an argument');
  });


});
