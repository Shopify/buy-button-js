import ComponentContainer from './container';
import productDefaults from '../defaults/product';
import View from './view';

export default class Product extends ComponentContainer {
  constructor(config, props) {
    let productConfig = Object.assign({}, productDefaults, config);
    super(productConfig, props);

    if (this.config.modal) {
      this.removeContents('button');
      this.removeContents('variantSelection');
      this.wrapContents('modalTrigger');
    }

    this.events = {
      addVariantToCart: this.onCartAdd.bind(this),
      openModal: this.openModal.bind(this)
    }
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
    this.props.modal.div.classList.add('active');
    let bg = this.props.modal.document.createElement('div');
    bg.classList.add('product-modal-overlay');
    bg.classList.add('active');
    this.props.modal.document.body.appendChild(bg);
    let wrapper = this._createWrapper(this.props.modal.document.body, 'product-modal-container', 'active');
    super.render(wrapper);
    let modalConfig = Object.assign({}, this.config, {
      contents: ['title', 'variantSelection', 'button']
    });
    let view = new View(modalConfig, this.props.model, this.events);
    view.render(this.wrapper);
    wrapper.setAttribute('id', view.id);
    let parent = wrapper.querySelector('[data-include]');

    this.props.model.options.forEach((optionModel) => {
      let option = new View(this.config.optionConfig, optionModel, {
        'selectVariant': this.selectChange.bind(this)
      });
      let wrapper = this._createWrapper(parent, this.config.optionConfig.className);
      option.render(wrapper);
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
