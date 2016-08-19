export default ".shopify-buy-frame {\n  display: inline-block; }\n  .shopify-buy-frame iframe {\n    width: 100%;\n    display: block;\n    height: 0;\n    overflow: hidden; }\n\n.shopify-buy-frame--cart {\n  width: 100%;\n  max-width: 350px;\n  position: fixed;\n  top: 0;\n  right: 0;\n  height: 100%;\n  z-index: 2147483647;\n  transform: translateX(100%);\n  transition: all 250ms cubic-bezier(0.165, 0.84, 0.44, 1); }\n  .shopify-buy-frame--cart iframe {\n    height: 100%; }\n  .shopify-buy-frame--cart.is-active {\n    transform: translateX(0); }\n\n.shopify-buy-frame--product iframe {\n  max-width: 230px; }\n\n.shopify-buy-frame--toggle {\n  position: fixed;\n  right: 0;\n  top: 50%;\n  transform: translateY(-50%);\n  max-width: 46px;\n  z-index: 2147483645;\n  display: none; }\n  .shopify-buy-frame--toggle.is-active {\n    display: block; }\n  .shopify-buy-frame--toggle iframe {\n    height: auto; }\n\n.shopify-buy-frame--productSet {\n  width: 100%; }\n\n.shopify-buy-frame--modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  z-index: 2147483646;\n  display: none;\n  transition: background 300ms ease; }\n  .shopify-buy-frame--modal iframe {\n    height: 100%;\n    width: 100%;\n    max-width: none; }\n  .shopify-buy-frame--modal.is-active {\n    background: rgba(0, 0, 0, 0.3); }\n  .shopify-buy-frame--modal.is-block {\n    display: block; }\n"