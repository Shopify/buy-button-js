const cartTemplates = {
  title: '<div class="{{data.classes.header}}">' +
            '<h2 class="{{data.classes.title}}">{{data.text.title}}</h2>' +
            '<button class="btn--close">' +
              '<span aria-role="hidden">×</span>' +
              '<span class="visuallyhidden">Close</span>' +
             '</button>' +
          '</div>',
  lineItems: '<div class="{{data.classes.lineItems}}">{{{data.childrenHtml}}}</div>',
  total: '<div class="{{data.classes.total}}">{{data.subtotal}}</div>',
  button: '<button class="{{data.classes.button}}">{{data.text.button}}</button>'
}

export default cartTemplates;
