import merge from 'lodash.merge';
import Component from '../component';
import Product from './product';

export default class ProductSet extends Component {
  get typeKey() {
    return 'productSet';
  }

  fetchData() {

    // eslint-disable-next-line camelcase
    return this.props.client.fetchQueryProducts({product_ids: this.id}).then((products) => {
      return {
        products,
      };
    });
  }

  render() {
    super.render();
    const productConfig = {
      node: this.document.querySelector(`.${this.classes.productSet.products}`),
      options: merge({}, this.config, {
        product: {
          iframe: false,
          classes: {
            wrapper: this.classes.productSet.product,
          }
        },
      }),
    };

    const promises = this.model.products.map((productModel) => {
      return new Product(productConfig, this.props).init(productModel);
    });

    return Promise.all(promises).then(() => this.loadImgs());
  }
}
