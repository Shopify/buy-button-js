import hogan from 'hogan.js';

export default class Template {
  constructor(templates, contents) {
    this.templates = templates;
    this.contents = contents;
    this.templateFn = hogan.compile(this.contents.reduce((acc, item) => acc + this.templates[item], ''));
  }

  render(data) {
    return `<div>${this.templateFn.render(data)}</div>`;
  }
}
