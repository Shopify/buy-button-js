import Template from '../../src/template';

import chai from 'chai';

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
    template = new Template(templates, contents, 'test');
  });

  afterEach(() => {
    template = null;
  })

  it('it puts data into the strings on #render', () => {
    const expectedString = '<div class="test "><h1>BUY MY BUTTONS fool</h1><button>BUTTON</button></div>';
    const data = {
      name: 'fool'
    }
    const output = template.render({data: data});
    chai.assert.equal(expectedString, output);
  });
});

