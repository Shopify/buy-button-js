import ComponentContainer from './container';
import productDefaults from '../defaults/product';
import View from './view';

export default class Product extends ComponentContainer {
  constructor(config, props) {
    let productConfig = Object.assign({}, productDefaults, config);
    super(productConfig, props);
    this.events = {
      addVariantToCart: this.onCartAdd.bind(this)
    }
  }

  getData() {
    return this.props.client.fetchProduct(this.config.id).then((product) => {
      return product;
    });
  }

  onCartAdd(data) {
    this.props.callbacks.addVariantToCart(data.data);
  }

  selectChange(view, event) {
    let target = event.target;
    let selectedValue = target.options[target.selectedIndex].value;
    let name = target.getAttribute('name');
    this.updateSelectedVariant(name, selectedValue);
  }

  updateSelectedVariant(name, value) {
    let selectedOption = this.props.model.options.filter((option, index) => {
      return option.name === name;
    })[0];
    selectedOption.selected = value;
    this.render();
  }

  render(wrapper) {
    super.render(wrapper);
    let parent = this.wrapper.querySelector('[data-include]');

    this.props.model.options.forEach((optionModel) => {
      let option = new View(this.config.optionConfig, optionModel, {
        'selectVariant': this.selectChange.bind(this)
      });
      let wrapper = this._createWrapper(parent, this.config.optionConfig.className);
      option.render(wrapper);
    });

    this.resize();
  }
}
