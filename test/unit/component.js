import Component from '../../src/component';
import View from '../../src/view';
import Updater from '../../src/updater';
import * as logNotFound from '../../src/utils/log-not-found';
import * as logger from '../../src/utils/logger';
import * as isFunction from '../../src/utils/is-function';

describe('Component class', () => {
  let component;

  beforeEach(() => {
    component = new Component({id: 1234});
  });

  afterEach(() => {
    component = null;
  });

  describe('constructor', () => {
    it('stores id, storeFrontId, node, and handle on instance', () => {
      const node = document.createElement('div');
      component = new Component({
        id: 1234,
        handle: 'lol',
        storefrontId: 111,
        node,
      });

      assert.equal(component.id, 1234);
      assert.equal(component.handle, 'lol');
      assert.equal(component.storefrontId, 111);
      assert.equal(component.node, node);
    });

    it('sets globalConfig based on passed in config', () => {
      const expectedObj = {
        debug: 'debug',
        cartNode: 'cartNode',
        moneyFormat: '${{amount}}',
        modalNode: 'modalNode',
        toggles: 'toggles',
      };
      const config = {
        id: 1234,
        debug: 'debug',
        cartNode: 'cartNode',
        modalNode: 'modalNode',
        toggles: 'toggles',
      };
      component = new Component(config);
      assert.deepEqual(component.globalConfig, expectedObj);
    });

    it('instantiates a view', () => {
      assert.instanceOf(component.view, View);
    });

    it('instantiates an updater', () => {
      assert.instanceOf(component.updater, Updater);
    });

    it('merges configuration options with defaults', () => {
      const config = {
        options: {
          product: {
            buttonDestination: 'modal',
          },
        },
      };
      component = new Component(config);
      assert.equal(component.config.product.buttonDestination, 'modal', 'configuration options override defaults');
      assert.equal(component.config.cart.iframe, true, 'defaults are merged into configuration');
    });

    it('sets props from props passed in', () => {
      const props = 'hello';
      component = new Component({id: 1234}, props);
      assert.equal(component.props, 'hello');
    });

    it('instantiates an empty model object', () => {
      assert.deepEqual(component.model, {});
    });
  });

  describe('getters', () => {
    describe('get name()', () => {
      it('returns name based on handle or id', () => {
        assert.equal(component.name, 'frame-undefined-1234', 'uses ID if ID is set');
        component = new Component({handle: 'lol'});
        assert.equal(component.name, 'frame-undefined-lol', 'uses handle if handle is set');
      });
    });

    describe('get options()', () => {
      it('returns options for component by typeKey', () => {
        component.typeKey = 'product';
        assert.deepEqual(component.options, component.config.product);
        assert.equal(component.options.buttonDestination, 'cart');
      });
    });

    describe('get DOMEvents()', () => {
      it('returns options.DOMEvents if it exists', () => {
        const config = {options: {product: {DOMEvents: 'test'}}};
        component = new Component(config);
        component.typeKey = 'product';
        assert.equal(component.DOMEvents, 'test');
      });

      it('returns an empty object is options.DOMEvents does not exist', () => {
        const config = {options: {product: {DOMEvents: null}}};
        component = new Component(config);
        component.typeKey = 'product';
        assert.deepEqual(component.DOMEvents, {});
      });
    });

    describe('get events()', () => {
      it('returns options.events if it exists', () => {
        const config = {options: {product: {events: 'test'}}};
        component = new Component(config);
        component.typeKey = 'product';
        assert.equal(component.events, 'test');
      });

      it('returns an empty object is options.events does not exist', () => {
        const config = {options: {product: {events: null}}};
        component = new Component(config);
        component.typeKey = 'product';
        assert.deepEqual(component.events, {});
      });
    });

    describe('get styles()', () => {
      it('returns styles for each component in manifest', () => {
        component = new Component({
          id: 1234,
          options: {
            product: {
              styles: {
                button: {
                  color: 'red',
                },
              },
            },
          },
        });
        component.typeKey = 'product';
        assert.deepEqual(component.styles, {product: {button: {color: 'red'}}});
      });
    });

    describe('get classes()', () => {
      it('returns classes for each component in manifest', () => {
        component.typeKey = 'product';
        assert.equal(component.classes.product.product, 'shopify-buy__product');
        assert.equal(component.classes.option.option, 'shopify-buy__option-select');
      });
    });

    describe('get selectors()', () => {
      it('returns classes formatted as css selectors for each component in manifest', () => {
        component.typeKey = 'product';
        assert.equal(component.selectors.product.product, '.shopify-buy__product');
        assert.equal(component.selectors.option.option, '.shopify-buy__option-select');
      });
    });

    describe('get googleFonts()', () => {
      it('returns google fonts for each component in manifest', () => {
        const config = {
          options: {
            product: {
              googleFonts: ['lol'],
            },
            option: {
              googleFonts: ['bar'],
            },
          },
        };
        component = new Component(config);
        component.typeKey = 'product';
        assert.deepEqual(component.googleFonts, ['lol', 'bar']);
      });
    });

    describe('get viewData()', () => {
      it('returns model and some other properties', () => {
        component.typeKey = 'product';
        component.model = {test: 'lol'};
        assert.equal(component.viewData.test, 'lol');
        assert.equal(component.viewData.classes.product.product, 'shopify-buy__product');
      });
    });

    describe('get morphCallbacks()', () => {
      it('returns an object with the function onBeforeElUpdated', () => {
        assert.instanceOf(component.morphCallbacks.onBeforeElUpdated, Function);
      });

      describe('onBeforeElUpdated()', () => {
        it('returns false if fromEl\'s tagname is img and its source is toEl\'s data-src element', () => {
          const fromEl = {tagName: 'IMG', src: 'data-src'};
          const toEl = {
            getAttribute(param) {
              return param;
            },
          };
          assert.equal(component.morphCallbacks.onBeforeElUpdated(fromEl, toEl), false);
        });

        it('returns true if fromEl\'s tagname is not img or its source is not toEl\'s data-src element', () => {
          const fromEl = {tagName: 'not IMG', src: 'not data-src'};
          const toEl = {
            getAttribute(param) {
              return param;
            },
          };
          assert.equal(component.morphCallbacks.onBeforeElUpdated(fromEl, toEl), true);
        });
      });
    });
  });

  describe('init()', () => {
    it('assigns model and initializes view', () => {
      component = new Component({id: 1234}, {
        browserFeatures: {},
      });
      component.view = {
        init: sinon.stub().returns(Promise.resolve()),
        render: sinon.spy(),
        delegateEvents: sinon.spy(),
      };
      component.typeKey = 'product';
      return component.init({
        lol: 'yes',
      }).then(() => {
        assert.deepEqual(component.model, {lol: 'yes'});
        assert.calledOnce(component.view.render);
        assert.calledOnce(component.view.delegateEvents);
        assert.calledOnce(component.view.init);
      });
    });

    it('catches any error from setupModel', () => {
      const errorSetupModelStub = sinon.stub(Component.prototype, 'setupModel').returns(Promise.reject({message: ['Not Found']}));
      const logNotFoundStub = sinon.stub(logNotFound, 'default');
      component = new Component({id: 1234}, {
        browserFeatures: {},
      });
      component.view = {
        init: sinon.stub().returns(Promise.resolve()),
        render: sinon.spy(),
        delegateEvents: sinon.spy(),
      };
      component.typeKey = 'product';

      return component.init({lol: 'yes'}).catch(() => {
        assert.throws(component.init, Error);
        assert.calledOnce(logNotFoundStub);
        errorSetupModelStub.restore();
      });
    });
  });

  describe('setupModel()', () => {
    it('returns passed data', () => {
      return component.setupModel({test: 'lol'}).then((model) => {
        assert.deepEqual(model, {test: 'lol'});
      });
    });

    it('calls fetchData if not passed data', () => {
      component.fetchData = sinon.stub().returns(Promise.resolve({test: 'lol'}));
      return component.setupModel().then((model) => {
        assert.deepEqual(model, {test: 'lol'});
      });
    });
  });

  describe('updateConfig()', () => {
    it('delegates to updater', () => {
      component.updater.updateConfig = sinon.spy();
      component.updateConfig({test: 'lol'});
      assert.calledWith(component.updater.updateConfig, {test: 'lol'});
    });
  });

  describe('destroy()', () => {
    it('delegates to view', () => {
      component.view.destroy = sinon.spy();
      component.destroy();
      assert.calledOnce(component.view.destroy);
    });
  });

  describe('_userEvent()', () => {
    it('logs to logger if debug is set to true', () => {
      const infoSpy = sinon.spy();
      const loggerStub = sinon.stub(logger, 'default').value({info: infoSpy});
      component.globalConfig.debug = true;
      component.typeKey = 'key';
      component._userEvent('test');
      assert.calledWith(infoSpy, 'EVENT: test (key)');
      loggerStub.restore();
    });

    it('does not log if debug is set to false', () => {
      const infoSpy = sinon.spy();
      const loggerStub = sinon.stub(logger, 'default').value({info: infoSpy});
      component.globalConfig.debug = false;
      component._userEvent('test');
      assert.notCalled(infoSpy);
      loggerStub.restore();
    });

    it('calls event if the method passed is a function in the event', () => {
      const eventSpy = sinon.spy();
      const config = {options: {product: {events: {test: eventSpy}}}};
      component = new Component(config);
      component.typeKey = 'product';

      const isFunctionStub = sinon.stub(isFunction, 'default').returns(true);
      component._userEvent('test');
      assert.calledWith(eventSpy, component);
      isFunctionStub.restore();
    });
  });
});
