import Widget from './widget';
import cartTemplate from '../templates/cart';

export default class Cart extends Widget {
  constructor(config) {
    super(config);
    this.className = 'cart';
    this.contents = ['title', 'total', 'checkout'];
    this.templates = cartTemplate;
  }

  getData() {
    return new Promise((resolve) => {
      return resolve({
        title: 'test Cart',
        total: '$100'
      })
    });
  }
}

