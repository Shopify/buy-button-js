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
  constructor(config) {
    let cartConfig = Object.assign({}, cartDefaults, config);
    super(cartConfig);
    this.init();
  }

  addItem(data) {
    this.updateRemoteCart().then((newCart) => {
      this.model = newCart;
      this.render();
    });
  }

  updateRemoteCart() {
    return new Promise((resolve) => {
      return resolve({
        title: 'test',
        total: '$100',
        lineItems: [
          {
            title: "Hot hat",
            price: "$10.99",
            quantity: "2"
          },
          {
            title: "Cat cactus",
            price: "$19.99",
            quantity: "1"
          }
        ]
      })
    });
  }

  getData() {
    return new Promise((resolve) => {
      return resolve({
        title: 'test',
        total: '$100',
        lineItems: [
          {
            title: "Hot hat",
            price: "$10.99",
            quantity: "2"
          }
        ]
      })
    });
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
