import Component from '../component';
import Template from '../template';
import completeAssign from '../utils/complete-assign';

let cachedImage = null;

export default class Product extends Component {
  constructor(config, props) {
    super(config, props, 'product', 'option');
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, 'options');
  }

  get currentImage() {
    if (!cachedImage) {
      cachedImage = this.model.selectedVariantImage;
    }

    return cachedImage;
  }

  get viewData() {
    return completeAssign(this.model, {
      buttonText: this.variantAvailable ? this.text.button : 'Unavailable',
      childrenHtml: this.childrenHtml,
      currentImage: this.currentImage,
      buttonClass: this.variantAvailable ? '' : this.classes.disabled,
      hasVariants: this.hasVariants,
      classes: this.classes,
    });
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`change .${this.config.option.classes.select}`]: this.onOptionSelect.bind(this),
      [`click .${this.options.classes.button}`]: this.onButtonClick.bind(this),
    });
  }

  get windowParams() {
    return Object.keys(this.config.window).reduce((acc, key) => `${acc}${key}=${this.config.window[key]},`, '');
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

  fetchData() {
    return this.props.client.fetchProduct(this.id);
  }

  render() {
    super.render.call(this);
  }

  onButtonClick(evt, product) {
    if (this.options.buttonTarget === 'cart') {
      this.props.addToCart(product.model);
    } else {
      this.openCheckout();
    }
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  openCheckout() {
    window.open(this.model.selectedVariant.checkoutUrl(1), 'checkout', this.windowParams);
  }

  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => option.name === optionName)[0];
    updatedOption.selected = value;
    if (this.variantAvailable) {
      cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    return updatedOption;
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

  optionValueCanBeSelected(selections, name, value) {
    const variants = this.variantArray;
    selections[name] = value;

    const satisfactoryVariants = variants.filter((variant) => {
      const matchingOptions = Object.keys(selections).filter((key) => variant.optionValues[key] === selections[key]);
      return matchingOptions.length === Object.keys(selections).length;
    });

    return satisfactoryVariants.length;
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
}
