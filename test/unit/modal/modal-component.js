import Modal from '../../../src/components/modal';
import ModalUpdater from '../../../src/updaters/modal';
import ModalView from '../../../src/views/modal';
import Product from '../../../src/components/product';
import Component from '../../../src/component';
import productFixture from '../../fixtures/product-fixture';

describe('Modal Component class', () => {
  describe('constructor', () => {
    let modal;
    let node;

    beforeEach(() => {
      node = document.createElement('div');
    });

    it('sets typeKey to modal', () => {
      modal = new Modal({node}, {});
      assert.equal(modal.typeKey, 'modal');
    });

    it('creates a child div element to node in config if provided and sets node to child element', () => {
      const div = document.createElement('div');
      const child = document.createElement('div');
      const appendChildStub = sinon.stub(node, 'appendChild').returns(child);
      const createElementStub = sinon.stub(document, 'createElement').returns(div);

      modal = new Modal({node}, {});
      assert.calledOnce(appendChildStub);
      assert.calledWith(appendChildStub, div);
      assert.equal(modal.node, child);

      appendChildStub.restore();
      createElementStub.restore();
    });

    it('creates a new div element in the document body and sets node to the new element if a node is not provided in config', () => {
      const div = document.createElement('div');
      const child = document.createElement('div');
      const appendChildStub = sinon.stub(document.body, 'appendChild').returns(child);
      const createElementStub = sinon.stub(document, 'createElement').returns(div);

      modal = new Modal({}, {});
      assert.calledOnce(appendChildStub);
      assert.calledWith(appendChildStub, div);
      assert.equal(modal.node, child);

      appendChildStub.restore();
      createElementStub.restore();
    });

    it('sets the node\'s class name to "shopify-buy-modal-wrapper"', () => {
      modal = new Modal({node}, {});
      assert.equal(modal.node.className, 'shopify-buy-modal-wrapper');
    });

    it('sets product to null', () => {
      modal = new Modal({node}, {});
      assert.isNull(modal.product);
    });

    it('instantiates a new modal updater', () => {
      modal = new Modal({node}, {});
      assert.instanceOf(modal.updater, ModalUpdater);
    });

    it('instantiates a new modal view', () => {
      modal = new Modal({node}, {});
      assert.instanceOf(modal.view, ModalView);
    });
  });

  describe('prototype methods', () => {
    const config = {
      node: document.createElement('div'),
    };
    let props;
    let modal;
    let closeModalStub;
    const testProductCopy = Object.assign({}, productFixture);

    beforeEach(() => {
      closeModalStub = sinon.stub().resolves();
      props = {
        closeModal: closeModalStub,
      };
      modal = new Modal(config, props);
    });

    describe('closeOnBgClick', () => {
      const event = {
        target: document.createElement('div'),
      };

      it('closes modal if product wrapper does not contain event target', () => {
        modal.productWrapper = document.createElement('div');
        modal.closeOnBgClick(event);
        assert.calledOnce(closeModalStub);
      });

      it('does not close modal if product wrapper contains event target', () => {
        modal.productWrapper = document.createElement('div');
        modal.productWrapper.appendChild(event.target);
        modal.closeOnBgClick(event);
        assert.notCalled(closeModalStub);
      });
    });

    describe('init', () => {
      let superInitStub;
      let productInitStub;
      let setFocusStub;
      let resizeStub;

      beforeEach(() => {
        superInitStub = sinon.stub(Component.prototype, 'init').resolves();
        productInitStub = sinon.stub(Product.prototype, 'init').resolves();
        setFocusStub = sinon.stub(modal.view, 'setFocus');
        resizeStub = sinon.stub(modal.view, 'resize').resolves();
        modal.view.wrapper = document.createElement('div');
      });

      afterEach(() => {
        productInitStub.restore();
        superInitStub.restore();
        setFocusStub.restore();
        resizeStub.restore();
      });

      it('sets isVisible to true', async () => {
        await modal.init(testProductCopy);
        assert(modal.isVisible);
      });

      it('calls super init with param', async () => {
        await modal.init(testProductCopy);
        assert.calledOnce(superInitStub);
        assert.calledWith(superInitStub, testProductCopy);
      });

      it('sets product wrapper to modal element in view wrapper', async () => {
        modal = Object.defineProperty(modal, 'classes', {
          value: {
            modal: {
              modal: 'modal',
            },
          },
        });
        const element = document.createElement('div');
        element.className = 'modal';
        modal.view.wrapper.appendChild(element);
        await modal.init(testProductCopy);
        assert.equal(modal.productWrapper, element);
      });

      it('instantiates a new product', async () => {
        await modal.init(testProductCopy);
        assert.instanceOf(modal.product, Product);
      });

      it('calls product init with model', async () => {
        await modal.init(testProductCopy);
        assert.calledOnce(productInitStub);
        assert.calledWith(productInitStub, modal.model);
      });

      it('sets focus on view', async () => {
        await modal.init(testProductCopy);
        assert.calledOnce(setFocusStub);
      });

      it('resizes view', async () => {
        await modal.init(testProductCopy);
        assert.calledOnce(resizeStub);
      });
    });

    describe('close', () => {
      let userEventStub;
      let closeStub;

      beforeEach(() => {
        userEventStub = sinon.stub(modal, '_userEvent');
        closeStub = sinon.stub(modal.view, 'close');
        modal.close();
      });

      afterEach(() => {
        userEventStub.restore();
        closeStub.restore();
      });

      it('calls user event with closeModal', () => {
        assert.calledOnce(userEventStub);
        assert.calledWith(userEventStub, 'closeModal');
      });

      it('closes view', () => {
        assert.calledOnce(closeStub);
      });
    });

    describe('getters', () => {
      describe('DOMEvents', () => {
        beforeEach(() => {
          modal = Object.defineProperty(modal, 'selectors', {
            value: {
              modal: {
                close: 'close',
              },
            },
          });
        });

        it('returns an object that includes DOMEvents from options', () => {
          modal.config.modal = {
            DOMEvents: {
              DOMEvents: {},
            },
          };
          assert.deepInclude(modal.DOMEvents, modal.options.DOMEvents);
        });

        it('returns an object with closeModal binded to close modal click', () => {
          modal.DOMEvents['click close']();
          assert.calledOnce(closeModalStub);
        });
      });

      describe('productConfig', () => {
        it('returns object that includes global config', () => {
          assert.deepInclude(modal.productConfig, modal.globalConfig);
        });

        it('returns object with node that holds product wrapper', () => {
          modal.productWrapper = document.createElement('div');
          assert.deepInclude(modal.productConfig, {node: modal.productWrapper});
        });

        it('returns object with options that holds config', () => {
          assert.deepInclude(modal.productConfig, {options: modal.config});
        });
      });
    });
  });
});
