/* eslint-disable camelcase */
import merge from 'lodash.merge';
import {defaultOptions, attributes} from './const';

class OptionsTransform {
  constructor(element) {
    this.legacyOptions = attributes.reduce((opts, attr) => {
      const value = element.getAttribute(`data-${attr}`);
      if (value) {
        opts[attr] = value;
      }
      return opts;
    }, {});
    this.embedType = this.legacyOptions.embed_type;
    this.handle = this.legacyOptions[`${this.embedType}_handle`];

    const newOptions = merge({}, defaultOptions);
    this.uiOptions = attributes.reduce((options, attr) => {
      const transform = this[`${attr}_transform`];
      const value = this.legacyOptions[attr];
      if (transform && value) {
        transform.call(this, value, options);
      }
      return options;
    }, newOptions);
  }

  display_size_transform(value, options) {
    if (this.embedType === 'product') {
      options.product.styles.wrapper.width = '230px';
    }
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
      options.product.buttonDestination = 'modal';
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

  buy_button_text_transform(value, options) {
    options.product.text.button = value;
  }

  button_background_color_transform(value, options) {
    options.product.styles.button['background-color'] = `#${value}`;
    options.cart.styles.button['background-color'] = `#${value}`;
    options.modalProduct.styles.button['background-color'] = `#${value}`;
    options.toggle.styles.toggle['background-color'] = `#${value}`;
  }

  button_text_color_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
    options.cart.styles.button.color = `#${value}`;
    options.modalProduct.styles.button.color = `#${value}`;
    options.toggle.styles.toggle.color = `#${value}`;
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

  buy_button_out_of_stock_text_transform(value, options) {
    options.product.text.outOfStock = value;
  }

  buy_button_product_unavailable_text_transform(value, options) {
    options.product.text.unavailable = value; // not implemented
  }

  checkout_button_text_transform(value, options) {
    options.cart.text.button = value;
  }

  text_color_transform(value, options) {
    options.cart.styles.lineItems.color = `#${value}`;
    options.cart.styles.subtotal.color = `#${value}`;
  }

  accent_color_transform(value, options) {
    options.cart.styles.title.color = `#${value}`;
    options.cart.styles.close.color = `#${value}`;
    options.cart.styles.cart['border-left'] = `1px solid #${value}`;
    options.cart.styles.footer['border-top'] = `1px solid #${value}`;
    options.lineItem.styles.variantTitle.color = `#${value}`;
    options.lineItem.styles.quantity.color = `#${value}`;
    options.lineItem.styles.quantityInput.color = `#${value}`;
    options.lineItem.styles.quantityButton.color = `#${value}`;
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
    options.cart.text.empty = value; // not implemented
  }

  next_page_button_text_transform(value, options) {
    options.productSet.text.nextPageButton = value; // not implemented
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
