const lineItemTemplates = {
  image: '<img class="{{data.classes.image}}" src="{{data.image.src}}" />',
  variantTitle: '<div class="{{data.classes.variantTitle}}">{{data.variant_title}}</div>',

  title: '<span class="{{data.classes.itemTitle}}">{{data.title}}</span>',
  price: '<span class="{{data.classes.price}}">${{data.line_price}}</span>',
  quantity: `<div class="cart-item__quantity-container">
              <button class="{{data.classes.quantityButton}} quantity-decrement" type="button" data-line-item-id="{{data.id}}"><span>-</span><span class="visuallyhidden">Decrement</span></button>
              <input class="{{data.classes.quantityInput}}" type="number" min="0" aria-label="Quantity" data-line-item-id="{{data.id}}" value="{{data.quantity}}">
              <button class="{{data.classes.quantityButton}} quantity-increment" type="button" data-line-item-id="{{data.id}}"><span>+</span><span class="visuallyhidden">Increment</span></button>
            </div>`,
};

export default lineItemTemplates;
