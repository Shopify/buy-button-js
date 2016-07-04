import hogan from 'hogan.js';

export default class Template {
  constructor(templates, contents, className) {
    this.templates = templates;
    this.contents = contents;
    this.className = className;
    this.templateFn = hogan.compile(this.contents.reduce((acc, item) => acc + this.templates[item], ''));
  }

  render(data) {
    return `<div class="${this.className}">${this.templateFn.render(data)}</div>`;
  }
}
