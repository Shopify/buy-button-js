import productTemplate from '../templates/product';
import optionTemplate from '../templates/option';

const productDefaults = {
  className: 'product',
  iframe: true,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: productTemplate,
  contents: ['title', 'variantTitle', 'price', 'variantSelection', 'button'],
  classes: {
    title: 'product-title',
    variantTitle: 'variant-title',
    price: 'variant-price',
    button: 'buy-button',
    data: 'product'
  },
  optionConfig: {
    templates: optionTemplate,
    contents: ['option'],
    className: 'option'
  },
}

export default productDefaults;
