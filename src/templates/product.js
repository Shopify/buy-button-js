const productTemplate = {
  title: '<h1 class="{{classes.title}}">{{data.title}}</h1>',
  variantTitle: '<h2 class="{{classes.variantTitle}}">{{data.selectedVariant.title}}</h2>',
  price: '<h2 class="{{classes.price}}">{{data.selectedVariant.price}}</h2>',
  variantSelection: '<div data-include></div>',
  button: '<button data-event="click.addVariantToCart" class="{{classes.button}}">Add To Cart</button>'
}

export default productTemplate;
