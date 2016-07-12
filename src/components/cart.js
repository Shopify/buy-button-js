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
