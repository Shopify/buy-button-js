const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'cart',
    contents: ['title', 'variantTitle', 'price', 'button'],
    templates: {
      title: '<h2>{{data.title}}</h2>',
      variantTitle: '<h3>{{data.selectedVariant.title}}</h3>',
      price: '<p><strong>{{data.selectedVariant.price}}</strong></p>',
      button: '<button class="button">Add to cart</button>',
    },
  },
};

export default defaults;
