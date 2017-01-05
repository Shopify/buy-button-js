# BuyButton.js

BuyButton.js is a highly customizable UI library for adding ecommerce functionality to any website. It allows you to create interactive UI components such as product listings and shopping carts with minimal configuration, while allowing you to easily customize the appearance and behaviour of the components.
It uses the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/) to connect to your Shopify store, giving you access to your products and collections.

To get started, take a look at [the documentation](http://shopify.github.io/buy-button-js/).

## Development

```
npm install
cp index.example.html index.html
```

* Add your API key and shop domain to index.html
* Set a product ID in index.html

```
npm run start

```

Will watch for changes, compile src/ to tmp/ using babel & browserify, and run a server on port 8080.

## Testing

```
npm run test-dev
```

Will watch for changes and run test suite.


## Deployment

First ensure you have the latest code, and install all dependencies
```
git pull origin master
npm install
```

Create a new version
```
npm version patch
git push origin master --tags
```

Publish! (Note: a paid NPM account is required for this step)
```
npm publish
```
