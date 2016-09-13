var Pretender = require('fetch-pretender');
var productListings = require('./fixtures/product');

var server = new Pretender();

server.get('https://embeds.myshopify.com/api/apps/6/product_listings/:id', function(request) {
  return [200, {"Content-Type": "application/json"}, JSON.stringify(productListings[request.params.id])]
});
