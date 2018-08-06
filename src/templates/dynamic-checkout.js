const quantityTemplate = `<div class="{{data.classes.dynamicCheckout.quantity}} {{data.quantityClass}}" data-element="dynamicCheckout.quantity">
            {{#data.contents.quantityDecrement}}
              <button class="{{data.classes.dynamicCheckout.quantityButton}} {{data.classes.dynamicCheckout.quantityDecrement}}" type="button" data-element="dynamicCheckout.quantityDecrement"><span>-</span><span class="visuallyhidden">Decrement</span></button>
            {{/data.contents.quantityDecrement}}
            {{#data.contents.quantityInput}}
              <input class="{{data.classes.dynamicCheckout.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}" data-element="dynamicCheckout.quantityInput">
            {{/data.contents.quantityInput}}
            {{#data.contents.quantityIncrement}}
              <button class="{{data.classes.dynamicCheckout.quantityButton}} {{data.classes.dynamicCheckout.quantityIncrement}}" type="button" data-element="dynamicCheckout.quantityIncrement"><span>+</span><span class="visuallyhidden">Increment</span></button>
            {{/data.contents.quantityIncrement}}
           </div>`;

const buttonTemplate = '<div data-shopify="payment-button"></div>';

const dynamicCheckoutTemplate = {
  img: '{{#data.currentImage.srcLarge}}<div class="{{data.classes.dynamicCheckout.imgWrapper}}" data-element="dynamicCheckout.imgWrapper"><img data-element="dynamicCheckout.img" class="{{data.classes.dynamicCheckout.img}}" src="{{data.currentImage.srcLarge}}" /></div>{{/data.currentImage.srcLarge}}',
  imgWithCarousel: `<div class="{{data.classes.dynamicCheckout.imgWrapper}}" data-element="dynamicCheckout.imageWrapper">
                      <div class="main-image-wrapper">
                        <button type="button" class="carousel-button carousel-button--previous">
                          Left
                          <img class="carousel-button-arrow" src="//sdks.shopifycdn.com/buy-button/latest/arrow.svg" alt="Carousel Arrow"/>
                        </button>
                        <img class="{{data.classes.dynamicCheckout.img}}" src="{{data.currentImage.src}}" data-element="dynamicCheckout.img" />
                        <button type="button" class="carousel-button carousel-button--next">
                          Right
                          <img class="carousel-button-arrow" src="//sdks.shopifycdn.com/buy-button/latest/arrow.svg" alt="Carousel Arrow"/>
                        </button>
                      </div>
                      <div class="{{data.classes.dynamicCheckout.carousel}}">
                        {{#data.carouselImages}}
                        <a data-element="dynamicCheckout.carouselitem" href="{{src}}" class="{{data.classes.dynamicCheckout.carouselItem}} {{#isSelected}} {{data.classes.dynamicCheckout.carouselItemSelected}} {{/isSelected}}" data-image-id="{{id}}" style="background-image: url({{carouselSrc}})"></a>
                        {{/data.carouselImages}}
                      </div>
                    </div>`,
  title: '<h1 class="{{data.classes.dynamicCheckout.title}}" data-element="dynamicCheckout.title">{{data.title}}</h1>',
  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.dynamicCheckout.variantTitle}}" data-element="dynamicCheckout.variantTitle">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
  options: '{{#data.hasVariants}}<div class="{{data.classes.dynamicCheckout.options}}" data-element="dynamicCheckout.options">{{{data.optionsHtml}}}</div>{{/data.hasVariants}}',
  price: `<div class="{{data.classes.dynamicCheckout.prices}}" data-element="dynamicCheckout.prices">
            {{#data.selectedVariant}}
            <span class="{{data.classes.dynamicCheckout.price}} {{data.priceClass}}" data-element="dynamicCheckout.price">{{data.formattedPrice}}</span>
            {{#data.selectedVariant.compareAtPrice}}<span class="{{data.classes.dynamicCheckout.compareAt}}" data-element="dynamicCheckout.compareAt">{{data.formattedCompareAtPrice}}</span>{{/data.selectedVariant.compareAtPrice}}
            {{/data.selectedVariant}}
          </div>`,
  description: '<div class="{{data.classes.dynamicCheckout.description}}" data-element="dynamicCheckout.description">{{{data.descriptionHtml}}}</div>',
  button: buttonTemplate,
  quantity: quantityTemplate,
  buttonWithQuantity: `<div class="{{data.classes.dynamicCheckout.buttonWithQuantity}}" data-element="dynamicCheckout.buttonWithQuantity">${quantityTemplate}${buttonTemplate}</div>`,
};

export default dynamicCheckoutTemplate;
