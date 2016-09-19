import merge from '../utils/merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';
import windowUtils from '../utils/window-utils';

const pollInterval = 200;

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
    this.cartNode = config.cartNode;
    this.modalNode = config.modalNode;
    this.defaultVariantId = config.variantId;
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, this.config.option.order);
    this.cart = null;
    this.modal = null;
    this.imgStyle = '';
    this.selectedQuantity = 1;
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

  get shouldUpdateImage() {
    return !this.cachedImage || (this.image && this.image.src && this.image.src !== this.cachedImage.src);
  }

  get currentImage() {
    if (this.shouldUpdateImage) {
      this.cachedImage = this.image;
    }

    return this.cachedImage;
  }

  get image() {
    if (!this.model.selectedVariant || !this.model.selectedVariant.imageVariants) {
      return null;
    }

    if (this.options.imageSize) {
      return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === this.options.imageSize)[0];
    }

    if (this.options.width && this.options.layout === 'vertical') {
      return this.model.selectedVariant.imageVariants.filter((image) => {
        return parseInt(image.dimension, 10) >= parseInt(this.options.width, 10);
      })[0];
    }

    return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === 'large')[0];
  }

  get viewData() {
    return merge(this.model, {
      optionsHtml: this.optionsHtml,
      contents: this.options.contents,
      currentImage: this.currentImage,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.buttonEnabled,
      classes: this.classes,
      selectedQuantity: this.selectedQuantity,
      buttonText: this.buttonText,
      imgStyle: this.imgStyle,
      quantityClass: this.quantityClass,
      priceClass: this.priceClass,
    });
  }

  get hasQuantity() {
    return this.options.contents.quantityInput;
  }

  get priceClass() {
    return this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '';
  }

  get wrapperClass() {
    return `${this.currentImage ? 'has-image' : 'no-image'} layout-${this.options.layout}`;
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents, {
      click: this.closeCartOnBgClick.bind(this),
      [`click .${this.classes.option.select.split(' ').join('.')}`]: this.stopPropagation.bind(this),
      [`focus .${this.classes.option.select.split(' ').join('.')}`]: this.stopPropagation.bind(this),
      [`click .${this.classes.option.wrapper.split(' ').join('.')}`]: this.stopPropagation.bind(this),
      [`click .${this.classes.product.quantityInput.split(' ').join('.')}`]: this.stopPropagation.bind(this),
      [`click .${this.classes.product.quantityButton.split(' ').join('.')}`]: this.stopPropagation.bind(this),
      [`change .${this.classes.option.select.split(' ').join('.')}`]: this.onOptionSelect.bind(this),
      [`click .${this.classes.product.button.split(' ').join('.')}`]: this.onButtonClick.bind(this),
      [`click .${this.classes.product.blockButton.split(' ').join('.')}`]: this.onButtonClick.bind(this),
      [`click .${this.classes.product.quantityButton.split(' ').join('.')}.quantity-increment`]: this.onQuantityIncrement.bind(this, 1),
      [`click .${this.classes.product.quantityButton.split(' ').join('.')}.quantity-decrement`]: this.onQuantityIncrement.bind(this, -1),
      [`blur .${this.classes.product.quantityInput.split(' ').join('.')}`]: this.onQuantityBlur.bind(this),
    });
  }

  stopPropagation(evt) {
    if (!this.options.contents.button) {
      evt.stopImmediatePropagation();
    }
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
      return this.options.text.unavailable;
    }
    if (!this.variantInStock) {
      return this.options.text.outOfStock;
    }
    return this.options.text.button;
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
    if (!this.options.contents.options) {
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

  render() {
    super.render();
    if (this.iframe) {
      this.resizeUntilLoaded();
    }
  }

  createCart() {
    if (this.shouldCreateCart) {
      return this.props.createCart({
        node: this.cartNode,
        options: this.config,
      });
    } else {
      return Promise.resolve(null);
    }
  }

  setupModel(data) {
    return super.setupModel(data).then((model) => {
      return this.setDefaultVariant(model);
    });
  }

  wrapTemplate(html) {
    let ariaLabel;
    switch (this.options.buttonDestination) {
    case 'modal':
      ariaLabel = 'View details';
      break;
    case 'cart':
      ariaLabel = 'Add to cart';
      break;
    default:
      ariaLabel = 'Buy Now';
    }

    if (this.options.contents.button) {
      return `<div class="${this.wrapperClass} ${this.classes.product.product}">${html}</div>`;
    } else {
      return `<div class="${this.wrapperClass} ${this.classes.product.product}"><div tabindex="0" role="button" aria-label="${ariaLabel}" class="${this.classes.product.blockButton}">${html}</div></div>`;
    }
  }

  sdkFetch() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({handle: this.handle}).then((products) => products[0]);
    }
    return Promise.reject();
  }

  fetchData() {
    return this.sdkFetch().then((model) => {
      if (model) {
        model.selectedQuantity = 0;
        return model;
      }
      throw new Error('Not Found');
    });
  }

  updateConfig(config) {
    if (config.id || config.variantId) {
      this.id = config.id || this.id;
      this.defaultVariantId = config.variantId || this.defaultVariantId;
      this.init();
      return;
    }

    let layout = this.options.layout;

    if (config.options && config.options.product) {
      if (config.options.product.layout) {
        layout = config.options.product.layout;
      }

      if (config.options.product.width) {
        this.iframe.setWidth(config.options.product.width);
      }

      if (layout === 'horizontal' && this.iframe.width && this.iframe.width !== 'none') {
        this.iframe.setWidth('none');
      }
    }

    if (this.iframe) {
      this.iframe.removeClass('layout-vertical');
      this.iframe.removeClass('layout-horizontal');
      this.iframe.addClass(`layout-${layout}`);
    }
    super.updateConfig(config);
    if (layout !== this.options.layout) {
      this._resizeX();
    }
    if (this.cart) {
      this.cart.updateConfig(config);
    }
    if (this.modal) {
      this.modal.updateConfig(Object.assign({}, config, {
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
        }),
      }));
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
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(this.selectedQuantity));
    }
  }

  resizeUntilLoaded() {
    if (!this.iframe || !this.model.selectedVariantImage) {
      return;
    }
    const img = this.wrapper.getElementsByClassName(this.classes.product.img)[0];
    let intervals = 0;
    if (img) {
      const productResize = setInterval(() => {
        if (!img.naturalWidth && intervals < 30) {
          intervals++;
          return;
        }
        this.resize();
        clearInterval(productResize);
      }, pollInterval);
    }
  }

  openOnlineStore() {
    window.open(this.onlineStoreURL);
  }

  openModal() {
    if (!this.modal) {
      this.modal = this.props.createModal({
        node: this.modalNode,
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
          modal: Object.assign({}, this.config.modal, {
            googleFonts: this.options.googleFonts,
          }),
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
    if (this.cart && this.cart.isVisible) {
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
