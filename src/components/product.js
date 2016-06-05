import Widget from './widget';
import productTemplate from '../templates/product';

export default class Product extends Widget {
  constructor() {
    super(...arguments);
    this.className = 'product';
    this.contents = ['title', 'variantTitle', 'price', 'button'];
    this.templates = productTemplate;
  }

  attachEventListeners() {
    this.wrapperNode.querySelector('.buy-button').addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick() {
    this.props.addToCart(this.data);
  }

  getData() {
    return new Promise((resolve) => {
      return resolve({
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      })
    });
  }
}

