import morphdom from 'morphdom';
import merge from './utils/merge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import logNotFound from './utils/log-not-found';
import Iframe from './iframe';
import Template from './template';
import styles from './styles/embeds/all';
import logger from './utils/logger';
import defaultMoneyFormat from './defaults/money-format';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const ESC_KEY = 27;

/**
 * Manages rendering, lifecycle, and data fetching of a cmoponent.
 */

export default class Component {

  /**
   * creates a component.
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
  constructor(config, props) {
    this.id = config.id;
    this.handle = config.handle;
    this.node = config.node;
    this.globalConfig = {
      debug: config.debug,
      moneyFormat: decodeURIComponent(config.moneyFormat) || defaultMoneyFormat,
      cartNode: config.cartNode,
      modalNode: config.modalNode,
      toggles: config.toggles,
    };
    this.config = merge({}, componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
  }

  /**
   * get reference to client from props.
   * @return {Object} client instance
   */
  get client() {
    return this.props.client;
  }

  /**
   * get unique name for component.
   * @return {String} component name.
   */
  get name() {
    let uniqueHandle = '';
    if (this.id) {
      uniqueHandle = `-${this.id}`;
    } else if (this.handle) {
      uniqueHandle = `-${this.handle}`;
    }
    return `frame-${this.typeKey}${uniqueHandle}`;
  }

  /**
   * get configuration options specific to this component.
   * @return {Object} options object.
   */
  get options() {
    return merge({}, this.config[this.typeKey]);
  }

  /**
   * get events to be bound to DOM.
   * @return {Object} DOMEvents object.
   */
  get DOMEvents() {
    return this.options.DOMEvents || {};
  }

  /**
   * get events to be called on lifecycle methods.
   * @return {Object} events object.
   */
  get events() {
    return this.options.events || {};
  }

  /**
   * get styles for component and any components it contains as determined by manifest.
   * @return {Object} key-value pairs of CSS styles.
   */
  get styles() {
    return this.options.manifest.filter((component) => this.config[component].styles).reduce((hash, component) => {
      hash[component] = this.config[component].styles;
      return hash;
    }, {});
  }

  /**
   * get classes for component and any components it contains as determined by manifest.
   * @return {Object} class keys and names.
   */
  get classes() {
    return this.options.manifest.filter((component) => this.config[component].classes).reduce((hash, component) => {
      hash[component] = this.config[component].classes;
      return hash;
    }, {});
  }

  /**
   * get classes formatted as CSS selectors.
   * @return {Object} class keys and selectors.
   */
  get selectors() {
    return this.options.manifest.filter((component) => this.config[component].classes).reduce((hash, component) => {
      hash[component] = Object.keys(this.config[component].classes).reduce((classes, classKey) => {
        classes[classKey] = `.${this.classes[component][classKey].split(' ').join('.')}`;
        return classes;
      }, {});
      return hash;
    }, {});
  }

  /**
   * get google fonts for component and any components it contains as determined by manifest.
   * @return {Array} array of names of fonts to be loaded.
   */
  get googleFonts() {
    return this.options.manifest
      .filter((component) => this.config[component].googleFonts)
      .reduce((fonts, component) => fonts.concat(this.config[component].googleFonts), []);
  }

