import ComponentContainer from './container';
import productTemplate from '../templates/product';
import View from './view';
import optionTemplate from '../templates/option';

const productDefaults = {
  optionConfig: {
    templates: optionTemplate,
    contents: ['option'],
    className: 'option'
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

  selectChange(view, event) {
    let target = event.target;
    let selectedValue = target.options[target.selectedIndex].value;
    let name = target.getAttribute('name');
    this.updateSelectedVariant(name, selectedValue);
  }

  updateSelectedVariant(name, value) {
    let selectedVariant = this.model.options.filter((option) => {
      return option.name === name;
    })[0].selected = value;
    this.render();
  }

  render(wrapper) {
    this.wrapper = wrapper || (this.wrapper || this._createWrapper());
    this.product = new View(this.config, this.model, this.props);
    this.product.render(this.wrapper);
    this.wrapper.setAttribute('id', this.model.id);

    this.options = this.model.options.map((option) => {
      return new View(this.config.optionConfig, option, {
        'selectVariant': this.selectChange.bind(this)
      });
    });

    this.options.forEach((option) => {
      let wrapper = this._createWrapper(this.wrapper, this.config.optionConfig.className);
      option.render(wrapper);
    });

    this.resize();
  }
}
