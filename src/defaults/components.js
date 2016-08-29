import productTemplates from '../templates/product';
import cartTemplates from '../templates/cart';
import optionTemplates from '../templates/option';
import toggleTemplates from '../templates/toggle';
import lineItemTemplates from '../templates/line-item';
import modalTemplates from '../templates/modal';

const defaults = {
  product: {
    iframe: true,
    buttonDestination: 'cart',
    layout: 'vertical',
    manifest: ['product', 'option'],
    order: [
      'img',
      'title',
      'variantTitle',
      'price',
      'options',
      'quantity',
      'button',
    ],
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      price: true,
      options: true,
      quantity: true,
      quantityIncrement: false,
      quantityDecrement: false,
      quantityInput: true,
      button: true,
      description: false,
    },
    templates: productTemplates,
    classes: {
      wrapper: 'product-wrapper',
      product: 'product',
      img: 'product__variant-img',
      imgWrapper: 'product-img-wrapper',
      blockButton: 'btn--parent',
      button: 'btn',
      title: 'product__title',
      prices: 'product__price',
      price: 'product__actual-price',
      compareAt: 'product__compare-price',
      variantTitle: 'product__variant-title',
      description: 'product-description',
      options: 'product__variant-selectors',
      disabled: 'btn-disabled',
      buttonBesideQty: 'beside-quantity',
      quantity: 'quantity-container',
      quantityInput: 'quantity',
      quantityButton: 'btn--seamless',
      quantityIncrement: 'quantity-increment',
      quantityDecrement: 'quantity-decrement',
    },
    text: {
      button: 'SHOP NOW',
      outOfStock: 'Out of stock',
      unavailable: 'Unavailable',
    },
  },
  modalProduct: {
    iframe: false,
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      price: true,
      options: true,
      button: true,
      quantity: true,
      quantityIncrement: false,
      quantityDecrement: false,
      quantityInput: true,
      description: true,
    },
    order: [
      'img',
      'title',
      'variantTitle',
      'price',
      'options',
      'quantity',
      'button',
      'description',
    ],
    classes: {
      wrapper: 'modal-product-wrapper',
      hasImage: 'has-image',
    },
    buttonDestination: 'cart',
    text: {
      button: 'ADD TO CART',
    },
  },
  modal: {
    iframe: true,
    manifest: ['modal', 'product', 'option'],
    classes: {
      modal: 'modal',
      contents: 'modal-contents',
      close: 'btn--close',
      wrapper: 'modal-wrapper',
      product: 'product-modal',
      img: 'modal-img',
      footer: 'modal-footer',
      footerWithImg: 'modal-footer--has-img',
      imgWithImg: 'modal-img--has-img',
      contentsWithImg: 'modal-contents--has-img',
      scrollContents: 'modal-scroll-contents',
    },
    contents: {
      contents: true,
    },
    order: ['contents'],
    templates: modalTemplates,
  },
  productSet: {
    iframe: true,
    manifest: ['product', 'option', 'productSet'],
    contents: {
      title: false,
      products: true,
      pagination: true,
    },
    order: ['title', 'products', 'pagination'],
    templates: {
      title: '<h2 class="{{data.classes.productSet.title}}">{{data.collection.attrs.title}}</h2>',
      products: '<div class="{{data.classes.productSet.products}}"></div>',
      pagination: '<button class="{{data.classes.productSet.paginationButton}} {{data.nextButtonClass}}">{{data.text.nextPageButton}}</button>',
    },
    text: {
      next: 'Next page',
    },
    classes: {
      wrapper: 'collection-wrapper',
      productSet: 'collection',
      title: 'collection__title',
      collection: 'collection',
      products: 'collection-products',
      product: 'collection-product',
      paginationButton: 'collection-pagination-button btn',
    },
    text: {
      nextPageButton: 'Next page',
    },
  },
  option: {
    templates: optionTemplates,
    contents: {
      option: true,
    },
    order: ['option'],
    classes: {
      option: 'option-select',
      wrapper: 'option-select-wrapper',
      select: 'option-select__select',
      label: 'option-select__label',
    },
  },
  cart: {
    iframe: true,
    templates: cartTemplates,
    startOpen: false,
    manifest: ['cart', 'lineItem'],
    contents: {
      title: true,
      lineItems: true,
      footer: true,
    },
    order: ['title', 'lineItems', 'footer'],
    classes: {
      wrapper: 'cart-wrapper',
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
      emptyCart: 'cart-empty-text',
    },
    text: {
      title: 'Cart',
      empty: 'Your cart is empty.',
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
      quantityIncrement: true,
      quantityDecrement: true,
      quantityInput: true,
    },
    order: [
      'image',
      'variantTitle',
      'title',
      'price',
      'quantity',
    ],
    classes: {
      lineItem: 'cart-item',
      image: 'cart-item__image',
      variantTitle: 'cart-item__variant-title',
      itemTitle: 'cart-item__title',
      price: 'cart-item__price',
      quantity: 'quantity-container',
      quantityInput: 'quantity cart-item__quantity-input',
      quantityButton: 'btn--seamless',
    },
  },
  toggle: {
    templates: toggleTemplates,
    manifest: ['toggle'],
    iframe: true,
    sticky: true,
    contents: {
      count: true,
      icon: true,
      title: false,
    },
    order: [
      'count',
      'icon',
      'title',
    ],
    classes: {
      wrapper: 'cart-toggle-wrapper',
      toggle: 'cart-toggle',
      title: 'cart-toggle__title',
      count: 'cart-toggle__count',
      icon: 'icon-cart icon-cart--side',
      iconPath: 'icon-cart__group',
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
