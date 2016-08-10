/* eslint-disable camelcase */
import {attributes} from './legacy-attributes';
import defaultOptions from './default-options';

class OptionsTransform {
  constructor(embedType, options) {
    this.embedType = embedType;
    this.legacyOptions = options;
  }
  process() {
    const options = Object.assign({}, defaultOptions);

    attributes.forEach((attr) => {
      const transform = this[`${attr}_transform`];
      const value = this.legacyOptions[attr];
      if (transform && value) {
        transform(value, options);
      }
    });

    return {options};
  }
  display_size_transform(value, options) {
  }
  has_image_transform(value, options) {
    options.product.contents.img = (value === 'true');
  }
  redirect_to_transform(value, options) {
  }
  product_modal_transform(value, options) {
  }
  buy_button_text_transform(value, options) {
    options.product.text.button = value;
  }
  button_background_color_transform(value, options) {
    options.product.styles.button['background-color'] = `#${value}`;
  }
  button_text_color_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
  }
  background_color_transform(value, options) {
  }
  show_product_price_transform(value, options) {
    options.product.contents.price = (value === 'true');
  }
  show_product_title_transform(value, options) {
    options.product.contents.title = (value === 'true');
  }
  buy_button_out_of_stock_text_transform(value, options) {
  }
  buy_button_product_unavailable_text_transform(value, options) {
  }
  product_title_color_transform(value, options) {
    options.product.styles.title.color = `#${value}`;
  }
  checkout_button_text_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
  }
  text_color_transform(value, options) {
    options.product.styles.button.color = `#${value}`;
  }
  accent_color_transform(value, options) {
  }
  cart_title_transform(value, options) {
  }
  cart_total_text_transform(value, options) {
  }
  discount_notice_text_transform(value, options) {
  }
  sticky_transform(value, options) {
  }
  empty_cart_text_transform(value, options) {
  }
  next_page_button_text_transform(value, options) {
  }
}

export default OptionsTransform;
