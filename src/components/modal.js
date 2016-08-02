import Component from '../component';
import Product from './product';
import merge from 'lodash.merge';

export default class Modal extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.isVisible = false;
  }

  get typeKey() {
    return 'modal';
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.modal.overlay}`]: this.close.bind(this),
    });
  }

  close(evt) {
    if (!this.wrapper.querySelector(`.${this.classes.modal.contents}`).contains(evt.target)) {
      this.iframe.removeClass('js-active');
    }
  }

  render() {
    super.render();
    this.iframe.addClass('js-active');

    const productConfig = merge({}, this.config.product, this.config.modalProduct);

    const config = {
      node: this.document.querySelector(`.${this.classes.modal.contents}`),
      options: merge({}, this.config, {
        product: productConfig,
      })
    };

    return new Product(config, this.props).init(this.model).then(() => {
      return this.loadImgs();
    });
  }
}
