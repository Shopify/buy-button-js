import ComponentContainer from './container';
import Product from './product';
import productDefaults from '../defaults/product';

const collectionDefaults = {
  className: 'collection',
  productConfig: productDefaults,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  iframe: true,
}

export default class Collection extends ComponentContainer {
  constructor(config, props) {
    let collectionConfig = Object.assign({}, collectionDefaults, config);
    super(collectionConfig, props);
  }

  getData() {
    return this.props.client.fetchQuery('products', {collection_id: this.config.id}).then((collection) => {
      return collection;
    });
  }

  onCartAdd(data) {
    this.props.callbacks.addVariantToCart(data.data);
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
    this.props.model.forEach((productModel) => {
      let product = new Product(this.config.productConfig, {
        model: productModel,
        callbacks: this.props.callbacks
      });
      let wrapper = this._createWrapper(this.wrapper, this.config.productConfig.className);
      product.render(wrapper);
    });
    this.resize();
  }
}
