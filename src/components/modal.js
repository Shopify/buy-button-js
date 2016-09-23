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
    let events = Object.assign({}, {
      [`click .${this.classes.modal.close.split(' ').join('.')}`]: this.close.bind(this),
    }, this.options.DOMEvents);
    if (this.product) {
      events = Object.assign({}, events, this.product.DOMEvents);
    }
    return events;
  }

  get productConfig() {
    return {
      node: this.productWrapper,
      options: merge({}, this.config),
    };
  }

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

  init(data) {
    this.isVisible = true;
    return super.init(data).then(() => {
      this.productWrapper = this.wrapper.getElementsByClassName(this.classes.modal.modal)[0];
      this.product = new Product(this.productConfig, this.props);
      return this.product.init(this.model).then(() => this.resize());
    });
  }

  updateConfig(config) {
    super.updateConfig(config);
    this.product = new Product(this.productConfig, this.props);
    return this.product.init(this.model).then(() => this.resize());
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
