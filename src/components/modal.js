import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import ModalView from '../views/modal';
import ModalUpdater from '../updaters/modal';

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
    this.typeKey = 'modal';
    this.node = config.node ? config.node.appendChild(document.createElement('div')) : document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.product = null;
    this.updater = new ModalUpdater(this);
    this.view = new ModalView(this);
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
      modalProduct: true,
    });
  }

  closeOnBgClick(evt) {
    if (!this.productWrapper.contains(evt.target)) {
      this.props.closeModal();
    }
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
      this.productWrapper = this.view.wrapper.getElementsByClassName(this.classes.modal.modal)[0];
      this.product = new Product(this.productConfig, this.props);
      return this.product.init(this.model).then(() => {
        this.view.setFocus();
        return this.view.resize();
      });
    });
  }

  /**
   * close modal.
   */
  close() {
    this._userEvent('closeModal');
    this.view.close();
  }
}
