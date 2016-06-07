import productTemplate from '../templates/product';
import optionTemplate from '../templates/option';

const productDefaults = {
  className: 'product',
  iframe: false,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: productTemplate,
  contents: ['title', 'variantTitle', 'price', 'variantSelection', 'button'],
  optionConfig: {
    templates: optionTemplate,
    contents: ['option'],
    className: 'option'
  }
}

export default productDefaults;
