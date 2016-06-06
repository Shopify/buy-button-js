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
    this.init();
  }

  getData() {
    return this.props.client.fetchQuery('products', {collection_id: this.config.id}).then((collection) => {
      return collection;
    });
  }

  onCartAdd(data) {
    this.props.addVariantToCart(data.data);
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
    this.products = this.model.map((p) => new Product(this.config.productConfig, {
      'buyButton': this.onCartAdd.bind(this)
    }, p));
    this.products.forEach((item) => {
      let wrapper = this._createWrapper(this.wrapper, this.config.productConfig.className);
      item.render(wrapper);
    });
    this.resize();
  }
}
