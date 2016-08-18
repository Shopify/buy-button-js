import merge from 'lodash.merge';
import Component from '../component';
import Product from './product';
import Template from '../template';

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
    }));
  }

  get productModalTemplates() {
    const quantity = this.product.config.modalProduct.contents.quantity ? this.product.templates.quantity : '';
    return {
      img: `<div class="${this.classes.modal.img}">${this.product.templates.img}</div>`,
      contents: `<div class="${this.classes.modal.contents} {{#data.currentImage}}${this.classes.modal.contentsWithImg}{{/data.currentImage}}"><div class="${this.classes.modal.scrollContents}">${this.productTemplate.masterTemplate}</div></div>`,
      footer: `<div class="${this.classes.modal.footer} {{#data.currentImage}}${this.classes.modal.footerWithImg}{{/data.currentImage}}">
                ${quantity}
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
    return super.init(data);
  }

  close() {
    this.wrapper.classList.remove('is-active');
    this.iframe.removeClass('is-active');
    this.iframe.parent.addEventListener('transitionend', () => {
      this.iframe.removeClass('is-block');
    });
  }

  render() {
    if (!this.isVisible) {
      return Promise.resolve();
    }
    super.render();
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
    this.wrapper.classList.add('is-active');
    this.product = new Product(this.productConfig, this.props);
    this.product.template = new Template(this.productModalTemplates, this.productModalContents);
    return this.product.init(this.model).then(() => this.loadImgs());
  }
}
