import Widget from './widget';
import Product from './product';
import Iframe from './iframe';

export default class Collection extends Widget {
  constructor() {
    super(...arguments);
    this.className = 'collection';
    this.products = [];
  }

  getData() {
    return new Promise((resolve) => {
      return resolve([{
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      },
      {
        title: 'test2',
        selectedVariant: {
          title: 'testVariant2',
          price: '$20'
        }
      }])
    });
  }

  render() {
    if (!this.iframe) {
      this.iframe = new Iframe(document);
      this.iframe.attach();
    }
    this.config.entryNode.parentNode.insertBefore(this.iframe.el, this.config.entryNode);

    this.getData().then((data) => {
      this.products = data.map((item) => {
        let product = new Product({entryNode: this.iframe.document.body}, item, this.props);
        let html = product.template(product.data);
        product.insert()
        product.afterRender();
      });
    });
  }
}
