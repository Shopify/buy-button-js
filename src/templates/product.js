const productTemplate = {
  title: '<h1 class="product-title">{{title}}</h1>',
  variantTitle: '<h2 class="variant-title">{{selectedVariant.title}}</h2>',
  price: '<h2 class="variant-price">{{selectedVariant.price}}</h2>',
  variantSelection: '<div data-include></div>',
  button: '<button data-event="click.buyButton" class="buy-button js-prevent-cart-listener">Add To Cart</button>'
}

export default productTemplate;
