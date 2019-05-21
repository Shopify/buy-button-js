import Component from '../../src/component';
import View from '../../src/view';
import Updater from '../../src/updater';
import * as componentDefaults from '../../src/defaults/components';
import * as logNotFound from '../../src/utils/log-not-found';
import * as logger from '../../src/utils/logger';
import * as isFunction from '../../src/utils/is-function';
import defaultMoneyFormat from '../../src/defaults/money-format';

describe('Component class', () => {
  describe('constructor', () => {
    let component;
    let componentDefaultsStub;
    const config = {
      id: 'id',
      handle: 'handle',
      storefrontId: 'sfid',
      debug: 'debug',
      cartNode: 'cartNode',
      modalNode: 'modalNode',
      toggles: 'toggles',
      node: document.createElement('div'),
      options: {
        product: {
          buttonDestination: 'modal',
        },
      },
    };
    const props = 'props';
    const componentDefault = 'default';

    beforeEach(() => {
      componentDefaultsStub = sinon.stub(componentDefaults, 'default').value({componentDefault});
      component = new Component(config, props);
    });

    afterEach(() => {
      componentDefaultsStub.restore();
    });

    it('sets id, storeFrontId, node, and handle on instance', () => {
      assert.equal(component.id, config.id);
      assert.equal(component.handle, config.handle);
      assert.equal(component.storefrontId, config.storefrontId);
      assert.equal(component.node, config.node);
    });

    it('sets globalConfig based on passed in config', () => {
      const expectedObj = {
        debug: config.debug,
        cartNode: config.cartNode,
        moneyFormat: decodeURIComponent(defaultMoneyFormat),
        modalNode: config.modalNode,
        toggles: config.toggles,
      };
      assert.deepEqual(component.globalConfig, expectedObj);
    });

    it('sets moneyFormat to decoded moneyFormat from config if it exists', () => {
      config.moneyFormat = encodeURIComponent('$${{amount}}');
      component = new Component(config);
      assert.equal(component.globalConfig.moneyFormat, decodeURIComponent('$${{amount}}'));
    });

    it('instantiates a view', () => {
      assert.instanceOf(component.view, View);
    });

    it('instantiates an updater', () => {
      assert.instanceOf(component.updater, Updater);
    });

    it('sets config from merging config.options with componentDefaults', () => {
      assert.equal(component.config.product.buttonDestination, config.options.product.buttonDestination);
      assert.equal(component.config.componentDefault, componentDefault);
    });

    it('sets props from props passed in', () => {
      assert.equal(component.props, props);
    });

    it('instantiates an empty model object', () => {
      assert.deepEqual(component.model, {});
    });
  });

  describe('prototype methods', () => {
    let component;
    const fetchData = {test: 'fetchData'};

    beforeEach(() => {
      Component.prototype.typeKey = 'product';
      Component.prototype.fetchData = sinon.stub().resolves(fetchData);
      component = new Component({id: 1234});
    });

    describe('init()', () => {
      let viewInitStub;
      let renderSpy;
      let delegateEventsSpy;
      const data = {data: 'data'};

      beforeEach(() => {
        viewInitStub = sinon.stub().resolves();
        renderSpy = sinon.spy();
        delegateEventsSpy = sinon.spy();
        component.view = {
          init: viewInitStub,
          render: renderSpy,
          delegateEvents: delegateEventsSpy,
        };
      });

      describe('successful initialization', () => {
        let userEventStub;
        let setupModelStub;
        let setupModel;

        beforeEach(() => {
          setupModel = {data: 'setupModel'};
          userEventStub = sinon.stub(component, '_userEvent');
          setupModelStub = sinon.stub(component, 'setupModel').resolves(setupModel);
        });

        afterEach(() => {
          userEventStub.restore();
          setupModelStub.restore();
        });

        it('assigns model and initializes view', async () => {
          await component.init(data);
          assert.equal(component.model, setupModel);
          assert.calledOnce(renderSpy);
          assert.calledOnce(setupModelStub);
          assert.calledWith(setupModelStub, data);
          assert.calledOnce(delegateEventsSpy);
          assert.calledOnce(viewInitStub);
        });

        it('calls userEvent for beforeInit and afterInit', async () => {
          await component.init(data);
          assert.calledTwice(userEventStub);
          assert.calledWith(userEventStub.getCall(0), 'beforeInit');
          assert.calledOnce(viewInitStub);
          assert.calledWith(userEventStub.getCall(1), 'afterInit');
        });

        it('returns the component instance', async () => {
          const response = await component.init(data);
          assert.equal(response, component);
        });
      });

      describe('unsuccessful initialization', () => {
        let errorSetupModelStub;
        let logNotFoundStub;

        beforeEach(() => {
          logNotFoundStub = sinon.stub(logNotFound, 'default');
        });

        afterEach(() => {
          errorSetupModelStub.restore();
          logNotFoundStub.restore();
        });

        it('catches and throws any error from setupModel', async () => {
          const setupError = {message: ['test']};
          errorSetupModelStub = sinon.stub(component, 'setupModel').rejects(setupError);
          try {
            await component.init(data);
          } catch (error) {
            assert.equal(error, setupError);
          }
          assert.throws(component.init, Error);
        });

        it('logs a not found error if the error message contains "Not Found"', async () => {
          const setupError = {message: ['Not Found']};
          errorSetupModelStub = sinon.stub(component, 'setupModel').rejects(setupError);
          try {
            await component.init(data);
          } catch (error) {
            assert.equal(error, setupError);
          }
          assert.calledOnce(logNotFoundStub);
          assert.calledWith(logNotFoundStub, component);
        });

        it('does not log a not found error if the error message does not contain "Not Found"', async () => {
          const setupError = {message: ['Another Error']};
          errorSetupModelStub = sinon.stub(component, 'setupModel').rejects(setupError);
          try {
            await component.init(data);
          } catch (error) {
            assert.equal(error, setupError);
          }
          assert.notCalled(logNotFoundStub);
        });
      });
    });

    describe('setupModel()', () => {
      it('returns passed data', async () => {
        const data = {test: 'test'};
        const model = await component.setupModel(data);
        assert.deepEqual(model, data);
      });

      it('fetches data if data was not passed', async () => {
        const model = await component.setupModel();
        assert.calledOnce(component.fetchData);
        assert.deepEqual(model, fetchData);
      });
    });

    describe('updateConfig()', () => {
      it('updates config with config param', () => {
        const config = 'config';
        const updatedConfig = 'updated';
        const updateConfigStub = sinon.stub(component.updater, 'updateConfig').returns(updatedConfig);
        const returnVal = component.updateConfig(config);
        assert.calledWith(updateConfigStub, config);
        assert.equal(returnVal, updatedConfig);
        updateConfigStub.restore();
      });
    });

    describe('destroy()', () => {
      it('destroys the view', () => {
        const destroyStub = sinon.stub(component.view, 'destroy');
        component.destroy();
        assert.calledOnce(destroyStub);
        destroyStub.restore();
      });
    });

    describe('getters', () => {
      describe('name', () => {
        it('returns name based on id if it exists', () => {
          component.id = 'id';
          assert.equal(component.name, 'frame-product-id');
        });

        it('returns name based on handle if id does not exist', () => {
          component.handle = 'handle';
          component.id = null;
          assert.equal(component.name, 'frame-product-handle');
        });

        it('returns name based on typeKey', () => {
          component.typeKey = 'typeKey';
          assert.equal(component.name, 'frame-typeKey-1234');
        });
      });

      describe('options', () => {
        it('returns options for component by typeKey', () => {
          assert.deepEqual(component.options, component.config.product);
        });
      });

      describe('options dependent', () => {
        beforeEach(() => {
          component = Object.defineProperty(component, 'options', {
            value: {
              DOMEvents: 'DOMEvents',
              events: 'events',
              viewData: {viewData: 'viewData'},
              text: 'text',
              manifest: ['manifest1', 'manifest2'],
            },
          });
          component.config = {
            manifest1: {
              classes: {
                label: 'manifest1-label',
                name: 'manifest1-name',
              },
              styles: {
                button: {color: 'red'},
              },
              googleFonts: ['Arial'],
            },
            manifest2: {
              classes: {
                label: 'manifest2-label',
                name: 'manifest2-name',
              },
              styles: {
                div: {color: 'blue'},
              },
              googleFonts: ['Calibri'],
            },
          };
        });

        describe('DOMEvents', () => {
          it('returns options.DOMEvents if it exists', () => {
            assert.equal(component.DOMEvents, 'DOMEvents');
          });

          it('returns an empty object if options.DOMEvents does not exist', () => {
            component.options.DOMEvents = null;
            assert.deepEqual(component.DOMEvents, {});
          });
        });

        describe('events', () => {
          it('returns options.events if it exists', () => {
            assert.equal(component.events, 'events');
          });

          it('returns an empty object if options.events does not exist', () => {
            component.options.events = null;
            assert.deepEqual(component.events, {});
          });
        });

        describe('styles', () => {
          it('returns styles for each component in manifest', () => {
            const expectedObj = {
              manifest1: {
                button: component.config.manifest1.styles.button,
              },
              manifest2: {
                div: component.config.manifest2.styles.div,
              },
            };
            assert.deepEqual(component.styles, expectedObj);
          });
        });

        describe('classes', () => {
          it('returns classes for each component in manifest', () => {
            const expectedObj = {
              manifest1: {
                label: component.config.manifest1.classes.label,
                name: component.config.manifest1.classes.name,
              },
              manifest2: {
                label: component.config.manifest2.classes.label,
                name: component.config.manifest2.classes.name,
              },
            };
            assert.deepEqual(component.classes, expectedObj);
          });
        });

        describe('selectors', () => {
          it('returns classes formatted as css selectors for each component in manifest', () => {
            const expectedObj = {
              manifest1: {
                label: `.${component.config.manifest1.classes.label}`,
                name: `.${component.config.manifest1.classes.name}`,
              },
              manifest2: {
                label: `.${component.config.manifest2.classes.label}`,
                name: `.${component.config.manifest2.classes.name}`,
              },
            };
            assert.deepEqual(component.selectors, expectedObj);
          });
        });

        describe('googleFonts', () => {
          it('returns google fonts for each component in manifest', () => {
            const googleFonts1 = component.config.manifest1.googleFonts;
            const googleFonts2 = component.config.manifest2.googleFonts;
            assert.deepEqual(component.googleFonts, [...googleFonts1, ...googleFonts2]);
          });
        });

        describe('viewData', () => {
          it('returns merged object of model, viewData, classes, and text', () => {
            component.model = {model: 'model'};
            component = Object.defineProperty(component, 'classes', {
              value: 'classes',
            });
            const expectedObj = {
              viewData: component.options.viewData.viewData,
              text: component.options.text,
              model: component.model.model,
              classes: component.classes,
            };
            assert.deepEqual(component.viewData, expectedObj);
          });
        });
      });

      describe('morphCallbacks', () => {
        it('returns an object with the function onBeforeElUpdated', () => {
          assert.instanceOf(component.morphCallbacks, Object);
          assert.equal(Object.keys(component.morphCallbacks).length, 1);
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

    describe('"private" methods', () => {
      describe('_userEvent()', () => {
        it('logs to logger if debug is set to true', () => {
          const infoSpy = sinon.spy();
          const loggerStub = sinon.stub(logger, 'default').value({info: infoSpy});
          component.globalConfig.debug = true;
          component.typeKey = 'key';
          component._userEvent('test');
          assert.calledOnce(infoSpy);
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
          component = Object.defineProperty(component, 'events', {
            value: {test: eventSpy},
          });

          const isFunctionStub = sinon.stub(isFunction, 'default').returns(true);
          component._userEvent('test');
          assert.calledOnce(eventSpy);
          assert.calledWith(eventSpy, component);
          isFunctionStub.restore();
        });
      });
    });
  });
});
