import productTemplates from '../templates/product';
import cartTemplates from '../templates/cart';
import optionTemplates from '../templates/option';
import toggleTemplates from '../templates/toggle';
import lineItemTemplates from '../templates/line-item';

const defaults = {
  product: {
    iframe: true,
    buttonDestination: 'cart',
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      price: true,
      description: false,
      options: true,
      quantity: false,
      button: true,
    },
    templates: productTemplates,
    classes: {
      product: 'product',
      img: 'product__variant-image',
      button: 'btn',
      title: 'product__title',
      prices: 'product__price',
      price: 'product__actual-price',
      compareAt: 'product__compare-price',
      variantTitle: 'product__variant-title',
      description: 'product-description',
      options: 'product__variant-selectors',
      disabled: 'btn-disabled',
      quantity: 'cart-item__quantity-container',
      quantityInput: 'cart-item__quantity',
      quantityButton: 'btn--seamless',
    },
    text: {
      button: 'Add to cart',
    },
  },
  productSet: {
    iframe: true,
    contents: {
      title: false,
      products: true,
    },
    templates: {
      title: '<h2 class="{{data.classes.productSet.title}}">{{data.collection.attrs.title}}</h2>',
      products: '<div class="{{data.classes.productSet.products}}"></div>',
    },
    classes: {
      title: 'collection__title',
      collection: 'collection',
      products: 'collection-products',
    },
  },
  option: {
    templates: optionTemplates,
    contents: {
      option: true,
    },
    classes: {
      option: 'component-input component-input--select',
      wrapper: 'shopify-select',
      select: 'component-input--select__select',
      label: 'component-input__label visuallyhidden',
    },
  },
  cart: {
    iframe: true,
    templates: cartTemplates,
    contents: {
      title: true,
      lineItems: true,
      footer: true,
    },
    classes: {
      cart: 'cart',
      header: 'cart__header',
      title: 'cart__title',
      lineItems: 'cart-items',
      footer: 'cart-bottom',
      subtotalText: 'cart__subtotal__text',
      subtotal: 'cart__subtotal__price',
      notice: 'cart__notice',
      currency: 'cart__currency',
      button: 'btn btn--cart-checkout',
      close: 'btn--close',
      cartScroll: 'cart-scroll',
    },
    text: {
      title: 'Your cart',
      button: 'Checkout',
      total: 'Total',
      currency: 'CAD',
      notice: 'Shipping and discount codes are added at checkout.',
    },
  },
  lineItem: {
    templates: lineItemTemplates,
    contents: {
      image: true,
      variantTitle: true,
      title: true,
      price: true,
      quantity: true,
    },
    classes: {
      lineItem: 'cart-item',
      image: 'cart-item__image',
      variantTitle: 'cart-item__variant-title',
      itemTitle: 'cart-item__title',
      price: 'cart-item__price',
      quantity: 'cart-item__quantity-container',
      quantityInput: 'cart-item__quantity',
      quantityButton: 'btn--seamless',
    },
  },
  toggle: {
    templates: toggleTemplates,
    iframe: true,
    contents: {
      count: true,
      title: true,
    },
    classes: {
      toggle: 'cart-toggle',
      title: 'cart-toggle__title',
      count: 'cart-toggle__count',
    },
    text: {
      title: 'cart',
    },
  },
  window: {
    height: 600,
    width: 600,
    toolbar: 0,
    scrollbars: 0,
    status: 0,
    resizable: 1,
    left: 0,
    top: 0,
    center: 0,
    createnew: 1,
    location: 0,
    menubar: 0,
    onUnload: null,
  },
};

export default defaults;
