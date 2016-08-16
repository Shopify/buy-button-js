import Template from '../../src/template';

const contents = {
  title: true,
  button: true,
}
const templates = {
  title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
  button: '<button>BUTTON</button>'
}

let template;

describe('Template class', () => {
  beforeEach(() => {
    template = new Template(templates, contents);
  });

  afterEach(() => {
    template = null;
  });

  describe('render', () => {

    describe('without callback', () => {
      it('it puts data into the strings', () => {
        const expectedString = '<h1>BUY MY BUTTONS fool</h1><button>BUTTON</button>';
        const data = {
          name: 'fool'
        }
        const output = template.render({data: data});
        assert.equal(expectedString, output);
      });
    });

    describe('with callback', () => {
      it('it puts data into the strings and calls callback', () => {
        const expectedString = '<h1>BUY MY BUTTONS fool</h1><button>BUTTON</button>';
        const data = {
          name: 'fool'
        }
        const spy = sinon.spy();
        const output = template.render({data: data}, spy);
        assert.calledWith(spy, expectedString);
      });
    });
  });
});

