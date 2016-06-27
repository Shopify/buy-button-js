import Template from '../../src/components/template';

const { module, test } = QUnit;
const contents = ['title', 'button'];
const templates = {
  title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
  button: '<button>BUTTON</button>'
}

let template;

module('Unit | View', {
  beforeEach() {
    template = new Template(templates, contents);
  },
  afterEach() {
    template = null;
  }
});

test('it puts data into the strings on #render', (assert) => {
  assert.expect(1);
  template.id = 'test';
  const expectedString = '<div id="test"><h1>BUY MY BUTTONS fool</h1><button>BUTTON</button></div>';
  const data = {
    name: 'fool'
  }
  const output = template.render({data: data});
  assert.equal(expectedString, output);
});
