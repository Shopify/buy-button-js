import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

const apiKey = window.SHOPIFY_BUY_UI_ADAPTER_API_KEY || '395ba487a5981e6e573b5ab104645271';
const appId = window.SHOPIFY_BUY_UI_ADAPTER_APP_ID || 6;

class Adapter {
  constructor() {
    this.clients = {};
    this.uis = {};
  }
  init() {
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element) => {
      const elem = new EmbedWrapper(element);
      elem.render(this.getShopUI(elem.shop));
      return elem;
    });
  }
  getShopUI(shop) {
    if (!this.uis[shop]) {
      this.clients[shop] = ShopifyBuy.buildClient({apiKey, appId, domain: shop});
      this.uis[shop] = ShopifyBuy.UI.init(this.clients[shop]);
    }
    return this.uis[shop];
  }
}

const adapter = new Adapter();

(() => { setTimeout(adapter.init.bind(adapter)); })();

export default adapter;