  /**
   * get reference to document object.
   * @return {Objcet} instance of Document.
   */
  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    return merge(this.model, this.options.viewData, {
      classes: this.classes,
      text: this.options.text,
    });
  }

  /**
   * get callbacks for morphdom lifecycle events.
   * @return {Object} object.
   */
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

  /**
   * get class name for iframe element. Defined in subclass.
   * @return {String}
   */
  get iframeClass() {
    return '';
  }

  /**
   * determines if iframe will require horizontal resizing to contain its children.
   * May be defined in subclass.
   * @return {Boolean}
   */
  get shouldResizeX() {
    return false;
  }

  /**
   * determines if iframe will require vertical resizing to contain its children.
   * May be defined in subclass.
   * @return {Boolean}
   */
  get shouldResizeY() {
    return false;
  }

  /**
   * initializes component by creating model and rendering view.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    this._userEvent('beforeInit');
    return this.setupView().then(() => this.setupModel(data)).then((model) => {
      this.model = model;
      this.render();
      this.delegateEvents();
      if (this.iframe) {
        this.iframe.el.onload = () => {
          this.iframe.el.onload = null;
          this.init();
        };
      }
      this._userEvent('afterInit');
      return this;
    })
    .catch((err) => {
      if (err.message.indexOf('Not Found') > -1) {
        logNotFound(this);
      } else {

        /* eslint-disable no-console */
        console.error(err);

        /* eslint-enable no-console */
      }
    });
  }

  /**
   * instantiates and configures Iframe if necessary.
   * @return {Promise} resolves when iframe is loaded.
   */
  setupView() {
    if (this.iframe) {
      if (this.iframe.document.contains(this.wrapper)) {
        return Promise.resolve();
      }
      this.iframe.parent.removeChild(this.iframe.el);
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

  /**
   * fetches data if necessary
   * @param {Object} [data] - data to initialize model with.
   */
  setupModel(data) {
    if (data) {
      return Promise.resolve(data);
    } else {
      return this.fetchData();
    }
  }

  /**
   * renders string template using viewData to wrapper element.
   */
  render() {
    this._userEvent('beforeRender');
    const html = this.template.render({data: this.viewData}, (data) => {
      return this.wrapTemplate(data);
    });
    if (!this.wrapper || (this.iframe && !this.document.contains(this.wrapper))) {
      this.wrapper = this._createWrapper();
    }
    this.updateNode(this.wrapper, html);
    this.resize();
    this._userEvent('afterRender');
  }

  /**
   * delegates DOM events to event listeners.
   */
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

  /**
   * get total height of iframe contents
   * @return {String} value in pixels.
   */
  get outerHeight() {
    const style = window.getComputedStyle(this.wrapper, '');
    if (!style) {
      return `${this.wrapper.clientHeight}px`;
    }
    let height = style.getPropertyValue('height');
    if (!height || height === '0px' || height === 'auto') {
      const clientHeight = this.wrapper.clientHeight;
      height = style.getPropertyValue('height') || `${clientHeight}px`;
    }
    return height;
  }

  /**
   * resize iframe if necessary.
   */
  resize() {
    if (!this.iframe || !this.wrapper) {
      return;
    }
    if (this.shouldResizeX) {
      this._resizeX();
    }
    if (this.shouldResizeY) {
      this._resizeY();
    }
  }

  /**
   * re-assign configuration and re-render component.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    this._userEvent('beforeUpdateConfig');
    this.config = merge(this.config, config.options);
    this.template = new Template(this.options.templates, this.options.contents, this.options.order);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles, this.googleFonts);
    }
    this.render();
    this.resize();
    this._userEvent('afterUpdateConfig');
  }

  /**
   * remove node from DOM.
   */
  destroy() {
    this.node.parentNode.removechild(this.node);
  }

  /**
   * update the contents of a DOM node with template
   * @param {String} className - class name to select node.
   * @param {Object} template - template to be rendered.
   */
  renderChild(className, template) {
    const selector = `.${className.split(' ').join('.')}`;
    const node = this.wrapper.querySelector(selector);
    const html = template.render({data: this.viewData});
    this.updateNode(node, html);
  }

  /**
   * call morpdom on a node with new HTML
   * @param {Object} node - DOM node to be updated.
   * @param {String} html - HTML to update DOM node with.
   */
  updateNode(node, html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    morphdom(node, div.firstElementChild);
  }

  /**
   * wrap HTML string in containing elements.
   * May be defined in subclass.
   * @param {String} html - HTML string.
   * @return {String} wrapped string.
   */
  wrapTemplate(html) {
    return `<div class="${this.classes[this.typeKey][this.typeKey]}">${html}</div>`;
  }

  /**
   * Focus first focusable element in wrapper.
   */
  setFocus() {
    const focusable = this.wrapper.querySelectorAll('a, button, input, select')[0];
    if (focusable) {
      focusable.focus();
    }
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
    if (this.globalConfig.debug) {
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
