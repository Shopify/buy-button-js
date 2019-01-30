const cartTemplates = {
  title: `<div class="{{data.classes.cart.header}}" data-element="cart.header">
            <h2 class="{{data.classes.cart.title}}" data-element="cart.title">{{data.text.title}}</h2>
            <button class="{{data.classes.cart.close}}" data-element="cart.close">
              <span aria-role="hidden">&times;</span>
              <span class="visuallyhidden">Close</span>
             </button>
          </div>`,
  lineItems: `<div class="{{data.classes.cart.cartScroll}} {{#data.contents.note}}{{data.classes.cart.cartScrollWithCartNote}}{{/data.contents.note}}" data-element="cart.cartScroll">
                {{#data.isEmpty}}<p class="{{data.classes.cart.empty}} {{data.classes.cart.emptyCart}}" data-element="cart.empty">{{data.text.empty}}</p>{{/data.isEmpty}}
                <div class="{{data.classes.cart.lineItems}}" data-element="cart.lineItems">{{{data.lineItemsHtml}}}</div>
              </div>`,
  footer: `{{^data.isEmpty}}
            <div class="{{data.classes.cart.footer}}" data-element="cart.footer">
              <p class="{{data.classes.cart.subtotalText}}" data-element="cart.total">{{data.text.total}}</p>
              <p class="{{data.classes.cart.subtotal}}" data-element="cart.subtotal">{{data.formattedTotal}}</p>
              {{#data.contents.note}}
                <div class="{{data.classes.cart.note}}" data-element="cart.note">
                  <p class="{{data.classes.cart.noteDescription}}" data-element="cart.noteDescription">{{data.text.noteDescription}}</p>
                  <textarea class="{{data.classes.cart.noteTextArea}}" data-element="cart.noteTextArea" rows="3"/>{{data.cartNote}}</textarea>
                </div>
              {{/data.contents.note}}
              <p class="{{data.classes.cart.notice}}" data-element="cart.notice">{{data.text.notice}}</p>
              <button class="{{data.classes.cart.button}}" type="button" data-element="cart.button">{{data.text.button}}</button>
            </div>
           {{/data.isEmpty}}`,
};

export default cartTemplates;
