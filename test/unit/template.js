import Template from '../../src/template';

describe('Template class', () => {
  let template;
  const contents = {
    title: true,
    button: true,
    description: false,
  };
  const templates = {
    button: '<button>button</button>',
    title: '<h1>title {{data.name}}</h1>',
    description: 'footer',
  };
  const order = ['title', 'button', 'description'];

  describe('constructor', () => {
    beforeEach(() => {
      template = new Template(templates, contents, order);
    });

    it('sets templates, contents, and order from params', () => {
      assert.equal(template.templates, templates);
      assert.equal(template.contents, contents);
      assert.equal(template.order, order);
    });
  });

  describe('prototype methods', () => {
    describe('render()', () => {
      const expectedString = '<h1>title test</h1><button>button</button>';
      const data = {
        name: 'test',
      };

      describe('without callback', () => {
        it('puts data into the string template', () => {
          const output = template.render({data});
          assert.equal(output, expectedString);
        });
      });

      describe('with callback', () => {
        it('puts data into the string template, then calls callback and returns its return value', () => {
          const cbStub = sinon.stub().returnsArg(0);
          const output = template.render({data}, cbStub);
          assert.calledOnce(cbStub);
          assert.calledWith(cbStub, expectedString);
          assert.equal(output, expectedString);
        });
      });
    });

    describe('getters', () => {
      describe('masterTemplate', () => {
        it('returns a string template', () => {
          const expectedString = templates.title + templates.button;
          assert.equal(template.masterTemplate, expectedString);
        });
      });
    });
  });
});
