import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

/**
 * Renders product modal.
 * @extends Component.
 */
export default class Modal extends Component {

  /**
   * create Modal.
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
  constructor(config, props) {
    super(config, props);
    this.node = config.node || document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.product = null;
  }

  /**
   * get key for configuration object.
   * @return {String}
   */
  get typeKey() {
    return 'modal';
  }

  /**
   * get events to be bound to DOM.
   * Combines Product events with modal events.
   * @return {Object}
   */
  get DOMEvents() {
    let events = Object.assign({}, {
      [`click .${this.classes.modal.close.split(' ').join('.')}`]: this.close.bind(this),
    }, this.options.DOMEvents);
    if (this.product) {
      events = Object.assign({}, events, this.product.DOMEvents);
    }
    return events;
  }

  /**
   * get configuration object for product within modal. Set product node to modal contents.
   * @return {Object}
   */
  get productConfig() {
    return {
      moneyFormat: this.moneyFormat,
      node: this.productWrapper,
      options: merge({}, this.config),
    };
  }

  /**
   * delegates DOM events to event listeners.
   * Adds event listener to wrapper to close modal on click.
   */
  delegateEvents() {
    super.delegateEvents();
    this.wrapper.addEventListener('click', this.closeOnBgClick.bind(this));
  }

  closeOnBgClick(evt) {
    if (!this.productWrapper.contains(evt.target)) {
      this.close();
    }
  }

  wrapTemplate(html) {
    return `<div class="${this.classes.modal.overlay}"><div class="${this.classes.modal.modal}">${html}</div></div>`;
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initializes product component.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
  */
  init(data) {
    this.isVisible = true;
    return super.init(data).then(() => {
      this.productWrapper = this.wrapper.getElementsByClassName(this.classes.modal.modal)[0];
      this.product = new Product(this.productConfig, this.props);
      return this.product.init(this.model).then(() => this.resize());
    });
  }

  /**
   * re-assign configuration and re-render component.
   * Update config on product within modal.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    super.updateConfig(config);
    this.product = new Product(this.productConfig, this.props);
    return this.product.init(this.model).then(() => this.resize());
  }

  /**
   * close modal.
   */
  close() {
    this._userEvent('closeModal');
    this.isVisible = false;
    removeClassFromElement('is-active', this.wrapper);
    if (this.iframe) {
      this.iframe.removeClass('is-active');
      removeClassFromElement('is-active', this.document.body);
    }
    if (this.props.browserFeatures.transition) {
      this.iframe.parent.addEventListener('transitionend', () => {
        this.iframe.removeClass('is-block');
      });
    } else {
      this.iframe.removeClass('is-block');
    }
  }

  /**
   * renders string template using viewData to wrapper element.
   */
  render() {
    if (!this.isVisible) {
      return;
    }
    super.render();
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
    addClassToElement('is-active', this.document.body);
    addClassToElement('is-active', this.wrapper);
  }
}
