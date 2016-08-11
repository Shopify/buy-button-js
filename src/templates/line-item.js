const lineItemTemplates = {
  image: '<img class="{{data.classes.lineItem.image}}" src="{{data.image.src}}" />',
  variantTitle: '<div class="{{data.classes.lineItem.variantTitle}}">{{data.variant_title}}</div>',

  title: '<span class="{{data.classes.lineItem.itemTitle}}">{{data.title}}</span>',
  price: '<span class="{{data.classes.lineItem.price}}">${{data.line_price}}</span>',
  quantity: `<div class="{{data.classes.lineItem.quantity}}">
              <button class="{{data.classes.lineItem.quantityButton}} quantity-decrement" type="button" data-line-item-id="{{data.id}}"><span>-</span><span class="visuallyhidden">Decrement</span></button>
              <input class="{{data.classes.lineItem.quantityInput}}" type="number" min="0" aria-label="Quantity" data-line-item-id="{{data.id}}" value="{{data.quantity}}">
              <button class="{{data.classes.lineItem.quantityButton}} quantity-increment" type="button" data-line-item-id="{{data.id}}"><span>+</span><span class="visuallyhidden">Increment</span></button>
            </div>`,
};

export default lineItemTemplates;
