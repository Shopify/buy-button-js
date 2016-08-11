import merge from 'lodash.merge';
import Component from '../component';
import CartToggle from './toggle';
import Template from '../template';
import Checkout from './checkout';

export default class Cart extends Component {
  constructor(config, props, storage) {
    super(config, props);
    this.storage = storage || window.localStorage;
    this.addVariantToCart = this.addVariantToCart.bind(this);
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents);
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
      return acc + this.childTemplate.render({data}, (output) => `<div class=${this.classes.lineItem.lineItem}>${output}</div>`);
    }, '');
  }

  get viewData() {
    return merge(this.model, {
      wrapperClass: this.isVisible ? 'js-active' : '',
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
      this.iframe.addClass('js-active');
    } else {
      this.iframe.removeClass('js-active');
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
    this.updateQuantity(target, () => target.value);
  }

  onQuantityIncrement(qty, evt, target) {
    this.updateQuantity(target, (prevQty) => prevQty + qty);
  }

  removeItem(id, el) {
    return this.model.updateLineItem(id, 0).then((cart) => {
      el.classList.add('is-discarded');
      setTimeout(() => {
        el.parentNode.removeChild(el);
      }, 1000);
    });
  }

  updateConfig(config) {
    super.updateConfig(config);
    this.toggle.updateConfig(config);
  }

  updateItem(id, qty) {
    return this.model.updateLineItem(id, qty).then((cart) => {
      this.model = cart;
      this.render();
      this.toggle.render();
      return cart;
    });
  }

  onCheckout() {
    this.checkout.open(this.model.checkoutUrl);
  }

  updateQuantity(target, fn) {
    const id = target.getAttribute('data-line-item-id')
    const item = this.model.lineItems.filter((lineItem) => lineItem.id === id)[0];
    const newQty = fn(item.quantity);
    if (newQty > 0) {
      this.updateItem(id, newQty);
    } else {
      this.removeItem(id, target.parentNode.parentNode);
    }
  }

  addVariantToCart(variant, quantity = 1) {
    const delay = this.isVisible ? 0 : 250;
    this.isVisible = true;
    this.render();
    setTimeout(() => {
      return this.model.addVariants({variant, quantity}).then((cart) => {
        this.render();
        this.toggle.render();
        return cart;
      });
    }, delay);
  }
}
