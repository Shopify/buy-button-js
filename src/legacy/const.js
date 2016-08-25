import optionTemplates from './templates/option';
import {
  productStyles,
  productSetStyles,
  modalProductStyles,
  modalStyles,
  lineItemStyles,
  cartStyles,
  toggleStyles,
} from './styles/overrides';

export const attributes = [
  'shop',
  'product_handle',
  'variant_id',
  'collection_handle',
  'embed_type',
  'display_size',
  'has_image',
  'redirect_to',
  'product_modal',
  'buy_button_text',
  'button_background_color',
  'button_text_color',
  'background_color',
  'show_product_price',
  'show_product_title',
  'buy_button_out_of_stock_text',
  'buy_button_product_unavailable_text',
  'product_title_color',
  'checkout_button_text',
  'text_color',
  'accent_color',
  'cart_title',
  'cart_total_text',
  'discount_notice_text',
  'sticky',
  'empty_cart_text',
  'next_page_button_text',
];

export const defaultOptions = {
  product: {
    text: {},
    contents: {
      quantity: false,
      quantityInput: false,
      quantityButton: false,
      quantityIncrement: false,
      quantityDecrement: false,
    },
    styles: Object.assign({}, productStyles),
  },
  productSet: {
    styles: Object.assign({}, productSetStyles),
    text: {},
  },
  modalProduct: {
    styles: Object.assign({}, modalProductStyles),
    contents: {
      variantTitle: false,
      footer: true,
    },
    events: {
      beforeRender: (productInstance) => {
        productInstance.template.contents.footer = true;
      },
    },
  },
  modal: {
    styles: Object.assign({}, modalStyles),
    events: {
      beforeRender: (modalInstance) => {
        modalInstance.config.modalProduct.contents.button = false;
      },
    },
  },
  cart: {
    styles: Object.assign({}, cartStyles),
    text: {},
  },
  lineItem: {
    styles: Object.assign({}, lineItemStyles),
  },
  toggle: {
    styles: Object.assign({}, toggleStyles),
  },
  option: {
    templates: optionTemplates,
  },
};
