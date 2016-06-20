import ComponentContainer from './container';
import Product from './product';
import collectionDefaults from '../defaults/collection';
import Iframe from './iframe';
import merge from 'deepmerge';

export default class Collection extends ComponentContainer {
  constructor(config, props) {
    const collectionConfig = Object.assign({}, collectionDefaults, config);
    const productConfig = merge(collectionDefaults.productConfig, config.productConfig);
    collectionConfig.productConfig = productConfig;
    ({ styles: collectionConfig.styles, classes: collectionConfig.classes } = productConfig);

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
        callbacks: this.props.callbacks,
        modal: this.modal
      },{
        imagesRendered: this.resize.bind(this)
      });
      let wrapper = this._createWrapper(this.wrapper, this.config.productConfig.className);
      product.render(wrapper);
    });
    this.resize();
  }
}
