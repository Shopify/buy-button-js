import View from '../../src/view';
import Component from '../../src/component';
import Template from '../../src/template';
import Iframe from '../../src/iframe';

describe('View class', () => {
  describe('constructor', () => {
    let component = new Component({id: 1234});
    let view = new View(component);

    it('stores component to instance', () => {
      assert.equal(view.component, component);
    });

    it('creates a template instance', () => {
      assert.instanceOf(view.template, Template);
    });
  });

  describe('init()', () => {
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

    it('returns a promise if iframe option is false', () => {
      component.config.product.iframe = false;
      return view.init().then((iframe) => {
        assert.isNull(iframe);
      });
    });

    it('loads an Iframe', () => {
      component.config.product.iframe = true;
      const loadStub = sinon.stub(Iframe.prototype, 'load').returns(Promise.resolve());
      const addClassSpy = sinon.spy(Iframe.prototype, 'addClass');
      return view.init().then((iframe) => {
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

    it('creates div and updates html', () => {
      const div = document.createElement('div');
      const tmplRender = sinon.stub(view.template, 'render').returns(`<div>LOL</div>`);
      view._createWrapper = sinon.stub().returns(div);
      view.resize = sinon.spy();
      view.updateNode = sinon.spy();
      view.render();
      assert.calledOnce(view._createWrapper);
      assert.calledOnce(view.resize);
      assert.calledWith(view.updateNode, div, '<div>LOL</div>');
    });
  });

  describe('delegateEvents()', () => {
    let component;
    let view;

    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
        options: {
          product: {
            DOMEvents: {
              'click .btn': function () {return true},
              'click': function () {return true},
            }
          }
        }
      }, {browserFeatures: {}});
      view = new View(component);
      component.typeKey = 'product';
    });

    it('calls _on for each DOM event', () => {
      const onStub = sinon.stub(view, '_on');
      view.wrapper = {
        addEventListener: sinon.spy()
      }
      view.delegateEvents();
      assert.calledWith(onStub, 'click', '.btn', sinon.match.func);
      assert.calledWith(view.wrapper.addEventListener, 'click', sinon.match.func);
    });
  });

  describe('append()', () => {
    let component;
    let view;

    beforeEach(() => {
      component = new Component({
        id: 1234,
        node: document.createElement('div'),
      }, {browserFeatures: {}});
      view = new View(component);
    });

    it('appends to document if iframe', () => {
      const div = document.createElement('div');
      view.iframe = {
        document: {
          body: {
            appendChild: sinon.spy()
          }
        }
      }
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
      const component = new Component({
        id: 1234,
      }, {browserFeatures: {}});
      const view = new View(component);
      view.node = {
        parentNode: {
          removeChild: sinon.spy()
        }
      }
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
            }
          }
        }
      }, {browserFeatures: {}});
      component.typeKey = 'product';
      const view = new View(component);
      const template = {
        render: sinon.stub().returns('<h1>BUY MY BUTTONS lol</h1>')
      }
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
    const component = new Component({
      id: 1234,
    }, {browserFeatures: {}});
    const view = new View(component);

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
    const component = new Component({
      id: 1234,
    }, {browserFeatures: {}});
    component.typeKey = 'product';
    const view = new View(component);
      const string = view.wrapTemplate('test');
      assert.equal(string, '<div class="shopify-buy__product">test</div>');
    });
  });

  describe('resize()', () => {
    let component;
    let view;
    let resizeX;
    let resizeY;

    beforeEach(() => {
      component = new Component({
        id: 1234,
      }, {browserFeatures: {}});
      view = new View(component);
      resizeX = sinon.stub(view, '_resizeX');
      resizeY = sinon.stub(view, '_resizeY');
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
  });

  describe('get styles()', () => {
    it('returns styles for each component in manifest', () => {
      let component = new Component({
        id: 1234,
        options: {
          product: {
            styles: {
              button: {
                color: 'red',
              }
            }
          }
        }
      });
      component.typeKey = 'product';
      let view = new View(component);
      assert.deepEqual(view.styles, {product: {button: {color: 'red'}}});
    });
  });
});

