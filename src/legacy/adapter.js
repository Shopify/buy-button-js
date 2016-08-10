import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

class Adapter {
  constructor() {
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element) => {
      return new EmbedWrapper(element);
    });
    if (this.elements.length === 0) {
      return;
    }
    this.generateClient();
    this.elements.forEach((elem) => elem.render(this.ui));
  }
  generateClient() {
    this.client = ShopifyBuy.buildClient(this.generateConfig());
    this.ui = ShopifyBuy.UI.init(this.client);
  }
  generateConfig() {
    return {
      apiKey: '395ba487a5981e6e573b5ab104645271',
      appId: 6,
      domain: this.elements[0].options.shop,
    };
  }
}

export default new Adapter();
