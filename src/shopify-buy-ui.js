import ShopifyBuy from 'shopify-buy';
import UI from './ui';

ShopifyBuy.UI = {
  ui: null,

  init(client) {
    if (!this.ui) {
      this.ui = new UI(client);
    }
    return this.ui;
  },
};

window.ShopifyBuy = ShopifyBuy;
export default ShopifyBuy;
