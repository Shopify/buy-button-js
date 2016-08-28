var Pretender = require('fetch-pretender');

describe('it loads', function () {
  beforeEach(function() {
    server = new Pretender();
    server.get('https://embeds.myshopify.com/api/apps/6/product_listings/6640244678', (request) => {
      return [200, {"Content-Type": "application/json"}, JSON.stringify(productJSON)];
    });
    server.unhandledRequest = function(verb, path, request) {
      console.warn(`unhandled path: ${path}`);
    }
    browser.url('http://localhost:8080/test/browser/product.html');
  });
});
