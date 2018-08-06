import Component from '../component';
import normalizeConfig from '../utils/normalize-config';
import View from '../view';

export default class DynamicCheckout extends Component {
  constructor(config, props) {
    super(
      normalizeConfig(config),
      props
    );

    this.typeKey = 'dynamicCheckout';
    this.view = new View(this);
    this.dynamicButton = null;
    this.defaultStorefrontVariantId = this.config.storefrontVariantId;
  }


  init(data) {
    return super.init.call(this, data).then((model) => {
      if (model) {
        this.view.render();
        this.dynamicButton = window.Shopify.DynamicBuyButton;
        const node = this.view.document.querySelectorAll('[data-shopify=payment-button]');
        if (node) {
          this.dynamicButton.mount(node[0]);
        }
      }
      return model;
    });
  }

  get scripts() {
    return [
      'https://payment-sheet.myshopify.io/v0.1.0/dbb.js',
    ];
  }

  sdkFetch() {
    if (this.storefrontId && Array.isArray(this.storefrontId)) {
      return this.props.client.product.fetch(this.storefrontId[0]);
    } else if (this.storefrontId) {
      return this.props.client.product.fetch(this.storefrontId);
    } else if (this.handle) {
      return this.props.client.product.fetchByHandle(this.handle).then((product) => product);
    }
    return Promise.reject(new Error('SDK Fetch Failed'));
  }

  fetchData() {
    return this.sdkFetch().then((model) => {
      if (model) {
        this.storefrontId = model.id;
        this.handle = model.handle;
        return model;
      }
      throw new Error('Not found');
    });
  }
}
