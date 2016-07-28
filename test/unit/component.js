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

describe('Component class', () => {
  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    Component.prototype.typeKey = 'product'
    component = new Component(config, {client: {}, imageCache: {}});
  });

  afterEach(() => {
    component = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('constructor', () => {
    it('merges configuration options and defaults', () => {
      assert.equal(component.config.product.templates.button, config.options.product.templates.button);
      assert.equal(component.config.product.buttonDestination, 'cart');
    });

    it('proxies commonly accessed attributes to config options for type', () => {
      assert.isOk(component.client);
      assert.equal(component.options.iframe, config.options.product.iframe);
      assert.deepEqual(component.templates.button, config.options.product.templates.button);
      assert.deepEqual(component.contents, componentDefaults.product.contents);
    });

    it('instantiates a template', () => {
      assert.isOk(component.template instanceof Template);
    });
  });

  describe('init', () => {
    it('fetches and renders data', (done) => {
      const setupView = sinon.stub(component, 'setupView').returns(Promise.resolve());
      const setupModel = sinon.stub(component, 'setupModel').returns(Promise.resolve({ title: 'test' }));
      const render = sinon.stub(component, 'render');
      const delegateEvents = sinon.stub(component, 'delegateEvents');

      component.init().then(() => {
        assert.deepEqual(component.model, {title: 'test'});
        assert.calledOnce(setupView);
        assert.calledOnce(setupModel);
        assert.calledOnce(render);
        assert.calledOnce(delegateEvents);
        done();
      }).catch((e) => {
        done(e);
      });
    });

    describe('with data passed as arg', () => {
      it('sets model to data', (done) => {
        component.init({title: 'test'}).then(() => {
          assert.equal('test', component.model.title);
          done();
        });
      });
    });

    describe('with no data passed as arg', () => {
      it('fetches data and sets model', (done) => {
        component.fetchData = sinon.stub().returns(Promise.resolve({title: 'rectangle'}));;
        component.init().then(() => {
          assert.equal('rectangle', component.model.title);
          done();
        });
      });
    });

    it('adds event listeners to nodes', (done) => {
      const clickSpy = sinon.spy();
      const testConfig = Object.assign({}, config);
      testConfig.options.product.DOMEvents = {
        'click .button': clickSpy
      }
      const testComponent = new Component(testConfig, {client: {}, imageCache: {}});
      testComponent.init({}).then(() => {
        testComponent.render();
        testComponent.delegateEvents();
        testComponent.document.getElementById('button').click();
        assert.calledWith(clickSpy, sinon.match.instanceOf(Event), sinon.match.instanceOf(window.Node));
        done();
      }).catch((e) => {
        console.log(e);
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
          assert.isOk(iframeComponent.iframe);
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
      assert.equal(component.options.styles.button.color, 'blue');
    });
  });

  describe('render', () => {
    it('sets innerHTML of wrapper on initial call', () => {
      const testHTML = '<h1>THIS IS ONLY A TEST</h1>';

      const tmplRender = sinon.stub(component.template, 'render').returns(testHTML);
      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });

    it('updates innerHTML of wrapper on second call', () => {
      const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
      const testHTML = '<h1>THIS IS NOT A TEST</h1>'
      component.wrapper = component.createWrapper();
      component.wrapper.innerHTML = testBeforeHTML;
      component.template.render = function (data) {
        assert.isOk(data.data);
        return testHTML;
      }

      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });
  });

  describe('wrapMethod', () => {
    it('returns a method wrapped by user methods', () => {
      const eventConfig = config;
      eventConfig.events = {
        'beforeTestMethod': function (c) {
          assert.isOk(c instanceof Component);
        },
        'afterTestMethod': function (c) {
          assert.isOk(c instanceof Component);
        },
      }
      const eventsComponent = new Component(eventConfig, {client: {}}, 'product');

      eventsComponent.testMethod = function (string) {
        assert.equal(string, 'an argument');
      }

      const wrapped = eventsComponent.wrapMethod(eventsComponent.testMethod);

      wrapped.call(eventsComponent, 'an argument');
    });
  });
});
