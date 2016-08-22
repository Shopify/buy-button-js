const productTemplate = {
  img: '<div class="{{data.classes.product.imgWrapper}}" style="{{data.imgStyle}}"><img class="{{data.classes.product.img}}" data-src="{{data.currentImage.src}}" /></div>',
  title: '<h1 class="{{data.classes.product.title}}">{{data.title}}</h1>',
  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.product.variantTitle}}">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
  options: '{{#data.hasVariants}}<div class="{{data.classes.product.options}}">{{{data.optionsHtml}}}</div>{{/data.hasVariants}}',
  price: `<div class="{{data.classes.product.prices}}">
            {{#data.selectedVariant}}
            {{#data.selectedVariant.compareAtPrice}}<span class="{{data.classes.product.compareAt}}">\${{data.selectedVariant.compareAtPrice}}</span>{{/data.selectedVariant.compareAtPrice}}
            <span class="{{data.classes.product.price}} {{data.priceClass}}">\${{data.selectedVariant.price}}</span>
            {{/data.selectedVariant}}
          </div>`,
  description: '<div class="{{data.classes.product.description}}">{{{data.description}}}</div>',
  button: '<button {{#data.buttonDisabled}}disabled{{/data.buttonDisabled}} class="{{data.classes.product.button}} {{data.buttonClass}}">{{data.buttonText}}</button>',
  quantityDecrement: '<button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityDecrement}}" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>',
  quantityIncrement: '<button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityIncrement}}" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>',
  quantityInput: '<input class="{{data.classes.product.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}">',
};

export default productTemplate;
