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
    this.modal = null;
    this.selectedQuantity = 1;
  }

  init(data) {
    return super.init.call(this, data).then((model) => (
      this.createCart().then((cart) => {
        this.cart = cart;
        this.render();
        return model;
      })
    ));
  }

  createCart() {
    if (this.options.buttonDestination === 'cart' || this.config.modalProduct.buttonDestination === 'cart') {
      return this.props.createCart(this.config);
    } else {
      return Promise.resolve();
    }
  }

  get typeKey() {
    return 'product';
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
      optionsHtml: this.optionsHtml,
      currentImage: this.currentImage,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.cart && this.options.buttonDestination === 'cart',
      priceClass: this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '',
      classes: this.classes,
      hasQuantity: this.options.contents.quantity,
      selectedQuantity: this.selectedQuantity,
    });
  }

  get buttonClass() {
    return `${this.variantAvailable ? '' : this.classes.disabled} ${this.options.contents.quantity ? 'beside-quantity' : ''}`;
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents, {
      click: this.closeCartOnBgClick.bind(this),
      [`change .${this.classes.option.select}`]: this.onOptionSelect.bind(this),
      [`click .${this.classes.product.button}`]: this.onButtonClick.bind(this),
      [`click .${this.classes.product.quantityButton}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.product.quantityButton}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`focusout .${this.classes.product.quantityInput}`]: this.onQuantityBlur.bind(this),
    });
  }

  get variantAvailable() {
    return this.model.selectedVariant;
  }

  get optionsHtml() {
    return this.decoratedOptions.reduce((acc, option) => {
      const data = option;
      data.classes = this.classes;

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
        disabled: !this.optionValueCanBeSelected(merge({}, this.selections), option.name, value),
      })),
    }));
  }

  fetchMethod() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({handle: this.handle}).then((products) => products[0]);
    }
  }

  fetchData() {
    return this.fetchMethod().then((model) => {
      model.selectedQuantity = 0;
      return model;
    });
  }

  onButtonClick() {
    if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this.cart.addVariantToCart(this.model.selectedVariant, this.model.selectedQuantity);
    } else if (this.options.buttonDestination === 'modal') {
      this.openModal();
    } else {
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(1));
    }
  }

  openModal() {
    if (!this.modal) {
      const productConfig = merge({}, this.config.product, this.config.modalProduct);
      this.modal = this.props.createModal({
        options: merge({}, this.config, {
          product: productConfig,
        }),
      }, this.props);
    }
    this.modal.init(this.model);
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  onQuantityBlur(evt, target) {
    this.updateQuantity(() => target.value);
  }

  onQuantityIncrement(qty) {
    this.updateQuantity((prevQty) => prevQty + qty);
  }

  updateQuantity(fn) {
    let quantity = fn(this.selectedQuantity);
    if (quantity < 0) {
      quantity = 0;
    }
    this.selectedQuantity = quantity;
    this.render();
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
    if (!this.wrapper.querySelector(`.${this.classes.product.button}`).contains(evt.target)) {
      this.cart.close();
    }
  }
}
