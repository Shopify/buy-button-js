import View from '../../src/components/view';

const { module, test } = QUnit;
const contents = ['title', 'button'];
const templates = {
  title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
  button: '<button>BUTTON</button>'
}

let view;

module('Unit | View', {
  beforeEach() {
    view = new View(templates, contents);
  },
  afterEach() {
    view = null;
  }
});

test('it smushes all the strings together', (assert) => {
  assert.expect(1);
  const expectedString = '<h1>BUY MY BUTTONS {{data.name}}</h1><button>BUTTON</button>';
  assert.equal(expectedString, view.templateString);
});

test('it puts data into the strings on #html', (assert) => {
  assert.expect(1);
  const expectedString = '<div><h1>BUY MY BUTTONS fool</h1><button>BUTTON</button></div>';
  const data = {
    name: 'fool'
  }
  const output = view.html({data: data});
  assert.equal(expectedString, output);
});
