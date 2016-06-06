import ComponentContainer from './container';
import View from './view';
import productDefaults from '../defaults/product';

const collectionDefaults = {
  className: 'collection',
  productConfig: productDefaults,
  entryNode: document.getElementsByTagName('script')[0].parentNode,
  iframe: true
}

export default class Collection extends ComponentContainer {
  constructor(config, props) {
    let collectionConfig = Object.assign({}, collectionDefaults, config);
    super(collectionConfig, props);
    this.init();
  }

  getData() {
    return new Promise((resolve) => {
      return resolve([{
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      },{
        title: 'cat hats',
        selectedVariant: {
          title: 'red',
          price: '$19'
        }
      }])
    });
  }

  onCartAdd(data) {
    this.props.addVariantToCart(data.data);
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
    this.products = this.model.map((p) => new View(this.config.productConfig, p, {
      'buyButton': this.onCartAdd.bind(this)
    }));
    this.products.forEach((item) => {
      let wrapper = this._createWrapper(this.wrapper, this.config.productConfig.className);
      item.render(wrapper);
    });
    this.resize();
  }
}
