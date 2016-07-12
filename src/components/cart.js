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
    if(localStorage.getItem('lastCartId')) {
      return this.props.client.fetchCart(localStorage.getItem('lastCartId'))
    } else {
      return this.props.client.createCart().then((cart) => {
        localStorage.setItem('lastCartId', cart.id);
        return cart;
      });
    }
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.quantityButton}.quantity-increment`]: this.updateQuantity.bind(this, 1),
      [`click .${this.classes.quantityButton}.quantity-decrement`]: this.updateQuantity.bind(this, -1),
    });
  }

  updateQuantity(qty, evt, target) {
    const id = target.dataset['lineItemId'];
    const item = this.model.lineItems.filter((lineItem) => lineItem.id === id)[0];
    const newQty = item.quantity + qty;
    this.model.updateLineItem(id, newQty).then((cart) => {
      this.model = cart;
      this.render();
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
      childrenHtml: this.childrenHtml
    });
  }

  addVariantToCart(id, quantity = 1) {
    this.model.addVariants({variant: id, quantity}).then(() => {
      this.render();
    });
  }
}
