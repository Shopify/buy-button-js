import hogan from 'hogan.js';

export default class Template {
  constructor(templates, contents) {
    this.templates = templates;
    this.contents = contents;
    this.templateFn = hogan.compile(this.masterTemplate);
  }

  get masterTemplate() {
    return Object.keys(this.contents)
        .filter((key) => this.contents[key])
        .reduce((acc, key) => acc + this.templates[key], '');
  }

  render(data, cb) {
    const output = `${this.templateFn.render(data)}`;
    if (!cb) {
      return output;
    }
    return cb(output);
  }
}
