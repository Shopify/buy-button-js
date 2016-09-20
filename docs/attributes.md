## Attributes for all components

<table>
  <tr>
    <td>
      <code>iframe</code>
    </td>

    <td>
      Whether to render the component inside an iframe. Iframes are beneficial for most users because they isolate the embed in a "sandbox" so that other parts of your website don't interact with it in unwanted ways. If you wish to have _full_ control over the appearance of your embed and know how to use CSS, you may choose to change this value to `false`.

      **Type**: Boolean (true or false)    
      **Default value**: `true` for all top-level components, `false` for all nested components (ex. the product within a collection).
    </td>
  </tr>

  <tr>
    <td>
      <code>order</code>
    </td>
    <td>
      Order in which to render the elements within the component. You must list all elements you wish to include.

      Example:

      <pre><code>
        order: [
          'title',
          'variantTitle',
          'price',
          'options',
          'description',
          'quantity',
          'button',
          'img',
        ]
      </code></pre>

      **Type**: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
      **Default value**: dependent on component. [View component defaults](TODO)
    </td>
  </tr>

  <tr>
    <td>
      <code>contents</code>
    </td>
    <td>
      Whether or not to render each element within the component. There is a key for each element in the object, set to either `true` or `false` by default. You may override any of these values.

      Example:

      <pre><code>
        contents: {
          img: false
        }
      </code></pre>

      **Type**: object
      **Default value**: dependent on component. [View component defaults](TODO)
    </td>
  </tr>

  <tr>
    <td>
      <code>text</code>
    </td>
    <td>
      Values for all text visible in embeds except for that defined in the product itself (for example, you cannot change the title of a product from the `text` object, you would change that from your Shopify admin).

      Example

      <pre><code>
        text: {
          button: 'Buy Now!'
        }
      </code></pre>

      **Type**: object
      **Default value**: dependent on component. [View component defaults](TODO)
    </td>
  </tr>

  <tr>
    <td>
      <code>styles</code>
    </td>
    <td>
      Any custom styles for a component. Format is based on [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS). The styles object is nested, with top-level keys representing elements within the component that can be styled. The styles for each element are a set of key-value pairs, with each key being a valid CSS property. To style pseudo-selectors (ex: hover states), create another nested object with the key matching your pseudo-selector.

      <pre><code>
        style: {
          button: {
            'color': 'red',
            ':hover': {
              'color': 'orange'
            }
          }
        }
      </code></pre>

      **Type**: object
      **Default value**: dependent on component. [View component defaults](TODO)
    </td>
  </tr>
</table>


# Component Types

## Product
Main product embed. Creates `options` component. Depending on options, may create a `modal` and `cart` component.  

### Product Attributes

<table>
  <tr>
    <td>
      <code>buttonDestination</code>
    </td>
    <td>
      Indicates the action for the button in the product embed. There are 4 options:

      * **'cart'** Adds product to cart and opens cart
      * **'modal'** Opens a modal window with further details about the product
      * **'checkout'** Opens a pop-up window directly to checkout
      * **'onlineStore'** Open product in your online store (Note: requires Online Store channel be active and product be visible in Online Store)

      **Type**: String: `'cart'`, `'modal'`, `'checkout'`, `'onlineStore'`
      **Default value**: `'cart'`
    </td>
  </tr>
  <tr>
    <td>
      <code>layout</code>
    </td>
    <td>
      Whether to orient the product vertically (with image on top) or horizontally (with image to the side). Vertically oriented products will have a set width (defaults to 240px) configurable by the `width` property, and horizontally oriented products will take up the full width of their location on your website.

      **Type**: String: `'vertical'`, `'horizontal'`
      **Default value**: `'vertical'`
    </td>
  </tr>
  <tr>
    <td>
      <code>width</code>
    </td>
    <td>
      Sets the maximum width for a product embed with vertical layout. Specified in pixels (ex. `400px`).

      **Type**: String
      **Default value**: `240px`
    </td>
  </tr>
</table>

### Product contents

<pre><code>
{
  img: true,
  title: true,
  variantTitle: false,
  price: true,
  options: true,
  quantity: false, // determines whether to show any quantity inputs at all
  quantityIncrement: false, // button to increase quantity
  quantityDecrement: false, // button to decrease quantity
  quantityInput: true, // input field to directly set quantity
  button: true,
  description: false,
}
</code></pre>

### Product text
Configurable text in product component:

<pre><code>
{
  button: 'SHOP NOW',
  outOfStock: 'Out of stock',
  unavailable: 'Unavailable',
}
</code></pre>

## Option component
Configures the option selector contained within a product.

No configurable contents or text.

## Cart
Shopping cart for product and collection embeds. Only one cart exists per page.

### Attributes for cart

<table>
  <tr>
    <td>
      <code>startOpen</code>
    </td>
    <td>
      Whether cart should be visible or not when initialized.

      **Type**: Boolean
      **Default value**: `false`
    </td>
  </tr>
</table>

### Cart contents

<pre><code>
{
  title: true,
  lineItems: true,
  footer: true,
},
</code></pre>

### Cart text

<pre><code>
{
  title: 'Cart',
  empty: 'Your cart is empty.',
  button: 'Checkout',
  total: 'Total',
  currency: 'CAD',
  notice: 'Shipping and discount codes are added at checkout.',
},
</code></pre>

