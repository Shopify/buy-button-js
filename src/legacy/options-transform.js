/* eslint-disable camelcase */
import merge from '../utils/merge';
import {defaultOptions, attributes} from './const';

class OptionsTransform {
  constructor(element, cart) {
    this.element = element;
    this.cart = cart;
  }

  get embedType() {
    return this.legacy.embed_type;
  }

  get handle() {
    return this.legacy[`${this.embedType}_handle`];
  }

  get variantId() {
    return this.legacy.variant_id;
  }

  get shop() {
    return this.legacy.shop;
  }

  get legacy() {
    this.legacyOptions = this.legacyOptions || attributes.reduce((opts, attr) => {
      const value = this.element.getAttribute(`data-${attr}`) || this.cart.getAttribute(`data-${attr}`);
      if (value) {
        opts[attr] = value;
      }
      return opts;
    }, {});
    return this.legacyOptions;
  }

  get ui() {
    this.uiOptions = this.uiOptions || attributes.reduce((options, attr) => {
      const transform = this[`${attr}_transform`];
      const value = this.legacy[attr];
      if (transform && value) {
        transform.call(this, value, options);
      }
      return options;
    }, merge({}, defaultOptions));
    window.a1 = defaultOptions;
    window.a2 = merge({}, defaultOptions);
    return this.uiOptions;
  }

  display_size_transform(value, options) {
    options.product.styles.wrapper.width = '230px';
    options.productSet.styles.product.width = '230px';
  }

  has_image_transform(value, options) {
    if (this.isTruthy(value)) {
      return;
    }
    options.product.contents.img = false;
    options.product.contents.price = false;
    options.product.contents.title = false;
    options.product.contents.options = false;
  }

  variant_id_transform(value, options) {
    if (this.embedType === 'product') {
      options.product.contents.options = false;
    }
  }

  redirect_to_transform(value, options) {
    if (value === 'product') {
      options.product.buttonDestination = 'onlineStore';
    } else {
      options.product.buttonDestination = value;
    }
    if (options.product.buttonDestination === 'modal') {
      this.setupModalOptions(options);
    }
  }

  product_modal_transform(value, options) {
    if (!this.isTruthy(value)) {
      return;
    }
    options.product.buttonDestination = 'modal';
    this.setupModalOptions(options);
  }

  button_background_color_transform(value, options) {
    [
      options.product.styles.button,
      options.cart.styles.button,
      options.toggle.styles.toggle,
    ].forEach((el) => {
      el['background-color'] = `#${value}`;
      el[':hover'] = {'background-color': this.adjustLuminance(value, -0.08)};
      el['border-color'] = this.adjustLuminance(value, -0.05);
    });
  }

  button_text_color_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
    options.cart.styles.button.color = `#${value}`;
    options.modalProduct.styles.button.color = `#${value}`;
    options.toggle.styles.toggle.color = `#${value}`;
    options.toggle.styles.toggle.stroke = `#${value}`;
    options.toggle.styles.toggle.fill = `#${value}`;
  }

  background_color_transform(value, options) {
    if (this.embedType !== 'collection') {
      options.product.styles.wrapper['background-color'] = `#${value}`;
      options.product.styles.title['margin-left'] = '20px';
      options.product.styles.title['margin-right'] = '20px';
      options.product.styles.options['margin-left'] = '20px';
      options.product.styles.options['margin-right'] = '20px';
      options.product.styles.button['margin-left'] = '20px';
      options.product.styles.button['margin-bottom'] = '15px';
    }
    options.modal.styles.wrapper['background-color'] = `#${value}`;
    options.modal.styles.footer['background-color'] = `#${value}`;
    options.modal.styles.footer['background-image'] = 'none';

    options.cart.styles.cart['background-color'] = `#${value}`;
    options.cart.styles.header['background-color'] = 'transparent';
    options.cart.styles.lineItems['background-color'] = 'transparent';
    options.cart.styles.footer['background-color'] = 'transparent';
  }

  show_product_price_transform(value, options) {
    options.product.contents.price = this.isTruthy(value);
  }

  show_product_title_transform(value, options) {
    options.product.contents.title = this.isTruthy(value);
  }

  product_title_color_transform(value, options) {
    options.product.styles.title.color = `#${value}`;
  }

  text_color_transform(value, options) {
    options.cart.styles.lineItems.color = `#${value}`;
    options.cart.styles.subtotal.color = `#${value}`;
    options.modalProduct.styles.description.color = `#${value}`;
    options.product.styles.description.color = `#${value}`;
    options.modal.styles.contents.color = `#${value}`;
  }

  accent_color_transform(value, options) {
    options.cart.styles.title.color = `#${value}`;
    options.cart.styles.close.color = `#${value}`;
    options.cart.styles.close[':hover'] = {color: this.adjustLuminance(value, -0.1)};
    options.cart.styles.footer['border-top'] = `1px solid #${value}`;
    options.lineItem.styles.variantTitle.color = `#${value}`;
    options.lineItem.styles.quantity.color = `#${value}`;
    options.lineItem.styles.quantityInput.color = `#${value}`;
    options.lineItem.styles.quantityButton.color = `#${value}`;
    options.modalProduct.styles.title.color = `#${value}`;
    options.modalProduct.styles.description.color = `#${value}`;
    options.modal.styles.close.color = `#${value}`;
    options.modal.styles.close[':hover'] = {color: this.adjustLuminance(value, -0.1)};
  }

  buy_button_text_transform(value, options) {
    options.product.text.button = value;
  }

  buy_button_out_of_stock_text_transform(value, options) {
    options.product.text.outOfStock = value;
  }

  buy_button_product_unavailable_text_transform(value, options) {
    options.product.text.unavailable = value;
  }

  checkout_button_text_transform(value, options) {
    options.cart.text.button = value;
  }

  cart_title_transform(value, options) {
    options.cart.text.title = value;
  }

  cart_total_text_transform(value, options) {
    options.cart.text.total = value;
  }

  discount_notice_text_transform(value, options) {
    options.cart.text.notice = value;
  }

  empty_cart_text_transform(value, options) {
    options.cart.text.empty = value;
  }

  next_page_button_text_transform(value, options) {
    options.productSet.text.nextPageButton = value;
  }

  adjustLuminance(hex, lum) {
    let rgb = '#';
    for (let i = 0; i < 3; i++) {
      let color = parseInt(hex.substr(i * 2, 2), 16);
      color = Math.round(this.clamp(color + (color * lum), 0, 255)).toString(16);
      rgb += `00${color}`.substr(color.length);
    }
    return rgb;
  }

  clamp(val, min, max) {
    return Math.min(Math.max(min, val), max);
  }

  setupModalOptions(options) {
    options.product.contents.options = false;
    options.product.contents.button = false;
    options.product.styles.title['text-align'] = 'center';
    options.product.styles.title['margin-top'] = '20px';
    options.product.styles.prices['margin-left'] = '0px';
    options.product.styles.prices.display = 'block';
    options.product.styles.prices['text-align'] = 'center';
    options.product.styles.prices['margin-bottom'] = '15px';
  }

  isTruthy(value) {
    return value === 'true' || value === '1';
  }
}

export default OptionsTransform;
