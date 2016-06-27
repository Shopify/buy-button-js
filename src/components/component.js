import morphdom from 'morphdom';
import merge from 'deepmerge';
import componentDefaults from '../defaults/components';
import Iframe from './iframe';
import Template from './template';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';

export default class Component {
  constructor(config, props, type) {
    this.id = config.id;
    this.node = config.node;
    this.type = type;
    this.config = merge(componentDefaults, config.options);
    this.props = props;
    this.model = {};
    this.iframe = this.options.iframe ? new Iframe(this.appendToHost.bind(this)) : null;
    this.template = new Template(this.templates, this.contents);
    this.children = null;
  }

  get client() {
    return this.props.client;
  }

  get options() {
    return this.config[this.type];
  }

  get templates() {
    return this.options.templates;
  }

  get contents() {
    return this.options.contents;
  }

  get styles() {
    return this.options.styles;
  }

  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  queryEntryNode() {
    this.entryNode = this.entryNode || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];
    this.entryNode.removeAttribute(DATA_ATTRIBUTE);
    return this.entryNode;
  }

  get events() {
    return Object.assign({}, this.options.events, {

    });
  }

  appendToHost(el) {
    if (this.node) {
      this.node.appendChild(el);
    } else {
      this.queryEntryNode();
      this.entryNode.parentNode.insertBefore(el, this.entryNode);
    }
  }

  delegateEvents() {
    Object.keys(this.events).forEach((key) => {
      const [eventName, selector] = key.split(' ');
      this._on(eventName, selector, (evt) => {
        this.events[key].call(this, evt, this);
      });
    });
  }

  getModel(data) {
    if (data) {
      return new Promise((resolve) => { resolve(data); });
    } else {
      return this.fetch();
    }
  }

  initWithData(data) {
    this.model = data;
    this.render();
    this.delegateEvents();
  }

  init() {
    return this.fetchData().then((model) => {
      this.model = model;
      this.render();
      this.delegateEvents();
      return model;
    });
  }

  render(children = '') {
    const viewData = Object.assign({}, this.model, {
      childrenHtml: children,
    });
    const html = this.template.render({data: viewData});
    if (this.wrapper && this.wrapper.innerHTML.length) {
      const div = this.document.createElement('div');
      div.innerHTML = html;
      morphdom(this.wrapper, div);
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
  }

  createWrapper() {
    const wrapper = this.document.createElement('div');
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.appendToHost(wrapper);
    }
    return wrapper;
  }

  _on(eventName, selector, fn) {
    this.wrapper.addEventListener(eventName, (evt) => {
      const possibleTargets = this.wrapper.querySelectorAll(selector);
      const target = evt.target;
      [...possibleTargets].forEach((possibleTarget) => {
        let el = target;
        while (el && el !== this.wrapper) {
          if (el === possibleTarget) {
            return fn.call(possibleTarget, evt);
          }
          el = el.parentNode;
        }
        return el;
      });
    });
  }
}
