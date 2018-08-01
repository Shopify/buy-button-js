import merge from '../utils/merge';
import Component from '../component';
import Template from '../template';
import Checkout from './checkout';
import windowUtils from '../utils/window-utils';
import formatMoney from '../utils/money';
import normalizeConfig from '../utils/normalize-config';
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
    // eslint-disable-next-line no-param-reassign
    config = normalizeConfig(config);

    super(config, props);
    this.typeKey = 'product';
    this.defaultStorefrontVariantId = config.storefrontVariantId;
    this.cachedImage = null;
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents, this.config.option.order);
    this.cart = null;
    this.modal = null;
    this.imgStyle = '';
    this.selectedQuantity = 1;
    this.selectedVariant = {};
    this.selectedOptions = {};
    this.selectedImage = null;
    this.updater = new ProductUpdater(this);
    this.view = new ProductView(this);
  }

  /**
   * determines when image src should be updated
   * @return {Boolean}
   */
  get shouldUpdateImage() {
    return !this.cachedImage || (this.image && this.image.src !== this.cachedImage);
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
    const DEFAULT_IMAGE_SIZE = 480;
    const MODAL_IMAGE_SIZE = 550;

    if (!(this.selectedVariant || this.options.contents.imgWithCarousel)) {
      return null;
    }

    let imageSize;
    if (this.options.width && this.options.width.slice(-1) === '%') {
      imageSize = 1000;
    } else {
      imageSize = parseInt(this.options.width, 10) || DEFAULT_IMAGE_SIZE;
    }

    let id;
    let src;
    let srcLarge;

    const imageOptions = {
      maxWidth: imageSize,
      maxHeight: imageSize * 1.5,
    };

    const imageOptionsLarge = {
      maxWidth: MODAL_IMAGE_SIZE,
      maxHeight: MODAL_IMAGE_SIZE * 1.5,
    };

    if (this.selectedImage) {
      id = this.selectedImage.id;
      src = this.props.client.image.helpers.imageForSize(this.selectedImage, imageOptions);
      srcLarge = this.props.client.image.helpers.imageForSize(this.selectedImage, imageOptionsLarge);
    } else if (this.selectedVariant.image == null && this.model.images[0] == null) {
      id = null;
      src = '';
      srcLarge = '';
    } else if (this.selectedVariant.image == null) {
      id = this.model.images[0].id;
      src = this.model.images[0].src;
      srcLarge = this.props.client.image.helpers.imageForSize(this.model.images[0], imageOptionsLarge);
    } else {
      id = this.selectedVariant.image.id;
      src = this.props.client.image.helpers.imageForSize(this.selectedVariant.image, imageOptions);
      srcLarge = this.props.client.image.helpers.imageForSize(this.selectedVariant.image, imageOptionsLarge);
    }
    return {id, src, srcLarge};
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedPrice() {
    if (!this.selectedVariant) {
      return '';
    }
    return formatMoney(this.selectedVariant.price, this.globalConfig.moneyFormat);
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedCompareAtPrice() {
    if (!this.selectedVariant) {
      return '';
    }
    return formatMoney(this.selectedVariant.compareAtPrice, this.globalConfig.moneyFormat);
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    return Object.assign({}, this.model, this.options.viewData, {
      classes: this.classes,
      contents: this.options.contents,
      text: this.options.text,
      optionsHtml: this.optionsHtml,
      decoratedOptions: this.decoratedOptions,
      currentImage: this.currentImage,
      buttonClass: this.buttonClass,
      hasVariants: this.hasVariants,
      buttonDisabled: !this.buttonEnabled,
      selectedVariant: this.selectedVariant,
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
      return {
        id: image.id,
        src: image.src,
        carouselSrc: this.props.client.image.helpers.imageForSize(image, {maxWidth: 100, maxHeight: 100}),
        isSelected: image.id === this.currentImage.id,
      };
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
    return this.model.variants.some((variant) => {
      if (this.selectedVariant) {
        return variant.id === this.selectedVariant.id;
      } else {
        return false;
      }
    });
  }

  get variantInStock() {
    return this.variantExists && this.selectedVariant.available;
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
    return this.selectedVariant && this.selectedVariant.compareAtPrice ? this.classes.product.loweredPrice : '';
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
    return this.model.options.map((option) => {
      return {
        name: option.name,
        values: option.values.map((value) => {
          return {
            name: value.value,
            selected: this.selectedOptions[option.name] === value.value,
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
    if (this.selectedVariant) {
      return {
        id: this.id,
        name: this.selectedVariant.productTitle,
        sku: null,
        price: this.selectedVariant.price,
      };
    } else {
      return {};
    }
  }

  /**
   * get info about variant to be sent to tracker
   * @return {Object}
   */
  get selectedVariantTrackingInfo() {
    const variant = this.selectedVariant;
    return {
      id: variant.id,
      name: variant.productTitle,
      quantity: this.selectedQuantity,
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
      variant: atob(this.selectedVariant.id).split('/')[4],
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
    return `${this.model.onlineStoreUrl}${this.onlineStoreQueryString}`;
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

    return this.props.createCart(cartConfig);
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
    if (this.storefrontId && Array.isArray(this.storefrontId)) {
      return this.props.client.product.fetch(this.storefrontId[0]);
    } else if (this.storefrontId) {
      return this.props.client.product.fetch(this.storefrontId);
    } else if (this.handle) {
      return this.props.client.product.fetchByHandle(this.handle).then((product) => product);
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
        this.storefrontId = model.id;
        this.handle = model.handle;
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
      this.props.tracker.trackMethod(this.cart.addVariantToCart.bind(this), 'Update Cart', this.selectedVariantTrackingInfo)(this.selectedVariant, this.selectedQuantity);
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
      let checkoutWindow;

      if (this.config.cart.popup) {
        const params = (new Checkout(this.config)).params;
        checkoutWindow = window.open(null, 'checkout', params);
      } else {
        checkoutWindow = window;
      }

      this.props.client.checkout.create().then((checkout) => {
        const lineItem = {variantId: this.selectedVariant.id, quantity: 1};
        this.props.client.checkout.addLineItems(checkout.id, [lineItem]).then((updatedCheckout) => {
          checkoutWindow.location = updatedCheckout.webUrl;
        });
      });
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
    const foundImage = imageList.find((image) => {
      return image.id === selectedImageId;
    });

    if (foundImage) {
      this.selectedImage = foundImage;
      this.cachedImage = foundImage;
    }

    this.view.render();
  }

  nextIndex(currentIndex, offset) {
    const nextIndex = currentIndex + offset;
    if (nextIndex >= this.model.images.length) {
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
    const updatedOption = this.model.options.find((option) => option.name === optionName);

    if (updatedOption) {
      this.selectedOptions[updatedOption.name] = value;
      this.selectedVariant = this.props.client.product.helpers.variantForOptions(this.model, this.selectedOptions);
    }

    if (this.variantExists) {
      this.cachedImage = this.selectedVariant.image;
      if (this.selectedVariant.image) {
        this.selectedImage = null;
      } else {
        this.selectedImage = this.model.images[0]; // get cached image
      }
    } else {
      this.selectedImage = this.model.images.find((image) => {
        return image.id === this.cachedImage.id;
      });
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
    let selectedVariant;
    if (this.defaultStorefrontVariantId) {
      selectedVariant = model.variants.find((variant) => variant.id === this.defaultStorefrontVariantId);
    } else {
      this.defaultStorefrontVariantId = model.variants[0].id;
      selectedVariant = model.variants[0];
      this.selectedImage = model.images[0];
    }

    if (!selectedVariant) {
      selectedVariant = model.variants[0];
    }
    this.selectedOptions = selectedVariant.selectedOptions.reduce((acc, option) => {
      acc[option.name] = option.value;
      return acc;
    }, {});
    this.selectedVariant = selectedVariant;
    return model;
  }
}
