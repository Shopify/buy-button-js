import View from '../view';
import merge from '../utils/merge';

export default class CartView extends View {
  constructor(component) {
    super(component);
    this.node.className = 'shopify-buy-cart-wrapper';
  }

  render() {
    super.render();
    if (!this.iframe) {
      return;
    }
    if (this.component.isVisible) {
      this.iframe.addClass('is-active');
      this.iframe.addClass('is-initialized');
    } else {
      this.iframe.removeClass('is-active');
    }
  }

  wrapTemplate(html) {
    return `<div class="${this.component.classes.cart.cart}">${html}</div>`;
  }

  get wrapperClass() {
    return this.component.isVisible ? 'is-active' : '';
  }
}
