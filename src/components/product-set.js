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
    this.imagesRendered = false;
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

    const imgs = [];

    const promises = this.model.products.map((productModel) => {
      const product = new Product(productConfig, this.props);

      this.products.push(product);
      return product.init(productModel);
    });

    Promise.all(promises).then((product) => {
      let imgs = [...this.wrapper.getElementsByTagName('img')]
        .filter((img) => img.src.indexOf('cdn.shopify.com') > -1)
        .map((img) => {
          return {
            img,
            loaded: img.naturalWidth > 0,
          }
        });

      this.resize();

      let iterations = imgs.length;

      if (!this.imagesRendered) {
        this.imagesRendered = true;
        const collectionResize = setInterval(() => {
          iterations++;
          imgs = imgs.map((img) => {
            return {
              img: img.img,
              loaded: img.img.naturalWidth > 0,
            }
          });
          const loadedImgs = imgs.filter((img) => img.loaded);
          this.resize();
          if (loadedImgs.length === imgs.length || iterations > imgs.length) {
            clearInterval(collectionResize);
          }
        }, 200);
      };

    });

  }
}
