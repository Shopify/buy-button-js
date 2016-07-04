import Component from '../component';
import Template from '../template';
import extend from '../utils/extend';
import Pretender from 'fetch-pretender';

let server = new Pretender()

  server.get('https://embeds.myshopify.com/api/apps/6/product_listings/6640244678', (request) => {
    return [
      200,
      {'content-type': 'application/javascript'},
      JSON.stringify({"product_listing":{"product_id":6640244678,"created_at":"2016-06-06T19:50:43-04:00","updated_at":"2016-06-14T18:12:39-04:00","body_html":"\u003cmeta charset=\"utf-8\"\u003e\n\u003cdiv\u003eWhat's cuter than a Sockness Monster wearing socks? Baby Sockness Monsters wearing socks. Our knee high Sockness Monster was such a hit that we decided to create an ankle version. The only problem: how to fit a whole monster on an ankle sock. Solution: put baby monsters on the ankle sock!\u003c\/div\u003e\n\u003cdiv\u003e \u003c\/div\u003e\n\u003cdiv\u003e56% cotton, 42% polyester, 2% spandex.  Made in Korea.\u003c\/div\u003e\n\u003cdiv\u003e \u003c\/div\u003e","handle":"ankle-socks","product_type":"","title":"Ankle socks","vendor":"Embeds","available":true,"tags":"","published_at":"2016-06-06T19:50:43-04:00","images":[{"id":12780243142,"created_at":"2016-06-06T19:50:44-04:00","position":1,"updated_at":"2016-06-06T19:50:44-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sharek.jpg?v=1465257044","variant_ids":[20984900806,20984923078]},{"id":12780246150,"created_at":"2016-06-06T19:51:00-04:00","position":2,"updated_at":"2016-06-06T19:51:00-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sloth.jpg?v=1465257060","variant_ids":[20984830918,20984917574,20984923270]},{"id":12780247046,"created_at":"2016-06-06T19:51:02-04:00","position":3,"updated_at":"2016-06-06T19:51:02-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/water.jpg?v=1465257062","variant_ids":[20984831046,20984917638,20984923334]},{"id":12780361606,"created_at":"2016-06-06T19:56:50-04:00","position":4,"updated_at":"2016-06-06T19:56:50-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/dino2.JPG?v=1465257410","variant_ids":[]},{"id":12780362502,"created_at":"2016-06-06T19:56:52-04:00","position":5,"updated_at":"2016-06-06T19:56:52-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/shark2.jpg?v=1465257412","variant_ids":[]},{"id":12780363014,"created_at":"2016-06-06T19:56:54-04:00","position":6,"updated_at":"2016-06-06T19:56:54-04:00","product_id":6640244678,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sloth2.JPG?v=1465257414","variant_ids":[]}],"options":[{"id":7989736070,"name":"Print","product_id":6640244678,"position":1},{"id":7989744518,"name":"Size","product_id":6640244678,"position":2}],"variants":[{"id":20984830918,"title":"sloth \/ small","option_values":[{"option_id":7989736070,"name":"Print","value":"sloth"},{"option_id":7989744518,"name":"Size","value":"small"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":1,"available":true,"created_at":"2016-06-06T19:50:43-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984917574,"title":"sloth \/ medium","option_values":[{"option_id":7989736070,"name":"Print","value":"sloth"},{"option_id":7989744518,"name":"Size","value":"medium"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":2,"available":true,"created_at":"2016-06-06T19:53:48-04:00","updated_at":"2016-06-06T19:53:57-04:00"},{"id":20984923270,"title":"sloth \/ large","option_values":[{"option_id":7989736070,"name":"Print","value":"sloth"},{"option_id":7989744518,"name":"Size","value":"large"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":3,"available":true,"created_at":"2016-06-06T19:54:18-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984831046,"title":"dinosaur \/ small","option_values":[{"option_id":7989736070,"name":"Print","value":"dinosaur"},{"option_id":7989744518,"name":"Size","value":"small"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":4,"available":true,"created_at":"2016-06-06T19:50:43-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984917638,"title":"dinosaur \/ medium","option_values":[{"option_id":7989736070,"name":"Print","value":"dinosaur"},{"option_id":7989744518,"name":"Size","value":"medium"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":5,"available":true,"created_at":"2016-06-06T19:53:48-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984923334,"title":"dinosaur \/ large","option_values":[{"option_id":7989736070,"name":"Print","value":"dinosaur"},{"option_id":7989744518,"name":"Size","value":"large"}],"price":"10.00","compare_at_price":null,"grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":6,"available":true,"created_at":"2016-06-06T19:54:18-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984900806,"title":"shark \/ medium","option_values":[{"option_id":7989736070,"name":"Print","value":"shark"},{"option_id":7989744518,"name":"Size","value":"medium"}],"price":"5.00","compare_at_price":"10.00","grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":7,"available":true,"created_at":"2016-06-06T19:53:03-04:00","updated_at":"2016-06-14T18:12:39-04:00"},{"id":20984923078,"title":"shark \/ large","option_values":[{"option_id":7989736070,"name":"Print","value":"shark"},{"option_id":7989744518,"name":"Size","value":"large"}],"price":"5.00","compare_at_price":"10.00","grams":0,"requires_shipping":true,"sku":"","barcode":"","taxable":true,"position":8,"available":true,"created_at":"2016-06-06T19:54:18-04:00","updated_at":"2016-06-14T18:12:39-04:00"}]}})
    ]
  });

let cachedImage = null;

export default class Product extends Component {
  constructor(config, props) {
    super(config, props, 'product');
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents);
  }

  get currentImage() {
    if (!cachedImage) {
      cachedImage = this.model.selectedVariantImage;
    }

    return cachedImage;
  }

  get viewData() {
    return extend(this.model, {
      buttonText: this.variantAvailable ? this.text.button : 'Unavailable',
      childrenHtml: this.childrenHtml,
      currentImage: this.currentImage,
      buttonClass: this.variantAvailable ? '' : this.classes.disabled,
      hasVariants: this.hasVariants,
      classes: this.classes
    })
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`change .${this.config.option.classes.select}`]: this.onOptionSelect.bind(this),
      [`click .${this.options.classes.button}`]: this.onButtonClick.bind(this)
    });
  }

  get windowParams() {
    return Object.keys(this.config.window).reduce((acc, key) => {
      return acc + `${key}=${this.config.window[key]},`;
    }, '');
  }

  get variantAvailable() {
    return this.model.selectedVariant;
  }

  get childrenHtml() {
    return this.decoratedOptions.reduce((acc, option) => {
      console.log(option);
      const data = option;
      data.classes = this.config.option.classes;
      return acc + this.childTemplate.render({ data: data });
    }, '');
  }

  get hasVariants() {
    return this.model.variants.length > 1;
  }

  fetchData() {
    return this.props.client.fetchProduct(this.id);
  }

  render() {
    super.render.call(this);
  }

  onButtonClick(evt, product) {
    if (this.options.buttonTarget === 'cart') {
      this.props.addToCart(product.model);
    } else {
      this.openCheckout();
    }
  }

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  openCheckout() {
    window.open(this.model.selectedVariant.checkoutUrl(1), 'checkout', this.windowParams);
  }

  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => {
      return option.name === optionName;
    })[0];
    updatedOption.selected = value;
    if (this.variantAvailable) {
      cachedImage = this.model.selectedVariantImage;
    }
    this.render();
    return updatedOption;
  }

  get variantArray() {
    delete this.variant_Array;
    return this.variant_Array = this.model.variants.map((variant) => {
      let betterVariant =  {
        id: variant.id,
        optionValues: {}
      }
      variant.optionValues.forEach((optionValue) => {
        betterVariant.optionValues[optionValue.name] = optionValue.value;
      });

      return betterVariant;
    });
  }

  get selections() {
    const selections = {};

    this.model.selections.forEach((selection, index) => {
      const option = this.model.options[index]
      selections[option.name] = selection;
    });

    return selections;
  }

  optionValueCanBeSelected(selections, name, value) {
    const variants = this.variantArray;
    selections[name] = value;

    const satisfactoryVariants = variants.filter((variant) => {
      const matchingOptions = Object.keys(selections).filter((key) => {
        return variant.optionValues[key] === selections[key];
      });
      return matchingOptions.length === Object.keys(selections).length;
    });

    return satisfactoryVariants.length;
  }

  get decoratedOptions() {
    return this.model.options.map((option) => {
      return {
        name: option.name,
        values: option.values.map((value) => {
          return {
            name: value,
            selected: value === option.selected,
            disabled: !this.optionValueCanBeSelected(Object.assign({}, this.selections), option.name, value)
          }
        })
      }
    });
  }
}
