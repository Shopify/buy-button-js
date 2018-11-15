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
      it('creates div and updates html', () => {
        const div = document.createElement('div');
        const tmplRender = sinon.stub(view.template, 'render').returns('<div>LOL</div>');
        view._createWrapper = sinon.stub().returns(div);
        view.resize = sinon.spy();
        view.updateNode = sinon.spy();
        view.render();
        assert.calledOnce(view._createWrapper);
        assert.calledOnce(view.resize);
        assert.calledWith(view.updateNode, div, '<div>LOL</div>');
        tmplRender.restore();
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
                'click'() { return true; },
              },
            },
          },
        }, {browserFeatures: {}});
        view = new View(component);
        component.typeKey = 'product';
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
        const component = new Component({
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
        const view = new View(component);
        const template = {
          render: sinon.stub().returns('<h1>BUY MY BUTTONS lol</h1>')
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

