import ShopifyBuy from 'shopify-buy/dist/shopify-buy.umd.polyfilled';
import UI from './ui';
import productTemplates from './templates/product';

ShopifyBuy.UI = {
  ui: null,

  init(client, trackingLib = null) {
    if (!this.ui) {
      this.ui = new UI(client, trackingLib);
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
