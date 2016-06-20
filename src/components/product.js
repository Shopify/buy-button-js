import ComponentContainer from './container';
import productDefaults from '../defaults/product';
import View from './view';
import merge from 'deepmerge';

export default class Product extends ComponentContainer {
  constructor(config, props, events = {}) {
    const productConfig = merge(productDefaults, config);
    super(productConfig, props);

    if (this.config.modal) {
      this.removeContents('button');
      this.removeContents('variantSelection');
      this.wrapContents('modalTrigger');
    }

    this.events = Object.assign({}, events, {
      addVariantToCart: this.onCartAdd.bind(this),
      openModal: this.openModal.bind(this),
    })
  }

  getData() {
    return this.props.client.fetchProduct(this.config.id).then((product) => {
      return product;
    });
  }

  removeContents(item) {
    let index = this.config.contents.indexOf(item);
    if (index > -1) {
      this.config.contents.splice(index, 1);
    }
  }

  wrapContents(item) {
    this.config.contents.unshift(`${item}Open`);
    this.config.contents.push(`${item}Close`);
  }

  openModal() {
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

    if (this.config.contents.indexOf('variantSelection') > -1) {
      this.props.model.options.forEach((optionModel) => {
        let option = new View(this.config.optionConfig, optionModel, {
          'selectVariant': this.selectChange.bind(this)
        });
        let wrapper = this._createWrapper(parent, this.config.optionConfig.className);
        option.render(wrapper);
      });
    }

    this.resize();
  }
}
