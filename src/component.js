import morphdom from 'morphdom';
import merge from 'lodash.merge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import Iframe from './iframe';
import Template from './template';
import styles from './styles/embeds/all';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;

function logEvent(event, type) {

  /* eslint-disable no-console */
  console.log(`EVENT: ${event} (${type})`);

  /* eslint-enable no-console  */
}

function methodStrings(method) {
  const capitalized = method.name.charAt(0).toUpperCase() + method.name.slice(1);
  return {
    before: `before${capitalized}`,
    after: `after${capitalized}`,
  };
}

export default class Component {
  constructor(config, props) {
    this.delegateEvents = this.wrapMethod(this.delegateEvents);
    this.resize = this.wrapMethod(this.resize);
    this.updateConfig = this.wrapMethod(this.updateConfig);
    this.id = config.id;
    this.node = config.node;
    this.debug = config.debug;
    this.config = merge(componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.template = new Template(this.templates, this.contents, this.classes[this.typeKey]);
    this.children = null;
  }

  get client() {
    return this.props.client;
  }

  get options() {
    return this.config[this.typeKey];
  }

  get templates() {
    return this.options.templates;
  }

  get contents() {
    return this.options.contents;
  }

  get styles() {
    const childStyles = this.config[this.childTypeKey] ? this.config[this.childTypeKey].styles : {};
    return Object.assign({}, this.options.styles, childStyles);
  }

  get classes() {
    const childClasses = this.config[this.childTypeKey] ? this.config[this.childTypeKey].classes : {};
    return Object.assign({}, this.options.classes, childClasses);
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
    return this.options.DOMEvents || {};
  }

  get viewData() {
    return merge(this.model, {
      classes: this.classes,
      text: this.text,
    });
  }

  delegateEvents() {
    Object.keys(this.DOMEvents).forEach((key) => {
      const [, eventName, selectorString] = key.match(delegateEventSplitter);
      const selector = selectorString.split(' ').join('.');
      this._on(eventName, selector, (evt, target) => {
        this.DOMEvents[key].call(this, evt, target);
      });
    });
  }

  resize() {
    if (!this.iframe) {
      return;
    }
    this.iframe.el.style.height = `${this.wrapper.clientHeight}px`;
    this.iframe.el.style.width = `${this.wrapper.clientWidth}px`;
  }

  setupView() {
    this.iframe = this.options.iframe ? new Iframe(this.node, this.classes, this.styles, styles[this.typeKey]) : null;
    if (this.iframe) {
      this.node.className += ` shopify-buy-frame shopify-buy-frame--${this.typeKey}`;
      return this.iframe.load();
    } else {
      return Promise.resolve();
    }
  }

  setupModel(data) {
    if (data) {
      return Promise.resolve(data);
    } else {
      return this.fetchData();
    }
  }

  init(data) {
    this._userEvent('beforeInit');
    return this.setupView().then(() => this.setupModel(data)).then((model) => {
      this.model = model;
      this.render();
      this.delegateEvents();
      this._userEvent('afterInit');
      return this;
    });
  }

  destroy() {
    this.node.parentNode.removeChild(this.node);
  }

  updateConfig(config) {
    this.config = merge(componentDefaults, config.options);
    this.template = new Template(this.templates, this.contents, this.typeKey);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles);
    }
    this.render();
    this.resize();
  }

  render() {
    this._userEvent('beforeRender');
    const html = this.template.render({data: this.viewData});
    if (this.wrapper && this.wrapper.innerHTML.length) {
      const div = this.document.createElement('div');
      div.innerHTML = html;
      morphdom(this.wrapper, div);
      this.wrapper.className = `${this.typeKey}-container`;
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
    this._userEvent('afterRender');
    return this.resizeAfterImgLoad();
  }

  createWrapper() {
    const wrapper = this.document.createElement('div');
    wrapper.className = `${this.typeKey}-container`;
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.node.appendChild(wrapper);
    }
    return wrapper;
  }

  resizeAfterImgLoad() {
    const imgs = [...this.wrapper.querySelectorAll('img')];
    if (imgs.length) {
      const promises = imgs.map((img) =>
        new Promise((resolve) => {
          if (this.props.imageCache[img.getAttribute('src')]) {
            return resolve();
          }
          img.addEventListener('load', (evt) => {
            this.props.imageCache[img.getAttribute('src')] = true;
            return resolve(evt);
          });
          img.addEventListener('error', (evt) => {
            resolve(evt);
          });
        })
      );
      return Promise.all(promises).then(() => this.resize());
    } else {
      return Promise.resolve(this.resize());
    }
  }

  wrapMethod(method) {
    return function(...args) {
      const {before, after} = methodStrings(method);
      this._userEvent(before);
      method.apply(this, args);
      this._userEvent(after);
    };
  }

  _userEvent(methodName) {
    if (this.debug) {
      logEvent(methodName, this.typeKey);
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
            return fn.call(possibleTarget, evt, possibleTarget);
          }
          el = el.parentNode;
        }
        return el;
      });
    });
  }
}
