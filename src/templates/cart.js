const cartTemplates = {
  title: `<div class="{{data.classes.header}}">
            <h2 class="{{data.classes.title}}">{{data.text.title}}</h2>
            <button class="{{data.classes.close}}">
              <span aria-role="hidden">×</span>
              <span class="visuallyhidden">Close</span>
             </button>
          </div>`,
  lineItems: '<div class="{{data.classes.cartScroll}}"><div class="{{data.classes.lineItems}}">{{{data.childrenHtml}}}</div></div>',
  footer: `<div class="{{data.classes.footer}}">
            <p class="{{data.classes.subtotalText}}">{{data.text.total}}</p>
            <p class="{{data.classes.subtotal}}"><span class="{{data.classes.currency}}"></span>\${{data.subtotal}}</p>
            <p class="{{data.classes.notice}}">{{data.text.notice}}</p>
            <button class="{{data.classes.button}}" type="button">{{data.text.button}}</button>
          </div>`,
};

export default cartTemplates;
