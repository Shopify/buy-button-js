---
"@shopify/buy-button-js": patch
---

Add title attribute to iframes for improved accessibility

- Adds configurable `title` attribute to all iframe components for better screen reader support
- Screen readers now announce meaningful descriptions instead of generic "frame" text
- Each component type (product, cart, toggle, modal, productSet) has intelligent default titles
- Titles can be customized via the component's text configuration
- For toggle, modal, and productSet components, use the `iframeAccessibilityLabel` text property
- For product and cart components, defaults to existing button/title text configurations