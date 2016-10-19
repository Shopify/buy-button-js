const cartTemplates = {
  title: `<div class="{{data.classes.cart.header}}">
            <h2 class="{{data.classes.cart.title}}">{{data.text.title}}</h2>
            <button class="{{data.classes.cart.close}}">
              <span aria-role="hidden">&times;</span>
              <span class="visuallyhidden">Close</span>
             </button>
          </div>`,
  lineItems: `<div class="{{data.classes.cart.cartScroll}}">
                {{#data.isEmpty}}<p class="{{data.classes.cart.emptyCart}}">{{data.text.empty}}</p>{{/data.isEmpty}}
                <div class="{{data.classes.cart.lineItems}}">{{{data.lineItemsHtml}}}</div>
              </div>`,
  footer: `<div class="{{data.classes.cart.footer}}">
            {{^data.isEmpty}}
              <p class="{{data.classes.cart.subtotalText}}">{{data.text.total}}</p>
              <p class="{{data.classes.cart.subtotal}}"><span class="{{data.classes.currency}}"></span>{{data.formattedTotal}}</p>
              <p class="{{data.classes.cart.notice}}">{{data.text.notice}}</p>
              <button class="{{data.classes.cart.button}}" type="button">{{data.text.button}}</button>
            {{/data.isEmpty}}
          </div>`,
};

export default cartTemplates;
