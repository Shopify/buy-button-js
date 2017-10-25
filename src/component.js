import merge from './utils/merge';
import isFunction from './utils/is-function';
import componentDefaults from './defaults/components';
import logNotFound from './utils/log-not-found';
import logger from './utils/logger';
import defaultMoneyFormat from './defaults/money-format';
import View from './view';
import Updater from './updater';

function moneyFormat(format = defaultMoneyFormat) {
  return decodeURIComponent(format);
}

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
    this.storefrontId = config.storefrontId;
    this.handle = config.handle;
    this.node = config.node;
    this.globalConfig = {
      debug: config.debug,
      moneyFormat: moneyFormat(config.moneyFormat),
      cartNode: config.cartNode,
      modalNode: config.modalNode,
      toggles: config.toggles,
    };
    this.config = merge({}, componentDefaults, config.options || {});
    this.props = props;
    this.model = {};
    this.updater = new Updater(this);
    this.view = new View(this);
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
   * get google fonts for component and any components it contains as determined by manifest.
   * @return {Array} array of names of fonts to be loaded.
   */
  get googleFonts() {
    return this.options.manifest
      .filter((component) => this.config[component].googleFonts)
      .reduce((fonts, component) => fonts.concat(this.config[component].googleFonts), []);
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
   * initializes component by creating model and rendering view.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    this._userEvent('beforeInit');
    return this.view.init().then(() => this.setupModel(data)).then((model) => {
      this.model = model;
      this.view.render();
      this.view.delegateEvents();
      this._userEvent('afterInit');
      return this;
    })
    .catch((err) => {
      if (err.message.indexOf('Not Found') > -1) {
        logNotFound(this);
      }
      throw err;
    });
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
   * re-assign configuration and re-render component.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    return this.updater.updateConfig(config);
  }

  /**
   * remove node from DOM.
   */
  destroy() {
    this.view.destroy();
  }

  _userEvent(methodName) {
    if (this.globalConfig.debug) {
      logger.info(`EVENT: ${methodName} (${this.typeKey})`);
    }
    if (isFunction(this.events[methodName])) {
      this.events[methodName].call(this, this);
    }
  }
}
