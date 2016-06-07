import ComponentContainer from './container';
import View from './view';
import cartDefaults from '../defaults/cart';

export default class Cart extends ComponentContainer {
  constructor(config, props) {
    let cartConfig = Object.assign({}, cartDefaults, config);
    super(cartConfig, props);
  }

  addItem(data) {
    this.props.model.addVariants({variant: data.selectedVariant, quantity: 1}).then((cart) => {
      this.props.model = cart;
      this.render();
    });
  }

  getData() {
    if(localStorage.getItem('lastCartId')) {
      return this.props.client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
        return remoteCart;
      });
    } else {
      return this.props.client.createCart().then(function (newCart) {
        localStorage.setItem('lastCartId', newCart.id);
        return newCart;
      });
    }
  }

  render() {
    super.render();
    let parent = this.wrapper.querySelector('[data-include]');

    this.lineItems = this.props.model.lineItems.map((l) => new View(this.config.lineItemConfig, l, {}));

    this.lineItems.forEach((item) => {
      let wrapper = this._createWrapper(parent, this.config.lineItemConfig.className);
      item.render(wrapper);
    });

    this.resize();
  }
}
