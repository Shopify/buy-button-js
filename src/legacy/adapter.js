import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

class Adapter {
  constructor() {
    this.clients = {};
    this.uis = {};
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element) => {
      const elem = new EmbedWrapper(element);
      elem.render(this.getUI(elem.shop));
      return elem;
    });
  }
  getUI(shop) {
    if (!this.uis[shop]) {
      this.clients[shop] = this.clients[shop] || ShopifyBuy.buildClient({
        apiKey: '395ba487a5981e6e573b5ab104645271',
        appId: 6,
        domain: shop,
      });
      this.uis[shop] = this.uis[shop] || ShopifyBuy.UI.init(this.clients[shop]);
    }
    return this.uis[shop];
  }
}

export default new Adapter();
