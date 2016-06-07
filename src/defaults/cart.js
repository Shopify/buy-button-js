import cartTemplate from '../templates/cart';
import lineItemTemplate from '../templates/line-item';

const cartDefaults = {
  className: 'cart',
  iframe: true,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: cartTemplate,
  contents: ['title', 'items', 'total', 'checkout'],
  lineItemConfig: {
    className: 'cart-item',
    templates: lineItemTemplate,
    contents: ['title', 'price', 'updateQuantity', 'quantity']
  },
  classes: {
    data: 'cart_content'
  }
}

export default cartDefaults;
