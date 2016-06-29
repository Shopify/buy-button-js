const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'checkout',
    contents: ['img', 'title', 'variantTitle', 'options', 'price', 'button'],
    templates: {
      img: '<img width="300" class="{{data.classes.img}}" src="{{data.currentImage.src}}" />',
      title: '<h1 class="{{data.classes.title}}">{{data.title}}</h1>',
      variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.variantTitle}}">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
      options: '{{#data.hasVariants}}<div class="{{data.classes.options}}">{{{data.childrenHtml}}}</div>{{/data.hasVariants}}',
      price: '<h2 class="{{data.classes.price}}">{{data.selectedVariant.price}}</h2>',
      button: '<button class="{{data.classes.button}} {{data.buttonClass}}">{{data.buttonText}}</button>',
    },
    styles: {
      button: {
        'background-color': 'red'
      }
    },
    classes: {
      button: 'btn',
      title: 'product-title',
      variantTitle: 'variant-title',
      price: 'variant-price',
      options: 'variant-selectors',
      disabled: 'btn-disabled'
    },
    text: {
      button: 'Add to cart'
    }
  },
  option: {
    templates: {
      option: '<select class={{data.classes.select}} name={{data.name}}>' +
                '{{#data.decoratedValues}}' +
                  '<option {{#selected}}selected{{/selected}} value={{name}}>{{name}}</option>' +
                '{{/data.decoratedValues}}' +
              '</select>'
    },
    contents: ['option'],
    classes: {
      select: 'select'
    }
  },
  cart: {
    iframe: true,
    contents: ['title', 'lineItems', 'total', 'checkout'],
    templates: {
      title: '<h2>{{data.title}}</h2>',
      lineItems: '<div class="line-items">{{{data.childrenHtml}}}</div>',
      total: '<p><strong>{{data.total}}</strong></p>',
      checkout: '<button>Checkout</button>'
    },
    styles: {
      button: {
        'background-color': 'red'
      }
    },
    classes: {
      button: 'button'
    }
  },
  lineItem: {
    contents: ['title', 'price'],
    templates: {
      title: '<h3>{{data.title}}</h3>',
      price: '<strong>{{data.price}}</strong>'
    }
  },
  window: {
    height: 600,
    width: 600,
    toolbar: 0,
    scrollbars: 0,
    status: 0,
    resizable: 1,
    left: 0,
    top: 0,
    center: 0,
    createnew: 1,
    location: 0,
    menubar: 0,
    onUnload: null
  }
};

export default defaults;
