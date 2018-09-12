const lineItemTemplates = {
  image: '<div class="{{data.classes.lineItem.image}}" style="background-image: url({{data.lineItemImage}})" data-element="lineItem.image"></div>',
  variantTitle: '<div class="{{data.classes.lineItem.variantTitle}}" data-element="lineItem.variantTitle">{{data.variantTitle}}</div>',

  title: '<span class="{{data.classes.lineItem.itemTitle}}" data-element="lineItem.itemTitle">{{data.title}}</span>',
  price: '<span class="{{data.classes.lineItem.price}}" data-element="lineItem.price">{{data.formattedPrice}}</span>',
  quantity: `<div class="{{data.classes.lineItem.quantity}}" data-element="lineItem.quantity">
              <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityDecrement}}" type="button" data-line-item-id="{{data.id}}" data-element="lineItem.quantityDecrement">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 7h8v2H4z"/></svg><span class="visuallyhidden">Decrement</span>
              </button>
              <input class="{{data.classes.lineItem.quantityInput}}" type="number" min="0" aria-label="Quantity" data-line-item-id="{{data.id}}" value="{{data.quantity}}" data-element="lineItem.quantityInput">
              <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityIncrement}}" type="button" data-line-item-id="{{data.id}}" data-element="lineItem.quantityIncrement">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12 7H9V4H7v3H4v2h3v3h2V9h3z"/></svg><span class="visuallyhidden">Increment</span>
              </button>
            </div>`,
};

export default lineItemTemplates;
