import ShopifyBuy from 'shopify-buy';
import UI from './ui';

ShopifyBuy.UI = {
  buildClient(config = {}) {
    const client = ShopifyBuy.buildClient(config);
    return new UI(client);
  },
};

export default ShopifyBuy;
