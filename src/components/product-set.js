import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import Template from '../template';

const pollInterval = 200;

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

export default class ProductSet extends Component {
  constructor(config, props) {
    super(config, props);
    this.products = [];
    this.cart = null;
    this.page = 1;
    this.nextModel = {products: []};
    this.height = 0;
    this.resizeCompleted = false;
  }

  get typeKey() {
    return 'productSet';
  }

  get nextButtonClass() {
    return this.nextModel.products.length ? 'is-active' : '';
  }

  get shouldResizeY() {
    return true;
  }

  get viewData() {
    return {
      classes: this.classes,
      text: this.text,
      nextButtonClass: this.nextButtonClass,
    };
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.productSet.paginationButton}`]: this.nextPage.bind(this),
    });
  }

  get paginationTemplate() {
    this._paginationTemplate = this._paginationTemplate || new Template({pagination: this.templates.pagination}, {pagination: true}, ['pagination']);
    return this._paginationTemplate;
  }

  get fetchQuery() {
    return {
      limit: 30,
      page: 1,
    };
  }

  init(data) {
    return super.init.call(this, data).then((model) => (
      this.props.createCart({options: this.config}).then((cart) => {
        this.cart = cart;
        if (model) {
          return this.renderProducts(this.model.products);
        }
        return model;
      })
    ));
  }

  sdkFetch(options = {}) {

    /* eslint-disable camelcase */
    const queryOptions = Object.assign({}, this.fetchQuery, options);
    let method;
    if (this.id) {
      const queryKey = isArray(this.id) ? 'product_ids' : 'collection_id';
      method = this.props.client.fetchQueryProducts(Object.assign({}, queryOptions, {[queryKey]: this.id}));
    } else if (this.handle) {
      method = this.props.client.fetchQueryCollections({handle: this.handle}).then((collections) => {
        const collection = collections[0];
        return this.props.client.fetchQueryProducts(Object.assign({}, queryOptions, {collection_id: collection.attrs.collection_id}));
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

  showPagination() {
    return this.sdkFetch({page: this.page + 1}).then((data) => {
      this.nextModel = {products: data};
      this.renderChild(this.classes.productSet.paginationButton, this.paginationTemplate);
      this.resize();
      return;
    });
  }

  nextPage() {
    this.model = this.nextModel;
    this.page = this.page + 1;
    this.renderProducts();
  }

  updateConfig(config) {
    super.updateConfig(config);
    this.cart.updateConfig(config);
  }

  resizeUntilFits() {
    if (!this.iframe || this.resizeCompleted) {
      return;
    }
    const maxResizes = this.products.length;
    let resizes = 0;

    this.height = this.wrapper.clientHeight;
    this.resize();
    const productSetResize = setInterval(() => {
      if (this.wrapper.clientHeight > this.height) {
        resizes++;
        this.resize();
      }
      if (resizes > maxResizes) {
        this.resizeCompleted = true;
        clearInterval(productSetResize);
      }
    }, pollInterval);
  }

  renderProducts() {
    if (!this.model.products.length) {
      return Promise.resolve();
    }
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

    return Promise.all(promises).then(() => {
      this.showPagination();
      this.resizeUntilFits();
      return;
    });

  }
}
