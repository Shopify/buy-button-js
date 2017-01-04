---
layout: default
---

# Advanced customization

For more advanced customizations, such as those found on our [Blog post](https://www.shopify.com/partners/blog/introducing-buybutton-js-shopifys-new-javascript-library), we'll go over how a component's DOM is constructed
from configuration options, which will make customization much more straightforward.

For each component, the DOM is determined by the following attributes in its configuration hash:

- templates
- contents
- order
- classes

If you want to make significant changes to the DOM structure, start with the `contents` object. Each key in `contents` with
a value of `true` must then have a matching key in the `templates` object, and must be present in the `order` array. For example,
if you were adding a `footer` to your component, you would make the following changes:

```js
var options = {
  product: {
    contents: {
      footer: true,
    },
    templates: {
      footer: '<footer>This is a footer</footer>'
    },
    order: [
      'img',
      'title',
      'price',
      'options',
      'quantity',
      'button',
      'footer',
    ],
  }
}

```

Note that the `order` array must include the key for every element you want to render, while the `contents` and `templates`
objects only need to include the values you are customizing.

## Custom styling

Styling components involves two of the configuration objects: `styles` and `classes`. In order to style an element, it must
have a class defined in the `classes` object. The key for this class is what you will use to target the class in the `styles`
object. Each component has a number of classes already defined, which you can use for styling in your templates:

Using an existing class to style the `price` element:

{% raw %}
```js

var options = {
  product: {
    templates: {
      price: '<p class="{{data.classes.product.price}}">NEW LOW PRICE: {{data.selectedVariant.price}}</p>'
    },
    styles: {
      price: {
        'color': 'red',
      }
    }
  }
}

```
{% endraw %}

If you are adding a new element or want to use a class not already defined, you will have to add it. It will be added to the
`data.classes.<component_name>` namespace.

{% raw %}
```js
var options = {
  product: {
    contents: {
      footer: true,
    },
    templates: {
      footer: '<footer class="{{data.classes.product.footer}}">This is a footer</footer>'
    },
    classes: {
      footer: 'product-footer',
    },
    styles: {
      footer: {
        'background-color': 'black'
      }
    }
  }
}
```
{% endraw %}

## Customizing the DOM

If you want to, you can completely replace parts of the DOM or the entire thing by setting the default elements to `false`
in the contents object, and adding a new component as above.

For example, if you wanted to wrap the `price` and `description` elements in a `details` container, you would add a `details`
key and set `price` and `description` to `false` in `contents`.

{% raw %}
```js
var options = {
  product: {
    contents: {
      details: true,
      price: false,
      description: false,
    },
    templates: {
      details: '<div class="{{data.classes.product.details}}">' +
        '<span class="{{data.classes.product.price}}">{{data.selectedVariant.price}}</span>' +
        '<div class="{{data.classes.product.description}}">{{data.description}}</div>' +
      '</div>'
    },
    classes: {
      details: 'product-details',
    },
    styles: {
      details: {
        'background-color': 'grey'
      }
    }
  }
}
```
{% endraw %}

## Custom events

You can bind or re-bind events to the DOM by adding key-value pairs to the `DOMEvents` object, where the key is an event name and selector,
and the value is a callback furnction. The key will be a string of the format `"eventType selector"` ex "click .btn".

```js
var options = {
  product: {
    DOMEvents: {
      'click .option-select': function (evt, target) {
        var data = target.dataset;
        var product = ui.components.product.filter(function (product) {
          return product.id === 8728441478;
        })[0];
        product.updateVariant(data.option, data.value);
      }
    }
  }
}
```

## Custom styling without iframes

If you want direct control over the css in your components you can selectively opt out of the iframe sandboxing by passing `iframe: false` through to a component's options.
The component will then be rendered directly into the host DOM and you can target the selectors with CSS.

The following code will render the product and cart components directly in the host DOM, but will still render the cart toggle in an iframe.

{% raw %}
```js
var options = {
  product: {
    iframe: false
  },
  cart: {
    iframe: false
  }
}

```
{% endraw %}

By default the components will have no styling outside the iframes, but you can include the compiled css for the components from the CDN if you wish to start from the
original design.

```html
<link href="http://sdks.shopifycdn.com/buy-button/latest/buybutton.css" rel="stylesheet" type="text/css" />
```
