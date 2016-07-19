import hogan from 'hogan.js';

export default class Template {
  constructor(templates, contents, className) {
    this.templates = templates;
    this.contents = contents;
    this.className = className;
    this.templateFn = hogan.compile(Object.keys(this.contents)
        .filter((key) => this.contents[key])
        .reduce((acc, key) => acc + this.templates[key], ''));
  }

  render(data) {
    return `<div class="${this.className} ${data.data.wrapperClass || ''}">${this.templateFn.render(data)}</div>`;
  }
}
