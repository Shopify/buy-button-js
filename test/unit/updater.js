import ShopifyBuy from '../../src/buybutton';
import Component from '../../src/component';
import Updater from '../../src/updater';

describe('Updater class', () => {
  describe('constructor', () => {
    it('stores component to instance', () => {
      const component = new Component({id: 1234});
      const updater = new Updater(component);
      assert.equal(updater.component, component);
    });
  });

  describe('updateConfig()', () => {
    let component;
    let updater;

    beforeEach(() => {
      component = new Component({id: 1234});
      component.view.render = sinon.spy();
      component.view.resize = sinon.spy();
      updater = new Updater(component);
    });

    it('merges new config with old config and updates view', () => {
      updater.updateConfig({
        options: {
          product: {
            buttonDestination: 'modal',
          },
        },
      });
      assert.equal(component.config.product.buttonDestination, 'modal');
      assert.calledOnce(component.view.render);
      assert.calledOnce(component.view.resize);
    });

    it('updates iframe if iframe exists', () => {
      component.typeKey = 'product';
      component.view.iframe = {
        updateStyles: sinon.spy()
      };
      component.updateConfig({});
      assert.calledWith(component.view.iframe.updateStyles, component.styles, component.googleFonts)
    });
  });
});
