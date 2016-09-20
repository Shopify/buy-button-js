import morphdom from 'morphdom';
import merge from './utils/merge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import logNotFound from './utils/log-not-found';
import Iframe from './iframe';
import Template from './template';
import styles from './styles/embeds/all';
import logger from './utils/logger';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const ESC_KEY = 27;

export default class Component {
  constructor(config, props) {
    this.id = config.id;
    this.handle = config.handle;
    this.node = config.node;
    this.debug = config.debug;
    this.moneyFormat = config.moneyFormat || '${{amount}}';
    this.config = merge({}, componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
    this.children = null;
  }

  get client() {
    return this.props.client;
  }

  get name() {
    let uniqueHandle = '';
    if (this.id) {
      uniqueHandle = `-${this.id}`;
    } else if (this.handle) {
      uniqueHandle = `-${this.handle}`;
    }
    return `frame-${this.typeKey}${uniqueHandle}`;
  }

  get options() {
    return merge({}, this.config[this.typeKey]);
  }

  get DOMEvents() {
    return this.options.DOMEvents || {};
  }

  get events() {
    return this.options.events || {};
  }

  get styles() {
    return this.options.manifest.filter((component) => this.config[component].styles).reduce((hash, component) => {
      hash[component] = this.config[component].styles;
      return hash;
    }, {});
  }

  get classes() {
    return this.options.manifest.filter((component) => this.config[component].classes).reduce((hash, component) => {
      hash[component] = this.config[component].classes;
      return hash;
    }, {});
  }

  get googleFonts() {
    return this.options.manifest
      .filter((component) => this.config[component].googleFonts)
      .reduce((fonts, component) => fonts.concat(this.config[component].googleFonts), []);
  }

  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  get viewData() {
    return merge(this.model, {
      classes: this.classes,
      text: this.options.text,
    });
  }

  get morphCallbacks() {
    return {
      onBeforeElUpdated(fromEl, toEl) {
        if (fromEl.tagName === 'IMG') {
          if (fromEl.src === toEl.getAttribute('data-src')) {
            return false;
          }
        }
        return true;
      },
    };
  }

  get iframeClass() {
    return '';
  }

  get shouldResizeX() {
    return false;
  }

  get shouldResizeY() {
    return false;
  }

  init(data) {
    this._userEvent('beforeInit');
    return this.setupView().then(() => this.setupModel(data)).then((model) => {
      this.model = model;
      this.render();
      this.delegateEvents();
      this._userEvent('afterInit');
      return this;
    })
    .catch((err) => {
      if (err.message.indexOf('Not Found') > -1) {
        logNotFound(this);
      } else {
        throw err;
      }
    });
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
        googleFonts: this.googleFonts,
        name: this.name,
        width: this.options.layout === 'vertical' ? this.options.width : null,
      });
      this.node.className += ` shopify-buy-frame shopify-buy-frame--${this.typeKey}`;
      this.iframe.addClass(this.iframeClass);
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

  render() {
    this._userEvent('beforeRender');
    const html = this.template.render({data: this.viewData}, (data) => {
      return this.wrapTemplate(data);
    });
    if (!this.wrapper) {
      this.wrapper = this._createWrapper();
    }
    this.updateNode(this.wrapper, html);
    this.resize();
    this._userEvent('afterRender');
  }

  delegateEvents() {
    this._userEvent('beforeDelegateEvents');
    this._closeComponentsOnEsc();
    Object.keys(this.DOMEvents).forEach((key) => {
      const [, eventName, selectorString] = key.match(delegateEventSplitter);
      if (selectorString) {
        this._on(eventName, selectorString, (evt, target) => {
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

  get outerHeight() {
    return this.document.defaultView.getComputedStyle(this.wrapper, '').getPropertyValue('height');
  }

  resize() {
    if (!this.iframe) {
      return;
    }
    if (this.shouldResizeX) {
      this._resizeX();
    }
    if (this.shouldResizeY) {
      this._resizeY();
    }
  }

  updateConfig(config) {
    this._userEvent('beforeUpdateConfig');
    this.config = merge(this.config, config.options);
    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles);
    }
    this.render();
    this.resize();
    this._userEvent('afterUpdateConfig');
  }

  destroy() {
    this.node.parentNode.removeChild(this.node);
  }

  renderChild(className, template) {
    const selector = `.${className.split(' ').join('.')}`;
    const node = this.wrapper.querySelector(selector);
    const html = template.render({data: this.viewData});
    this.updateNode(node, html);
  }

  updateNode(node, html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    morphdom(node, div.firstElementChild);
  }

  wrapTemplate(html) {
    return `<div class="${this.classes[this.typeKey][this.typeKey]}">${html}</div>`;
  }

  _resizeX() {
    this.iframe.el.style.width = `${this.document.body.clientWidth}px`;
  }

  _resizeY(value) {
    const newHeight = value || this.outerHeight;
    this.iframe.el.style.height = newHeight;
  }

  _createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = this.classes[this.typeKey][this.typeKey];
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.node.appendChild(wrapper);
    }
    return wrapper;
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
      logger.info(`EVENT: ${methodName} (${this.typeKey})`);
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
    }, eventName === 'blur');
  }
}
