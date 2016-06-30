const cartTemplates = {
  title: '<h2>{{data.title}}</h2>',
  lineItems: '<div class="line-items">{{{data.childrenHtml}}}</div>',
  total: '<p><strong>{{data.total}}</strong></p>',
  checkout: '<button>Checkout</button>'
}

export default cartTemplates;
