const productTemplate = {
  img: '<img width="300" class="{{data.classes.product.productImg}}" src="{{data.currentImage.src}}" />',
  title: '<h1 class="{{data.classes.product.title}}">{{data.title}}</h1>',
  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.product.variantTitle}}">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
  options: '{{#data.hasVariants}}<div class="{{data.classes.product.options}}">{{{data.childrenHtml}}}</div>{{/data.hasVariants}}',
  price: `<div class="{{data.classes.product.prices}}">
            {{#data.selectedVariant.compareAtPrice}}<span class="{{data.classes.product.compareAt}}">\${{data.selectedVariant.compareAtPrice}}</span>{{/data.selectedVariant.compareAtPrice}}
            <span class="{{data.classes.product.price}} {{data.priceClass}}">\${{data.selectedVariant.price}}</span>
          </div>`,
  description: '<div class="{{data.classes.product.description}}">{{{data.description}}}</div>',
  button: '<button {{#data.buttonDisabled}}disabled{{/data.buttonDisabled}} class="{{data.classes.product.button}} {{data.buttonClass}}">{{data.buttonText}}</button>',
  quantity: `<div class="cart-item__quantity-container">
              <button class="{{data.classes.product.quantityButton}} quantity-decrement" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>
              <input class="{{data.classes.product.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}">
              <button class="{{data.classes.product.quantityButton}} quantity-increment" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>
            </div>`,
};

export default productTemplate;
