const productTemplate = {
  title: '<h1 class="product-title">{{title}}</h1>',
  variantTitle: '<h2 class="variant-title">{{selectedVariant.title}}</h2>',
  price: '<h2 class="variant-price">{{selectedVariant.price}}</h2>',
  button: '<button class="buy-button js-prevent-cart-listener">Add To Cart</button>'
}

export default productTemplate;
