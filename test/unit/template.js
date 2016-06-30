import Template from '../../src/template';

const { module, test } = QUnit;
const contents = ['title', 'button'];
const templates = {
  title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
  button: '<button>BUTTON</button>'
}

let template;

module('Unit | Template', {
  beforeEach() {
    template = new Template(templates, contents);
  },
  afterEach() {
    template = null;
  }
});

test('it puts data into the strings on #render', (assert) => {
  assert.expect(1);
  const expectedString = '<div><h1>BUY MY BUTTONS fool</h1><button>BUTTON</button></div>';
  const data = {
    name: 'fool'
  }
  const output = template.render({data: data});
  assert.equal(expectedString, output);
});
