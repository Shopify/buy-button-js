import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import ModalContainer from '../containers/modal';
import ModalFrame from '../frames/modal';

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
    this.node = config.node ? config.node.appendChild(document.createElement('div')) : document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.product = null;
    this.updater = new ModalUpdater(this);
    this.container = new ModalContainer(this);
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
    return Object.assign({}, {
      [`click ${this.selectors.modal.close}`]: this.props.closeModal.bind(this),
    }, this.options.DOMEvents);
  }

  /**
   * get configuration object for product within modal. Set product node to modal contents.
   * @return {Object}
   */
  get productConfig() {
    return Object.assign({}, this.globalConfig, {
      node: this.productWrapper,
      options: merge({}, this.config),
    });
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
      this.props.closeModal();
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
      return this.product.init(this.model).then(() => {
        this.setFocus();
        return this.container.resize();
      });
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
    return this.product.init(this.model).then(() => this.container.resize());
  }

  /**
   * close modal.
   */
  close() {
    this._userEvent('closeModal');
    this.container.close();
  }

  /**
   * renders string template using viewData to wrapper element.
   */
  render() {
    if (!this.isVisible) {
      return;
    }
    super.render();
    this.container.render();
  }
}
