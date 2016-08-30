import Pretender from 'fetch-pretender';
import ShopifyBuy from '../../../src/shopify-buy-ui';
import UI from '../../../src/ui';
import adapter, {Adapter} from '../../../src/legacy/adapter';
import EmbedWrapper from '../../../src/legacy/embed-wrapper';
import productJSON from '../../fixtures/pretender/product';
import {product, cart} from '../../fixtures/legacy/elements';

let server;

describe('legacy/adapter', () => {
  let subject;
  let productNode;
  let cartNode;

  before(() => {
    server = new Pretender();
    server.get('https://widgets.shopifyapps.com/v4/api_key', (request) => {
      return [200, {"Content-Type": "application/json"}, JSON.stringify({api_key: 'xxx'})];
    });
    server.get('https://can-i-buy-a-feeling.myshopify.com/api/apps/6/product_listings', (request) => {
      return [200, {"Content-Type": "application/json"}, JSON.stringify(productJSON)];
    });
    server.unhandledRequest = function(verb, path, request) {
      console.warn(`unhandled path: ${path}`);
    }
  });

  beforeEach(() => {
    subject = new Adapter();
    productNode = product();
    cartNode = cart();
    document.body.appendChild(productNode);
    document.body.appendChild(cartNode);
  });

  afterEach(() => {
    document.body.removeChild(productNode);
    document.body.removeChild(cartNode);
  });

  after(() => {
    server.shutdown();
  });

  it('should export a new adapter', () => {
    assert.isOk(adapter instanceof Adapter);
  });

  it('should create embed wrappers for each data-embed_type element that is not a cart', () => {
    subject.init();
    assert.equal(subject.elements.length, 1);
    assert.isOk(subject.elements[0] instanceof EmbedWrapper);
  });

  it('should save a reference to any cart embeds', () => {
    subject.init();
    assert.isOk(subject.cart);
  });

  it('should pass a reference to cart to other embeds', () => {
    subject.init();
    assert.isOk(subject.elements[0].cart);
  });

  it('should create a client and ui for each shop', () => {
    subject.init();
  });
});
