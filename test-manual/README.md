# Manual Browser Testing

This directory contains a test page for manually verifying buy-button-js works correctly in a real browser environment.

## Important: buy-button-js vs buy-button-storefront

**This test page tests `buy-button-js` directly** — the core UI rendering library.

The embed code merchants get from the Shopify admin loads `buy-button-storefront.min.js` (from CDN), which is a **different package** that wraps buy-button-js with tracking/analytics and provides a convenience API.

| Package | API | Source |
|---------|-----|--------|
| `buy-button-js` (this repo) | `ShopifyBuy.UI.init(client)` | Local build (`lib/buybutton.umd.js`) |
| `buy-button-storefront` (wrapper) | `ShopifyBuy.UI.onReady(client).then(...)` | CDN (`buy-button-storefront.min.js`) |

If you're testing changes to buy-button-js, use this test page. The `onReady` API from merchant embed codes won't work here because that's added by the storefront wrapper.

## Why Manual Testing?

The unit test suite (794 tests) verifies component logic, but doesn't render actual buy buttons in a browser. This test page lets you:

- Verify the built bundle loads correctly
- See real buy buttons render with products from live stores
- Test cart interactions, modals, and checkout flows
- Confirm changes don't break visual rendering or API communication

## Quick Start

```bash
# 1. Install dependencies (if not already done)
pnpm install

# 2. Build the package
pnpm build

# 3. Start the local server
pnpm serve

# 4. Open the test page (check terminal for actual port - defaults to 8080)
open http://localhost:8080/test-manual/
```

> **Note:** If port 8080 is in use, `http-server` will use the next available port (e.g., 8081, 8082). Check the terminal output for the actual URL.

## What's Tested

The test page includes several buy button configurations:

| Test | Type | Store | Purpose |
|------|------|-------|---------|
| 1 | Product | kara-daviduik | Basic product with default styling |
| 2 | Collection | kara-daviduik | Collection grid rendering |
| 3 | Product | hydrogen-migration | Cross-store verification |

## Expected Behavior

When working correctly, you should see:

1. ✅ Green "ShopifyBuy loaded successfully" status at the top
2. Product images, titles, and prices rendered
3. "Add to cart" buttons that open a cart drawer when clicked
4. Cart drawer with working quantity controls and checkout button

## Troubleshooting

**"ShopifyBuy not loaded" error:**
- Run `pnpm build` first
- Check that `lib/buybutton.umd.js` exists

**Products not rendering:**
- Check browser console for API errors
- Verify network requests to `*.myshopify.com` succeed
- Some stores may have access restrictions

**CORS errors:**
- Use `pnpm serve` instead of opening the file directly
- Or use a browser with relaxed local file security

## Adding More Tests

To test additional scenarios, add new `<div id="test-X">` elements and corresponding `ui.createComponent()` calls in the script section. Use your own store's domain and storefront access token.
