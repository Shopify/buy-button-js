import merge from '../utils/merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';
import windowUtils from '../utils/window-utils';

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

const propertiesWhitelist = [
  'background',
  'background-color',
  'border',
  'border-radius',
  'color',
  'border-color',
  'border-width',
  'border-style',
  'transition',
  'text-transform',
  'text-shadow',
  'box-shadow',
  'font-size',
  'font-family',
];

function whitelistedProperties(selectorStyles) {
  return Object.keys(selectorStyles).reduce((filteredStyles, propertyName) => {
    if (isPseudoSelector(propertyName) || isMedia(propertyName)) {
      filteredStyles[propertyName] = whitelistedProperties(selectorStyles[propertyName]);
      return filteredStyles;
    }
    if (propertiesWhitelist.indexOf(propertyName) > -1) {
      filteredStyles[propertyName] = selectorStyles[propertyName];
    }
    return filteredStyles;
  }, {});
}

export default class Product extends Component {
  constructor(config, props) {
    super(config, props);
    this.defaultVariantId = config.variantId;
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, this.config.option.order);
    this.cart = null;
    this.modal = null;
    this.imgStyle = '';
    this.selectedQuantity = 1;
  }

  init(data) {
    return super.init.call(this, data).then((model) => (
      this.createCart().then((cart) => {
        this.cart = cart;
        if (model) {
          this.render();
        }
        return model;
      })
    ));
  }

  createCart() {
    if (this.shouldCreateCart) {
      return this.props.createCart({
        options: this.config,
      });
    } else {
      return Promise.resolve(null);
    }
  }

  get shouldCreateCart() {
    return this.options.buttonDestination === 'cart' || (this.options.buttonDestination === 'modal' && this.config.modalProduct.buttonDestination === 'cart');
  }

  get iframeClass() {
    return `layout-${this.options.layout}`;
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
      optionsHtml: this.optionsHtml,
      contents: this.contents,
      currentImage: this.currentImage,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.buttonEnabled,
      priceClass: this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '',
      classes: this.classes,
      hasQuantity: this.options.contents.quantityInput,
      selectedQuantity: this.selectedQuantity,
      buttonText: this.buttonText,
      imgStyle: this.imgStyle,
      quantityClass: this.quantityClass,
    });
  }

  get wrapperClass() {
    return `${this.currentImage ? 'has-image' : 'no-image'} layout-${this.options.layout}`;
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents, {
      click: this.closeCartOnBgClick.bind(this),
      [`change .${this.classes.option.select}`]: this.onOptionSelect.bind(this),
      [`click .${this.classes.product.button}`]: this.onButtonClick.bind(this),
      [`click .${this.classes.product.blockButton}`]: this.onButtonClick.bind(this),
      [`click .${this.classes.product.quantityButton}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.product.quantityButton}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`focusout .${this.classes.product.quantityInput}`]: this.onQuantityBlur.bind(this),
    });
  }

  get buttonClass() {
    const disabledClass = this.buttonEnabled ? '' : this.classes.disabled;
    const quantityClass = this.options.contents.quantity ? 'beside-quantity' : '';
    return `${disabledClass} ${quantityClass}`;
  }

  get quantityClass() {
    return this.options.contents.quantityIncrement || this.options.contents.quantityDecrement ? 'with-buttons' : '';
  }

  get buttonText() {
    if (!this.variantExists) {
      return this.text.unavailable;
    }
    if (!this.variantInStock) {
      return this.text.outOfStock;
    }
    return this.text.button;
  }

  get buttonEnabled() {
    return this.buttonActionAvailable && this.variantExists && this.variantInStock;
  }

  get variantExists() {
    return Boolean(this.model.selectedVariant);
  }

  get variantInStock() {
    return this.variantExists && this.model.selectedVariant.available;
  }

  get requiresCart() {
    return this.options.buttonDestination === 'cart';
  }

  get buttonActionAvailable() {
    return !this.requiresCart || Boolean(this.cart);
  }

  get optionsHtml() {
    if (!this.contents.options) {
      return '';
    }
    return this.decoratedOptions.reduce((acc, option) => {
      const data = option;
      data.classes = this.classes;

      return acc + this.childTemplate.render({data});
    }, '');
  }

  get hasVariants() {
    return this.model.variants.length > 1;
  }

  get decoratedOptions() {
    return this.model.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => ({
        name: value,
        selected: value === option.selected,
      })),
    }));
  }

  get shouldResizeX() {
    return this.options.layout === 'horizontal';
  }

  get shouldResizeY() {
    return true;
  }

  setupModel(data) {
    return super.setupModel(data).then((model) => {
      return this.setDefaultVariant(model);
    });
  }

  wrapTemplate(html) {
    if (this.contents.button) {
      return `<div class="${this.wrapperClass} ${this.classes.product.product}">${html}</div>`;
    } else {
      return `<button class="${this.classes.product.blockButton} ${this.wrapperClass} ${this.classes.product.product}">${html}</button>`;
    }
  }

  sdkFetch() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({handle: this.handle}).then((products) => products[0]);
    }
    return Promise.resolve();
  }

  fetchData() {
    return this.sdkFetch().then((model) => {
      model.selectedQuantity = 0;
      return model;
    });
  }

  updateConfig(config) {
    if (this.iframe) {
      this.iframe.removeClass('layout-vertical');
      this.iframe.removeClass('layout-horizontal');
      this.iframe.addClass(`layout-${config.options.product.layout || this.options.layout}`);
    }
    super.updateConfig(config);
    this.cart.updateConfig(config);
    if (this.modal) {
      this.modal.updateConfig(config);
    }
  }

  onButtonClick(evt) {
    evt.stopPropagation();
    if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'CART_ADD', this.selectedVariantTrackingInfo)(this.model.selectedVariant, this.model.selectedQuantity);
    } else if (this.options.buttonDestination === 'modal') {
      this.openModal();
    } else if (this.options.buttonDestination === 'onlineStore') {
      this.openOnlineStore();
    } else {
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(1));
    }
  }

  get selectedVariantTrackingInfo() {
    const variant = this.model.selectedVariant;
    return {
      id: variant.id,
      name: variant.productTitle,
      quantity: this.model.selectedQuantity,
      sku: null,
      price: variant.price,
    };
  }

  get modalProductConfig() {
    let modalProductStyles;
    if (this.config.product.styles) {
      modalProductStyles = merge({}, Object.keys(this.config.product.styles).reduce((productStyles, selectorKey) => {
        productStyles[selectorKey] = whitelistedProperties(this.config.product.styles[selectorKey]);
        return productStyles;
      }, {}), this.config.modalProduct.styles);
    } else {
      modalProductStyles = {};
    }

    return Object.assign({}, this.config.modalProduct, {
      styles: modalProductStyles,
    });
  }

  get onlineStoreParams() {
    return {
      channel: 'buy_button',
      referrer: encodeURIComponent(windowUtils.location()),
      variant: this.model.selectedVariant.id,
    };
  }

  get onlineStoreQueryString() {
    return Object.keys(this.onlineStoreParams).reduce((string, key) => {
      return `${string}${key}=${this.onlineStoreParams[key]}&`;
    }, '?');
  }

  get onlineStoreURL() {
    return `https://${this.props.client.config.domain}/products/${this.id}${this.onlineStoreQueryString}`;
  }

  resizeUntilLoaded() {
    if (!this.iframe) {
      return;
    }
    const img = this.wrapper.getElementsByClassName(this.classes.product.img)[0];
    const productResize = setInterval(() => {
      if (!this.model.selectedVariantImage || img.clientHeight > 0) {
        return;
      }
      this.resize();
      clearInterval(productResize);
    }, 200);
  }

  render() {
    super.render();
    this.resizeUntilLoaded();
  }

  openOnlineStore() {
    window.open(this.onlineStoreURL);
  }

  openModal() {
    if (!this.modal) {
      this.modal = this.props.createModal({
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
          modal: {
            googleFonts: this.options.googleFonts,
          },
        }),
      }, this.props);
    }
    return this.modal.init(this.model);
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
    if (this.variantExists) {
      this.cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    return updatedOption;
  }

  closeCartOnBgClick() {
    if (this.cart.isVisible) {
      this.cart.close();
    }
  }

  setDefaultVariant(model) {
    if (!this.defaultVariantId) {
      return model;
    }

    const selectedVariant = model.variants.filter((variant) => variant.id === this.defaultVariantId)[0];
    if (selectedVariant) {
      model.options.forEach((option) => {
        option.selected = selectedVariant.optionValues.filter((optionValue) => optionValue.name === option.name)[0].value;
      });
    } else {

      // eslint-disable-next-line
      console.error('invalid variant ID');
    }
    return model;
  }
}
