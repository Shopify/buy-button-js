import morphdom from 'morphdom';
import merge from 'deepmerge';
import componentDefaults from '../defaults/components';
import Iframe from './iframe';
import Template from './template';

export default class Component {
  constructor(config, props, type) {
    this.id = config.id;
    this.node = config.node;
    this.type = type;
    this.config = merge(componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.iframe = this.options.iframe ? new Iframe(this.node, this.classes, this.styles) : null;
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

  get classes() {
    return this.options.classes;
  }

  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  get events() {
    return Object.assign({}, this.options.events, {

    });
  }

  delegateEvents() {
    Object.keys(this.events).forEach((key) => {
      const [eventName, selector] = key.split(' ');
      this._on(eventName, selector, (evt) => {
        this.events[key].call(this, evt, this);
      });
    });
  }

  resize() {
    if (this.iframe) {
      this.iframe.el.style.height = this.wrapper.clientHeight + 'px';
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

  updateConfig(config) {
    this.config = merge(componentDefaults, config.options);
    this.render();
    this.delegateEvents();
  }

  render(children = '') {
    const viewData = this.model;
    viewData.childrenHtml = children;
    viewData.classes = this.classes;
    const html = this.template.render({data: viewData});
    if (this.wrapper && this.wrapper.innerHTML.length) {
      const div = this.document.createElement('div');
      div.innerHTML = html;
      morphdom(this.wrapper, div);
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
    this.resizeAfterImgLoad();
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

  resizeAfterImgLoad() {
    let promises = [...this.wrapper.querySelectorAll('img')].map(img => {
      return new Promise((resolve) => {
        img.addEventListener('load', (evt) => {
          resolve(evt)
        });
      });
    });
    if (promises.length) {
      Promise.all(promises).then(result => {
        this.resize();
      });
    }
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
