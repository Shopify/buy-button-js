import Handlebars from 'handlebars';
import WrapperIframe from './wrapper-iframe';
import WrapperDiv from './wrapper-div';

const widgetDefaults = {
  iframe: true,
  parentNode: document.getElementsByTagName('script')[0].parentNode,
  className: 'product'
}

export default class Widget {
  constructor (config, props) {
    this.config = Object.assign({}, widgetDefaults, config);
    this.contents = this.config.contents || [];
    this.templates = this.config.templates || {};
    this.renderTarget = this.config.iframe ?
        new WrapperIframe(this.config.parentNode, document, this.config.className) :
        new WrapperDiv(this.config.parentNode, document, this.config.className);
    this.props = props || {};
    this.data = this.props.data || {};
    this.init();
  }

  init() {
    this.renderTarget.attach(this.config.className);
  }

  get template() {
    return Handlebars.compile(this.templateString);
  }

  get templateString () {
    return this.contents.reduce((string, item) => {
      return string + this.templates[item]
    }, '');
  }

  render() {
    let html = this.template(this.data);
    this.insert(html);
    this.renderTarget.resize();
    this.attachEventListeners();
  }

  insert (html) {
    this.renderTarget.setHtml(html);
  }
}

