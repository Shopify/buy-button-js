import merge from 'lodash.merge';
import Component from '../component';
import CartToggle from '../components/toggle';
import Template from '../template';

export default class Cart extends Component {
  constructor(config, props, storage) {
    super(config, props, 'cart', 'lineItem');
    this.storage = storage || window.localStorage;
    this.addVariantToCart = this.addVariantToCart.bind(this);
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents, 'cart-item');
    this.node = document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-cart-wrapper';
    this.isVisible = false;
    this.toggle = new CartToggle(config, {cart: this});
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.close}`]: this.onClose.bind(this),
      [`click .${this.classes.quantityButton}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.quantityButton}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`focusout .${this.classes.quantityInput}`]: this.onQuantityBlur.bind(this),
    });
  }

  get childrenHtml() {
    return this.model.lineItems.reduce((acc, lineItem) => {
      const data = lineItem;
      data.classes = this.config.lineItem.classes;
      return acc + this.childTemplate.render({data});
    }, '');
  }

  get viewData() {
    return merge(this.model, {
      wrapperClass: this.isVisible ? 'js-active' : '',
      text: this.text,
      classes: this.classes,
      childrenHtml: this.childrenHtml,
    });
  }

  fetchData() {
    if (this.storage.getItem('lastCartId')) {
      return this.props.client.fetchCart(this.storage.getItem('lastCartId'));
    } else {
      return this.props.client.createCart().then((cart) => {
        this.storage.setItem('lastCartId', cart.id);
        return cart;
      });
    }
  }

  init(data) {
    return super.init(data).then((cart) => this.toggle.init({lineItems: cart.model.lineItems}).then(() => this));
  }

  destroy() {
    super.destroy();
    this.toggle.destroy();
  }

  onClose() {
    this.isVisible = false;
    this.render();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.render();
  }

  onQuantityBlur(evt, target) {
    this.updateQuantity(target.dataset.lineItemId, () => target.value);
  }

  onQuantityIncrement(qty, evt, target) {
    this.updateQuantity(target.dataset.lineItemId, (prevQty) => prevQty + qty);
  }

  updateQuantity(id, fn) {
    const item = this.model.lineItems.filter((lineItem) => lineItem.id === id)[0];
    const newQty = fn(item.quantity);
    return this.model.updateLineItem(id, newQty).then((cart) => {
      this.model = cart;
      this.render();
      return cart;
    });
  }

  addVariantToCart(variant, quantity = 1) {
    this.isVisible = true;
    return this.model.addVariants({variant, quantity}).then((cart) => {
      this.render();
      this.toggle.render();
      return cart;
    });
  }
}
