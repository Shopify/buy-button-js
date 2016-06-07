import cartTemplate from '../templates/cart';
import lineItemTemplate from '../templates/line-item';

const cartDefaults = {
  className: 'cart',
  iframe: true,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: cartTemplate,
  contents: ['title', 'items', 'total', 'checkout'],
  lineItemConfig: {
    className: 'lineItem',
    templates: lineItemTemplate,
    contents: ['title', 'price', 'quantity']
  },
  classes: {
    data: 'cart_content'
  }
}

export default cartDefaults;
