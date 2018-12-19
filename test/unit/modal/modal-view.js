import Modal from '../../../src/components/modal';
import View from '../../../src/view';
import * as elementClass from '../../../src/utils/element-class';

describe('Modal View class', () => {
  const props = {
    browserFeatures: {},
  };
  const config = {
    node: document.createElement('div'),
  };
  let modal;

  beforeEach(() => {
    modal = new Modal(config, props);
  });

  describe('wrapTemplate', () => {
    it('wraps html in a div element with modal class, and wraps modal div within a div with overlay class', () => {
      modal = Object.defineProperty(modal, 'classes', {
        value: {
          modal: {
            overlay: 'overlay',
            modal: 'modal',
          },
        },
      });
      const html = 'html';
      const htmlString = '<div class="overlay"><div class="modal">html</div></div>';
      assert.equal(modal.view.wrapTemplate(html), htmlString);
    });
  });

  describe('close', () => {
    let removeClassFromElementStub;

    beforeEach(() => {
      removeClassFromElementStub = sinon.stub(elementClass, 'removeClassFromElement');
      modal.view = Object.defineProperty(modal.view, 'document', {
        value: document,
      });
    });

    afterEach(() => {
      removeClassFromElementStub.restore();
    });

    it('sets the modal to not visible', () => {
      modal.view.close();
      assert.isFalse(modal.isVisible);
    });

    it('removes "is-active" class from wrapper and document body', () => {
      modal.view.wrapper = document.createElement('div');
      modal.view.close();
      assert.calledWith(removeClassFromElementStub.getCall(0), 'is-active', modal.view.wrapper);
      assert.calledWith(removeClassFromElementStub.getCall(1), 'is-active', modal.view.document.body);
    });

    it('removes "shopify-buy-modal-is-active" class from document body and html element', () => {
      modal.view.close();
      assert.calledWith(removeClassFromElementStub.getCall(2), 'shopify-buy-modal-is-active', document.body);
      assert.calledWith(removeClassFromElementStub.getCall(3), 'shopify-buy-modal-is-active', document.getElementsByTagName('html')[0]);
    });

    it('removes "is-active" and "is-block" classes from node if iframe does not exist', () => {
      modal.view.iframe = null;
      modal.view.close();
      assert.calledWith(removeClassFromElementStub.getCall(4), 'is-active', modal.node);
      assert.calledWith(removeClassFromElementStub.getCall(5), 'is-block', modal.node);
    });

    describe('when iframe exists', () => {
      let removeClassSpy;
      let addEventListenerSpy;

      beforeEach(() => {
        removeClassSpy = sinon.spy();
        addEventListenerSpy = sinon.spy();
        modal.view.iframe = {
          removeClass: removeClassSpy,
          parent: {
            addEventListener: addEventListenerSpy,
          },
        };
      });

      it('removes "is-block" class from iframe', () => {
        modal.view.close();
        assert.calledWith(removeClassSpy.getCall(0), 'is-block');
      });

      it('adds a transitionend event listener to remove "is-active" class on iframe if browser supports transition', () => {
        modal.props.browserFeatures.transition = true;
        modal.view.close();
        assert.calledOnce(addEventListenerSpy);
        assert.calledWith(addEventListenerSpy, 'transitionend', sinon.match.func);
        addEventListenerSpy.getCall(0).args[1]();
        assert.calledWith(removeClassSpy.getCall(1), 'is-active');
      });

      it('removes "is-active" class from iframe if browser does not support transition', () => {
        modal.props.browserFeatures.transition = false;
        modal.view.close();
        assert.notCalled(addEventListenerSpy);
        assert.calledWith(removeClassSpy.getCall(1), 'is-active');
      });
    });
  });

  describe('delegateEvents', () => {
    let superDelegateEventsStub;
    let addEventListenerSpy;
    let closeOnBgClickStub;

    beforeEach(() => {
      superDelegateEventsStub = sinon.stub(View.prototype, 'delegateEvents');
      addEventListenerSpy = sinon.spy();
      modal.view.wrapper = {
        addEventListener: addEventListenerSpy,
      };
      closeOnBgClickStub = sinon.stub(modal, 'closeOnBgClick');
      modal.view.delegateEvents();
    });

    afterEach(() => {
      superDelegateEventsStub.restore();
      closeOnBgClickStub.restore();
    });

    it('calls super delegateEvents()', () => {
      assert.calledOnce(superDelegateEventsStub);
    });

    it('adds click event listener to wrapper that closes on bg click', () => {
      assert.calledOnce(addEventListenerSpy);
      assert.calledWith(addEventListenerSpy, 'click', sinon.match.func);
      addEventListenerSpy.getCall(0).args[1]();
      assert.calledOnce(closeOnBgClickStub);
    });
  });

  describe('render', () => {
    let superRenderStub;
    let addClassToElementStub;

    beforeEach(() => {
      superRenderStub = sinon.stub(View.prototype, 'render');
      addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');
    });

    afterEach(() => {
      superRenderStub.restore();
      addClassToElementStub.restore();
    });

    it('does not render or add classes if component is not visible', () => {
      modal.isVisible = false;
      modal.view.render();
      assert.notCalled(superRenderStub);
      assert.notCalled(addClassToElementStub);
    });

    describe('when component is visible', () => {
      beforeEach(() => {
        modal.isVisible = true;
        modal.view = Object.defineProperty(modal.view, 'document', {
          value: document,
        });
      });

      it('calls super render()', () => {
        modal.view.render();
        assert.calledOnce(superRenderStub);
      });

      it('adds "is-active" class to document body and wrapper', () => {
        modal.view.wrapper = document.createElement('div');
        modal.view.render();
        assert.calledWith(addClassToElementStub.getCall(0), 'is-active', modal.view.document.body);
        assert.calledWith(addClassToElementStub.getCall(3), 'is-active', modal.view.wrapper);

      });

      it('adds "shopify-buy-modal-is-active" class to document body and html element', () => {
        modal.view.render();
        assert.calledWith(addClassToElementStub.getCall(1), 'shopify-buy-modal-is-active', document.body);
        assert.calledWith(addClassToElementStub.getCall(2), 'shopify-buy-modal-is-active', document.getElementsByTagName('html')[0]);
      });

      it('adds "is-active" and "is-block" classes to iframe if iframe exists', () => {
        const addClassSpy = sinon.spy();
        modal.view.iframe = {
          addClass: addClassSpy,
        };
        modal.view.render();
        assert.calledTwice(addClassSpy);
        assert.calledWith(addClassSpy.getCall(0), 'is-active');
        assert.calledWith(addClassSpy.getCall(1), 'is-block');
      });

      it('adds "is-active" and "is-block" classes to node if iframe does not exist', () => {
        modal.view.iframe = null;
        modal.view.render();
        assert.calledWith(addClassToElementStub.getCall(4), 'is-active', modal.node);
        assert.calledWith(addClassToElementStub.getCall(5), 'is-block', modal.node);
      });
    });
  });
});
