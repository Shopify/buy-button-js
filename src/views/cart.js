import View from '../view';

export default class CartView extends View {
  constructor(component) {
    super(component);
    this.node.className = 'shopify-buy-cart-wrapper';
  }

  render() {
    super.render();
    if (this.component.isVisible) {
      this.addClass('is-active');
      this.addClass('is-initialized');
    } else {
      this.removeClass('is-active');
    }
  }

  wrapTemplate(html) {
    return `<div class="${this.component.classes.cart.cart}">${html}</div>`;
  }

  get wrapperClass() {
    return this.component.isVisible ? 'is-active' : '';
  }
}
