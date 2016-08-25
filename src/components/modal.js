import merge from 'lodash.merge';
import Component from '../component';
import Product from './product';
import Template from '../template';
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

  get productTemplate() {
    return new Template(this.product.templates, Object.assign({}, this.product.config.modalProduct.contents, {
      img: false,
    }), this.product.config.modalProduct.order);
  }

  get productModalTemplates() {
    return {
      img: `<div class="${this.classes.modal.img}">${this.product.templates.img}</div>`,
      contents: `<div class="${this.classes.modal.contents} {{#data.currentImage}}${this.classes.modal.contentsWithImg}{{/data.currentImage}}"><div class="${this.classes.modal.scrollContents}">${this.productTemplate.masterTemplate}</div></div>`,
      footer: `<div class="${this.classes.modal.footer} {{#data.currentImage}}${this.classes.modal.footerWithImg}{{/data.currentImage}}">
                ${this.product.templates.button}
              </div>`,
    };
  }

  get productModalContents() {
    return {
      img: true,
      contents: true,
    };
  }

  get productModalOrder() {
    return ['img', 'contents', 'footer'];
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
    this.product.template = new Template(this.productModalTemplates, this.productModalContents, this.productModalOrder);
  }
}
