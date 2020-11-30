import {trapFocus, removeTrapFocus} from '../../src/utils/focus';

describe('Focus utils', () => {
  let node;
  let firstEl;
  let middleEl;
  let lastEl;

  beforeEach(() => {
    node = document.createElement('div');
    firstEl = document.createElement('button');
    middleEl = document.createElement('input');
    lastEl = document.createElement('select');

    node.appendChild(firstEl);
    node.appendChild(middleEl);
    node.appendChild(lastEl);
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
  });

  describe('trapFocus', () => {
    it('focuses the first element', () => {
      const focusSpy = sinon.spy();

      firstEl.focus = focusSpy;
      trapFocus(node);

      assert.calledOnce(focusSpy);
    });

    describe('Focus events', () => {
      let addEventListenerSpy;
      let removeEventListenerSpy;

      beforeEach(() => {
        addEventListenerSpy = sinon.spy();
        removeEventListenerSpy = sinon.spy();
        node.addEventListener = addEventListenerSpy;
        node.removeEventListener = removeEventListenerSpy;

        trapFocus(node);
      });

      it('adds focusin and focusout event handlers', () => {
        assert.calledTwice(addEventListenerSpy);
        assert.calledWith(addEventListenerSpy.firstCall, 'focusout');
        assert.calledWith(addEventListenerSpy.secondCall, 'focusin');
      });

      it('adds a keydown event listener if the focusin event handler is called on the first focusable element', () => {
        const mockEvent = {
          target: firstEl,
        };
        addEventListenerSpy.getCall(1).args[1](mockEvent);

        assert.calledThrice(addEventListenerSpy);
        assert.calledWith(addEventListenerSpy.thirdCall, 'keydown');
      });

      it('adds a keydown event listener if the focusin event handler is called on the last focusable element', () => {
        const mockEvent = {
          target: lastEl,
        };
        addEventListenerSpy.getCall(1).args[1](mockEvent);

        assert.calledThrice(addEventListenerSpy);
        assert.calledWith(addEventListenerSpy.thirdCall, 'keydown');
      });

      it('does not add a keydown event listener if the focusin event handler is called on a focusable element that is not first or last', () => {
        const mockEvent = {
          target: middleEl,
        };
        addEventListenerSpy.getCall(1).args[1](mockEvent);

        assert.calledTwice(addEventListenerSpy);
      });

      it('removes the keydown event if the focusout event handle is called', () => {
        removeEventListenerSpy.resetHistory();
        addEventListenerSpy.getCall(0).args[1]();

        assert.calledOnce(removeEventListenerSpy);
        assert.calledWith(removeEventListenerSpy.firstCall, 'keydown');
      });
    });

    describe('removeTrapFocus call', () => {
      it('removes the focusin, focusout, and keydown event handlers from the node provided if they currently exist', () => {  
        trapFocus(node);

        const removeEventListenerSpy = sinon.spy();
        node.removeEventListener = removeEventListenerSpy;
        trapFocus(node);

        assert.calledThrice(removeEventListenerSpy);
        assert.calledWith(removeEventListenerSpy.firstCall, 'focusin');
        assert.calledWith(removeEventListenerSpy.secondCall, 'focusout');
        assert.calledWith(removeEventListenerSpy.thirdCall, 'keydown');
      });
    });

    describe('Keydown event', () => {
      let addEventListenerSpy;
      let preventDefaultSpy;
      let focusinHandler;
      let keydownHandler;

      beforeEach(() => {
        preventDefaultSpy = sinon.spy();
        addEventListenerSpy = sinon.spy(node, 'addEventListener');
        trapFocus(node);
        focusinHandler = addEventListenerSpy.getCall(1).args[1];
      });

      describe('First element', () => {
        beforeEach(() => {
          focusinHandler({
            target: firstEl,
          });
          keydownHandler = addEventListenerSpy.getCall(2).args[1];
        });

        it('focuses the last element if shift+tab is pressed when focused on the first element', () => {
          const focusSpy = sinon.spy();
          lastEl.focus = focusSpy;
          keydownHandler({keyCode: 9, shiftKey: true, target: firstEl, preventDefault: preventDefaultSpy});

          assert.calledOnce(focusSpy);
          assert.calledOnce(preventDefaultSpy);
        });

        it('does not focus the last element if a non shift+tab key is pressed when focused on the first element', () => {
          const focusSpy = sinon.spy();
          lastEl.focus = focusSpy;
          keydownHandler({keyCode: 10, shiftKey: true, target: firstEl, preventDefault: preventDefaultSpy});

          assert.notCalled(focusSpy);
          assert.notCalled(preventDefaultSpy);
        });
      });

      describe('Last element', () => {
        beforeEach(() => {
          focusinHandler({
            target: lastEl,
          });
          keydownHandler = addEventListenerSpy.getCall(2).args[1];
        });

        it('focuses the first element if tab is pressed when focused on the last element', () => {
          const focusSpy = sinon.spy();
          firstEl.focus = focusSpy;
          keydownHandler({keyCode: 9, shiftKey: false, target: lastEl, preventDefault: preventDefaultSpy});

          assert.calledOnce(focusSpy);
          assert.calledOnce(preventDefaultSpy);
        });

        it('does not focus the first element if a non tab key is pressed when focused on the last element', () => {
          const focusSpy = sinon.spy();
          firstEl.focus = focusSpy;
          keydownHandler({keyCode: 10, shiftKey: false, target: lastEl, preventDefault: preventDefaultSpy});

          assert.notCalled(focusSpy);
          assert.notCalled(preventDefaultSpy);
        });
      });
    });
  });

  describe('removeTrapFocus', () => {
    it('removes the focusin, focusout, and keydown event handlers from the node provided', () => {
      trapFocus(node);

      const removeEventListenerSpy = sinon.spy();
      node.removeEventListener = removeEventListenerSpy;

      removeTrapFocus(node);

      assert.calledThrice(removeEventListenerSpy);
      assert.calledWith(removeEventListenerSpy.firstCall, 'focusin');
      assert.calledWith(removeEventListenerSpy.secondCall, 'focusout');
      assert.calledWith(removeEventListenerSpy.thirdCall, 'keydown');
    });
  });
});
