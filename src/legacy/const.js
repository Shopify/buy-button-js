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
    button: {},
    variantTitle: {},
    title: {},
    price: {},
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
  },
  text: {},
};

export const defaultOptions = {product, productSet, modalProduct, modal, cart};
