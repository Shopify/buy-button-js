import optionTemplates from './templates/option';
import productModalTemplates from './templates/product-modal';
import {
  productStyles,
  productSetStyles,
  modalProductStyles,
  modalStyles,
  lineItemStyles,
  cartStyles,
  toggleStyles,
  optionStyles,
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
      contents: true,
    },
    order: ['contents'],
    templates: productModalTemplates,
  },
  modal: {
    styles: Object.assign({}, modalStyles),
  },
  cart: {
    styles: Object.assign({}, cartStyles),
    text: {},
  }),
  events: {
    beforeRender: (modalInstance) => {
      modalInstance.config.modalProduct.contents.button = false;
    },
  },
  lineItem: {
    styles: Object.assign({}, lineItemStyles),
    close: {},
  },
  toggle: {
};

const lineItem = {
    styles: Object.assign({}, toggleStyles),
  },
  option: {
    templates: optionTemplates,
    styles: Object.assign({}, optionStyles),
  },
};
