import Component from './component';

export default class Cart extends Component {
  constructor(config, props) {
    super(config, props, 'cart');
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
