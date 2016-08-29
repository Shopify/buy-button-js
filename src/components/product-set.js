import merge from '../utils/merge';
import Component from '../component';
import Product from './product';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

export default class ProductSet extends Component {
  constructor(config, props) {
    super(config, props);
    this.products = [];
    this.cart = null;
    this.page = 1;
    this.nextModel = null;
  }

  get typeKey() {
    return 'productSet';
  }

  get nextButtonClass() {
    return this.nextModel ? 'is-active' : '';
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

  sdkFetch(page = 1, limit = 30) {
    /* eslint-disable camelcase */
    let method;
    if (this.id) {
      const queryKey = isArray(this.id) ? 'product_ids' : 'collection_id';
      method = this.props.client.fetchQueryProducts({[queryKey]: this.id, page, limit});
    } else if (this.handle) {
      method = this.props.client.fetchQueryCollections({handle: this.handle, page, limit}).then((collections) => {
        const collection = collections[0];
        return this.props.client.fetchQueryProducts({collection_id: collection.attrs.collection_id, page, limit});
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
    const page = this.page + 1;
    this.sdkFetch(page).then((data) => {
      this.nextModel = data.length ? { products: data } : null;
      this.updateNode(this.classes.productSet.paginationButton, this.templates.pagination);
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
      this.cart = this.cart || this.products[0].cart;
      return this.loadImgs().then(() => this.showPagination());
    });
  }

  render() {
    super.render()
    return this.renderProducts(this.model.products);
  }
}
