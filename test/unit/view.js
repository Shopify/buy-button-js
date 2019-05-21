import View from '../../src/view';
import Component from '../../src/component';
import Template from '../../src/template';
import Iframe from '../../src/iframe';
import * as elementClass from '../../src/utils/element-class';

describe('View class', () => {
  describe('constructor', () => {
    let component;
    let view;

    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
      });
      view = new View(component);
    });

    it('stores component to instance', () => {
      assert.equal(view.component, component);
    });

    it('sets iframe to null', () => {
      assert.equal(view.iframe, null);
    });

    it('sets node to component\'s node', () => {
      assert.equal(view.node, component.node);
    });

    it('creates a template instance', () => {
      assert.instanceOf(view.template, Template);
    });

    it('sets eventBound to false', () => {
      assert.equal(view.eventsBound, false);
    });
  });

  describe('prototype methods', () => {
    let component;
    let view;

    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
      }, {browserFeatures: {}});
      view = new View(component);
      component.typeKey = 'product';
    });

    describe('init()', () => {
      let loadStub;
      let addClassStub;
      const loadRes = 'done';

      beforeEach(() => {
        loadStub = sinon.stub(Iframe.prototype, 'load').resolves(loadRes);
        addClassStub = sinon.stub(Iframe.prototype, 'addClass');
        component = Object.defineProperty(component, 'options', {
          writable: true,
          value: {
            iframe: true,
            manifest: ['product', 'option'],
          },
        });
      });

      afterEach(() => {
        loadStub.restore();
        addClassStub.restore();
      });

      it('returns a promise if iframe option is false', async () => {
        component.options.iframe = false;
        const iframe = await view.init();
        assert.isNull(iframe);
      });

      it('returns the iframe if it already exists', async () => {
        view.iframe = 'iframe';
        const iframe = await view.init();
        assert.equal(iframe, view.iframe);
      });

      it('creates and loads an Iframe', async () => {
        await view.init();
        assert.instanceOf(view.iframe, Iframe);
        assert.calledOnce(loadStub);
      });

      it('returns the response of iframe\'s load()', async () => {
        const response = await view.init();
        assert.equal(response, loadRes);
      });

      it('adds view\'s className to iframe', async () => {
        await view.init();
        assert.calledOnce(addClassStub);
        assert.calledWith(addClassStub, view.className);
      });

      it('adds class name dependent on typeKey to component node', async () => {
        component.typeKey = 'typeKey';
        await view.init();
        assert.equal(component.node.className, ' shopify-buy-frame shopify-buy-frame--typeKey');
      });
    });

    describe('render()', () => {
      let userEventStub;
      let templateRenderStub;
      let wrapTemplateStub;
      let createWrapperStub;
      let updateNodeStub;
      let resizeStub;
      let div;
      let htmlTemplate;
      let wrapTemplateReturnVal;

      beforeEach(() => {
        div = document.createElement('div');
        htmlTemplate = '<div>test</div>';
        wrapTemplateReturnVal = 'wrapped';
        userEventStub = sinon.stub(component, '_userEvent');
        templateRenderStub = sinon.stub(view.template, 'render').returns(htmlTemplate);
        wrapTemplateStub = sinon.stub(view, 'wrapTemplate').returns(wrapTemplateReturnVal);
        createWrapperStub = sinon.stub(view, '_createWrapper').returns(div);
        updateNodeStub = sinon.stub(view, 'updateNode');
        resizeStub = sinon.stub(view, 'resize');
      });

      afterEach(() => {
        userEventStub.restore();
        templateRenderStub.restore();
        wrapTemplateStub.restore();
        createWrapperStub.restore();
        updateNodeStub.restore();
        resizeStub.restore();
      });

      it('renders template by passing in viewData and callback function to template\'s render', () => {
        view.render();
        assert.calledOnce(templateRenderStub);
        assert.deepEqual(templateRenderStub.getCall(0).args[0], {data: component.viewData});
        const renderCb = templateRenderStub.getCall(0).args[1]('test');
        assert.calledOnce(wrapTemplateStub);
        assert.calledWith(wrapTemplateStub, 'test');
        assert.equal(renderCb, wrapTemplateReturnVal);
      });

      it('calls component\'s user event before and after render', () => {
        view.render();
        assert.calledTwice(userEventStub);
        assert.calledWith(userEventStub.getCall(0), 'beforeRender');
        assert.calledWith(userEventStub.getCall(1), 'afterRender');
        assert.calledOnce(templateRenderStub);
      });

      it('creates a wrapper if one does not already exist', () => {
        view.wrapper = null;
        view.render();
        assert.calledOnce(createWrapperStub);
        assert.equal(view.wrapper, div);
      });

      it('does not create a new wrapper if one already exists', () => {
        view.wrapper = document.createElement('div');
        view.render();
        assert.notCalled(createWrapperStub);
      });

      it('updates node with wrapper and html then resizes', () => {
        view.render();
        assert.calledOnce(updateNodeStub);
        assert.calledWith(updateNodeStub, view.wrapper, htmlTemplate);
        assert.calledOnce(resizeStub);
      });
    });

    describe('delegateEvents()', () => {
      let addEventListenerSpy;
      let clickBtnSpy;
      let clickSpy;
      let closeComponentsOnEscStub;
      let onStub;

      beforeEach(() => {
        addEventListenerSpy = sinon.spy();
        clickBtnSpy = sinon.spy();
        clickSpy = sinon.spy();
        component = Object.defineProperty(component, 'DOMEvents', {
          value: {
            'click .btn': clickBtnSpy,
            click: clickSpy,
          },
        });
        view.wrapper = {
          addEventListener: addEventListenerSpy,
        };
        closeComponentsOnEscStub = sinon.stub(view, 'closeComponentsOnEsc');
        onStub = sinon.stub(view, '_on');
      });

      afterEach(() => {
        closeComponentsOnEscStub.restore();
        onStub.restore();
      });

      it('calls closeComponentsOnEsc()', () => {
        view.delegateEvents();
        assert.calledOnce(closeComponentsOnEscStub);
      });

      it('calls _on for each DOM event with a selector', () => {
        const event = new Event('click');
        const target = document.createElement('div');
        view.delegateEvents();
        assert.calledOnce(onStub);
        assert.calledWith(onStub, 'click', '.btn');
        onStub.getCall(0).args[2](event, target);
        assert.calledOnce(clickBtnSpy);
        assert.calledWith(clickBtnSpy, event, target);
      });

      it('adds event listener for DOM event without a selector', () => {
        const event = new Event('click');
        view.delegateEvents();
        assert.calledWith(addEventListenerSpy, 'click');
        addEventListenerSpy.getCall(0).args[1](event);
        assert.calledOnce(clickSpy);
        assert.calledWith(clickSpy, event);
      });

      it('binds events and sets eventsBound to true if eventsBound is false', () => {
        view.eventsBound = false;
        view.delegateEvents();
        assert.called(closeComponentsOnEscStub);
        assert.called(onStub);
        assert.called(addEventListenerSpy);
        assert.equal(view.eventsBound, true);
      });

      it('prevents rebinding if events are already bound', () => {
        view.eventsBound = true;
        assert.notCalled(closeComponentsOnEscStub);
        assert.notCalled(onStub);
        assert.notCalled(addEventListenerSpy);
      });

      it('sets iframe.el.onload to null and reloads iframe when iframe.el.onload is called if iframe already exists', () => {
        const reloadIframeStub = sinon.stub(view, 'reloadIframe');
        view.iframe = {el: {}};

        view.delegateEvents();
        assert.instanceOf(view.iframe.el.onload, Function);
        view.iframe.el.onload();
        assert.equal(view.iframe.el.onload, null);
        assert.calledOnce(reloadIframeStub);
        reloadIframeStub.restore();
      });
    });

    describe('reloadIframe()', () => {
      it('removes iframe and initializes component', () => {
        const el = document.createElement('div');
        view.iframe = {el};
        view.wrapper = {};
        const removeChildStub = sinon.stub(view.node, 'removeChild');
        const initStub = sinon.stub(view.component, 'init');

        view.reloadIframe();
        assert.calledOnce(removeChildStub);
        assert.calledWith(removeChildStub, el);
        assert.isNull(view.wrapper);
        assert.isNull(view.iframe);
        assert.calledOnce(initStub);

        removeChildStub.restore();
        initStub.restore();
      });
    });

    describe('append()', () => {
      it('appends to document if iframe exists', () => {
        const appendChildSpy = sinon.spy();
        const div = document.createElement('div');
        view.iframe = {
          document: {
            body: {
              appendChild: appendChildSpy,
            },
          },
        };
        view.append(div);
        assert.calledOnce(appendChildSpy);
        assert.calledWith(appendChildSpy, div);
      });

      it('appends to node if iframe does not exist', () => {
        const div = document.createElement('div');
        const appendChildStub = sinon.stub(view.component.node, 'appendChild');
        view.iframe = null;
        view.append(div);
        assert.calledOnce(appendChildStub);
        assert.calledWith(appendChildStub, div);
        appendChildStub.restore();
      });
    });

    describe('addClass()', () => {
      let addClassToElementStub;
      let addClassSpy;

      beforeEach(() => {
        addClassSpy = sinon.spy();
        view.iframe = {addClass: addClassSpy};
        addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');
      });

      afterEach(() => {
        addClassToElementStub.restore();
      });

      it('adds class to iframe if iframe exists', () => {
        view.addClass('test-class');
        assert.calledOnce(addClassSpy);
        assert.calledWith(addClassSpy, 'test-class');
        assert.notCalled(addClassToElementStub);
      });

      it('adds class to element if iframe does not exist', () => {
        view.iframe = null;
        view.addClass('test-class');
        assert.calledOnce(addClassToElementStub);
        assert.calledWith(addClassToElementStub, 'test-class', view.component.node);
      });
    });

    describe('removeClass()', () => {
      let removeClassFromElementStub;
      let removeClassSpy;

      beforeEach(() => {
        removeClassSpy = sinon.spy();
        view.iframe = {removeClass: removeClassSpy};
        removeClassFromElementStub = sinon.stub(elementClass, 'removeClassFromElement');
      });

      afterEach(() => {
        removeClassFromElementStub.restore();
      });

      it('removes class from iframe if iframe exists', () => {
        view.removeClass('test-class');
        assert.calledOnce(removeClassSpy);
        assert.calledWith(removeClassSpy, 'test-class');
        assert.notCalled(removeClassFromElementStub);
      });

      it('removes class from element if iframe does not exist', () => {
        view.iframe = null;
        view.removeClass('test-class');
        assert.calledOnce(removeClassFromElementStub);
        assert.calledWith(removeClassFromElementStub, 'test-class', view.component.node);
      });
    });

    describe('destroy()', () => {
      it('removes node from parent', () => {
        const removeChildSpy = sinon.spy();
        view.node = {
          parentNode: {
            removeChild: removeChildSpy,
          },
        };
        view.destroy();
        assert.calledOnce(removeChildSpy);
        assert.calledWith(removeChildSpy, view.node);
      });
    });

    describe('renderChild()', () => {
      it('updates node with new node and html created from class name and template params', () => {
        const html = '<h1>test</h1>';
        const node = document.createElement('div');
        const renderStub = sinon.stub().returns(html);
        const querySelectorStub = sinon.stub().returns(node);
        const template = {
          render: renderStub,
        };
        view.wrapper = {
          querySelector: querySelectorStub,
        };
        const updateNodeStub = sinon.stub(view, 'updateNode');

        view.renderChild('class1 class2', template);

        assert.calledOnce(querySelectorStub);
        assert.calledWith(querySelectorStub, '.class1.class2');

        assert.calledOnce(renderStub);
        assert.deepEqual(renderStub.getCall(0).args[0], {data: view.component.viewData});

        assert.calledOnce(updateNodeStub);
        assert.calledWith(updateNodeStub, node, html);

        updateNodeStub.restore();
      });
    });

    describe('updateNode()', () => {
      it('updates contents of node', () => {
        const div = document.createElement('div');
        div.innerHTML = '<h1>old</h1>';
        const html = '<h1>new</h1>';
        view.updateNode(div, `<div>${html}</div>`);
        assert.equal(div.innerHTML, html);
      });
    });

    describe('wrapTemplate()', () => {
      it('puts strings in a div with typeKey\'s class and html', () => {
        component.typeKey = 'typeKey';
        component = Object.defineProperty(component, 'classes', {
          value: {typeKey: {typeKey: 'testClass'}},
        });
        const string = view.wrapTemplate('test');
        assert.equal(string, '<div class="testClass">test</div>');
      });
    });

    describe('resize()', () => {
      let resizeXStub;
      let resizeYStub;

      beforeEach(() => {
        resizeXStub = sinon.stub(view, '_resizeX');
        resizeYStub = sinon.stub(view, '_resizeY');
      });

      afterEach(() => {
        resizeXStub.restore();
        resizeYStub.restore();
      });

      it('does not resize if there is no iframe', () => {
        view.iframe = null;
        view.wrapper = {};
        view.resize();
        assert.notCalled(resizeXStub);
        assert.notCalled(resizeYStub);
      });

      it('does not resize if there is no wrapper', () => {
        view.iframe = {};
        view.wrapper = null;
        view.resize();
        assert.notCalled(resizeXStub);
        assert.notCalled(resizeYStub);
      });

      it('resizes iframe width if shouldResizeX is true', () => {
        view.iframe = {};
        view.wrapper = document.createElement('div');
        view = Object.defineProperty(view, 'shouldResizeX', {
          value: true,
        });
        view.resize();
        assert.calledOnce(resizeXStub);
        assert.notCalled(resizeYStub);
      });

      it('resizes iframe height if shouldResizeY is true', () => {
        view.iframe = {};
        view.wrapper = document.createElement('div');
        view = Object.defineProperty(view, 'shouldResizeY', {
          value: true,
        });
        view.resize();
        assert.calledOnce(resizeYStub);
        assert.notCalled(resizeXStub);
      });
    });

    describe('setFocus()', () => {
      it('focuses first focusable element in wrapper', () => {
        view.wrapper = document.createElement('div');
        view.wrapper.append(document.createElement('a'));
        view.wrapper.append(document.createElement('button'));
        const focusStub = sinon.stub(view.wrapper.firstElementChild, 'focus');
        view.setFocus();
        assert.calledOnce(focusStub);
        focusStub.restore();
      });
    });

    describe('closeComponentsOnEsc()', () => {
      let event;
      let closeModalSpy;
      let closeCartSpy;

      beforeEach(() => {
        closeModalSpy = sinon.spy();
        closeCartSpy = sinon.spy();
        component.props = {
          closeModal: closeModalSpy,
          closeCart: closeCartSpy,
        };
        view = Object.defineProperty(view, 'document', {
          value: document,
        });
        event = new Event('keydown');
      });

      it('does not add event listener if there is no iframe', () => {
        view.iframe = null;
        const addEventListenerStub = sinon.stub(view.document, 'addEventListener');
        view.closeComponentsOnEsc();
        assert.notCalled(addEventListenerStub);
        addEventListenerStub.restore();
      });

      it('closes modal and cart when escape key is pressed', () => {
        view.iframe = {};
        event.keyCode = 27; // escape key

        view.closeComponentsOnEsc();
        view.document.dispatchEvent(event);
        assert.calledOnce(closeModalSpy);
        assert.calledOnce(closeCartSpy);
      });

      it('does not close modal or cart when any key except escape is pressed', () => {
        view.iframe = {};
        event.keyCode = 999;

        view.closeComponentsOnEsc();
        view.document.dispatchEvent(event);
        assert.notCalled(closeModalSpy);
        assert.notCalled(closeCartSpy);
      });
    });

    describe('animateRemoveNode()', () => {
      let node;
      let removeNodeStub;
      let event;
      let addClassToElementStub;

      beforeEach(() => {
        node = document.createElement('div');
        node.setAttribute('id', 123);
        document.body.appendChild(node);
        removeNodeStub = sinon.stub(view, 'removeNode');
        addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');
        event = new Event('animationend');
      });

      afterEach(() => {
        document.body.removeChild(node);
        removeNodeStub.restore();
        addClassToElementStub.restore();
      });

      it('adds is-hidden class to element', () => {
        view.animateRemoveNode(123);
        assert.calledOnce(addClassToElementStub);
        assert.calledWith(addClassToElementStub, 'is-hidden', node);
      });

      it('removes node on animationend event if animation is supported and element has a parent node', () => {
        view.component.props.browserFeatures.animation = true;
        view.animateRemoveNode(123);
        node.dispatchEvent(event);
        assert.calledOnce(removeNodeStub);
        assert.calledWith(removeNodeStub, node);
      });

      it('removes the node if animation is not supported', () => {
        component.props.browserFeatures.animation = false;
        view.animateRemoveNode(123);
        assert.calledOnce(removeNodeStub);
        assert.calledWith(removeNodeStub, node);
      });
    });

    describe('removeNode()', () => {
      it('removes node and calls render', () => {
        const removeChildSpy = sinon.spy();
        const renderStub = sinon.stub(view, 'render');
        const el = {
          parentNode: {removeChild: removeChildSpy},
        };
        view.removeNode(el);
        assert.calledOnce(removeChildSpy);
        assert.calledWith(removeChildSpy, el);
        assert.calledOnce(renderStub);
        renderStub.restore();
      });
    });

    describe('getters', () => {
      describe('outerHeight', () => {
        let getPropertyValueSpy;

        beforeEach(() => {
          view.wrapper = document.createElement('div');
          getPropertyValueSpy = sinon.spy(CSSStyleDeclaration.prototype, 'getPropertyValue');
        });

        afterEach(() => {
          getPropertyValueSpy.restore();
        });

        it('returns wrapper height if there is no styling on wrapper', () => {
          view.wrapper = {clientHeight: 10};
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(null);
          assert.equal(view.outerHeight, '10px');
          getComputedStyleStub.restore();
        });

        it('returns the height of the wrapper set in style', () => {
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          view.wrapper.style.height = '50px';
          assert.equal(view.outerHeight, '50px');
          getComputedStyleStub.restore();
        });

        it('returns wrapper\'s client height if height is not set in style', () => {
          view.wrapper = {
            clientHeight: 20,
            style: {
              height: '',
              getPropertyValue: sinon.spy(),
            },
          };
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          assert.equal(view.outerHeight, '20px');
          getComputedStyleStub.restore();
        });

        it('calls getPropertyValue() twice if height is not set in style', () => {
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          view.wrapper.style.height = '';
          assert.equal(view.outerHeight, `${view.wrapper.clientHeight}px`);
          assert.calledTwice(getPropertyValueSpy);
          assert.calledWith(getPropertyValueSpy, 'height');
          getComputedStyleStub.restore();
        });

        it('calls getPropertyValue() twice if height is set to 0px in style', () => {
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          view.wrapper.style.height = '0px';
          assert.equal(view.outerHeight, '0px');
          assert.calledTwice(getPropertyValueSpy);
          assert.calledWith(getPropertyValueSpy, 'height');
          getComputedStyleStub.restore();
        });

        it('calls getPropertyValue() twice if height is set to auto in style', () => {
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          view.wrapper.style.height = 'auto';
          assert.equal(view.outerHeight, 'auto');
          assert.calledTwice(getPropertyValueSpy);
          assert.calledWith(getPropertyValueSpy, 'height');
          getComputedStyleStub.restore();
        });

        it('calls getPropertyValue() once if height is set to a value in style', () => {
          const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
          view.wrapper.style.height = '30px';
          assert.equal(view.outerHeight, '30px');
          assert.calledOnce(getPropertyValueSpy);
          assert.calledWith(getPropertyValueSpy, 'height');
          getComputedStyleStub.restore();
        });
      });

      describe('className', () => {
        it('returns an empty string', () => {
          assert.equal(view.className, '');
        });
      });

      describe('shouldResizeX', () => {
        it('returns false', () => {
          assert.equal(view.shouldResizeX, false);
        });
      });

      describe('shouldResizeY', () => {
        it('returns false', () => {
          assert.equal(view.shouldResizeY, false);
        });
      });

      describe('document', () => {
        it('returns iframe\'s document if iframe exists', () => {
          view.iframe = {document: {}};
          assert.equal(view.document, view.iframe.document);
        });

        it('returns window\'s document if iframe does not exist', () => {
          view.iframe = null;
          assert.equal(view.document, window.document);
        });
      });
    });

    describe('"private" methods', () => {
      describe('_createWrapper()', () => {
        let createElementStub;
        let appendStub;
        let mockWrapper;

        beforeEach(() => {
          mockWrapper = document.createElement('div');
          createElementStub = sinon.stub(document, 'createElement').returns(mockWrapper);
          appendStub = sinon.stub(view, 'append');
        });

        afterEach(() => {
          createElementStub.restore();
          appendStub.restore();
        });

        it('creates a wrapper and appends it to view', () => {
          view._createWrapper();
          assert.calledOnce(createElementStub);
          assert.calledWith(createElementStub, 'div');
          assert.calledOnce(appendStub);
          assert.calledWith(appendStub, mockWrapper);
        });

        it('returns the newly created wrapper', () => {
          assert.equal(view._createWrapper(), mockWrapper);
        });

        it('adds component type class to wrapper', () => {
          component.typeKey = 'cart';
          component = Object.defineProperty(component, 'classes', {
            value: {
              cart: {cart: 'class-name'},
            },
          });
          assert.equal(view._createWrapper().className, 'class-name');
        });
      });

      describe('_resizeX()', () => {
        it('sets the iframe width to the body\'s client width', () => {
          view.iframe = {el: {style: {}}};
          view = Object.defineProperty(view, 'document', {
            value: {
              body: {clientWidth: 10},
            },
          });
          view._resizeX();
          assert.equal(view.iframe.el.style.width, '10px');
        });
      });

      describe('_resizeY()', () => {
        beforeEach(() => {
          view.iframe = {el: {style: {}}};
        });

        it('sets the iframe height to param value', () => {
          view._resizeY('20px');
          assert.equal(view.iframe.el.style.height, '20px');
        });

        it('sets the iframe height to outer height if param is not passed in', () => {
          view = Object.defineProperty(view, 'outerHeight', {
            value: '30px',
          });
          view._resizeY();
          assert.equal(view.iframe.el.style.height, '30px');
        });
      });

      describe('_on()', () => {
        describe('addEventListener tests', () => {
          let addEventListenerSpy;

          beforeEach(() => {
            addEventListenerSpy = sinon.spy();
            view.wrapper = {addEventListener: addEventListenerSpy};
          });

          it('calls addEventListener with eventName', () => {
            view._on('test', '', '');
            assert.calledOnce(addEventListenerSpy);
            assert.calledWith(addEventListenerSpy, 'test');
          });

          it('executes event handler in capturing phase when event is blur', () => {
            view._on('blur', '', '');
            assert.calledOnce(addEventListenerSpy);
            assert.calledWith(addEventListenerSpy, 'blur', sinon.match.any, true);
          });
        });

        describe('event listener tests', () => {
          let functionSpy;
          let event;
          let button;

          beforeEach(() => {
            functionSpy = sinon.spy();
            event = new Event('click', {bubbles: true});
            button = document.createElement('button');
            button.className = 'btn';
            view.wrapper = document.createElement('div');
            view.wrapper.appendChild(button);
          });

          it('calls function on event if target matches selector', () => {
            view._on('click', '.btn', functionSpy);
            view.wrapper.firstChild.dispatchEvent(event);
            assert.calledOnce(functionSpy);
            assert.calledWith(functionSpy, event, button);
          });

          it('does not call function if target does not match selector', () => {
            view._on('click', '.not-btn', functionSpy);
            view.wrapper.firstChild.dispatchEvent(event);
            assert.notCalled(functionSpy);
          });
        });
      });
    });
  });
});

