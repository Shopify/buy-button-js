import ShopifyBuy from 'shopify-buy';
import UI from './ui';
import Pretender from 'fetch-pretender';

ShopifyBuy.UI = {
  buildClient(config = {}) {
    const client = ShopifyBuy.buildClient(config);
    return new UI(client);
  },
};

window.ShopifyBuy = ShopifyBuy;
export default ShopifyBuy;
