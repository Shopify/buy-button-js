import View from '../view';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

export default class CartView extends View {
  constructor(component) {
    super(component);
    this.node.className = 'shopify-buy-cart-wrapper';
  }

  render() {
    super.render();
    if (this.component.isVisible) {
      this.addClass('is-active');
      this.addClass('is-visible');
      this.addClass('is-initialized');
      if (this.iframe) {
        addClassToElement('is-block', this.iframe.el);
      }
    } else {
      this.removeClass('is-active');
      if (!this.component.props.browserFeatures.transition) {
        this.removeClass('is-visible');
        if (this.iframe) {
          removeClassFromElement('is-block', this.iframe.el);
        }
      }
    }
  }

  delegateEvents() {
    super.delegateEvents();
    if (this.component.props.browserFeatures.transition) {
      this.node.addEventListener('transitionend', () => {
        if (this.component.isVisible) {
          return;
        }

        this.removeClass('is-visible');
        if (this.iframe) {
          removeClassFromElement('is-block', this.iframe.el);
        }
      });
    }
  }

  wrapTemplate(html) {
    return `<div class="${this.component.classes.cart.cart}">${html}</div>`;
  }

  get wrapperClass() {
    return this.component.isVisible ? 'is-active' : '';
  }
}
