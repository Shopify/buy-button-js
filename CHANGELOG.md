# Changelog

### v0.12.0 (August 15, 2019)
- Bump various npm dependencies, notably the following major updates: (#633)
  - `babel/core` | `babel/cli` | `babel/runtime` : v7.x
  - `core-js`: v3.1.4
  - `node-sass`: v4.12.0
  - `mustache`: v3.0.1
  - `morphdom`: v2.5.5
  - `browserify`: v13.3.0
  - `postcss`: v7.1.17
- Bump `shopify-buy` dependency to v2.7.0 (#635)
- Fix missing double quotes around classes in options template (#578)

### v0.11.0 (March 29, 2019)
- Bump `shopify-buy` dependency to v2.2.0.
- Asserts `lineItemsSubtotalPrice` is exposed.
- Add a `formattedLineItemsSubtotal` field to cart view model. The new field consists in a sum of all line items prices without any discount, taxes or shipping rates applications.
