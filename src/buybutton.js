import ShopifyBuy from 'shopify-buy/lib/shopify-polyfilled';
import UI from './ui';
import productTemplates from './templates/product';

window.ShopifyBuy = window.ShopifyBuy || ShopifyBuy;

ShopifyBuy.UI = window.ShopifyBuy.UI || {
  ui: null,

  init(client, integrations = {}, styleOverrides) {
    if (!this.ui) {
      this.ui = new UI(client, integrations, styleOverrides);
    }
    return this.ui;
  },

  adapterHelpers: {
    templates: {
      product: productTemplates,
    },
  },

  UIConstructor: UI,
};

export default ShopifyBuy;
