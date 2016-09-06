import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

export default class Modal extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.product = null;
  }

  get typeKey() {
    return 'modal';
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, this.product.DOMEvents, {
      [`click .${this.classes.modal.close}`]: this.close.bind(this),
    });
  }

  get productConfig() {
    return {
      node: this.document.querySelector(`.${this.classes.modal.modal}`),
      options: merge({}, this.config),
    };
  }

  wrapTemplate(html) {
    return html;
  }

  delegateEvents() {
    super.delegateEvents();
    this.document.body.addEventListener('click', this.closeOnBgClick.bind(this));
  }

  closeOnBgClick(evt) {
    if (!this.wrapper.contains(evt.target)) {
      this.close();
    }
  }

  init(data) {
    this.isVisible = true;
    return super.init(data).then(() => {
      return this.product.init(this.model).then(() => this.loadImgs());
    });
  }

  close() {
    removeClassFromElement('is-active', this.wrapper);
    this.iframe.removeClass('is-active');
    if (this.props.browserFeatures.transition) {
      this.iframe.parent.addEventListener('transitionend', () => {
        this.iframe.removeClass('is-block');
      });
    } else {
      this.iframe.removeClass('is-block');
    }
  }

  render() {
    if (!this.isVisible) {
      return;
    }
    super.render();
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
    addClassToElement('is-active', this.wrapper);
    this.product = new Product(this.productConfig, this.props);
  }
}
