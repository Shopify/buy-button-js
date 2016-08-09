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

  wrapperClasses(data) {
    return `${this.className} ${data.data.wrapperClass || ''}`;
  }

  render(data) {
    if (this.className) {
      return `<div class="${this.wrapperClasses(data)}">${this.templateFn.render(data)}</div>`;
    } else {
      return `${this.templateFn.render(data)}`;
    }
  }
}
