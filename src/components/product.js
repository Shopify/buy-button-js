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

/**
 * Renders and fetches data for product embed.
 * @extends Component.
 */

export default class Product extends Component {

  /**
   * create Product.
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
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

  /**
   * get key for configuration object.
   * @return {String}
   */
  get typeKey() {
    return 'product';
  }

  /**
   * get class name for iframe element.
   * @return {String} iframe class.
   */
  get iframeClass() {
    return `layout-${this.options.layout}`;
  }

  /**
   * determines if product requries a cart component based on buttonDestination.
   * @return {Boolean}
   */
  get shouldCreateCart() {
    return this.options.buttonDestination === 'cart' || (this.options.buttonDestination === 'modal' && this.config.modalProduct.buttonDestination === 'cart');
  }

  /**
   * determines when image src should be updated
   * @return {Boolean}
   */
  get shouldUpdateImage() {
    return !this.cachedImage || (this.image && this.image.src && this.image.src !== this.cachedImage.src);
  }

  /**
   * get image for product and cache it. Return caches image if shouldUpdateImage is false.
   * @return {Object} image objcet.
   */
  get currentImage() {
    if (this.shouldUpdateImage) {
      this.cachedImage = this.image;
    }

    return this.cachedImage;
  }

  /**
   * get image for selected variant and size based on options or layout.
   * @return {Object} image object.
   */
  get image() {
    if (!this.model.selectedVariant || !this.model.selectedVariant.imageVariants) {
      return null;
    }

    if (this.options.imageSize) {
      return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === this.options.imageSize)[0];
    }

    if (this.options.width && this.options.layout === 'vertical') {
      return this.model.selectedVariant.imageVariants.filter((image) => {
        const containerWidth = parseInt(this.options.width, 10);
        return parseInt(image.dimension, 10) >= containerWidth * 1.5;
      })[0];
    }

