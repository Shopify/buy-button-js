const cartTemplates = {
  title: `<div class="{{data.classes.cart.header}}">
            <h2 class="{{data.classes.cart.title}}">{{data.text.title}}</h2>
            <button class="{{data.classes.cart.close}}">
              <span aria-role="hidden">×</span>
              <span class="visuallyhidden">Close</span>
             </button>
          </div>`,
  lineItems: '<div class="{{data.classes.cart.cartScroll}}"><div class="{{data.classes.cart.lineItems}}">{{{data.childrenHtml}}}</div></div>',
  footer: `<div class="{{data.classes.cart.footer}}">
            <p class="{{data.classes.cart.subtotalText}}">{{data.text.total}}</p>
            <p class="{{data.classes.cart.subtotal}}"><span class="{{data.classes.currency}}"></span>\${{data.subtotal}}</p>
            <p class="{{data.classes.cart.notice}}">{{data.text.notice}}</p>
            <button class="{{data.classes.cart.button}}" type="button">{{data.text.button}}</button>
          </div>`,
};

export default cartTemplates;
