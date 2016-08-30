import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import hogan from 'hogan.js';

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
  }

  get typeKey() {
    return 'productSet';
  }

  get nextButtonClass() {
    return this.nextModel.products.length ? 'is-active' : '';
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
    this._paginationTemplate = this._paginationTemplate || hogan.compile(this.templates.pagination);
    return this._paginationTemplate;
  }

  get fetchQuery() {

    /* eslint-disable camelcase */
    return {
      limit: this.options.limit,
      page: 1,
      sort_by: this.options.sortBy,
    }
  }

  sdkFetch(options = {}) {
    options = Object.assign({}, this.fetchQuery, options);
    let method;
    if (this.id) {
      const queryKey = isArray(this.id) ? 'product_ids' : 'collection_id';
      method = this.props.client.fetchQueryProducts(Object.assign({}, options, {[queryKey]: this.id}));
    } else if (this.handle) {
      method = this.props.client.fetchQueryCollections({handle: this.handle}).then((collections) => {
        const collection = collections[0];
        return this.props.client.fetchQueryProducts(Object.assign({}, options, {collection_id: collection.attrs.collection_id}));
      });
    }
    return method;

    /* eslint-enable camelcase */
  }

  fetchData() {
    return this.sdkFetch().then((products) => {
      return {
        products,
      };
    });
  }

  showPagination() {
    return this.sdkFetch({page: this.page + 1}).then((data) => {
      this.nextModel = {products: data};
      this.updateNode(this.classes.productSet.paginationButton, this.paginationTemplate);
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

    const promises = this.model.products.map((productModel) => {
      const product = new Product(productConfig, this.props);
      this.products.push(product);
      return product.init(productModel);
    });

    return Promise.all(promises).then(() => {
      this.resize();
      if (this.products.length) {
        this.cart = this.cart || this.products[0].cart;
      }
      return this.loadImgs().then(() => this.showPagination());
    });
  }

  init() {
    return super.init().then(() => {
      return this.renderProducts(this.model.products);
    });
  }
}
