import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

class Adapter {
  constructor() {
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element) => {
      return new EmbedWrapper(element);
    });
    this.client = ShopifyBuy.buildClient(this.clientConfig);
    this.ui = ShopifyBuy.UI.init(this.client);
    this.elements.forEach((elem) => elem.render(this.ui));
  }
  get clientConfig() {
    const config = {
      apiKey: '395ba487a5981e6e573b5ab104645271',
      appId: 6,
    };

    if (this.elements.length > 0) {
      config.domain = this.elements[0].options.shop;
    }

    return config;
  }
}

export default new Adapter();
