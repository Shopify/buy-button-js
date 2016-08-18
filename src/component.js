import morphdom from 'morphdom';
import merge from 'lodash.merge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import Iframe from './iframe';
import Template from './template';
import styles from './styles/embeds/all';
import {addClassToElement, removeClassFromElement} from './utils/element-class';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const ESC_KEY = 27;

function logEvent(event, type) {

  /* eslint-disable no-console */
  console.log(`EVENT: ${event} (${type})`);

  /* eslint-enable no-console  */
}

export default class Component {
  constructor(config, props) {
    this.id = config.id;
    this.handle = config.handle;
    this.node = config.node;
    this.debug = config.debug;
    this.config = merge({}, componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.template = new Template(this.templates, this.contents);
    this.children = null;
  }

  get client() {
    return this.props.client;
  }

  get options() {
    return merge({}, this.config[this.typeKey]);
  }

  get manifest() {
    return this.options.manifest.slice(0);
  }

  get templates() {
    return merge({}, this.options.templates);
  }

  get contents() {
    return this.options.order.reduce((items, key) => {
      if (this.options.contents[key]) {
        items[key] = true;
      }
      return items;
    }, {});
  }

  get text() {
    return merge({}, this.options.text);
  }

  get events() {
    return merge({}, this.options.events);
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents);
  }

  get styles() {
    return this.manifest.filter((component) => this.config[component].styles).reduce((hash, component) => {
      hash[component] = this.config[component].styles;
      return hash;
    }, {});
  }

  get classes() {
    return this.manifest.filter((component) => this.config[component].classes).reduce((hash, component) => {
      hash[component] = this.config[component].classes;
      return hash;
    }, {});
  }

  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  get viewData() {
    return merge(this.model, {
      classes: this.classes,
      text: this.text,
    });
  }

  get morphCallbacks() {
    return {};
  }

  delegateEvents() {
    this._userEvent('beforeDelegateEvents');
    this._closeComponentsOnEsc();
    Object.keys(this.DOMEvents).forEach((key) => {
      const [, eventName, selectorString] = key.match(delegateEventSplitter);
      const selector = selectorString.split(' ').join('.');
      if (selector) {
        this._on(eventName, selector, (evt, target) => {
          this.DOMEvents[key].call(this, evt, target);
        });
      } else {
        this.wrapper.addEventListener('click', (evt) => {
          this.DOMEvents[key].call(this, evt);
        });
      }
    });
    this._userEvent('afterDelegateEvents');
  }

  resize() {
    if (!this.iframe) {
      return;
    }
    if (this.typeKey === 'product') {
      this.resizeX();
    }
    if (this.typeKey === 'product' || this.typeKey === 'productSet') {
      this.resizeY();
    }
  }

  resizeY() {
    this.iframe.el.style.height = `${this.wrapper.clientHeight}px`;
  }

  resizeX() {
    this.iframe.el.style.width = `${this.wrapper.clientWidth}px`;
  }

  setupView() {
    if (this.iframe) {
      return Promise.resolve();
    }
    if (this.options.iframe) {
      this.iframe = new Iframe(this.node, {
        classes: this.classes,
        customStyles: this.styles,
        stylesheet: styles[this.typeKey],
        browserFeatures: this.props.browserFeatures,
      });
      this.node.className += ` shopify-buy-frame shopify-buy-frame--${this.typeKey}`;
      return this.iframe.load();
    } else {
      this.iframe = null;
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
    this._userEvent('beforeUpdateConfig');
    this.config = merge(this.config, config.options);
    this.template = new Template(this.templates, this.contents, this.classes[this.typeKey][this.typeKey]);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles);
    }
    this.render();
    this.resize();
    this._userEvent('afterUpdateConfig');
  }

  wrapTemplate(html) {
    return `<div class="${this.classes[this.typeKey][this.typeKey]}">${html}</div>`;
  }

  render() {
    this._userEvent('beforeRender');
    const html = this.template.render({data: this.viewData}, (data) => {
      return this.wrapTemplate(data);
    });
    if (this.wrapper && this.wrapper.innerHTML.length) {
      const div = document.createElement('div');
      div.innerHTML = html;
      morphdom(this.wrapper, div, this.morphCallbacks);
      this.wrapper.className = this.classes[this.typeKey].wrapper;
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
    this._userEvent('afterRender');
    return this.loadImgs();
  }

  createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = this.classes[this.typeKey].wrapper;
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.node.appendChild(wrapper);
    }
    return wrapper;
  }

  loadImgs() {
    const imgs = Array.prototype.slice.call(this.wrapper.querySelectorAll('img'));
    const promises = imgs.map((img) => {
      addClassToElement('is-transitioning', img);
      const src = img.getAttribute('data-src');
      if (src) {
        return new Promise((resolve) => {
          img.addEventListener('load', (evt) => {
            removeClassFromElement('is-transitioning', img);
            return resolve(evt);
          });
          img.addEventListener('error', (evt) => {
            return resolve(evt);
          });
          img.setAttribute('src', src);
        });
      } else {
        return Promise.resolve();
      }
    });
    if (this.iframe) {
      return Promise.all(promises).then(() => this.resize());
    } else {
      return Promise.resolve();
    }
  }

  _closeComponentsOnEsc() {
    if (!this.iframe) {
      return;
    }
    this.document.addEventListener('keydown', (evt) => {
      if (evt.keyCode !== ESC_KEY) {
        return;
      }
      this.props.closeModal();
      this.props.closeCart();
    });
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
      const possibleTargets = Array.prototype.slice.call(this.wrapper.querySelectorAll(selector));
      const target = evt.target;

      possibleTargets.forEach((possibleTarget) => {
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
