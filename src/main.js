import ShopifyBuy from 'shopify-buy';
import Product from './components/product';
import Collection from './components/collection';

window.ShopifyBuy = ShopifyBuy;

ShopifyBuy.UI = ShopifyBuy.UI || {};

var c = new Collection({});
c.getData().then(() => c.render());
