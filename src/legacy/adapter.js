import ShopifyBuy from '../shopify-buy-ui';
import UI from '../ui';
import EmbedWrapper from './embed-wrapper';

const appId = window.SHOPIFY_BUY_UI_ADAPTER_APP_ID || 6;
const apiHost = window.SHOPIFY_BUY_UI_API_HOST || 'https://widgets.shopifyapps.com';
const apiPath = window.SHOPIFY_BUY_UI_API_PATH || '/v4/api_key';

export class Adapter {
  constructor() {
    this.uis = {};
    this.promises = {};
    this.cart = null;
  }

  init() {
    this.elements = [...document.querySelectorAll('[data-embed_type]')].reduce((elements, element) => {
      if (element.getAttribute('data-embed_type') === 'cart') {
        this.cart = element;
      } else {
        elements.push(element);
      }
      return elements;
    }, []).map((element) => {
      const wrapper = new EmbedWrapper(element, this.cart);
      return this.getShopUI(wrapper.shop)
        .then(wrapper.render.bind(wrapper))
        .catch(wrapper.handleError.bind(wrapper));
    });
  }

  getShopUI(domain) {
    if (this.uis[domain]) {
      return Promise.resolve(this.uis[domain]);
    }
    this.promises[domain] = this.promises[domain] || fetch(`${apiHost}${apiPath}?domain=${domain}`)
      .then((resp) => resp.json())
      .then((data) => {
        this.uis[domain] = new UI(ShopifyBuy.buildClient({apiKey: data.api_key, appId, domain}));
        this.promises[domain] = null;
        return this.uis[domain];
      });
    return this.promises[domain];
  }
}

const adapter = new Adapter();

document.addEventListener('DOMContentLoaded', adapter.init.bind(adapter));

window.BuyButtonUIAdapter = adapter;
export default adapter;
