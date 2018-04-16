import ShopifyBuy from 'shopify-buy';
import UI from './ui';
import productTemplates from './templates/product';
import 'whatwg-fetch';
import 'core-js/modules/es6.promise';
import 'core-js/modules/es6.string.ends-with';
import 'core-js/modules/es6.array.iterator';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.object.assign';
import 'core-js/modules/es7.object.values';

window.ShopifyBuy = window.ShopifyBuy || ShopifyBuy;

ShopifyBuy.UI = window.ShopifyBuy.UI || {
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

export default ShopifyBuy;
