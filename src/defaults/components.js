import productTemplates from '../templates/product';
import optionTemplates from '../templates/option';
import cartTemplates from '../templates/cart';
import lineItemTemplates from '../templates/lineItem';

const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'checkout',
    contents: ['img', 'title', 'variantTitle', 'options', 'price', 'button'],
    templates: productTemplates,
    styles: {
      button: {
        'background-color': 'red'
      }
    },
    classes: {
      button: 'btn',
      title: 'product-title',
      variantTitle: 'variant-title',
      price: 'variant-price',
      options: 'variant-selectors',
      disabled: 'btn-disabled'
    },
    text: {
      button: 'Add to cart'
    }
  },
  option: {
    templates: optionTemplates,
    contents: ['option'],
    classes: {
      select: 'select'
    }
  },
  cart: {
    iframe: true,
    contents: ['title', 'lineItems', 'total', 'checkout'],
    templates: cartTemplates,
    styles: {
      button: {
        'background-color': 'red'
      }
    },
    classes: {
      button: 'button'
    }
  },
  lineItem: {
    contents: ['title', 'price'],
    templates: lineItemTemplates
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
    onUnload: null
  }
};

export default defaults;
