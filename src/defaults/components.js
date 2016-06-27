const defaults = {
  product: {
    iframe: true,
    buttonTarget: 'cart',
    contents: ['title', 'variantTitle', 'price', 'button'],
    templates: {
      title: '<h2>{{data.title}}</h2>',
      variantTitle: '<h3>{{data.selectedVariant.title}}</h3>',
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
      option: '<select data-event="change.selectVariant" name={{data.name}}>' +
                  '{{#each data.values}}' +
                      '<option {{conditionalString ../data.selected this "selected"}}  value={{this}}>{{this}}</option>' +
                    '{{/each}}' +
                '</select>'
    },
    contents: ['option']
  },
  cart: {
    iframe: true,
    contents: ['title', 'lineItems', 'total', 'checkout'],
    templates: {
      title: '<h2>{{data.title}}</h2>',
      lineItems: '<div class="line-items">{{data.childrenHtml}}</div>',
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
  }
};

export default defaults;
