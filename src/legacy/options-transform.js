/* eslint-disable camelcase */
import merge from 'lodash.merge';
import {defaultOptions, attributes} from './const';

class OptionsTransform {
  constructor(embedType, element) {
    this.embedType = embedType;
    this.legacyOptions = attributes.reduce((opts, attr) => {
      opts[attr] = element.getAttribute(`data-${attr}`);
      return opts;
    }, {});

    // STICKY, if it is not defined and not true then do not move the cart tab
    // to the side of the window, just place inline where it is in the DOM
    const newOptions = merge({}, defaultOptions);
    this.uiArguments = attributes.reduce((options, attr) => {
      const transform = this[`${attr}_transform`];
      const value = this.legacyOptions[attr];
      if (transform && value) {
        transform.call(this, value, options);
      }
      return options;
    }, newOptions);
  }

  display_size_transform(value, options) {
    let width = 450;
    if (value === 'compact') {
      width = 230;
    } else if (parseInt(value, 10)) {
      width = parseInt(value, 10);
    }
    options.product.styles.wrapper.width = `${width}px`;
  }

  has_image_transform(value, options) {
    if (value === 'true') {
      return;
    }
    options.product.contents.img = false;
    options.product.contents.price = false;
    options.product.contents.title = false;
    options.product.contents.options = false;
  }

  variant_id_transform(value, options) {
    options.product.contents.options = false;
  }

  redirect_to_transform(value, options) {
    // cart, checkout, modal, product
    // default on collection is modal
    // default on product is cart
    // product opens a new tab with the product
    // if this equals modal, dont show, button, variants, or price.
    options.product.buttonDestination = value;
    if (value === 'modal') {
      options.product.contents.options = false;
      options.product.contents.price = false;
      options.product.contents.button = false;
    }
  }

  product_modal_transform(value, options) {
    // click on item and modal opens
    // hide button and variants
    if (value !== 'true') {
      return;
    }
    options.product.buttonDestination = 'modal';
    options.product.contents.options = false;
    options.product.contents.price = false;
    options.product.contents.button = false;
  }

  buy_button_text_transform(value, options) {
    options.product.text.button = value;
  }

  button_background_color_transform(value, options) {
    options.product.styles.button['background-color'] = `#${value}`;
    options.cart.styles.button['background-color'] = `#${value}`;
    options.modalProduct.styles.button['background-color'] = `#${value}`;
    options.modal.styles.button['background-color'] = `#${value}`;
  }

  button_text_color_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
    options.cart.styles.button.color = `#${value}`;
    options.modalProduct.styles.button.color = `#${value}`;
    options.modal.styles.button.color = `#${value}`;
  }

  background_color_transform(value, options) {
    // product background
    //    adds padding around variant inputs and button so that it looks like a contained component
    // NOT collections product background
    // cart background
    // modal background
    options.product.styles.wrapper['background-color'] = `#${value}`;
  }

  show_product_price_transform(value, options) {
    options.product.contents.price = (value === 'true');
  }

  show_product_title_transform(value, options) {
    options.product.contents.title = (value === 'true');
  }

  product_title_color_transform(value, options) {
    options.product.styles.title.color = `#${value}`;
  }

  buy_button_out_of_stock_text_transform(value, options) {
    options.product.text.outOfStock = value; // not implemented
  }

  buy_button_product_unavailable_text_transform(value, options) {
    options.product.text.productUnavailable = value; // not implemented
  }

  checkout_button_text_transform(value, options) {
    options.cart.text.button = value;
  }

  text_color_transform(value, options) {
    // cart
    //  title of the line items, quantity, price, total price.
    options.product.styles.button.color = `#${value}`;
  }

  accent_color_transform(value, options) {
    // cart border color
    options.cart.styles.wrapper['border-color'] = `#${value}`;
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

  sticky_transform(value, options) {
  }

  empty_cart_text_transform(value, options) {
    options.cart.text.emptyCart = value; // not implemented
  }

  next_page_button_text_transform(value, options) {
    options.productSet.text.nextPageButton = value; // not implemented
  }
}

export default OptionsTransform;