    return this.model.selectedVariant.imageVariants.filter((imageVariant) => imageVariant.name === 'grande')[0];
  }

  get shouldResizeX() {
    return this.options.layout === 'horizontal';
  }

  get shouldResizeY() {
    return true;
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
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

  get hasVariants() {
    return this.model.variants.length > 1;
  }

  get requiresCart() {
    return this.options.buttonDestination === 'cart';
  }

  get buttonActionAvailable() {
    return !this.requiresCart || Boolean(this.cart);
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

  /**
   * get events to be bound to DOM.
   * @return {Object}
   */
  get DOMEvents() {
    return merge({}, {
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
    }, this.options.DOMEvents);
  }

  /**
   * get HTML for product options selector.
   * @return {String} HTML
   */
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

  /**
   * get options for product with selected value.
   * @return {Array}
   */
  get decoratedOptions() {
    return this.model.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => ({
        name: value,
        selected: value === option.selected,
      })),
    }));
  }

  /**
   * get info about variant to be sent to tracker
   * @return {Object}
   */
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

  /**
   * get configuration object for product details modal based on product config and modalProduct config.
   * @return {Object} configuration object.
   */
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

  /**
   * get params for online store URL.
   * @return {Object}
   */
  get onlineStoreParams() {
    return {
      channel: 'buy_button',
      referrer: encodeURIComponent(windowUtils.location()),
      variant: this.model.selectedVariant.id,
    };
  }

  /**
   * get query string for online store URL from params
   * @return {String}
   */
  get onlineStoreQueryString() {
    return Object.keys(this.onlineStoreParams).reduce((string, key) => {
      return `${string}${key}=${this.onlineStoreParams[key]}&`;
    }, '?');
  }

  /**
   * get URL to open online store page for product.
   * @return {String}
   */
  get onlineStoreURL() {
    return `https://${this.props.client.config.domain}/products/${this.id}${this.onlineStoreQueryString}`;
  }

  /**
   * open online store in new tab.
   */
  openOnlineStore() {
    this._userEvent('openOnlineStore');
    window.open(this.onlineStoreURL);
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initalizes cart if necessary.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
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

  /**
   * renders string template using viewData to wrapper element.
   * Resizes iframe to match image size.
   */
  render() {
    super.render();
    if (this.iframe) {
      this.resizeUntilLoaded();
    }
  }

  /**
   * creates cart if necessary.
   * @return {Promise}
   */
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

  /**
   * fetches data if necessary.
   * Sets default variant for product.
   * @param {Object} [data] - data to initialize model with.
   */
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

  /**
   * fetch product data from API.
   * @return {Promise} promise resolving to model data.
   */
  sdkFetch() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({handle: this.handle}).then((products) => products[0]);
    }
    return Promise.reject();
  }

  /**
   * call sdkFetch and set selected quantity to 0.
   * @throw 'Not Found' if model not returned.
   * @return {Promise} promise resolving to model data.
   */
  fetchData() {
    return this.sdkFetch().then((model) => {
      if (model) {
        model.selectedQuantity = 0;
        return model;
      }
      throw new Error('Not Found');
    });
  }

  /**
   * re-assign configuration and re-render component.
   * Resize iframe based on change in dimensions of product.
   * Update Cart or Modal components if necessary.
   * @param {Object} config - new configuration object.
   */
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

      if (layout === 'vertical' && this.iframe.width === 'none') {
        this.iframe.setWidth(this.options.width);
      }

      if (layout === 'horizontal' && this.iframe.width && this.iframe.width !== 'none') {
        this.iframe.setWidth('none');
      }

      if (config.options.product.width) {
        this.iframe.setWidth(config.options.product.width);
      }

      if (config.options.product.layout) {
        this.iframe.el.style.width = '100%';
      }
    }

    if (this.iframe) {
      this.iframe.removeClass('layout-vertical');
      this.iframe.removeClass('layout-horizontal');
      this.iframe.addClass(`layout-${layout}`);
      this._resizeX();
      this._resizeY();
    }
    super.updateConfig(config);
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

  /**
   * check size of image until it is resolved, then set height of iframe.
   */
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

  /**
   * prevent events from bubbling if entire product is being treated as button.
   */
  stopPropagation(evt) {
    if (!this.options.contents.button) {
      evt.stopImmediatePropagation();
    }
  }

  onButtonClick(evt) {
    evt.stopPropagation();
    if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this._userEvent('addVariantToCart');
      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'CART_ADD', this.selectedVariantTrackingInfo)(this.model.selectedVariant, this.model.selectedQuantity);
    } else if (this.options.buttonDestination === 'modal') {
      this.openModal();
    } else if (this.options.buttonDestination === 'onlineStore') {
      this.openOnlineStore();
    } else {
      this._userEvent('openCheckout');
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(this.selectedQuantity));
    }
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

  closeCartOnBgClick() {
    if (this.cart && this.cart.isVisible) {
      this.cart.close();
    }
  }

  /**
   * create modal instance and initialize.
   * @return {Promise} promise resolving to modal instance
   */
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
    this._userEvent('openModal');
    return this.modal.init(this.model);
  }

  /**
   * update quantity of selected variant and rerender.
   * @param {Function} fn - function which returns new quantity given current quantity.
   */
  updateQuantity(fn) {
    let quantity = fn(this.selectedQuantity);
    if (quantity < 0) {
      quantity = 0;
    }
    this.selectedQuantity = quantity;
    this._userEvent('updateQuantity');
    this.render();
  }

  /**
   * Update variant based on option value.
   * @param {String} optionName - name of option being modified.
   * @param {String} value - value of selected option.
   * @return {Object} updated option object.
   */
  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => option.name === optionName)[0];
    updatedOption.selected = value;
    if (this.variantExists) {
      this.cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    this._userEvent('updateVariant');
    return updatedOption;
  }

  /**
   * set default variant to be selected on initialization.
   * @param {Object} model - model to be modified.
   */
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
