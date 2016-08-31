import ShopifyBuy from 'shopify-buy';
import UI from './ui';
import productTemplates from './templates/product';

ShopifyBuy.UI = {
  ui: null,

  init(client) {
    if (!this.ui) {
      this.ui = new UI(client);
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
