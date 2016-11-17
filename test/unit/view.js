
  describe('render', () => {
    it('sets innerHTML of wrapper on initial call', () => {
      const testHTML = '<h1>THIS IS ONLY A TEST</h1>';

      const tmplRender = sinon.stub(component.template, 'render').returns(`<div>${testHTML}</div>`);
      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });

    it('updates innerHTML of wrapper on second call', () => {
      const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
      const testHTML = '<h1>THIS IS NOT A TEST</h1>'
      const tmplRender = sinon.stub(component.template, 'render').returns(`<div>${testHTML}</div>`);
      component.wrapper = component._createWrapper();
      component.wrapper.innerHTML = testBeforeHTML;
      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });
  });

  describe('renderChild', () => {
    let updateNodeSpy;
    let childNode;

    beforeEach(() => {
      const contents = {
        title: true,
      }
      const templates = {
        title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
      }
      const order = ['title'];
      const template = new Template(templates, contents, order);
      updateNodeSpy = sinon.stub(component, 'updateNode');
      childNode = document.createElement('div');
      childNode.className = 'foo';
      component.model.name = 'lol';
      component.wrapper = component._createWrapper();
      component.wrapper.appendChild(childNode);
      component.renderChild('foo', template);
    });

    it('calls updateNode with node and html', () => {
      assert.calledWith(updateNodeSpy, childNode, '<h1>BUY MY BUTTONS lol</h1>');
    });
  });

  describe('updateNode', () => {
    it('updates contents of node', () => {
      const div = document.createElement('div');
      div.innerHTML = '<h1>OLD TEXT</h1>';
      const html = '<h1>SO FRESH</h1>';
      component.updateNode(div, `<div>${html}</div>`);
      assert.equal(div.innerHTML, html);
    });
  });


  describe('wrapTemplate', () => {
    describe('when button exists', () => {
      it('puts strings in a div', () => {
        const string = component.wrapTemplate('test');
        assert.equal(string, '<div class="shopify-buy__product">test</div>');
      });
    });
  });
