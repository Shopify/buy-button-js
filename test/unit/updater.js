import Component from '../../src/component';
import Updater from '../../src/updater';
import Template from '../../src/template';

describe('Updater class', () => {
  describe('constructor', () => {
    let component;
    let updater;

    beforeEach(() => {
      component = new Component({id: 1234});
      updater = new Updater(component);
    });

    it('stores component to instance', () => {
      assert.equal(updater.component, component);
    });
  });

  describe('prototype methods', () => {
    describe('updateConfig()', () => {
      let component;
      let updater;
      let renderSpy;
      let resizeSpy;
      const config = {options: {product: {}}};

      beforeEach(() => {
        renderSpy = sinon.spy();
        resizeSpy = sinon.spy();
        component = new Component({id: 1234});
        component.typeKey = 'product';
        component.view.render = renderSpy;
        component.view.resize = resizeSpy;
        updater = new Updater(component);
      });

      it('instantiates a template in the component view', () => {
        updater.updateConfig(config);
        assert.instanceOf(updater.component.view.template, Template);
      });

      it('merges config params with current config', () => {
        const oldConfig = {test: 'test'};
        updater.component.config = oldConfig;
        updater.updateConfig(config);
        assert.deepEqual(updater.component.config, Object.assign(config.options, oldConfig));
      });

      it('renders and resizes view', () => {
        updater.updateConfig(config);
        assert.calledOnce(renderSpy);
        assert.calledOnce(resizeSpy);
      });

      it('updates iframe if iframe exists', () => {
        const updateStylesSpy = sinon.spy();
        component.view.iframe = {
          updateStyles: updateStylesSpy,
        };
        component.updateConfig(config);
        assert.calledOnce(updateStylesSpy);
        assert.calledWith(updateStylesSpy, component.styles, component.googleFonts);
      });
    });
  });
});
