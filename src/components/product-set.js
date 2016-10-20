import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import Template from '../template';

const pollInterval = 200;

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

/**
 * Renders and fetches data for collection and product set embed.
 * @extends Component.
 */

export default class ProductSet extends Component {

  /**
   * create ProductSet
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
  constructor(config, props) {
    super(config, props);
    this.products = [];
    this.cartNode = config.cartNode;
    this.modalNode = config.modalNode;
    this.cart = null;
    this.page = 1;
    this.nextModel = {products: []};
    this.height = 0;
    this.resizeCompleted = false;
  }

  /**
   * get key for configuration object.
   * @return {String}
   */
  get typeKey() {
    return 'productSet';
  }

  get nextButtonClass() {
    return this.nextModel.products.length ? 'is-active' : '';
  }

  get shouldResizeY() {
    return true;
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    return Object.assign({}, this.options.viewData, {
      classes: this.classes,
      text: this.options.text,
      nextButtonClass: this.nextButtonClass,
    });
  }

  /**
   * get events to be bound to DOM.
   * @return {Object}
   */
  get DOMEvents() {
    return Object.assign({}, {
      click: this.props.closeCart.bind(this),
      [`click ${this.selectors.productSet.paginationButton}`]: this.nextPage.bind(this),
    }, this.options.DOMEvents);
  }

  /**
   * get template for rendering pagination button.
   * @return {Object} Template instance
   */
  get paginationTemplate() {
    this._paginationTemplate = this._paginationTemplate || new Template({pagination: this.options.templates.pagination}, {pagination: true}, ['pagination']);
    return this._paginationTemplate;
  }

  get fetchQuery() {
    return {
      limit: 30,
      page: 1,
    };
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initalizes cart if necessary.
   * Calls renderProducts.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    return super.init.call(this, data).then((model) => (
      this.props.createCart({options: this.config}).then((cart) => {
        this.cart = cart;
        if (model) {
          return this.renderProducts(this.model.products);
        }
        return this;
      })
    ));
  }

  /**
   * fetches products from SDK based on provided config information.
   * @param {Object} options - query options for request
   * @return {Promise} promise resolving to collection data.
   */
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
        this.id = collection.attrs.collection_id;
        return this.sdkFetch(options);
      });
    }
    return method;

    /* eslint-enable camelcase */
  }

  wrapTemplate(html) {
    return `<div class="${this.classes.productSet.productSet}">${html}</div>`;
  }

  /**
   * call sdkFetch and set model.products to products array.
   * @throw 'Not Found' if model not returned.
   * @return {Promise} promise resolving to model data.
   */
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

  /**
   * make request to SDK for current page + 1 to determine if next page exists. Render button if next page exists.
   * @return {Promise} promise resolving when button is rendered or not.
   */
  showPagination() {
    return this.sdkFetch({page: this.page + 1}).then((data) => {
      this.nextModel = {products: data};
      this.renderChild(this.classes.productSet.paginationButton, this.paginationTemplate);
      this.resize();
      return;
    });
  }

  /**
   * append next page worth of products into the DOM
   */
  nextPage() {
    this.model = this.nextModel;
    this.page = this.page + 1;
    this._userEvent('loadNextPage');
    this.renderProducts();
  }

  /**
   * resize iframe until it is tall enough to contain all products.
   */
  resizeUntilFits() {
    if (!this.iframe || this.resizeCompleted) {
      return;
    }
    const maxResizes = this.products.length;
    let resizes = 0;

    this.height = this.outerHeight;
    this.resize();
    const productSetResize = setInterval(() => {
      const currentHeight = this.outerHeight;
      if (parseInt(currentHeight, 10) > parseInt(this.height, 10)) {
        resizes++;
        this.height = currentHeight;
        this.resize(currentHeight);
      }
      if (resizes > maxResizes) {
        this.resizeCompleted = true;
        clearInterval(productSetResize);
      }
    }, pollInterval);
  }

  /**
   * re-assign configuration and re-render component.
   * Update Cart component if necessary.
   * Call renderProducts.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    super.updateConfig(config);
    this.cart.updateConfig(config);
    this.renderProducts();
  }

  /**
   * render product components into productSet container. Show pagination button if necessary.
   * @return {Promise} promise resolving to instance.
   */
  renderProducts() {
    if (!this.model.products.length) {
      return Promise.resolve();
    }
    const productConfig = {
      node: this.document.querySelector(`.${this.classes.productSet.products}`),
      modalNode: this.modalNode,
      cartNode: this.cartNode,
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
      this.resizeUntilFits();
      this.showPagination();
      return this;
    });
  }

}
