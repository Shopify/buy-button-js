import ComponentContainer from './container';
import productTemplate from '../templates/product';
import View from './view';
import optionTemplate from '../templates/option';

const productDefaults = {
  optionConfig: {
    templates: optionTemplate
  }
}

export default class Product extends ComponentContainer {
  constructor(config, props, model) {
    let productConfig = Object.assign({}, productDefaults, config);
    super(productConfig, props, model);
  }

  getData() {
    return this.props.client.fetchProduct(this.config.id).then((product) => {
      return product;
    });
  }

  onCartAdd(data) {
    this.props.addVariantToCart(data.data);
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
    this.product = new View(this.config, this.model, this.props);
    this.product.render(this.wrapper);
    this.wrapper.setAttribute('id', this.model.id);

    this.options = this.model.options.map((option) => {
      return new View(this.config.optionConfig);
    });

    console.log(this.options);
    this.resize();
  }
}
