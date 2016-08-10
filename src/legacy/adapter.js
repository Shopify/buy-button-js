import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

class Adapter {
  constructor() {
    this.clients = {};
    this.uis = {};
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element) => {
      const elem = new EmbedWrapper(element);
      elem.render(this.getUI(elem));
      return elem;
    });
  }
  getUI(elem) {
    this.clients[elem.shop] = this.clients[elem.shop] || ShopifyBuy.buildClient({
      apiKey: '395ba487a5981e6e573b5ab104645271',
      appId: 6,
      domain: elem.shop,
    });
    this.uis[elem.shop] = this.uis[elem.shop] || ShopifyBuy.UI.init(this.client);
    return this.uis[elem.shop];
  }
}

export default new Adapter();
