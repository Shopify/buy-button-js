import productTemplates from '../templates/product';
import cartTemplates from '../templates/cart';
import optionTemplates from '../templates/option';
import toggleTemplates from '../templates/toggle';
import lineItemTemplates from '../templates/line-item';

const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'cart',
    contents: ['img', 'title', 'variantTitle', 'description', 'options', 'price', 'button'],
    templates: productTemplates,
    classes: {
      product: 'product',
      img: 'variant-img',
      button: 'btn',
      title: 'product-title',
      variantTitle: 'variant-title',
      description: 'product-description',
      price: 'variant-price',
      options: 'variant-selectors',
      disabled: 'btn-disabled',
    },
    text: {
      button: 'Add to cart',
    },
  },
  option: {
    templates: optionTemplates,
    contents: ['option'],
    classes: {
      option: 'options',
      select: 'select',
      option: 'option',
    },
  },
  cart: {
    iframe: true,
    templates: cartTemplates,
    contents: ['title', 'lineItems', 'total', 'button'],
    classes: {
      cart: 'cart',
      header: 'cart-section cart-section--top',
      title: 'cart-title',
      lineItems: 'cart-item-container cart-section',
      footer: 'cart-bottom',
      total: 'cart-info clearfix cart-section',
      button: 'btn btn--cart-checkout',
      close: 'btn--close',
    },
    text: {
      title: 'Your cart',
      button: 'Checkout',
    },
  },
  lineItem: {
    templates: lineItemTemplates,
    contents: ['image', 'title', 'variantTitle', 'quantity', 'price'],
    classes: {
      lineItem: 'cart-item',
      image: 'cart-item__img',
      variantTitle: 'cart-item__variant-title',
      title: 'cart-item__title',
      price: 'cart-item__price',
      quantity: 'cart-item__quantity-container',
      quantityInput: 'cart-item__quantity',
      quantityButton: 'btn--seamless',
    },
  },
  toggle: {
    templates: toggleTemplates,
    contents: ['title', 'count'],
    classes: {
      toggle: 'cart-toggle',
      title: 'cart-toggle__title',
      count: 'cart-toggle__count'
    },
    text: {
      title: 'cart'
    }
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
