import {modalProductStyles, modalStyles} from './styles/overrides';

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

const product = {
  text: {},
  contents: {},
  styles: {
    img: {
      'margin-bottom': '0px',
    },
    title: {
      'margin-top': '10px',
      'margin-bottom': '20px',
    },
    button: {},
    variantTitle: {},
    options: {
      'margin-bottom': '0px',
    },
    price: {},
    prices: {},
    wrapper: {
      width: '450px',
    },
  },
};

const productSet = {
  text: {},
};

const modalProduct = {
  styles: Object.assign({}, modalProductStyles, {
    button: {},
    wrapper: {},
  }),
  events: {
    beforeRender: (productInstance) => {
      productInstance.template.contents.footer = true;
    },
  },
};

const modal = {
  styles: Object.assign({}, modalStyles, {
    button: {},
    wrapper: {},
    footer: {},
  }),
  events: {
    beforeRender: (modalInstance) => {
      modalInstance.config.modalProduct.contents.button = false;
    },
  },
};

const cart = {
  styles: {
    button: {},
    header: {},
    title: {},
    lineItems: {},
    subtotal: {},
    cart: {},
    footer: {},
    close: {},
  },
  text: {},
};

const lineItem = {
  styles: {
    variantTitle: {},
    quantity: {},
    quantityInput: {},
    quantityButton: {},
  },
};

const toggle = {
  styles: {
    toggle: {},
  },
};

export const defaultOptions = {product, productSet, modalProduct, modal, cart, lineItem, toggle};
