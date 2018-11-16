import View from '../../src/view';
import Component from '../../src/component';
import Template from '../../src/template';
import Iframe from '../../src/iframe';

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

    describe('animateRemoveNode()', () => {
      let node;

      beforeEach(() => {
        component = new Component({
          id: 1234,
          node: document.createElement('div'),
        }, {browserFeatures: {animation: true}});
        component.typeKey = 'product';
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
  });
});

