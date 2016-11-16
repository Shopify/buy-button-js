import ShopifyBuy from 'shopify-buy/lib/shopify-polyfilled';
import UI from './ui';
import productTemplates from './templates/product';

window.ShopifyBuy = window.ShopifyBuy || ShopifyBuy;

ShopifyBuy.UI = window.ShopifyBuy.UI || {
  uis: {},

  init(client, integrations = {}, styleOverrides) {
    const domain = client.config.domain;
    if (!this.uis[domain]) {
      this.uis[domain] = new UI(client, integrations, styleOverrides);
    }
    return this.uis[domain];
  },

  adapterHelpers: {
    templates: {
      product: productTemplates,
    },
  },
};

export default ShopifyBuy;
