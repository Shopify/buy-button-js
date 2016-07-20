import Component from '../component';
import Product from './product';

export default class Collection extends Component {
  constructor(config, props) {
    super(config, props, 'collection');
  }

  fetchData() {
    return this.props.client.fetchCollection(this.id).then((collection) => {
      return this.props.client.fetchQueryProducts({collection_id: this.id}).then((products) => {
        return {
          products,
          collection
        }
      });
    });
  }

  render() {
    super.render();
    const productConfig = Object.assign({}, this.config, {
      node: this.wrapper,
    });
    productConfig.product.iframe = false;

    return Promise.all(this.model.products.map((productModel) => {
      new Product(productConfig, this.props).init(productModel);
    })).then(() => this.resizeAfterImgLoad());
  }
}
