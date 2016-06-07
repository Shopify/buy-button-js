const lineItemTemplate = {
  title: '<h4 class="product-title">{{data.title}}</h4>',
  price: '<h5 class="variant-price">{{data.price}}</h5>',
  updateQuantity: '<button data-event="click.decQuantity" class="btn--seamless quantity-decrement" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>' +
                  '<input class="cart-item__quantity" type="number" min="0" aria-label="Quantity">' +
                  '<button data-event="click.incQuantity" class="btn--seamless quantity-increment" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>',
  quantity: '<p>{{data.quantity}} = {{data.line_price}}</p>'

}

export default lineItemTemplate;
