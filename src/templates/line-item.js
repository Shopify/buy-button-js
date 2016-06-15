const lineItemTemplate = {
  title: '<h3 class="product-title">{{data.title}}</h3><h4>{{data.variant_title}}</h4>',
  price: '<h5 class="variant-price">{{data.price}}</h5>',
  updateQuantity: '<button data-event="click.decQuantity" class="btn--seamless quantity-decrement" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>' +
                  '<input class="cart-item__quantity" type="number" min="0" aria-label="Quantity">' +
                  '<button data-event="click.incQuantity" class="btn--seamless quantity-increment" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>',
  quantity: '<p>{{data.quantity}} = {{data.line_price}}</p>',
  img: '<img width="100" height="100" src="{{data.image.src}}" />'

}

export default lineItemTemplate;
