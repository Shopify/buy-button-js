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

  alterDOM() {
    const imgTemplate = new Template(this.product.templates, {img: true}, 'product-modal-img');
    const imgHtml = imgTemplate.render({data: this.product.viewData});

    const buttonTemplate = new Template(this.product.templates, {
      quantity: this.product.contents.quantity,
      button: true,
    }, 'product-modal-footer');

    const buttonHtml = buttonTemplate.render({data: this.product.viewData});

    const footerDiv = this.document.createElement('div');
    footerDiv.innerHTML = buttonHtml;
    footerDiv.className = 'modal-footer';

    const imgDiv = this.document.createElement('div');
    imgDiv.innerHTML = imgHtml;
    imgDiv.className = 'modal-img';

    this.wrapper.children[0].appendChild(footerDiv);
    this.wrapper.children[0].insertBefore(imgDiv, this.wrapper.children[0].children[0]);

    const overLayDiv = this.document.createElement('div');
    overLayDiv.className = 'modal-overlay';
    this.document.body.appendChild(overLayDiv);

    this.product.wrapper = this.wrapper;
    return Promise.resolve();
  }

  render() {
    super.render();
    this.iframe.addClass('js-active');

    const config = {
      node: this.document.querySelector(`.${this.classes.modal.contents}`),
      options: merge({}, this.config),
    };

    this.product = new Product(config, this.props);

    const contents = Object.assign({}, this.product.contents, {
      img: false,
      button: false,
      quantity: false,
    });

    this.product.template = new Template(this.product.templates, contents, 'modal-scroll-content');
    return this.product.init(this.model).then(() => this.alterDOM()).then(() => this.product.delegateEvents()).then(() => this.loadImgs());
  }
}
