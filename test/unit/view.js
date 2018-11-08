import View from '../../src/view';
import Component from '../../src/component';
import Template from '../../src/template';
import Iframe from '../../src/iframe';
import * as elementClass from '../../src/utils/element-class';

describe('View class', () => {
  let component;
  let view;

  beforeEach(() => {
    component = new Component({
      id: 1234,
      node: document.createElement('div'),
    }, {browserFeatures: {}});
    view = new View(component);
  });

  describe('constructor', () => {
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

  describe('init()', () => {
    beforeEach(() => {
      component.typeKey = 'product';
    });

    it('returns a promise if iframe option is false', () => {
      component.config.product.iframe = false;
      return view.init().then((iframe) => {
        assert.isNull(iframe);
      });
    });

    it('loads an Iframe', () => {
      component.config.product.iframe = true;
      const loadStub = sinon.stub(Iframe.prototype, 'load').resolves();
      const addClassSpy = sinon.spy(Iframe.prototype, 'addClass');
      return view.init().then(() => {
        assert.instanceOf(view.iframe, Iframe);
        assert.equal(component.node.className, ' shopify-buy-frame shopify-buy-frame--product');
        assert.calledOnce(loadStub);
        assert.calledWith(addClassSpy, '');
        loadStub.restore();
        addClassSpy.restore();
      });
    });
  });

  describe('render()', () => {
    beforeEach(() => {
      component.typeKey = 'product';
    });

    it('creates div and updates html', () => {
      const div = document.createElement('div');
      const tmplRender = sinon.stub(view.template, 'render').returns('<div>LOL</div>');
      const createWrapperStub = sinon.stub(view, '_createWrapper').returns(div);
      view.resize = sinon.spy();
      view.updateNode = sinon.spy();
      view.render();
      assert.calledOnce(createWrapperStub);
      assert.calledOnce(view.resize);
      assert.calledWith(view.updateNode, div, '<div>LOL</div>');
      tmplRender.restore();
      createWrapperStub.restore();
    });

    it('does not make a new wrapper if one already exists', () => {
      view.wrapper = {};
      const tmplRender = sinon.stub(view.template, 'render').returns('<div>LOL</div>');
      const createWrapperStub = sinon.stub(view, '_createWrapper');
      const updateNodeStub = sinon.stub(view, 'updateNode');

      view.render();
      assert.notCalled(createWrapperStub);
      tmplRender.restore();
      createWrapperStub.restore();
      updateNodeStub.restore();
    });
  });

  describe('delegateEvents()', () => {
    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
        options: {
          product: {
            DOMEvents: {
              'click .btn'() { return true; },
              click() { return true; },
            },
          },
        },
      }, {browserFeatures: {}});
      view = new View(component);
      component.typeKey = 'product';
    });

    it('calls closeComponentsOnEsc', () => {
      const closeComponentsOnEscStub = sinon.stub(view, 'closeComponentsOnEsc');
      view.wrapper = {
        addEventListener: sinon.spy(),
      };
      view.delegateEvents();
      assert.calledOnce(closeComponentsOnEscStub);
      closeComponentsOnEscStub.restore();
    });

    it('calls _on for each DOM event', () => {
      const onStub = sinon.stub(view, '_on');
      view.wrapper = {
        addEventListener: sinon.spy(),
      };
      view.delegateEvents();
      assert.calledWith(onStub, 'click', '.btn', sinon.match.func);
      assert.calledWith(view.wrapper.addEventListener, 'click', sinon.match.func);
    });

    it('bind events if eventsBound is false', () => {
      view.wrapper = {
        addEventListener: sinon.spy(),
      };
      view.delegateEvents();
      assert.called(view.wrapper.addEventListener);
    });

    it('prevents rebinding if events already bound', () => {
      view.wrapper = {
        addEventListener: sinon.spy(),
      };
      view.eventsBound = true;
      view.delegateEvents();
      assert.notCalled(view.wrapper.addEventListener);
    });

    it('sets iframe.el.onload to reloadIframe() if iframe already exists', () => {
      const reloadIframeStub = sinon.stub(view, 'reloadIframe');
      const closeComponentsOnEscStub = sinon.stub(view, 'closeComponentsOnEsc');
      view.wrapper = {
        addEventListener: sinon.spy(),
      };
      view.iframe = {el: {}};

      view.delegateEvents();
      view.iframe.el.onload();
      assert.calledOnce(reloadIframeStub);
      reloadIframeStub.restore();
      closeComponentsOnEscStub.restore();
    });
  });

  describe('reloadIframe()', () => {
    it('removes iframe and calls component.init', () => {
      view.iframe = {el: 'test'};
      view.wrapper = {};
      const removeChildStub = sinon.stub(view.node, 'removeChild');
      const initStub = sinon.stub(view.component, 'init');

      view.reloadIframe();
      assert.calledWith(removeChildStub, 'test');
      assert.isNull(view.wrapper);
      assert.isNull(view.iframe);
      assert.calledOnce(initStub);
    });
  });

  describe('append()', () => {
    it('appends to document if iframe', () => {
      const div = document.createElement('div');
      view.iframe = {
        document: {
          body: {
            appendChild: sinon.spy(),
          },
        },
      };
      view.append(div);
      assert.calledWith(view.iframe.document.body.appendChild, div);
    });

    it('appends to node if no iframe', () => {
      const div = document.createElement('div');
      const appendChildSpy = sinon.spy(view.component.node, 'appendChild');
      view.iframe = null;
      view.append(div);
      assert.calledWith(appendChildSpy, div);
    });
  });

  describe('addClass()', () => {
    it('adds class to iframe if iframe exists', () => {
      view.iframe = {addClass: sinon.spy()};
      view.addClass('test-class');
      assert.calledWith(view.iframe.addClass, 'test-class');
    });

    it('calls addClassToElement if iframe does not exist', () => {
      const addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');

      view.addClass('test-class');
      assert.calledWith(addClassToElementStub, 'test-class');
      addClassToElementStub.restore();
    });
  });

  describe('removeClass()', () => {
    it('removes class from iframe if iframe exists', () => {
      view.iframe = {removeClass: sinon.spy()};
      view.removeClass('test-class');
      assert.calledWith(view.iframe.removeClass, 'test-class');
    });

    it('calls removeClassToElement if iframe does not exist', () => {
      const removeClassFromElementStub = sinon.stub(elementClass, 'removeClassFromElement');

      view.removeClass('test-class');
      assert.calledWith(removeClassFromElementStub, 'test-class');
      removeClassFromElementStub.restore();
    });
  });

  describe('destroy()', () => {
    it('removes node from parent', () => {
      view.node = {
        parentNode: {
          removeChild: sinon.spy(),
        },
      };
      view.destroy();
      assert.calledOnce(view.node.parentNode.removeChild);
    });
  });

  describe('renderChild()', () => {
    it('calls updateNode with node and html', () => {
      component = new Component({
        id: 1234,
        options: {
          product: {
            viewData: {
              title: 'lol',
            },
          },
        },
      }, {browserFeatures: {}});
      component.typeKey = 'product';
      view = new View(component);
      const template = {
        render: sinon.stub().returns('<h1>BUY MY BUTTONS lol</h1>'),
      };
      view.updateNode = sinon.spy();
      view.wrapper = document.createElement('div');
      const childNode = document.createElement('div');
      childNode.className = 'title';
      view.wrapper.appendChild(childNode);

      view.renderChild('title', template);
      assert.calledWith(view.updateNode, childNode, '<h1>BUY MY BUTTONS lol</h1>');
      assert.calledWith(template.render, sinon.match.has('data'));
    });
  });

  describe('updateNode()', () => {
    it('updates contents of node', () => {
      const div = document.createElement('div');
      div.innerHTML = '<h1>OLD TEXT</h1>';
      const html = '<h1>SO FRESH</h1>';
      view.updateNode(div, `<div>${html}</div>`);
      assert.equal(div.innerHTML, html);
    });
  });

  describe('wrapTemplate()', () => {
    it('puts strings in a div', () => {
      component.typeKey = 'product';
      const string = view.wrapTemplate('test');
      assert.equal(string, '<div class="shopify-buy__product">test</div>');
    });
  });

  describe('resize()', () => {
    let resizeX;
    let resizeY;

    beforeEach(() => {
      resizeX = sinon.spy(view, '_resizeX');
      resizeY = sinon.spy(view, '_resizeY');
    });

    afterEach(() => {
      resizeX.restore();
      resizeY.restore();
    });

    it('does nothing if no iframe or no wrapper', () => {
      view.iframe = null;
      view.resize();
      assert.notCalled(resizeX);
      assert.notCalled(resizeY);
      view.iframe = true;
      view.wrapper = null;
      assert.notCalled(resizeX);
      assert.notCalled(resizeY);
    });

    it('resizes iframe width when shouldResizeX is true', () => {
      const iframe = document.createElement('iframe');
      const iframeWidth = 100;
      view = Object.defineProperty(view, 'shouldResizeX', {
        value: true,
        writable: false,
      });
      view.wrapper = document.createElement('div');
      view.iframe = {
        el: iframe,
        document: {
          body: {
            clientWidth: iframeWidth,
          },
        },
      };
      view.resize();
      assert.called(resizeX);
      assert.notCalled(resizeY);
      assert.equal(iframe.style.width, `${iframeWidth}px`);
    });

    it('resizes iframe height when shouldResizeY is true', () => {
      const iframe = document.createElement('iframe');
      const iframeHeight = '50px';
      view = Object.defineProperty(view, 'shouldResizeY', {
        value: true,
        writable: false,
      });
      view = Object.defineProperty(view, 'outerHeight', {
        value: iframeHeight,
        writable: false,
      });
      view.wrapper = document.createElement('div');
      view.iframe = {
        el: iframe,
      };
      view.resize();
      assert.called(resizeY);
      assert.notCalled(resizeX);
      assert.equal(iframe.style.height, iframeHeight);
    });
  });

  describe('setFocus()', () => {
    it('focuses first focusable element in wrapper', () => {
      view.wrapper = document.createElement('div');
      view.wrapper.append(document.createElement('a'));
      view.wrapper.append(document.createElement('button'));
      const focusSpy = sinon.spy(view.wrapper.firstElementChild, 'focus');
      view.setFocus();
      assert.calledOnce(focusSpy);
      focusSpy.restore();
    });
  });

  describe('closeComponentsOnEsc()', () => {
    let node;
    let event;
    let closeModalSpy;
    let closeCartSpy;

    beforeEach(() => {
      closeModalSpy = sinon.spy();
      closeCartSpy = sinon.spy();
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
      }, {
        closeModal: closeModalSpy,
        closeCart: closeCartSpy,
      });
      view = new View(component);
      component.typeKey = 'product';
      node = document.createElement('div');
      node.setAttribute('id', 123);
      document.body.appendChild(node);
      event = new Event('keydown');
    });

    afterEach(() => {
      document.body.removeChild(node);
    });

    it('does not add event listener if there is no iframe', () => {
      view.iframe = null;
      const addEventListenerStub = sinon.stub(view.document, 'addEventListener');
      view.closeComponentsOnEsc();
      assert.notCalled(addEventListenerStub);
      addEventListenerStub.restore();
    });

    it('calls closeModal and closeCart when escape key is pressed', () => {
      const loadStub = sinon.stub(Iframe.prototype, 'load').resolves();
      event.keyCode = 27; // escape key
      component.config.product.iframe = true;

      return view.init().then(() => {
        view.iframe.el = {document: window.document};
        view.closeComponentsOnEsc();
        view.document.dispatchEvent(event);
        assert.calledOnce(closeModalSpy);
        assert.calledOnce(closeCartSpy);
        loadStub.restore();
      });
    });

    it('does not do anything when any key except escape is pressed', () => {
      const loadStub = sinon.stub(Iframe.prototype, 'load').resolves();
      event.keyCode = 999;
      component.config.product.iframe = true;

      return view.init().then(() => {
        view.iframe.el = {document: window.document};
        view.closeComponentsOnEsc();
        view.document.dispatchEvent(event);
        assert.notCalled(closeModalSpy);
        assert.notCalled(closeCartSpy);
        loadStub.restore();
      });
    });
  });

  describe('animateRemoveNode()', () => {
    let node;

    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
      }, {browserFeatures: {animation: true}});
      view = new View(component);
      node = document.createElement('div');
      node.setAttribute('id', 123);
      document.body.appendChild(node);
      node.addEventListener = sinon.spy();
    });

    afterEach(() => {
      document.body.removeChild(node);
    });

    it('adds event listener on animationend if browser supports it', () => {
      view.animateRemoveNode(123);
      assert.calledWith(node.addEventListener, 'animationend');
    });

    it('removes the node if animation is not supported', () => {
      component.props.browserFeatures.animation = false;
      view.removeNode = sinon.spy();
      view.animateRemoveNode(123);
      assert.calledOnce(view.removeNode);
    });
  });

  describe('removeNode()', () => {
    it('removes node and calls render', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 123);
      document.body.appendChild(div);
      view.render = sinon.spy();
      view.removeNode(div);
      assert.notOk(document.getElementById(123));
      assert.calledOnce(view.render);
    });
  });

  describe('getters', () => {
    describe('get outerHeight', () => {
      it('returns wrapper height if there is no styling on wrapper', () => {
        view.wrapper = {clientHeight: 10};
        const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(null);
        assert.equal(view.outerHeight, '10px');
        getComputedStyleStub.restore();
      });

      it('returns the height of the wrapper', () => {
        view.wrapper = document.createElement('div');
        const getComputedStyleStub = sinon.stub(window, 'getComputedStyle').returns(view.wrapper.style);
        view.wrapper.style.height = '50px';
        assert.equal(view.outerHeight, '50px');
        getComputedStyleStub.restore();
      });

      it('returns clientHeight is height is not set in style', () => {
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
    });

    describe('get className', () => {
      it('returns an empty string', () => {
        assert.equal(view.className, '');
      });
    });

    describe('get shouldResizeX', () => {
      it('returns false', () => {
        assert.equal(view.shouldResizeX, false);
      });
    });

    describe('get shouldResizeY', () => {
      it('returns false', () => {
        assert.equal(view.shouldResizeY, false);
      });
    });

    describe('get document', () => {
      it('returns iframe.document if iframe exists', () => {
        view.iframe = {document: 'hello'};
        assert.equal(view.document, 'hello');
      });

      it('returns window.document if iframe does not exist', () => {
        view.iframe = null;
        assert.equal(view.document, window.document);
      });
    });
  });

  describe('private methods', () => {
    describe('_createWrapper()', () => {
      it('creates a wrapper and appends it to view', () => {
        const createElementSpy = sinon.spy(document, 'createElement');
        const appendStub = sinon.stub(view, 'append');
        component.typeKey = 'product';
        view._createWrapper();
        assert.calledWith(createElementSpy, 'div');
        assert.calledOnce(appendStub);
        appendStub.restore();
        createElementSpy.restore();
      });

      it('returns the newly created wrapper', () => {
        const mockWrapper = {};
        const createElementStub = sinon.stub(document, 'createElement').returns(mockWrapper);
        const appendStub = sinon.stub(view, 'append');
        component.typeKey = 'product';
        assert.equal(view._createWrapper(), mockWrapper);
        createElementStub.restore();
        appendStub.restore();
      });

      it('adds component type class to wrapper', () => {
        component.typeKey = 'product';
        assert.equal(view._createWrapper().className, 'shopify-buy__product');
      });
    });

    describe('_on()', () => {
      it('calls addEventListener with eventName', () => {
        const addEventListenerSpy = sinon.spy();
        view.wrapper = {addEventListener: addEventListenerSpy};
        view._on('test', '', '');
        assert.calledWith(addEventListenerSpy, 'test');
      });

      it('executes event handler in capturing phase when event is blur', () => {
        const addEventListenerSpy = sinon.spy();
        view.wrapper = {addEventListener: addEventListenerSpy};
        view._on('blur', '', '');
        assert.calledWith(addEventListenerSpy, 'blur', sinon.match.any, true);
      });

      it('calls function on event if target matches selector', () => {
        const functionSpy = sinon.spy();
        const event = new Event('click', {bubbles: true});
        const button = document.createElement('button');
        button.className = 'btn';
        view.wrapper = document.createElement('div');
        view.wrapper.appendChild(button);
        view._on('click', '.btn', functionSpy);
        view.wrapper.firstChild.dispatchEvent(event);
        assert.calledWith(functionSpy, event, button);
      });

      it('does not call function if target does not match selector', () => {
        const functionSpy = sinon.spy();
        const event = new Event('click', {bubbles: true});
        const button = document.createElement('button');
        button.className = 'btn';
        view.wrapper = document.createElement('div');
        view.wrapper.appendChild(button);
        view._on('click', '.not-btn', functionSpy);
        view.wrapper.firstChild.dispatchEvent(event);
        assert.notCalled(functionSpy);
      });
    });
  });
});

