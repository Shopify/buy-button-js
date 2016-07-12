import Component from '../component';
import completeAssign from '../utils/complete-assign';

export default class Cart extends Component {
  constructor(config, props) {
    super(config, props, 'cart');
  }

  fetchData() {
    if(localStorage.getItem('lastCartId')) {
      return this.props.client.fetchCart(localStorage.getItem('lastCartId'))
    } else {
      return this.props.client.createCart().then((cart) => {
        localStorage.setItem('lastCartId', cart.id);
      });
    }
  }

  get viewData() {
    return completeAssign(this.model, {
      text: this.text,
      classes: this.classes,
    });
  }
}
