const shopifyUI = new ShopifyBuy.UI({
  subdomain,
  appId,
  key
});

shopifyUI.create('product', {
  id: 12345,
  styles: {
    button: {
      'padding': '20px',
      'font-size': '24px'
    }
  },
  contents: ['button'],
  text: {
    button: 'Buy Now!'
  },
  buttonLinkType: 'checkout'
});

// simple collection example
shopifyUI.create('collection', {
  id: 12345,
  columns: 4,
  modal: false,
  productConfig: {
    styles: {
      button: {
        'border-radius': '20px'
      }
    }
  },
  cartConfig: {
    styles: {
      container: {
        'background-color': '#000000'
      }
    }
  }
})

// Advanced product example
shopifyUI.create('product', {
  id: 12345,
  styles: {
    button: {
      'background-color': '#FFE000',
      'padding': '20px',
      'box-shadow': '3px 3px 0 #ccb300'
    },
    container: {
      'text-align': 'center'
    }
  },
  templates: {
    button: function (data, classes, events) {
      return '<button onclick="{{events.addVariant}}" classes="{{classes.button}}">Buy Now | <strike>{{data.compareAt}}</strike> {{data.price}}</button>'
    }
  },
  afterRender: function (productComponent) {
    externalService.fetchSoldCount().then(function (count) {
      var p = productComponent.document.createElement('p');
      p.text = count + ' units sold';
      productComponent.nodes.productContainer.appendChild(p);
    });
  }
});

// advanced custom product collection
var wrapper = document.getElementById('shopify-products');
[12234, 23444, 56568].forEach(function (productId) {
  shopifyUI.create('product', {
    id: productId,
    node: wrapper,
    afterAddVariantToCart: function (variant) {
      analyticsService.push('variant added to cart', variant.id);
    },
    styles: {
      button: {
        'opacity': '0',
        'transition': 'all .2s'
      }
    },
    afterRender: function (component) {
      component.nodes.container.on('hover', function () {
        component.nodes.button.css('opacity', 1);
      }, function () {
        component.nodes.button.css('opacity', 0);
      });
    }
  });
});
