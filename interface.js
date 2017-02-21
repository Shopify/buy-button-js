const shopifyUI = ShopifyBuy.UI.initialize({
  subdomain,
  appId,
  key
});

// compnent-specific options nested under `options` hash
shopifyUI.create('collection', {
  id: 12345,
  options: {
    collection: {
      columns: 4
    },
    product: {
      events: {
        afterAddVariantToCart: function (variant) {
          analyticsService.push('variant added to cart', variant.id);
        }
      }
      styles: {
        button: {
          'padding': '20px',
          'font-size': '24px'
        }
      }
      contents: ['button'],
      text: {
        button: 'Buy Now!'
      },
    }
  }
});

// component-specific top-level options hashes
shopifyUI.create('collection', {
  id: 12345,
  collectionOptions: {
    columns: 4
  },
  productOptions: {
    events: {
      afterAddVariantToCart: function (variant) {
        analyticsService.push('variant added to cart', variant.id);
      }
    },
    styles: {
      button: {
        'padding': '20px',
        'font-size': '24px'
      }
    }
    contents: ['button'],
    text: {
      button: 'Buy Now!'
    }
  }
});
