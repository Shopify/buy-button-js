import Component from '../component';
import Product from './product';

export default class Collection extends Component {
  constructor(config, props) {
    super(config, props, 'collection');
    this.productComponents = [];
  }

  fetchData() {
    return this.props.client.fetchQueryProducts({collection_id: this.id});
  }

  render() {
    super.render();
    const productConfig = Object.assign({}, this.config, {
      node: this.wrapper,
    });
    productConfig.product.iframe = false;

    Promise.all(this.model.map((product) => {
      const component = new Product(productConfig, this.props);
      this.productComponents.push(component);
      return component.init(product);
    })).then(() => this.resizeAfterImgLoad());
  }
}
