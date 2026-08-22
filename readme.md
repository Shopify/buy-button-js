# BuyButton.js

[BuyButton.js on NPM](https://www.npmjs.com/package/@shopify/buy-button-js)

BuyButton.js is a highly customizable UI library for adding e-commerce functionality to any website. It allows you to create interactive UI components such as product listings and shopping carts with minimal configuration, while allowing you to easily customize the appearance and behaviour of the components.
It uses the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/) to connect to your Shopify store, giving you access to your products and collections.

To get started, take a look at [the documentation](http://shopify.github.io/buy-button-js/).
For questions, suggestions and feedback, please <a href="https://github.com/Shopify/buy-button-js/issues">create an issue</a>.

## BuyButton.js v3.0 troubleshooting

### Checkout showing Online Store password page

If your Online Store is password protected, users will be shown your Online Store password page when attempting to go to checkout. The best way to resolve this is to add [this redirect theme](https://github.com/instantcommerce/shopify-headless-theme) to your Online Store and remove password protection.

## Development

```
pnpm install
```

```
pnpm run start

```

Will watch for changes, compile src/ to tmp/ using babel & browserify, and run a server at <http://localhost:8080/>.
`http-server` binds to `127.0.0.1` (not `0.0.0.0`) to avoid conflicting with dev's `devns` port proxy. `dev open app` opens this URL.
If 8080 is taken, `http-server` auto-increments to 8081, 8082, etc. — use the URL printed in the terminal.

## Testing

```
pnpm run test
```

will run full test suite locally

```
pnpm run test-dev
```

Will watch for changes and run test suite.

### Manual Browser Testing

To verify buy buttons render correctly in a real browser:

```bash
pnpm build
pnpm serve
# Open the URL the terminal prints on startup, e.g.:
open http://localhost:8080/test-manual/
```

See [`test-manual/README.md`](./test-manual/README.md) for details.

## Documentation

Docs are a Jekyll site in `/docs`, published at <https://shopify.github.io/buy-button-js/>.
GitHub Pages builds `/docs` from `main` automatically (there is no `gh-pages` branch).

`dev up` provisions Ruby and Jekyll, so to preview locally just run:

```
pnpm run docs
```

Doc server runs at <http://localhost:4000/buy-button-js/>.
`dev open docs` assumes Jekyll's default port (4000); if you pass `--port` to override it, open the URL Jekyll prints instead.
