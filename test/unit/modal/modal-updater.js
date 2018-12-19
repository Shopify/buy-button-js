import Modal from '../../../src/components/modal';
import Updater from '../../../src/updater';
import Product from '../../../src/components/product';

describe('Modal Updater class', () => {
  describe('updateConfig', () => {
    const resizeReturnValue = {};
    const updateConfigParam = {};
    const props = {};
    const config = {
      node: document.createElement('div'),
    };
    let modal;
    let superUpdateConfigStub;
    let initStub;
    let resizeStub;
    let updateConfigValue;

    beforeEach(async () => {
      modal = new Modal(config, props);
      superUpdateConfigStub = sinon.stub(Updater.prototype, 'updateConfig');
      initStub = sinon.stub(Product.prototype, 'init').resolves();
      resizeStub = sinon.stub(modal.view, 'resize').resolves(resizeReturnValue);
      updateConfigValue = await modal.updater.updateConfig(updateConfigParam);
    });

    afterEach(() => {
      superUpdateConfigStub.restore();
      initStub.restore();
      resizeStub.restore();
    });

    it('calls super updateConfig with param', () => {
      assert.calledOnce(superUpdateConfigStub);
      assert.calledWith(superUpdateConfigStub, updateConfigParam);
    });

    it('instantiates a new product', () => {
      assert.instanceOf(modal.product, Product);
    });

    it('initializes product then resizes view', () => {
      assert.calledOnce(initStub);
      assert.calledWith(initStub, modal.model);
      assert.calledOnce(resizeStub);
    });

    it('returns the return value of resize', () => {
      assert.equal(updateConfigValue, resizeReturnValue);
    });
  });
});
