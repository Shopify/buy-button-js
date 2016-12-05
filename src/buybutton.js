import ShopifyBuy from 'shopify-buy/polyfilled';
import UI from './ui';
import productTemplates from './templates/product';

window.ShopifyBuy = window.ShopifyBuy || ShopifyBuy;

ShopifyBuy.UI = window.ShopifyBuy.UI || {
  domains: {},

  init(client, integrations = {}, styleOverrides) {
    const domain = client.config.domain;
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
