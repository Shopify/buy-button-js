import hogan from 'hogan.js';

let idCounter = 0;

function uniqueId() {
  return `shopify-ui-${++idCounter}`;
}

export default class Template {
  constructor(templates, contents) {
    this.templates = templates;
    this.contents = contents;
    this.id = uniqueId();
    this.templateFn = hogan.compile(this.contents.reduce((acc, item) => acc + this.templates[item], ''));
  }

  render(data) {
    console.log(data);
    return `<div id="${this.id}">${this.templateFn.render(data)}</div>`;
  }
}
