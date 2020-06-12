---
layout: default
---
# Shopify BuyButton.js

The Shopify Buy Button JS library is a highly customizable UI library for adding ecommerce functionality to any website. It allows you to easily create interactive UI components such as product listings and shopping carts with minimal configuration, while exposing powerful customization options. It uses the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/) to connect to your Shopify store, giving you access to your products and collections.

> Note: For questions, suggestions and feeback, please <a href="https://github.com/Shopify/buy-button-js/issues" target="_blank">create an issue on the Github repo</a>.

Using BuyButton.js, you can add the following components to your website:

* Product listings and "Buy Now" buttons
* Collections of products
* Shopping cart

This tool is intended for use by developers who are familiar with JavaScript and HTML.

## Current Support

| Internet Explorer     | Chrome, Edge, Firefox, Opera     | Safari    | iOS     | Android   |
| :-------------------- | :------------------------------- | :-------- | :------ | :-------- |
| 11+                   | (Current - 1) or Current         | 8+        | 8+      | 4.4+

## Including the library

Include a script tag with a specific version of the library specified. The example below uses version `1.0.0`, but the latest version can be found on [NPM](https://www.npmjs.com/package/@shopify/buy-button-js).

```html
<script src="http://sdks.shopifycdn.com/buy-button/1.0.0/buybutton.js"></script>
```

## Creating a Shop Client

A Shop Client will allow you to connect to the Shopify API so that you can retrieve data about your products and collections. You will need your `myshopify.com` domain, API key, and application ID to create your client and begin making requests. <a href="https://docs.shopify.com/api/sdks/js-buy-sdk/getting-started#app-id" target="_blank">Where do I find my API Key and application ID?</a>

```js
var client = ShopifyBuy.buildClient({
  domain: 'my-shop.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token', // previously apiKey, now deprecated
});
```

> Note: You will need to publish <a href="https://docs.shopify.com/manual/products/collections/make-collections-findable#change-the-visibility-of-a-collection" target="_blank">product/collection</a> you wish to interact with to the
> "Buy Button" channel in Shopify.

## Initializing the Library

You can now create a UI instance, which is the main interface you will use to create components. The `ShopifyBuy.UI.init` method takes the client you previously configured as its argument.

```js
var ui = ShopifyBuy.UI.init(client);
```

## Creating a component

Components are created through the UI instance's `createComponent` method. There are 4 types of components you can create this way: `'product'`, `'collection'`, `'productSet'`, and `'cart'`. The component type is the first argument to `createComponent`, the second argument is the configuration object.

To create a product or collection component, you will need to pass that resource's ID to the configuration object. <a href="https://docs.shopify.com/api/sdks/js-buy-sdk/getting-started#retrieving-products" target="_blank">How do I find my resource ID?</a>

The only mandatory field in the configuration object is a resource identifier, which is either an ID or a handle. You will also likely want to specify a `node`, which is a DOM Element to which the component will be attached.

```js
ui.createComponent('product', {
  id: 1234567,
  node: document.getElementById('my-product')
});
```

This will append an iframe containing your product listing to the `node` specified. It will also create 2 other components: a cart, and a "cart toggle", which is a small tab on the right side of the screen which toggles the cart open.

## Customizing a component

To customize your component, you can create an `options` object in your configuration object. Each component you wish to customize (for example, product or cart), will have its own configuration nested within the `options` object. For example, to customize the product and the cart in a product component, you would pass through both `cart` and `product` objects:

```js
ui.createComponent('product', {
  id: 1234567,
  options: {
    product: {
      buttonDestination: 'modal'
    },
    cart: {
      startOpen: true
    }
  }
});
```

For a full list of customization options, view the [customization documentation](/buy-button-js/customization).
