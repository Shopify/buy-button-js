import ShopifyBuy from 'shopify-buy';
import UI from './ui';
import productTemplates from './templates/product';

ShopifyBuy.UI = {
  ui: null,

  init(client, integrations = {}) {
    if (!this.ui) {
      this.ui = new UI(client, integrations);
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

window.ShopifyBuy = ShopifyBuy;
export default ShopifyBuy;
