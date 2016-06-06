import productTemplate from '../templates/product';

const productDefaults = {
  className: 'product',
  iframe: false,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  templates: productTemplate,
  contents: ['title', 'variantTitle', 'price', 'button']
}

export default productDefaults;
