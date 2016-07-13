import Component from '../component';
import Template from '../template';
import completeAssign from '../utils/complete-assign';

export default class Cart extends Component {
  constructor(config, props) {
    super(config, props, 'cart', 'lineItem');
    this.addVariantToCart = this.addVariantToCart.bind(this);
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents, 'cart-item');
  }

  fetchData() {
    if (localStorage.getItem('lastCartId')) {
      return this.props.client.fetchCart(localStorage.getItem('lastCartId'));
    } else {
      return this.props.client.createCart().then((cart) => {
        localStorage.setItem('lastCartId', cart.id);
        return cart;
      });
    }
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.quantityButton}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.quantityButton}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`focusout .${this.classes.quantityInput}`]: this.onQuantityBlur.bind(this),
    });
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

  get childrenHtml() {
    return this.model.lineItems.reduce((acc, lineItem) => {
      const data = lineItem;
      data.classes = this.config.lineItem.classes;
      return acc + this.childTemplate.render({data});
    }, '');
  }

  get viewData() {
    return completeAssign(this.model, {
      text: this.text,
      classes: this.classes,
      childrenHtml: this.childrenHtml,
    });
  }

  addVariantToCart(variant, quantity = 1) {
    return this.model.addVariants({variant, quantity}).then((cart) => {
      this.render();
      return cart;
    });
  }
}
