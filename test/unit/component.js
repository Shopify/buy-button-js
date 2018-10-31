import Component from '../../src/component';
import View from '../../src/view';
import Updater from '../../src/updater';
import * as logNotFound from '../../src/utils/log-not-found';


describe('Component class', () => {

  describe('constructor', () => {
    it('stores id, node, and handle on instance', () => {
      const node = document.createElement('div');
      const component = new Component({
        id: 1234,
        handle: 'lol',
        node,
      });

      assert.equal(component.id, 1234);
      assert.equal(component.handle, 'lol');
      assert.equal(component.node, node);
    });

    it('sets globalConfig based on passed in config', () => {
      const component = new Component({
        id: 1234,
      });
      assert.equal(component.globalConfig.moneyFormat, '${{amount}}');
    });

    it('instantiates a view', () => {
      const component = new Component({
        id: 1234,
      });
      assert.instanceOf(component.view, View);
    });

    it('instantiates an updater', () => {
      const component = new Component({
        id: 1234,
      });
      assert.instanceOf(component.updater, Updater);
    })

    it('merges configuration options with defaults', () => {
      const config = {
        options: {
          product: {
            buttonDestination: 'modal',
          },
        },
      };
      const component = new Component(config);
      assert.equal(component.config.product.buttonDestination, 'modal', 'configuration options override defaults');
      assert.equal(component.config.cart.iframe, true, 'defaults are merged into configuration');
    });
  });

  describe('get name()', () => {
    it('returns name based on handle or id', () => {
      let component = new Component({id: 1234});
      assert.equal(component.name, 'frame-undefined-1234', 'uses ID if ID is set');
      component = new Component({handle: 'lol'});
      assert.equal(component.name, 'frame-undefined-lol', 'uses handle if handle is set');
    });
  });

  describe('get options()', () => {
    it('returns options for component by typeKey', () => {
      const component = new Component({id: 1234});
      component.typeKey = 'product';
      assert.equal(component.options.buttonDestination, 'cart');
    });
  });

  describe('get styles()', () => {
    it('returns styles for each component in manifest', () => {
      const component = new Component({
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
      const component = new Component({id: 1234});
      component.typeKey = 'product';
      assert.equal(component.classes.product.product, 'shopify-buy__product');
      assert.equal(component.classes.option.option, 'shopify-buy__option-select');
    });
  });

  describe('get selectors()', () => {
    it('returns classes formatted as css selectors for each component in manifest', () => {
      const component = new Component({id: 1234});
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
      const component = new Component(config);
      component.typeKey = 'product';
      assert.deepEqual(component.googleFonts, ['lol', 'bar']);
    });
  });

  describe('get viewData()', () => {
    it('returns model and some other properties', () => {
      const component = new Component({id: 1234});
      component.typeKey = 'product';
      component.model = {test: 'lol'};
      assert.equal(component.viewData.test, 'lol');
      assert.equal(component.viewData.classes.product.product, 'shopify-buy__product');
    });
  });

  describe('init()', () => {
    it('assigns model and initializes view', () => {
      const component = new Component({id: 1234}, {
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
      const component = new Component({id: 1234}, {
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
      const component = new Component({id: 1234});
      return component.setupModel({test: 'lol'}).then((model) => {
        assert.deepEqual(model, {test: 'lol'});
      });
    });

    it('calls fetchData if not passed data', () => {
      const component = new Component({id: 1234});
      component.fetchData = sinon.stub().returns(Promise.resolve({test: 'lol'}));
      return component.setupModel().then((model) => {
        assert.deepEqual(model, {test: 'lol'});
      });
    });
  });

  describe('updateConfig()', () => {
    it('delegates to updater', () => {
      const component = new Component({id: 1234});
      component.updater.updateConfig = sinon.spy();
      component.updateConfig({test: 'lol'});
      assert.calledWith(component.updater.updateConfig, {test: 'lol'});
    });
  });

  describe('destroy()', () => {
    it('delegates to view', () => {
      const component = new Component({id: 1234});
      component.view.destroy = sinon.spy();
      component.destroy();
      assert.calledOnce(component.view.destroy);
    });
  });
});
