---
"@shopify/buy-button-js": major
---

Drop IE 11, Safari 8, iOS 8, Android 4.4 browser support. Minimum browser targets are now rolling modern versions aligned with Shopify Online Store themes. The library now emits ES2015+ JavaScript (native classes, arrow functions, template literals) and no longer transpiles to ES5.

**Migration guide:**
- If you need IE 11 support, pin to `@shopify/buy-button-js@^3.0.0`.
- If you use the CDN `latest` URL (`sdks.shopifycdn.com/buy-button/latest/buybutton.js`), pin to a specific 3.x version before upgrading.
- If your site relied on buy-button-js to provide `fetch`, `Promise`, or ES6 array/object polyfills as a side effect, you must now provide your own polyfills.