## LineItem component
Configures line items within cart.

### LineItem contents
<pre><code>
{
  image: true,
  variantTitle: true,
  title: true,
  price: true,
  quantity: true,
  quantityIncrement: true,
  quantityDecrement: true,
  quantityInput: true,
},
</code></pre>

No configurable text.

## ProductSet component
Either a collection embed or a set of multiple products specified by ID.

### ProductSet contents

<pre><code>
{
  products: true,
  pagination: true,
}
</code></pre>

### ProductSet text

<pre><code>
{
  nextPageButton: 'Next page',
},
</code></pre>

## Modal component

Created when Product's `buttonDestination` property is set to `'modal'`.

No configurable contents or text.

## ModalProduct component
Configures the product contained within the modal. Allows product in modal to have different appearances and behaviours than the embed which launched it.

All attributes, contents, and text are as Product component.

## Toggle component
Configures the small tab at the right side of the screen which opens and closes the cart. Also displays number of items contaiend in the cart. Created by Cart component.

### Toggle contents

<pre><code>
{
  count: true,
  icon: true,
  title: false,
}
</code></pre>

### Toggle text

<pre><code>
{
  title: 'cart', // not visible by default, but read to screen readers
},
</code></pre>

## Window component
Configures the pop-up window for checkout. You will likely only want to configure the `height` and `width` attributes.

<pre><code>
{
  height: 600,
  width: 600,
  toolbar: 0,
  scrollbars: 0,
  status: 0,
  resizable: 1,
  left: 0,
  top: 0,
  center: 0,
  createnew: 1,
  location: 0,
  menubar: 0,
  onUnload: null,
},
</code></pre>

# Advanced Attributes

Only edit the following attributes if you are knowledgeable in HTML/CSS/JavaScript and willing to dedicate the resources to maintaining a custom experience.

<table>
  <tr>
    <td><code>classes</code></td>
    <td>
      Determines class names added to elements within components. Unlikely you will need to edit these unless you are opting out of the iframe sandboxing.

      **Type**: Object
      **Default values**: dependent on component. [View source](TODO).
    </td>
  </tr>
  <tr>
    <td><code>templates</code></td>
    <td>
      Determines the HTML for each element. Templates are specified as strings using the [Hogan](http://twitter.github.io/hogan.js/) templating engine, which implements the [Mustache](https://mustache.github.io/) syntax.

      Templates have a variety of data available to them, accessible through the `data` namespace. Information on the `data` object is a combination of the model supporting the component provided by the [JS Buy SDK](http://shopify.github.io/js-buy-sdk/api/classes/ShopifyBuy.html) (ProductModel, ProductVariantModel, Option, and CartModel), the `classes` object, the `text` object, and a number of utility strings and booleans.

      Make a point of keeping the classes from the original templates, as these are used for data binding.

      If you wish to add custom styles to any new HTML you add, you can add additional keys to the `classes` object, and then add the same key to the `styles` object. Ensure that you match the key for this class name between the template, the `classes` object, and the `styles` object.

      #### Example

      If you wanted to change the product title template to include extra HTML (for example, the string 'NEW'), you could pass in a new value for the `title` template:

      <pre><code>
        product: {
          templates: {
            title: '<h1 class="{{data.classes.product.title}}">{{data.title}} <span class="{{data.classes.product.newBadge}}">NEW</span></h1>',
          },
          classes: {
            newBadge: 'badge--new'
          },
          styles: {
            newBadge: {
              'background-color': 'red',
              'border-radius': '10px',
              'color': 'yellow'
            }
          }
        }
      </pre></code>

    </td>
  </tr>
  <tr>
    <td>
      <code>events</code>
    </td>
    <td>
      A number of component lifecycle hooks are available for running custom functions.

      These events can be used for custom functionality such as tracking, or advanced DOM manipulation.

      <pre><code>
      {
        'beforeInit': function (component) {}, // before component is initialized
        'afterInit': function (component) {},
        'beforeRender': function (component) {}, // before component is rendered, after it has a `model` defined
        'afterRender': function (component) {},
        'beforeDelegateEvents': function (component) {}, // before events are bound to the DOM
        'afterDelegateEvents': function(component) {},
        'beforeUpdateConfig': function(component) {}, // before configuration is updated (only relevant in uncommon customizations)
        'afterUpdateConfig': function(component) {},
      }
      </code></pre>
    </td>
  </tr>
  <tr>
    <td><code>DOMEvents</code></td>
    <td>
      Binds custom events to DOM nodes by selector. Format is `'eventName selector': callback`.

      Example:

      <pre><code>
      product: {
        DOMEvents: {
          'click .button': function (event) {
            myAnalyticsLibrary.track()
          }
        }
      }
      </code></pre>

      DOM nodes are selected using `querySelectorAll`, so a valid selector must be provided. If you are binding to a class from the `classes` object (as is recommended), the string may contain spaces and will not start with a dot, so you will need to format it appropriately:

      <pre><code>
        `click .${this.classes.product.button.split(' ').join('.')}`: myCallback
      </code></pre>
    </td>
  </tr>
</table>
