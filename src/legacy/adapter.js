import ShopifyBuy from '../shopify-buy-ui';
import UI from '../ui';
import EmbedWrapper from './embed-wrapper';

// Use the Buy Button Channel API key
const apiKey = window.SHOPIFY_BUY_UI_ADAPTER_API_KEY || '395ba487a5981e6e573b5ab104645271';
const appId = window.SHOPIFY_BUY_UI_ADAPTER_APP_ID || 6;

class Adapter {
  constructor() {
    this.uis = {};
  }
  init() {
    this.elements = [...document.querySelectorAll('[data-embed_type]')].map((element, index) => {
      const elem = new EmbedWrapper(element);
      elem.render(this.getShopUI(elem.shop)).catch((error) => {
        element.innerHTML = `Buy Button ${error}`;
      });
      return elem;
    });
  }
  getShopUI(domain) {
    if (!this.uis[domain]) {
      this.uis[domain] = new UI(ShopifyBuy.buildClient({apiKey, appId, domain}));
    }
    return this.uis[domain];
  }
}

const adapter = new Adapter();

document.addEventListener('DOMContentLoaded', adapter.init.bind(adapter));

export default adapter;
