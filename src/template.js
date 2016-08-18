import hogan from 'hogan.js';

export default class Template {
  constructor(templates, contents) {
    this.templates = templates;
    this.contents = contents;
    this.templateFn = hogan.compile(this.masterTemplate);
  }

  get masterTemplate() {
    return this.contents
        .reduce((acc, key) => {
          const string = this.templates[key] || '';
          return acc + string;
        }, '');
  }

  render(data, cb) {
    const output = `${this.templateFn.render(data)}`;
    if (!cb) {
      return output;
    }
    return cb(output);
  }
}
