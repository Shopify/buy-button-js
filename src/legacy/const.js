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
    wrapper: {},
  },
};

const productSet = {
  styles: {
    product: {},
    wrapper: {},
  },
  products: {},
  text: {},
};

const modalProduct = {
  styles: {
    button: {},
    wrapper: {},
  },
  text: {},
};

const modal = {
  styles: {
    button: {},
    wrapper: {},
  },
  text: {},
};

const cart = {
  styles: {
    button: {},
    wrapper: {},
    header: {},
    title: {},
    lineItems: {},
    subtotal: {},
    cart: {},
    footer: {},
  },
  text: {},
};

const toggle = {
  styles: {
    button: {},
    wrapper: {},
  },
  text: {},
};

export const defaultOptions = {product, productSet, modalProduct, modal, cart, toggle};
