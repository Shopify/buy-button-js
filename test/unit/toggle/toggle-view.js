import Toggle from '../../../src/components/toggle';
import View from '../../../src/view';

describe('Toggle View class', () => {
  let toggle;
  let cart;
  let toggleVisibilitySpy;
  let setActiveElSpy;

  beforeEach(() => {
    toggleVisibilitySpy = sinon.spy();
    setActiveElSpy = sinon.spy();
    cart = {
      toggleVisibility: toggleVisibilitySpy,
    };
    const node = document.createElement('div');
    toggle = new Toggle({node}, {
      cart,
      setActiveEl: setActiveElSpy,
    });
  });

  describe('render()', () => {
    let superRenderStub;
    let addClassStub;
    let removeClassStub;
    let resizeStub;

    beforeEach(() => {
      superRenderStub = sinon.stub(View.prototype, 'render');
      addClassStub = sinon.stub(toggle.view, 'addClass');
      removeClassStub = sinon.stub(toggle.view, 'removeClass');
      resizeStub = sinon.stub(toggle.view, 'resize');
      toggle.view = Object.defineProperty(toggle.view, 'isVisible', {
        writable: true,
      });
    });

    afterEach(() => {
      superRenderStub.restore();
      addClassStub.restore();
      removeClassStub.restore();
      resizeStub.restore();
    });

    it('calls super\'s render()', () => {
      toggle.view.render();
      assert.calledOnce(superRenderStub);
    });

    it('adds "is-sticky" class if component is sticky', () => {
      toggle.view.isVisible = false;
      toggle.config.toggle.sticky = true;

      toggle.view.render();
      assert.calledOnce(addClassStub);
      assert.calledWith(addClassStub, 'is-sticky');
    });

    it('adds "is-active" class if component is visible', () => {
      toggle.view.isVisible = true;
      toggle.config.toggle.sticky = false;

      toggle.view.render();
      assert.calledOnce(addClassStub);
      assert.calledWith(addClassStub, 'is-active');
    });

    it('removes "is-active" class if component is visible', () => {
      toggle.view.isVisible = false;

      toggle.view.render();
      assert.calledOnce(removeClassStub);
      assert.calledWith(removeClassStub, 'is-active');
    });

    describe('when iframe exists', () => {
      let setAttributeSpy;
      beforeEach(() => {
        setAttributeSpy = sinon.spy();
        toggle.view.iframe = {
          parent: {
            setAttribute: setAttributeSpy,
          },
        };
        toggle.view.render();
      });

      it('updates three attributes', () => {
        assert.calledThrice(setAttributeSpy);
      });

      it('sets tabindex of iframe\'s parent to zero', () => {
        assert.calledWith(setAttributeSpy.getCall(0), 'tabindex', 0);
      });

      it('sets role of iframe\'s parent to button', () => {
        assert.calledWith(setAttributeSpy.getCall(1), 'role', 'button');
      });

      it('sets aria-label of iframe\'s parent to text title', () => {
        assert.calledWith(setAttributeSpy.getCall(2), 'aria-label', toggle.options.text.title);
      });

      it('resizes view', () => {
        assert.calledOnce(resizeStub);
      });
    });
  });

  describe('delegateEvents()', () => {
    let superDelegateEventsStub;

    beforeEach(() => {
      superDelegateEventsStub = sinon.stub(View.prototype, 'delegateEvents');
    });

    afterEach(() => {
      superDelegateEventsStub.restore();
    });

    it('calls super\'s delegateEvents()', () => {
      toggle.view.delegateEvents();
      assert.calledOnce(superDelegateEventsStub);
    });

    describe('when iframe exists', () => {
      let addEventListenerSpy;
      let preventDefaultSpy;

      beforeEach(() => {
        addEventListenerSpy = sinon.spy();
        preventDefaultSpy = sinon.spy();
        toggle.view.iframe = {
          parent: {
            addEventListener: addEventListenerSpy,
          },
        };
        toggle.view.delegateEvents();
      });

      it('adds a keydown event listener to iframe parent if it exists', () => {
        assert.calledOnce(addEventListenerSpy);
        assert.calledWith(addEventListenerSpy, 'keydown', sinon.match.func);
      });

      it('does not toggle cart visibility, set the active element, or call preventDefault if keydown event is not the enter or space key', () => {
        const event = {
          keyCode: 999,
          preventDefault: preventDefaultSpy,
        };
        addEventListenerSpy.getCall(0).args[1](event);
        assert.notCalled(toggleVisibilitySpy);
        assert.notCalled(preventDefaultSpy);
        assert.notCalled(setActiveElSpy);
      });

      it('toggles cart visibility, sets the active element, and calls preventDefault if keydown event is the enter key', () => {
        const event = {
          keyCode: 13, // enter key
          preventDefault: preventDefaultSpy,
        };
        addEventListenerSpy.getCall(0).args[1](event);
        assert.calledOnce(toggleVisibilitySpy);
        assert.calledWith(toggleVisibilitySpy, cart);
        assert.calledOnce(preventDefaultSpy);
        assert.calledWith(setActiveElSpy);
        assert.calledWith(setActiveElSpy, toggle.view.node);
      });

      it('toggles cart visibility, sets the active element, and calls preventDefault if keydown event is the space key', () => {
        const event = {
          keyCode: 32, // space key
          preventDefault: preventDefaultSpy,
        };
        addEventListenerSpy.getCall(0).args[1](event);
        assert.calledOnce(toggleVisibilitySpy);
        assert.calledWith(toggleVisibilitySpy, cart);
        assert.calledOnce(preventDefaultSpy);
        assert.calledWith(setActiveElSpy);
        assert.calledWith(setActiveElSpy, toggle.view.node);
      });
    });
  });

  describe('wrapTemplate()', () => {
    it('wraps html and readable label in a div with sticky class and toggle class', () => {
      const html = 'test';
      const htmlString = toggle.view.wrapTemplate(html);
      const expectedString =
      `<div class="${toggle.view.stickyClass} ${toggle.classes.toggle.toggle}">
      ${html}
      ${toggle.view.readableLabel}
    </div>`;
      assert.equal(htmlString, expectedString);
    });
  });

  describe('_resizeX()', () => {
    it('sets iframe width to wrapper\'s client width', () => {
      toggle.view.iframe = {
        el: {
          style: {
            width: '10px',
          },
        },
      };
      toggle.view.wrapper = {
        clientWidth: 20,
      };
      toggle.view._resizeX();
      assert.equal(toggle.view.iframe.el.style.width, '20px');
    });
  });

  describe('getters', () => {
    describe('shouldResizeY', () => {
      it('returns true', () => {
        assert.isTrue(toggle.view.shouldResizeY);
      });
    });

    describe('shouldResizeX', () => {
      it('returns true', () => {
        assert.isTrue(toggle.view.shouldResizeX);
      });
    });

    describe('isVisible', () => {
      it('returns true if the toggle counter is higher than zero', () => {
        toggle = Object.defineProperty(toggle, 'count', {
          value: 1,
        });
        assert.isTrue(toggle.view.isVisible);
      });

      it('returns false if the toggle counter is zero', () => {
        toggle = Object.defineProperty(toggle, 'count', {
          value: 0,
        });
        assert.isFalse(toggle.view.isVisible);
      });

      it('returns false if the toggle counter is less than zero', () => {
        toggle = Object.defineProperty(toggle, 'count', {
          value: -1,
        });
        assert.isFalse(toggle.view.isVisible);
      });
    });

    describe('stickyClass', () => {
      it('returns "is-sticky" if component is sticky', () => {
        toggle.config.toggle.sticky = true;
        assert.equal(toggle.view.stickyClass, 'is-sticky');
      });

      it('returns "is-inline" if component is not sticky', () => {
        toggle.config.toggle.sticky = false;
        assert.equal(toggle.view.stickyClass, 'is-inline');
      });
    });

    describe('outerHeight', () => {
      it('returns the wrapper\'s client height in px', () => {
        toggle.view.wrapper = {clientHeight: 5};
        assert.equal(toggle.view.outerHeight, '5px');
      });
    });

    describe('readableLabel', () => {
      it('returns empty string if content title exists', () => {
        toggle.config.toggle.contents = {
          title: true,
        };
        assert.equal(toggle.view.readableLabel, '');
      });

      it('returns a p element with text title if content title does not exist', () => {
        toggle.config.toggle = {
          contents: {title: false},
          text: {title: 'title'},
        };
        assert.equal(toggle.view.readableLabel, `<p class="shopify-buy--visually-hidden">${toggle.options.text.title}</p>`);
      });
    });
  });
});
