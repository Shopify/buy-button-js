import merge from '../utils/merge';
import Component from '../component';
import CartToggle from './toggle';
import Template from '../template';
import Checkout from './checkout';
import {addClassToElement} from '../utils/element-class';

export default class Cart extends Component {
  constructor(config, props, storage) {
    super(config, props);
    this.storage = storage || window.localStorage;
    this.addVariantToCart = this.addVariantToCart.bind(this);
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents, this.config.lineItem.order);
    this.node = document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-cart-wrapper';
    this.isVisible = false;
    this.toggle = new CartToggle(config, Object.assign({}, this.props, {cart: this}));
    this.checkout = new Checkout(this.config);
  }

  get typeKey() {
    return 'cart';
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents, {
      [`click .${this.classes.cart.close}`]: this.close.bind(this),
      [`click .${this.classes.lineItem.quantityButton}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.lineItem.quantityButton}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`click .${this.classes.cart.button}`]: this.onCheckout.bind(this),
      [`focusout .${this.classes.lineItem.quantityInput}`]: this.onQuantityBlur.bind(this),
    });
  }

  get lineItemsHtml() {
    return this.model.lineItems.reduce((acc, lineItem) => {
      const data = lineItem;
      data.classes = this.classes;
      return acc + this.childTemplate.render({data}, (output) => `<div id="${lineItem.id}" class=${this.classes.lineItem.lineItem}>${output}</div>`);
    }, '');
  }

  get viewData() {
    return merge(this.model, {
      wrapperClass: this.isVisible ? 'is-active' : '',
      text: this.text,
      classes: this.classes,
      lineItemsHtml: this.lineItemsHtml,
      isEmpty: this.model.lineItems.length < 1,
    });
  }

  fetchData() {
    if (this.storage.getItem('lastCartId')) {
      return this.props.client.fetchCart(this.storage.getItem('lastCartId'));
    } else {
      return this.props.client.createCart().then((cart) => {
        try {
          this.storage.setItem('lastCartId', cart.id);
        } catch (err) {
          // eslint-disable-next-line
          console.warn('localStorage unsupported');
        }
        return cart;
      });
    }
  }

  init(data) {
    return super.init(data).then((cart) => this.toggle.init({lineItems: cart.model.lineItems}).then(() => this));
  }

  render() {
    super.render();
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  }

  destroy() {
    super.destroy();
    this.toggle.destroy();
  }

  close() {
    this.isVisible = false;
    this.render();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.render();
  }

  onQuantityBlur(evt, target) {
    this.setQuantity(target, () => target.value);
  }

  onQuantityIncrement(qty, evt, target) {
    this.setQuantity(target, (prevQty) => prevQty + qty);
  }

  setQuantity(target, fn) {
    const id = target.getAttribute('data-line-item-id');
    const item = this.model.lineItems.filter((lineItem) => lineItem.id === id)[0];
    const newQty = fn(item.quantity);
    return this.updateItem(id, newQty);
  }

  updateItem(id, qty) {
    return this.model.updateLineItem(id, qty).then((cart) => {
      this.model = cart;
      this.toggle.render();
      if (qty > 0) {
        this.render();
      } else {
        this.animateRemoveItem(id);
      }
      return cart;
    });
  }

  animateRemoveItem(id) {
    const el = this.document.getElementById(id);
    addClassToElement('is-hidden', el);
    if (el.parentNode) {
      if (this.props.browserFeatures.transition) {
        el.addEventListener('transitionend', () => {
          // eslint-disable-next-line
          // TODO: why is transitionend sometimes called twice?
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } else {
        el.parentNode.removeChild(el);
      }
    }
  }

  updateConfig(config) {
    super.updateConfig(config);
    this.toggle.updateConfig(config);
  }

  onCheckout() {
    this.checkout.open(this.model.checkoutUrl);
  }

  addVariantToCart(variant, quantity = 1) {
    this.isVisible = true;
    this.render();
    return this.model.addVariants({variant, quantity}).then((cart) => {
      this.render();
      this.toggle.render();
      return cart;
    });
  }
}
