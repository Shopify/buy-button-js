import merge from '../utils/merge';
import Component from '../component';
import Product from './product';

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

export default class ProductSet extends Component {
  constructor(config, props) {
    super(config, props);
    this.products = [];
    this.cart = null;
  }

  get typeKey() {
    return 'productSet';
  }

  get shouldResizeY() {
    return true;
  }

  init(data) {
    return super.init.call(this, data).then((model) => (
      this.props.createCart({options: this.config}).then((cart) => {
        this.cart = cart;
        if (model) {
          this.render();
        }
        return model;
      })
    ));
  }

  sdkFetch() {

    /* eslint-disable camelcase */
    let method;
    if (this.id) {
      const queryKey = isArray(this.id) ? 'product_ids' : 'collection_id';
      method = this.props.client.fetchQueryProducts({[queryKey]: this.id});
    } else if (this.handle) {
      method = this.props.client.fetchQueryCollections({handle: this.handle}).then((collections) => {
        const collection = collections[0];
        return this.props.client.fetchQueryProducts({collection_id: collection && collection.attrs.collection_id});
      });
    }
    return method;

    /* eslint-enable camelcase */
  }

  fetchData() {
    return this.sdkFetch().then((products) => {
      if (products.length) {
        return {
          products,
        };
      }
      throw new Error('Not Found');
    });
  }

  updateConfig(config) {
    super.updateConfig(config);
    this.cart.updateConfig(config);
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
          },
        },
      }),
    };

    const promises = this.model.products.map((productModel) => {
      const product = new Product(productConfig, this.props);
      this.products.push(product);
      return product.init(productModel);
    });

    return Promise.all(promises).then(() => {
      this.resize();
      return this.loadImgs();
    });
  }
}
