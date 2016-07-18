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
  });

  describe('constructor', () => {
    it('merges configuration options and defaults', () => {
      chai.assert.equal(component.config.product.templates.button, config.options.product.templates.button);
      chai.assert.equal(component.config.product.buttonDestination, 'cart');
    });

    it('proxies commonly accessed attributes to config options for type', () => {
      chai.assert.isOk(component.client);
      chai.assert.equal(component.options.iframe, config.options.product.iframe);
      chai.assert.equal(component.templates.button, config.options.product.templates.button);
      chai.assert.equal(component.contents, componentDefaults.product.contents);
    });

    it('instantiates a template', () => {
      chai.assert.isOk(component.template instanceof Template);
    });
  });

  describe('init', () => {
    it('fetches and renders data', (done) => {
      const setupView = sinon.stub(component, 'setupView').returns(Promise.resolve());
      const setupModel = sinon.stub(component, 'setupModel').returns(Promise.resolve({ title: 'test' }));
      const render = sinon.stub(component, 'render');
      const delegateEvents = sinon.stub(component, 'delegateEvents');

      component.init().then(() => {
        chai.assert.deepEqual(component.model, {title: 'test'});
        chai.assert.calledOnce(setupView);
        chai.assert.calledOnce(setupModel);
        chai.assert.calledOnce(render);
        chai.assert.calledOnce(delegateEvents);
        setupView.restore();
        setupModel.restore();
        render.restore();
        delegateEvents.restore();
        done();
      }).catch((e) => {
        done(e);
      });
    });

    describe('with data passed as arg', () => {
      it('sets model to data', (done) => {
        component.init({title: 'test'}).then(() => {
          chai.assert.equal('test', component.model.title);
          done();
        });
      });
    });

    describe('with no data passed as arg', () => {
      it('fetches data and sets model', (done) => {
        component.fetchData = sinon.stub().returns(Promise.resolve({title: 'rectangle'}));;
        component.init().then(() => {
          chai.assert.equal('rectangle', component.model.title);
          done();
        });
      });
    });

    it('adds event listeners to nodes', (done) => {
      const clickSpy = sinon.spy();
      component.options.DOMEvents = {
        'click .button': clickSpy
      }
      component.init({}).then(() => {
        component.render();
        component.delegateEvents();
        component.document.getElementById('button').click();
        chai.assert.calledWith(clickSpy, sinon.match.instanceOf(Event), sinon.match.instanceOf(window.Node));
        done();
      });
    });

    describe('if iframe is true', () => {
      it('creates an iframe', (done) => {
        const iframeComponent = new Component({
          node: document.getElementById('fixture'),
          id: 123,
          options: { product: {iframe: true}}}, {client: {}, imageCache: {}},
          'product');
        const setupModel = sinon.stub(iframeComponent, 'setupModel').returns(Promise.resolve({ title: 'test' }));
        iframeComponent.init().then(() => {
          chai.assert.isOk(iframeComponent.iframe);
          setupModel.restore();
          done();
        });
      });
    });
  });

  describe('updateConfig', () => {
    it('updates config with passed options', () => {
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
      chai.assert.equal(component.options.styles.button.color, 'blue');
    });
  });

  describe('render', () => {
    it('sets innerHTML of wrapper on initial call', () => {
      const testHTML = '<h1>THIS IS ONLY A TEST</h1>';

      const tmplRender = sinon.stub(component.template, 'render').returns(testHTML);
      component.render();
      chai.assert.equal(component.wrapper.innerHTML, testHTML);
    });

    it('updates innerHTML of wrapper on second call', () => {
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
  });

  describe('wrapMethod', () => {
    it('returns a method wrapped by user methods', () => {
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
});
