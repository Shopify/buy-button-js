import merge from '../utils/merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';
import windowUtils from '../utils/window-utils';
import formatMoney from '../utils/money';
import ProductView from '../views/product';
import ProductUpdater from '../updaters/product';

function isFunction(obj) {
  return Boolean(obj && obj.constructor && obj.call && obj.apply);
}

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

const ENTER_KEY = 13;

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
    this.typeKey = 'product';
    this.defaultVariantId = config.variantId;
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, this.config.option.order);
    this.cart = null;
    this.modal = null;
    this.imgStyle = '';
    this.selectedQuantity = 1;
    this.updater = new ProductUpdater(this);
    this.view = new ProductView(this);
    this.selectedImage = null;
  }

  /**
   * determines if product requries a cart component based on buttonDestination.
   * @return {Boolean}
   */
  get shouldCreateCart() {
    return this.options.buttonDestination !== 'checkout' && this.config.modalProduct.buttonDestination !== 'checkout';
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
    if (!this.model.selectedVariant || !this.model.selectedVariant.image || !this.model.selectedVariant.image.variants.length) {
      return null;
    }
    const availableSizes = this.model.selectedVariant.image.variants;

    let imageSize = 'grande';

    if (this.options.width && this.options.layout === 'vertical') {
      imageSize = availableSizes.filter((image) => {
        const containerWidth = parseInt(this.options.width, 10);
        return parseInt(image.dimension, 10) >= containerWidth * 1.5;
      })[0].name;
    }

    if (this.options.imageSize) {
      imageSize = this.options.imageSize;
    }

    let sourceImage = this.model.selectedVariant.image;
    if (this.selectedImage) {
      sourceImage = this.model.images.filter((image) => {
        return image.id === this.selectedImage.id;
      })[0];
    }

    return sourceImage.variants.filter((image) => {
      return image.name === imageSize;
    })[0];
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedPrice() {
    if (!this.model.selectedVariant) {
      return '';
    }
    return formatMoney(this.model.selectedVariant.price, this.globalConfig.moneyFormat);
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedCompareAtPrice() {
    if (!this.model.selectedVariant) {
      return '';
    }
    return formatMoney(this.model.selectedVariant.compareAtPrice, this.globalConfig.moneyFormat);
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    const image = Object.assign({}, this.currentImage);
    return merge(this.model, this.options.viewData, {
      classes: this.classes,
      contents: this.options.contents,
      text: this.options.text,
      optionsHtml: this.optionsHtml,
      decoratedOptions: this.decoratedOptions,
      currentImage: image,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.buttonEnabled,
      selectedQuantity: this.selectedQuantity,
      buttonText: this.buttonText,
      imgStyle: this.imgStyle,
      quantityClass: this.quantityClass,
      priceClass: this.priceClass,
      formattedPrice: this.formattedPrice,
      formattedCompareAtPrice: this.formattedCompareAtPrice,
      carouselIndex: 0,
      carouselImages: this.carouselImages,
    });
  }

  get carouselImages() {
    return this.model.images.map((image) => {
      return Object.assign({}, image, {
        isSelected: image.id === this.currentImage.id,
        carouselSrc: image.variants[3].src,
      });
    });
  }

  get buttonClass() {
    const disabledClass = this.buttonEnabled ? '' : this.classes.disabled;
    const quantityClass = this.options.contents.buttonWithQuantity ? this.classes.product.buttonBesideQty : '';
    return `${disabledClass} ${quantityClass}`;
  }

  get quantityClass() {
    return this.options.contents.quantityIncrement || this.options.contents.quantityDecrement ? this.classes.product.quantityWithButtons : '';
  }

  get buttonText() {
    if (this.options.buttonDestination === 'modal') {
      return this.options.text.button;
    }
    if (!this.variantExists) {
      return this.options.text.unavailable;
    }
    if (!this.variantInStock) {
      return this.options.text.outOfStock;
    }
    return this.options.text.button;
  }

  get buttonEnabled() {
    return this.options.buttonDestination === 'modal' || (this.buttonActionAvailable && this.variantExists && this.variantInStock);
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
    return this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? this.classes.product.loweredPrice : '';
  }

  get isButton() {
    return this.options.isButton && !(this.options.contents.button || this.options.contents.buttonWithQuantity);
  }

  /**
   * get events to be bound to DOM.
   * @return {Object}
   */
  get DOMEvents() {
    return merge({}, {
      click: this.closeCartOnBgClick.bind(this),
      [`click ${this.selectors.option.select}`]: this.stopPropagation.bind(this),
      [`focus ${this.selectors.option.select}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.option.wrapper}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.product.quantityInput}`]: this.stopPropagation.bind(this),
      [`click ${this.selectors.product.quantityButton}`]: this.stopPropagation.bind(this),
      [`change ${this.selectors.option.select}`]: this.onOptionSelect.bind(this),
      [`click ${this.selectors.product.button}`]: this.onButtonClick.bind(this),
      [`click ${this.selectors.product.blockButton}`]: this.onButtonClick.bind(this),
      [`keyup ${this.selectors.product.blockButton}`]: this.onBlockButtonKeyup.bind(this),
      [`click ${this.selectors.product.quantityIncrement}`]: this.onQuantityIncrement.bind(this, 1),
      [`click ${this.selectors.product.quantityDecrement}`]: this.onQuantityIncrement.bind(this, -1),
      [`blur ${this.selectors.product.quantityInput}`]: this.onQuantityBlur.bind(this),
      [`click ${this.selectors.product.carouselItem}`]: this.onCarouselItemClick.bind(this),
      [`click ${this.selectors.product.carouselNext}`]: this.onCarouselChange.bind(this, 1),
      [`click ${this.selectors.product.carouselPrevious}`]: this.onCarouselChange.bind(this, -1),
    }, this.options.DOMEvents);
  }

  /**
   * prevent events from bubbling if entire product is being treated as button.
   */
  stopPropagation(evt) {
    if (this.isButton) {
      evt.stopImmediatePropagation();
    }
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
      const data = merge(option, this.options.viewData);
      data.classes = this.classes;
      data.onlyOption = (this.model.options.length === 1);

      return acc + this.childTemplate.render({data});
    }, '');
  }

  /**
   * get product variants with embedded options
   * @return {Array} array of variants
   */
  get variantArray() {
    delete this.variantArrayMemo;
    this.variantArrayMemo = this.model.variants.map((variant) => {
      const betterVariant = {
        id: variant.id,
        available: variant.available,
        optionValues: {},
      };
      variant.optionValues.forEach((optionValue) => {
        betterVariant.optionValues[optionValue.name] = optionValue.value;
      });

      return betterVariant;
    });
    return this.variantArrayMemo;
  }

  /**
   * get selected values for options
   * @return {Object} object with option names as keys
   */
  get selections() {
    const selections = {};

    this.model.selections.forEach((selection, index) => {
      const option = this.model.options[index];
      selections[option.name] = selection;
    });

    return selections;
  }

  /**
   * determines whether an option can resolve to an available variant given current selections
   * @return {Boolean}
   */
  optionValueCanBeSelected(selections, name, value) {
    const variants = this.variantArray;
    const selectableValues = Object.assign({}, selections, {
      [name]: value,
    });

    const satisfactoryVariants = variants.filter((variant) => {
      const matchingOptions = Object.keys(selectableValues).filter((key) => {
        return variant.optionValues[key] === selectableValues[key];
      });
      return matchingOptions.length === Object.keys(selectableValues).length;
    });

    let variantSelectable = false;

    variantSelectable = satisfactoryVariants.reduce((variantExists, variant) => {
      const variantAvailable = variant.available;
      if (!variantExists) {
        return variantAvailable;
      }
      return variantExists;
    }, false);
    return variantSelectable;
  }

  /**
   * get options for product with selected value.
   * @return {Array}
   */
  get decoratedOptions() {
    const selections = this.selections;
    return this.model.options.map((option) => {
      return {
        name: option.name,
        values: option.values.map((value) => {
          return {
            name: value,
            selected: value === option.selected,
            disabled: !this.optionValueCanBeSelected(selections, option.name, value),
          };
        }),
      };
    });
  }

  /**
   * get info about product to be sent to tracker
   * @return {Object}
   */
  get trackingInfo() {
    if (!this.model.selectedVariant) {
      return {};
    }
    return {
      id: this.id,
      name: this.model.selectedVariant.productTitle,
      sku: null,
      price: this.model.selectedVariant.price,
    };
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
    const identifier = this.handle ? this.handle : this.id;
    return `https://${this.props.client.config.domain}/products/${identifier}${this.onlineStoreQueryString}`;
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
    return this.createCart().then((cart) => {
      this.cart = cart;
      return super.init.call(this, data).then((model) => {
        if (model) {
          this.view.render();
        }
        return model;
      });
    });
  }

  /**
   * creates cart if necessary.
   * @return {Promise}
   */
  createCart() {
    const cartConfig = Object.assign({}, this.globalConfig, {
      node: this.globalConfig.cartNode,
      options: this.config,
    });

    if (this.shouldCreateCart) {
      return this.props.createCart(cartConfig);
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
    return Promise.reject(new Error('SDK Fetch Failed'));
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

  onButtonClick(evt, target) {
    evt.stopPropagation();
    if (isFunction(this.options.buttonDestination)) {
      this.options.buttonDestination(this);
    } else if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this._userEvent('addVariantToCart');
      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'Update Cart', this.selectedVariantTrackingInfo)(this.model.selectedVariant, this.model.selectedQuantity);
      if (this.iframe) {
        this.props.setActiveEl(target);
      }
    } else if (this.options.buttonDestination === 'modal') {
      this.props.setActiveEl(target);
      this.openModal();
    } else if (this.options.buttonDestination === 'onlineStore') {
      this.openOnlineStore();
    } else {
      this._userEvent('openCheckout');
      new Checkout(this.config).open(this.model.selectedVariant.checkoutUrl(this.selectedQuantity));
    }
  }

  onBlockButtonKeyup(evt, target) {
    if (evt.keyCode === ENTER_KEY) {
      this.onButtonClick(evt, target);
    }
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.selectedImage = null;
    this.updateVariant(name, value);
  }

  onQuantityBlur(evt, target) {
    this.updateQuantity(() => parseInt(target.value, 10));
  }

  onQuantityIncrement(qty) {
    this.updateQuantity((prevQty) => prevQty + qty);
  }

  closeCartOnBgClick() {
    if (this.cart && this.cart.isVisible) {
      this.cart.close();
    }
  }

  onCarouselItemClick(evt, target) {
    evt.preventDefault();
    const selectedImageId = target.getAttribute('data-image-id');
    const imageList = this.model.images;
    const foundImage = imageList.filter((image) => {
      return image.id === parseInt(selectedImageId, 10);
    })[0];

    if (foundImage) {
      this.selectedImage = foundImage;
      this.cachedImage = foundImage;
    }
    this.view.render();
  }

  nextIndex(currentIndex, offset) {
    const nextIndex = currentIndex + offset;
    if (nextIndex > this.model.images.length) {
      return 0;
    }
    if (nextIndex < 0) {
      return this.model.images.length - 1;
    }
    return nextIndex;
  }

  onCarouselChange(offset) {
    const imageList = this.model.images;
    const currentImage = imageList.filter((image) => {
      return image.id === this.currentImage.id;
    })[0];
    const currentImageIndex = imageList.indexOf(currentImage);
    this.selectedImage = imageList[this.nextIndex(currentImageIndex, offset)];
    this.cachedImage = this.selectedImage;
    this.view.render();
  }

  /**
   * create modal instance and initialize.
   * @return {Promise} promise resolving to modal instance
   */
  openModal() {
    if (!this.modal) {
      const modalConfig = Object.assign({}, this.globalConfig, {
        node: this.globalConfig.modalNode,
        options: Object.assign({}, this.config, {
          product: this.modalProductConfig,
          modal: Object.assign({}, this.config.modal, {
            googleFonts: this.options.googleFonts,
          }),
        }),
      });
      this.modal = this.props.createModal(modalConfig, this.props);
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
    this.view.render();
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
    this.view.render();
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
