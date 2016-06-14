import ComponentContainer from './container';
import View from './view';
import cartDefaults from '../defaults/cart';

export default class Cart extends ComponentContainer {
  constructor(config, props) {
    let cartConfig = Object.assign({}, cartDefaults, config);
    super(cartConfig, props);
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

  updateLineItemQty(inc, view) {
    let variant = view.data;
    let newQuantity = view.data.quantity + inc;
    this.props.model.updateLineItem(variant.id, newQuantity).then((cart) => {
      this.render();
    });
  }

  addItem(data) {
    this.props.model.addVariants({variant: data.selectedVariant, quantity: 1}).then((cart) => {
      this.props.model = cart;
      this.render();
    });
  }

  render() {
    super.render();
    let parent = this.wrapper.querySelector('[data-include]');
    this.props.model.lineItems.forEach((itemModel) => {
      let lineItem = new View(this.config.lineItemConfig, itemModel, {
        'incQuantity': this.updateLineItemQty.bind(this, 1),
        'decQuantity': this.updateLineItemQty.bind(this, -1)
      });
      let wrapper = this._createWrapper(parent, this.config.lineItemConfig.className);
      lineItem.render(wrapper);
    });

    this.resize();
  }
}
