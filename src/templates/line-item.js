const lineItemTemplates = {
  image: '<img class="{{data.classes.image}}" src="{{data.image.src}}" />',
  variantTitle: '<div class="{{data.classes.variantTitle}}">{{data.variant_title}}</div>',
  title: '<span class="{{data.classes.title}}">{{data.title}}</span>',
  price: '<span class="{{data.classes.price}}">{{data.price}}</span>',
  quantity: '<span class="{{data.classes.quantity}}">{{data.quantity}}</span>',
}

export default lineItemTemplates;
