import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

export default class Modal extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = config.node || document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-modal-wrapper';
    this.product = null;
  }

  get typeKey() {
    return 'modal';
  }

  get DOMEvents() {
    let events = Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.modal.close}`]: this.close.bind(this),
    });
    if (this.product) {
      events = Object.assign({}, events, this.product.DOMEvents);
    }
    return events;
  }

  get productConfig() {
    return {
      node: this.wrapper,
      options: merge({}, this.config),
    };
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
      this.product = new Product(this.productConfig, this.props);
      return this.product.init(this.model).then(() => this.resize());
    });
  }

  close() {
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
