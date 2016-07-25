import merge from 'lodash.merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';

export default class Product extends Component {
  constructor(config, props) {
    super(config, props);
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, 'options');
    this.cart = null;
  }

  init(data) {
    return super.init.call(this, data).then((model) => (
      this.props.createCart(this.config).then((cart) => {
        this.cart = cart;
        this.render();
        return model;
      })
    ));
  }

  get typeKey() {
    return 'product';
  }

  get childTypeKey() {
    return 'option';
  }

  get currentImage() {
    if (!this.cachedImage) {
      this.cachedImage = this.model.selectedVariantImage;
    }

    return this.cachedImage;
  }

  get viewData() {
    return merge(this.model, {
      buttonText: this.variantAvailable ? this.text.button : 'Unavailable',
      childrenHtml: this.childrenHtml,
      currentImage: this.currentImage,
      buttonClass: this.variantAvailable ? '' : this.classes.disabled,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.cart,
      priceClass: this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '',
      classes: this.classes,
    });
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      'click': this.closeCartOnBgClick.bind(this),
      [`change .${this.config.option.classes.select}`]: this.onOptionSelect.bind(this),
      [`click .${this.options.classes.button}`]: this.onButtonClick.bind(this),
    });
  }

  get variantAvailable() {
    return this.model.selectedVariant;
  }

  get childrenHtml() {
    return this.decoratedOptions.reduce((acc, option) => {
      const data = option;
      data.classes = this.config.option.classes;

      return acc + this.childTemplate.render({data});
    }, '');
  }

  get hasVariants() {
    return this.model.variants.length > 1;
  }

  get variantArray() {
    delete this.variantsMemo;
    this.variantsMemo = this.model.variants.map((variant) => {
      const betterVariant = {
        id: variant.id,
        optionValues: {},
      };
      variant.optionValues.forEach((optionValue) => {
        betterVariant.optionValues[optionValue.name] = optionValue.value;
      });

      return betterVariant;
    });
    return this.variantsMemo;
  }

  get selections() {
    const selections = {};

    this.model.selections.forEach((selection, index) => {
      const option = this.model.options[index];
      selections[option.name] = selection;
    });

    return selections;
  }

  get decoratedOptions() {
    return this.model.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => ({
        name: value,
        selected: value === option.selected,
        disabled: !this.optionValueCanBeSelected(Object.assign({}, this.selections), option.name, value),
      })),
    }));
  }

  fetchData() {
    return this.props.client.fetchProduct(this.id);
  }

  onButtonClick() {
    if (this.options.buttonDestination === 'cart') {
      this.cart.addVariantToCart(this.model.selectedVariant);
    } else {
      this.openCheckout();
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(1));
    }
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => option.name === optionName)[0];
    updatedOption.selected = value;
    if (this.variantAvailable) {
      this.cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    return updatedOption;
  }

  optionValueCanBeSelected(selections, name, value) {
    const variants = this.variantArray;
    selections[name] = value;

    const satisfactoryVariants = variants.filter((variant) => {
      const matchingOptions = Object.keys(selections).filter((key) => variant.optionValues[key] === selections[key]);
      return matchingOptions.length === Object.keys(selections).length;
    });

    return satisfactoryVariants.length;
  }

  closeCartOnBgClick(evt) {
    if (!this.wrapper.querySelector(`.${this.classes.button}`).contains(evt.target)) {
      this.cart.close();
    }
  }
}
