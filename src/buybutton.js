// import ShopifyBuy from 'shopify-buy/polyfilled';
import ShopifyBuy, {Config} from 'shopify-buy';
import UI from './ui';
import productTemplates from './templates/product';

window.ShopifyBuy = window.ShopifyBuy || ShopifyBuy;
window.Config = window.Config || Config;

ShopifyBuy.UI = window.ShopifyBuy.UI || {
  domains: {},

  init(client, integrations = {}, styleOverrides) {
    const domain = client.fetchShopInfo().then((res) => {
      return res.attrs.primaryDomain.attrs.host.value;
    });
    if (!this.domains[domain]) {
      this.domains[domain] = new UI(client, integrations, styleOverrides);
    }
    return this.domains[domain];
  },

  adapterHelpers: {
    templates: {
      product: productTemplates,
    },
  },
};

export default ShopifyBuy;
