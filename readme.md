# BuyButton.js with custom attributes

~ For custom engineering Solutions, please contact our firm [get-magic.com](https://get-magic.com) ~

This repository contains a modified version of the Shopify Buy Button library that allows developers to add custom attributes to product line items. While the default Buy Button library does not support this functionality, our implementation enables sending additional data from external applications to Shopify, facilitating the creation of custom retail functionality.

## Features

- Add custom attributes to product line items during checkout
- Attributes are visible to customers during the checkout process
- Attributes are accessible in the Shopify admin panel and through webhooks as metadata

## Limitations

- Custom attributes are not displayed in the cart before checkout, which may cause confusion for customers with bulk orders. However, this should not be an issue for small orders.
- mocha test framework is purged
- After compiling the library, you will need to manually merge your bits with the live shopify bits. We have provided our compiled minified version in ./latest folder.
## Usage

This project is shared for educational purposes and is provided without warranty under the MIT license. 

Use and self-host at your own risk.

To build and run the project, we recommend using a Linux environment.

# Prereqs : 

1. Install [nvm](https://github.com/nvm-sh/nvm)
2. Install build essentials and python 2 `sudo apt-get install -y build-essential g++ python2`
3. Set project to use NodeJS 15 `nvm use 15`
4. Install yarn `npm install yarn -g`
5. Remove from package.json file  'wdio-mocha-framework' which contains the unsupported npm 'fibers' dependency. Its used for test automation.
6. Run `yarn install`
7. Run `yarn build`


# Original unmodified Readme:
## BuyButton.js

[BuyButton.js on NPM](https://www.npmjs.com/package/@shopify/buy-button-js)
[![Travis](https://travis-ci.com/Shopify/buy-button-js.svg?branch=master)](https://travis-ci.com/Shopify/buy-button-js)

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
