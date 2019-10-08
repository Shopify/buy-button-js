# Changelog

### v1.0.3 (October 8, 2019)
- Fix product set's `trackingInfo` to return tracking information for each product in set ([#651](https://github.com/Shopify/buy-button-js/pull/651)) 

### v1.0.2 (September 24, 2019)
- Add `openCheckout` user event ([#647](https://github.com/Shopify/buy-button-js/pull/647)) 
- Fixed pagination error for product set buy buttons ([#645](https://github.com/Shopify/buy-button-js/pull/645))
- Tracker related updates:
  - Add 2 new events (`Open cart checkout` and `Open modal`) ([#648](https://github.com/Shopify/buy-button-js/pull/648))
  - Standardized tracking info's `id` value to be the `storefrontId` ([#645](https://github.com/Shopify/buy-button-js/pull/645))
  - Updated tracking info values and added addtional properties ([#645](https://github.com/Shopify/buy-button-js/pull/645))

### v1.0.1 (September 10, 2019)
- Fix how ShopifyBuy.UI is set ([#643](https://github.com/Shopify/buy-button-js/pull/643))

### v1.0.0 (September 5, 2019)
- Add support for automatic discounts in the `lineItem` component ([#640](https://github.com/Shopify/buy-button-js/pull/640))
  - Add `priceWithDiscounts` contents option and enable by default
  - Disable `price` contents option by default
  - Add `priceWithDiscounts` to the order array
  - Add `priceWithDiscounts`, `fullPrice`, `discount`, and `discountIcon` styles
  - Update default `price` styles to account for its position inside the `priceWithDiscounts` container
- Add support for automatic discounts in the `cart` component ([#640](https://github.com/Shopify/buy-button-js/pull/640))  
  - Add `discounts` contents option and enable by default
  - Add `discount`, `discountText`, `discountIcon`, `discountAmount`, and `cartScrollWithDiscounts` styles
- Update layout of `lineItem` component to position variant title below product title ([#640](https://github.com/Shopify/buy-button-js/pull/640))
  - Update default position of `variantTitle` in the `lineItem` component's order array
  - Update default `variantTitle` styles
- Update browser support ([#641](https://github.com/Shopify/buy-button-js/pull/641))
  - Internet Explorer: 11+
  - Safari: 8+
  - Chrome, Firefox, Opera, Edge: last 2 versions
  - iOS: 8+
  - Android: 4.4+ 

### v0.12.0 (August 15, 2019)
- Bump various npm dependencies, notably the following major updates: ([#633](https://github.com/Shopify/buy-button-js/pull/633))
  - `babel/core` | `babel/cli` | `babel/runtime` : v7.x
  - `core-js`: v3.1.4
  - `node-sass`: v4.12.0
  - `mustache`: v3.0.1
  - `morphdom`: v2.5.5
  - `browserify`: v13.3.0
  - `postcss`: v7.1.17
- Bump `shopify-buy` dependency to v2.7.0 ([#635](https://github.com/Shopify/buy-button-js/pull/635))
- Fix missing double quotes around classes in options template ([#636](https://github.com/Shopify/buy-button-js/pull/636))

### v0.11.0 (March 29, 2019)
- Bump `shopify-buy` dependency to v2.2.0.
- Asserts `lineItemsSubtotalPrice` is exposed.
- Add a `formattedLineItemsSubtotal` field to cart view model. The new field consists in a sum of all line items prices without any discount, taxes or shipping rates applications.
