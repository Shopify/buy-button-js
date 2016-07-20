import Component from '../component';
import Product from './product';

export default class ProductSet extends Component {
  constructor(config, props) {
    super(config, props, 'collection', 'product');
  }

  fetchData() {

    /* eslint-disable camelcase */
    return this.props.client.fetchQueryProducts({product_ids: this.id}).then((products) => {
      return {
        products,
      };
    });

    /* eslint-enable camelcase */
  }

  render() {
    super.render();
    const productConfig = Object.assign({}, this.config, {
      node: this.document.querySelector(`.${this.classes.products}`),
    });
    productConfig.product.iframe = false;

    return Promise.all(this.model.products.map((productModel) => {
      return new Product(productConfig, this.props).init(productModel);
    })).then(() => this.resizeAfterImgLoad());
  }
}
