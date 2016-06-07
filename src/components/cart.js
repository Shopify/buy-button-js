import ComponentContainer from './container';
import cartTemplate from '../templates/cart';
import lineItemTemplate from '../templates/line-item';
import View from './view';

const cartDefaults = {
  className: 'cart',
  iframe: true,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: cartTemplate,
  contents: ['title', 'total', 'checkout'],
  lineItemConfig: {
    className: 'lineItem',
    templates: lineItemTemplate,
    contents: ['title', 'price', 'quantity']
  }
}

export default class Cart extends ComponentContainer {
  constructor(config, props) {
    let cartConfig = Object.assign({}, cartDefaults, config);
    super(cartConfig, props);
    this.init();
  }

  addItem(data) {
    this.model.addVariants({variant: data.selectedVariant, quantity: 1}).then((cart) => {
      this.model = cart;
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
    this.wrapper = this.wrapper || this._createWrapper();
    this.cart = new View(this.config, this.model, {});
    this.cart.render(this.wrapper);;
    this.wrapper.setAttribute('id', this.cart.id);

    this.lineItems = this.model.lineItems.map((l) => new View(this.config.lineItemConfig, l, {}));

    this.lineItems.forEach((item) => {
      let wrapper = this._createWrapper(this.wrapper, this.config.lineItemConfig.className);
      item.render(wrapper);
    });

    this.resize();
  }
}
