import morphdom from 'morphdom';
import merge from 'deepmerge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import Iframe from './iframe';
import Template from './template';
const delegateEventSplitter = /^(\S+)\s*(.*)$/;

function logEvent(event) {
  console.log(`EVENT: ${event}`);
}

function methodStrings(method) {
  const capitalized = method.name.charAt(0).toUpperCase() + method.name.slice(1)
  return {
    before: `before${capitalized}`,
    after: `after${capitalized}`
  }
}

export default class Component {
  constructor(config, props, type) {
    this.delegateEvents = this.wrapMethod(this.delegateEvents);
    this.render = this.wrapMethod(this.render);
    this.initWithData = this.wrapMethod(this.initWithData);
    this.resize = this.wrapMethod(this.resize);
    this.updateConfig = this.wrapMethod(this.updateConfig);
    this.id = config.id;
    this.node = config.node;
    this.debug = config.debug;
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

  get text() {
    return this.options.text;
  }

  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  get events() {
    return this.options.events || {};
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {

    });
  }

  viewData() {
    return {};
  }

  delegateEvents() {
    Object.keys(this.DOMEvents).forEach((key) => {
      const [_, eventName, selector] = key.match(delegateEventSplitter)
      this._on(eventName, selector, (evt) => {
        this.DOMEvents[key].call(this, evt, this);
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
    this._userEvent('beforeInit');
    return this.fetchData().then((model) => {
      this.model = model;
      this.render();
      this.delegateEvents();
      this._userEvent('afterInit');
      return model;
    });
  }

  updateConfig(config) {
    this.config = merge(componentDefaults, config.options);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles);
    }
    this.render();
    this.delegateEvents();
  }

  render() {
    const viewData = this.model;
    const localViewData = Object.assign({}, this.viewData());
    viewData.classes = this.classes;
    Object.keys(localViewData).forEach((key) => {
      viewData[key] = localViewData[key];
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
    this.resizeAfterImgLoad();
  }

  createWrapper() {
    const wrapper = this.document.createElement('div');
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.node.appendChild(wrapper);
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

  wrapMethod(method) {
    return function() {
      const {before, after} = methodStrings(method);
      this._userEvent(before);
      method.apply(this, arguments);
      this._userEvent(after);
    }
  }

  _userEvent(methodName) {
    if (this.debug) {
      logEvent(methodName);
    }
    if (isFunction(this.events[methodName])) {
      this.events[methodName].call(this, this);
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
