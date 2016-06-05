import productTemplates from '../templates/product';
import Widget from './widget';

const productContents = ['title', 'variantTitle', 'price', 'button'];

export default class Product extends Widget {
  constructor (config, props) {
    let productConfig = Object.assign({}, config);
    productConfig.templates = Object.assign(productTemplates, config.templates);
    productConfig.contents = config.contents || productContents;
    super(productConfig, props);
  }

  getData() {
    return new Promise((resolve) => {
      return resolve(this.data || {
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      })
    });
  }
};

