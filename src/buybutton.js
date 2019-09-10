import ShopifyBuy from 'shopify-buy';
import UI from './ui';
import productTemplates from './templates/product';
import 'whatwg-fetch';
import 'core-js/features/promise';
import 'core-js/features/string/ends-with';
import 'core-js/features/array/iterator';
import 'core-js/features/array/find';
import 'core-js/features/object/assign';
import 'core-js/features/object/values';

class UpdatedShopifyBuy extends ShopifyBuy {
  static buildClient(config) {
    const newConfig = Object.assign({}, config, {source: 'buy-button-js'});
    return super.buildClient(newConfig);
  }
}

window.ShopifyBuy = window.ShopifyBuy || UpdatedShopifyBuy;

UpdatedShopifyBuy.UI = window.ShopifyBuy.UI || {
  domains: {},

  init(client, integrations = {}, styleOverrides) {
    const uniqueClientKey = `${client.config.domain}.${client.config.storefrontAccessToken}`;

    if (!this.domains[uniqueClientKey]) {
      this.domains[uniqueClientKey] = new UI(client, integrations, styleOverrides);
    }

    return this.domains[uniqueClientKey];
  },

  adapterHelpers: {
    templates: {
      product: productTemplates,
    },
  },
};

export default UpdatedShopifyBuy;
