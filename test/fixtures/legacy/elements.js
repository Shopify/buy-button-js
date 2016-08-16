

export function createDivElement(options = {}) {
  var div = document.createElement('div');
  for(let key in options) {
    div.setAttribute(`data-${key}`, options[key]);
  }
  return div;
}

export function product(options = {}) {
  return createDivElement(Object.assign({
    embed_type: 'product',
    shop: 'can-i-buy-a-feeling.myshopify.com',
    product_handle: 'anger',
  }, options));
}

export function productWithVariant(options = {}) {
  return createDivElement(Object.assign({
    embed_type: 'product',
    shop: 'can-i-buy-a-feeling.myshopify.com',
    product_handle: 'anger',
    variant_id: '20100569478',
  }, options));
}

export function collection(options = {}) {
  return createDivElement(Object.assign({
    embed_type: 'collection',
    shop: 'can-i-buy-a-feeling.myshopify.com',
    collection_handle: "premium-feelings",
  }, options));
}

export function cart(options = {}) {
  return createDivElement(Object.assign({
    embed_type: 'cart',
    shop: 'can-i-buy-a-feeling.myshopify.com',
  }, options));
}
