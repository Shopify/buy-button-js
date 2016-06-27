import Component from './component';
import Template from './template';

export default class Cart extends Component {
  constructor(config, props) {
    super(config, props, 'cart');
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents);
  }

  addItem(product) {
    this.model.addVariants({variant: product.selectedVariant, quantity: 1}).then((cart) => {
      console.log(cart);
      this.model = cart;
      this.render();
    });
  }

  render() {
    super.render.call(this, this.childrenHtml);
  }

  get childrenHtml() {
    return this.model.lineItems.reduce((acc, lineItem) => {
      const data = lineItem;
      data.classes = this.config.lineItem.classes;
      console.log(data);
      return acc + this.childTemplate.render({ data: data });
    }, '');
  }

  fetchData() {
    const lastCart = localStorage.getItem('lastCartId')
    if (lastCart) {
      return this.props.client.fetchCart(lastCart);
    } else {
      return this.props.client.createCart().then((data) => {
        try {
          localStorage.setItem('lastCartId', data.id);
        } catch (e) {

        }
        return data;
      });
    }
  }
}
