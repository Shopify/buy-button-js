import ShopifyBuy from '../shopify-buy-ui';
import EmbedWrapper from './embed-wrapper';

// Use the Buy Button Channel API key
const apiKey = window.SHOPIFY_BUY_UI_ADAPTER_API_KEY || '395ba487a5981e6e573b5ab104645271';
const appId = window.SHOPIFY_BUY_UI_ADAPTER_APP_ID || 6;

export class Adapter {
  constructor() {
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
      this.uis[shop] = ShopifyBuy.UI.init(ShopifyBuy.buildClient({apiKey, appId, domain: shop}));
    }
    return this.uis[shop];
  }
}

const adapter = new Adapter();

document.addEventListener('DOMContentLoaded', adapter.init.bind(adapter));

export default adapter;
