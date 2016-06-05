import Handlebars from 'handlebars';

const defaults = {
  entryNode: document.getElementsByTagName('script')[0],
  productConfig: {}
}

export default class Widget {
  constructor(config, data, props) {
    this.config = Object.assign(defaults, config);
    this.data = data || null;
    this.props = props;
  }

  get templateString() {
    return this.contents.reduce((string, item) => {
      return string + this.templates[item]
    }, '');
  }

  get template() {
    return Handlebars.compile(this.templateString);
  }

  get wrapperNode() {
    return this.div;
  }

  getData() {
    return new Promise((resolve) => this.data);
  }

  afterRender() {
    this.attachEventListeners();
  }

  render() {
    return this.getData().then((data) => {
      this.data = data;
      this.html = this.template(this.data);
      this.insert()
      this.afterRender();
    });
  }

  insert() {
    this.div = this.div || document.createElement('div');
    this.div.className = this.className;
    this.config.entryNode.appendChild(this.div);
    this.div.innerHTML = this.html;
  }
}

