const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'checkout',
    contents: ['title', 'variantTitle', 'options', 'price', 'button'],
    templates: {
      title: '<h2>{{data.title}}</h2>',
      variantTitle: '<h3>{{data.selectedVariant.title}}</h3>',
      options: '{{{data.childrenHtml}}}',
      price: '<p><strong>{{data.selectedVariant.price}}</strong></p>',
      button: '<button class="{{data.classes.button}}" class="button">Add to cart</button>',
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
  option: {
    templates: {
      option: '<select class={{data.classes.select}} name={{data.name}}>' +
                '{{#data.values}}' +
                    '<option value={{.}}>{{.}}</option>' +
                  '{{/data.values}}' +
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
