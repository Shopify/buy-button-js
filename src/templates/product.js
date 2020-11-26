const quantityTemplate = `<div class="{{data.classes.product.quantity}} {{data.quantityClass}}" data-element="product.quantity">
            {{#data.contents.quantityDecrement}}
              <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityDecrement}}" type="button" data-element="product.quantityDecrement"><span>-</span><span class="visuallyhidden">Decrement</span></button>
            {{/data.contents.quantityDecrement}}
            {{#data.contents.quantityInput}}
              <input class="{{data.classes.product.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}" data-element="product.quantityInput">
            {{/data.contents.quantityInput}}
            {{#data.contents.quantityIncrement}}
              <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityIncrement}}" type="button" data-element="product.quantityIncrement"><span>+</span><span class="visuallyhidden">Increment</span></button>
            {{/data.contents.quantityIncrement}}
           </div>`;
const buttonTemplate = '<div class="{{data.classes.product.buttonWrapper}}" data-element="product.buttonWrapper"><button {{#data.buttonDisabled}}disabled{{/data.buttonDisabled}} class="{{data.classes.product.button}} {{data.buttonClass}}" data-element="product.button">{{data.buttonText}}</button></div>';

const productTemplate = {
  img: '{{#data.currentImage.srcLarge}}<div class="{{data.classes.product.imgWrapper}}" data-element="product.imgWrapper"><img alt="{{data.currentImage.altText}}" data-element="product.img" class="{{data.classes.product.img}}" src="{{data.currentImage.srcLarge}}" /></div>{{/data.currentImage.srcLarge}}',
  imgWithCarousel: `<div class="{{data.classes.product.imgWrapper}}" data-element="product.imageWrapper">
                      <div class="{{data.classes.product.carouselImgWrapper}}" aria-roledescription="{{data.text.carouselAriaRoleDescription}}" aria-label="{{data.text.carouselAriaLabel}}" >
                        <div aria-live="polite" aria-atomic="true">
                          <span class="visuallyhidden">{{data.imageIndexString}}</span>
                          <img class="{{data.classes.product.img}}" alt="{{data.currentImage.altText}}" src="{{data.currentImage.src}}" data-element="product.img" />
                        </div>
                        <div class="{{data.classes.product.carouselButtons}}">
                          <button type="button" class="{{data.classes.product.carouselButton}} {{data.classes.product.carouselPrevious}}" aria-label="{{data.text.carouselPreviousImage}}">
                            <svg class="{{data.classes.product.carouselButtonIcon}}" viewBox="0 0 19 34"><path d="M15.2 4l.8.7L3.4 17.2 16 29.8l-.8.7L2 17.2 15.2 4z" /></svg>                          
                          </button>
                          <button type="button" class="{{data.classes.product.carouselButton}} {{data.classes.product.carouselNext}}" aria-label="{{data.text.carouselNextImage}}">
                            <svg class="{{data.classes.product.carouselButtonIcon}}" viewBox="0 0 19 34"><path d="M2.9 30.7l-.8-.7 12.6-12.5L2.1 4.9l.8-.7 13.2 13.3L2.9 30.7z" /></svg>                          
                          </button>
                        </div>
                      </div>
                      <ul class="{{data.classes.product.carousel}}" role="list">
                        {{#data.carouselImages}}
                        <li class="{{data.classes.product.carouselItem}} {{#isSelected}} {{data.classes.product.carouselItemSelected}} {{/isSelected}}" {{#isSelected}} aria-current="true" {{/isSelected}}>
                          <a class="{{data.classes.product.carouselItemLink}}" data-element="product.carouselitem" aria-label="{{ariaLabel}}" href="{{src}}" data-image-id="{{id}}" style="background-image: url({{carouselSrc}})"></a>
                        </li>
                        {{/data.carouselImages}}
                      </ul>
                    </div>`,
  title: '<h1 class="{{data.classes.product.title}}" data-element="product.title">{{data.title}}</h1>',
  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.product.variantTitle}}" data-element="product.variantTitle">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
  options: '{{#data.hasVariants}}<div class="{{data.classes.product.options}}" data-element="product.options">{{{data.optionsHtml}}}</div>{{/data.hasVariants}}',
  price: `<div class="{{data.classes.product.prices}}" data-element="product.prices">
            {{#data.selectedVariant}}
            <span class="visuallyhidden">{{data.priceAccessibilityLabel}}&nbsp;</span>
            <span class="{{data.classes.product.price}} {{data.priceClass}}" data-element="product.price">{{data.formattedPrice}}</span>
            {{#data.hasCompareAtPrice}}
            <span class="visuallyhidden">{{data.compareAtPriceAccessibilityLabel}}&nbsp;</span>
            <span class="{{data.classes.product.compareAt}}" data-element="product.compareAt">{{data.formattedCompareAtPrice}}</span>
            {{/data.hasCompareAtPrice}}
            {{#data.showUnitPrice}}
            <div class="{{data.classes.product.unitPrice}}" data-element="product.unitPrice">
              <span class="visuallyhidden">{{data.text.unitPriceAccessibilityLabel}}</span>
              {{data.formattedUnitPrice}}<span aria-hidden="true">/</span><span class="visuallyhidden">&nbsp;{{data.text.unitPriceAccessibilitySeparator}}&nbsp;</span>{{data.formattedUnitPriceBaseUnit}}
            </div>
            {{/data.showUnitPrice}}
            {{/data.selectedVariant}}
          </div>`,
  description: '<div class="{{data.classes.product.description}}" data-element="product.description">{{{data.descriptionHtml}}}</div>',
  button: buttonTemplate,
  quantity: quantityTemplate,
  buttonWithQuantity: `<div class="{{data.classes.product.buttonWithQuantity}}" data-element="product.buttonWithQuantity">${quantityTemplate}${buttonTemplate}</div>`,
};

export default productTemplate;
