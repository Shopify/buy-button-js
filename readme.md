# BuyButton.js

[BuyButton.js on NPM](https://www.npmjs.com/package/@shopify/buy-button-js)

BuyButton.js is a highly customizable UI library for adding ecommerce functionality to any website. It allows you to create interactive UI components such as product listings and shopping carts with minimal configuration, while allowing you to easily customize the appearance and behaviour of the components.
It uses the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/) to connect to your Shopify store, giving you access to your products and collections.

To get started, take a look at [the documentation](http://shopify.github.io/buy-button-js/).
For questions, suggestions and feeback, please <a href="https://github.com/Shopify/buy-button-js/issues">create an issue</a>.

## Development

```
yarn
cp index.example.html index.html
```

* Add your API key and shop domain to index.html
* Set a product ID in index.html

```
yarn run start

```

Will watch for changes, compile src/ to tmp/ using babel & browserify, and run a server on port 8080.

## Testing

```
yarn run test
```

will run full test suite locally

```
yarn run test-dev
```

Will watch for changes and run test suite.

## Documentation

To run docs locally, install jekyll:

```
gem install jekyll
```

```
yarn run docs
```
Doc server will run at http://localhost:4000/buy-button-js/
Docs source files are located in /docs.
Docs are automatically deployed to gh-pages from master.
