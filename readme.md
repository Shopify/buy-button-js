# BuyButton.js

BuyButton.js is a highly customizable UI library for adding ecommerce functionality to any website. It allows you to create interactive UI components such as product listings and shopping carts with minimal configuration, while allowing you to easily customize the appearance and behaviour of the components.
It uses the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/) to connect to your Shopify store, giving you access to your products and collections.

To get started, take a look at [the documentation](http://shopify.github.io/buy-button-js/).

## Development

```
dev up
cp index.example.html index.html
```

* Add your API key and shop domain to index.html
* Set a product ID in index.html

```
dev start

```

Will watch for changes, compile src/ to tmp/ using babel & browserify, and run a server on port 8080.

## Testing

```
dev test
```

will run full test suite locally

```
yarn run test-dev
```

Will watch for changes and run test suite.
