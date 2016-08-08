import merge from 'lodash.merge';
import Component from '../component';
import Product from './product';
import Template from '../template';

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
    return Object.assign({}, this.options.DOMEvents, this.product.DOMEvents, {
      [`click .${this.classes.modal.overlay}`]: this.closeOnBgClick.bind(this),
      [`click .${this.classes.modal.close}`]: this.close.bind(this),
    });
  }

  closeOnBgClick(evt) {
    if (!this.wrapper.querySelector(`.${this.classes.modal.contents}`).contains(evt.target)) {
      this.close();
    }
  }

  close() {
    this.iframe.removeClass('js-active');
  }

  render() {
    super.render();
    this.iframe.addClass('js-active');

    const config = {
      node: this.document.querySelector(`.${this.classes.modal.modal}`),
      options: merge({}, this.config),
    };

    this.product = new Product(config, this.props);

    const productContents = Object.assign({}, this.product.contents, {
      img: false,
      button: false,
      quantity: false,
    });

    const productTemplate = new Template(this.product.templates, productContents);

    const templates = {
      img: `<div class="modal-img">${this.product.templates.img}</div>`,
      contents: `<div class="modal-contents"><div class="modal-scroll-contents">${productTemplate.masterTemplate}</div></div>`,
      footer: `<div class="modal-footer">
                ${this.product.templates.quantity}
                ${this.product.templates.button}
              </div>`
    }

    this.product.template = new Template(templates, {img: true, contents: true, footer: true});

    return this.product.init(this.model).then(() => this.loadImgs());
  }
}
