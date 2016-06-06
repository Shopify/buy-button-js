import ComponentContainer from './container';
import productTemplate from '../templates/product';

class Product extends ComponentContainer {
  constructor(config) {
    let productConfig = Object.assign({}, productDefaults, config);
    super(productConfig);
  }

  getData() {
    return new Promise((resolve) => {
      return resolve({
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      })
    });
  }

  onCartAdd(data) {
    console.log(data);
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
    this.product = new ProductView(this.config, this.model, {
      'buyButton': this.onCartAdd.bind(this)
    });
    this.wrapper.innerHTML = this.product.render();
    this.wrapper.setAttribute('id', item.id);
    this.resize();
  }
}
