import ComponentContainer from './container';
import Product from './product';
import productDefaults from '../defaults/product';
import Iframe from './iframe';

const collectionDefaults = {
  className: 'collection',
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  iframe: true,
  classes: {
    data: 'collection'
  },
  productConfig: Object.assign({}, productDefaults, {
    iframe: false
  })
}

export default class Collection extends ComponentContainer {
  constructor(config, props) {
    let productConfig = Object.assign({}, collectionDefaults.productConfig, config.productConfig);
    let collectionConfig = Object.assign({}, collectionDefaults, config);
    collectionConfig.productConfig = productConfig;
    collectionConfig.styles = productConfig.styles;
    collectionConfig.classes = productConfig.classes;

    super(collectionConfig, props);
    this.modal = null;
    if (this.config.productConfig.modal) {
      this.modal = new Iframe(this.config.entryNode, {}, {
        data: 'product_modal'
      })
    }
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
