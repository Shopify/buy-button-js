import OptionsTransform from '../../../src/legacy/options-transform';
import {product} from '../../fixtures/legacy/elements';

describe('legacy/options-transform/product', () => {
  let subject;
  let productNode;

  beforeEach(() => {
    productNode = product();
    subject = new OptionsTransform(productNode);
  });

  it('should define embedType', () => {
    assert.equal(subject.embedType, 'product');
  });

  it('should parse legacy options from the element', () => {
    assert.deepEqual(subject.legacy, {
      embed_type: 'product',
      shop: 'can-i-buy-a-feeling.myshopify.com',
      product_handle: 'anger',
    });
  });

  describe('data-display_size', () => {
    it('should handle display_size="compact"', () => {
      productNode = product({display_size: 'compact'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.wrapper.width, '230px');
    });

    it('should default to 450px', () => {
      productNode = product();
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.wrapper.width, '450px');
    });
  })

  describe('data-has_image', () => {

    it('should do nothing if has_image is truthy', () => {
      productNode = product({has_image: '1'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.img, undefined);
      productNode = product({has_image: 'true'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.img, undefined);
    });

    it('should hide image, price, title, and options if false', () => {
      productNode = product({has_image: 'false'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.img, false);
      assert.equal(subject.ui.product.contents.price, false);
      assert.equal(subject.ui.product.contents.title, false);
      assert.equal(subject.ui.product.contents.options, false);
    });

  });

  describe('data-variant_id', () => {

    it('should hide the options', () => {
      productNode = product({variant_id: 123});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.options, false);
    });

  });

  describe('data-redirect_to', () => {

    it('should set buttonDestination to modal if vaue is "product"', () => {
      productNode = product({redirect_to: 'product'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.buttonDestination, 'onlineStore');
    });

    it('should set the buttonDestination', () => {
      productNode = product({redirect_to: 'checkout'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.buttonDestination, 'checkout');
    });

    it('should style the product when destination is modal', () => {
      productNode = product({redirect_to: 'modal'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.buttonDestination, 'modal');
      assert.equal(subject.ui.product.contents.options, false);
      assert.equal(subject.ui.product.contents.button, false);
      assert.equal(subject.ui.product.styles.title['text-align'], 'center');
      assert.equal(subject.ui.product.styles.title['margin-top'], '20px');
      assert.equal(subject.ui.product.styles.prices['margin-left'], '0px');
      assert.equal(subject.ui.product.styles.prices.display, 'block');
      assert.equal(subject.ui.product.styles.prices['text-align'], 'center');
      assert.equal(subject.ui.product.styles.prices['margin-bottom'], '15px');
    });

  });

  describe('data-product_modal', () => {
    it('should do nothing', () => {
      productNode = product({product_modal: 'false'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.buttonDestination, undefined);
      assert.equal(subject.ui.product.contents.options, undefined);
    });

    it('should style the product when true', () => {
      productNode = product({product_modal: 'true'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.buttonDestination, 'modal');
      assert.equal(subject.ui.product.contents.options, false);
      assert.equal(subject.ui.product.contents.button, false);
      assert.equal(subject.ui.product.styles.title['text-align'], 'center');
      assert.equal(subject.ui.product.styles.title['margin-top'], '20px');
      assert.equal(subject.ui.product.styles.prices['margin-left'], '0px');
      assert.equal(subject.ui.product.styles.prices.display, 'block');
      assert.equal(subject.ui.product.styles.prices['text-align'], 'center');
      assert.equal(subject.ui.product.styles.prices['margin-bottom'], '15px');
    });

  });

  describe('data-buy_button_text', () => {
    it('should set the text of the buy button', () => {
      productNode = product({buy_button_text: 'test text'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.text.button, 'test text');
    });
  });

  describe('data-button_background_color', () => {
    it('should set all the button styles', () => {
      productNode = product({button_background_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.button['background-color'], '#abc123');
      assert.equal(subject.ui.cart.styles.button['background-color'], '#abc123');
      assert.equal(subject.ui.toggle.styles.toggle['background-color'], '#abc123');
    });
  });

  describe('data-button_text_color', () => {
    it('should set all the button styles', () => {
      productNode = product({button_text_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.button.color, '#abc123');
      assert.equal(subject.ui.cart.styles.button.color, '#abc123');
      assert.equal(subject.ui.modalProduct.styles.button.color, '#abc123');
      assert.equal(subject.ui.toggle.styles.toggle.color, '#abc123');
    });
  });

  describe('data-button_text_color', () => {
    it('should set all the button styles', () => {
      productNode = product({button_text_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.button.color, '#abc123');
      assert.equal(subject.ui.cart.styles.button.color, '#abc123');
      assert.equal(subject.ui.modalProduct.styles.button.color, '#abc123');
      assert.equal(subject.ui.toggle.styles.toggle.color, '#abc123');
    });
  });

  describe('data-background_color', () => {
    it('should set product styles', () => {
      productNode = product({background_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.wrapper['background-color'], '#abc123');
      assert.equal(subject.ui.product.styles.title['margin-left'], '20px');
      assert.equal(subject.ui.product.styles.title['margin-right'], '20px');
      assert.equal(subject.ui.product.styles.options['margin-left'], '20px');
      assert.equal(subject.ui.product.styles.options['margin-right'], '20px');
      assert.equal(subject.ui.product.styles.button['margin-left'], '20px');
      assert.equal(subject.ui.product.styles.button['margin-bottom'], '15px');
    });

    it('should set modal background', () => {
      productNode = product({background_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.modal.styles.wrapper['background-color'], '#abc123');
      assert.equal(subject.ui.modal.styles.footer['background-color'], '#abc123');
      assert.equal(subject.ui.modal.styles.footer['background-image'], 'none');
    })

    it('should set cart styles', () => {
      productNode = product({background_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.cart.styles.cart['background-color'], '#abc123');
      assert.equal(subject.ui.cart.styles.header['background-color'], 'transparent');
      assert.equal(subject.ui.cart.styles.lineItems['background-color'], 'transparent');
      assert.equal(subject.ui.cart.styles.footer['background-color'], 'transparent');
    });
  });

  describe('data-show_product_price', () => {
    it('should set the visibility of the price', () => {
      productNode = product({show_product_price: 'true'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.price, true);
    });
  });

  describe('data-show_product_title', () => {
    it('should set the visibility of the title', () => {
      productNode = product({show_product_title: 'true'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.contents.title, true);
    });
  });

  describe('data-product_title_color', () => {
    it('should set the color of the title', () => {
      productNode = product({product_title_color: 'abc123'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.styles.title.color, '#abc123');
    });
  });

  describe('data-buy_button_out_of_stock_text', () => {
    it('should set the text of the stock message', () => {
      productNode = product({buy_button_out_of_stock_text: 'nope'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.text.outOfStock, 'nope');
    });
  });

  describe('data-buy_button_product_unavailable_text', () => {
    it('should set the text of the unavailable message', () => {
      productNode = product({buy_button_product_unavailable_text: 'nope'});
      subject = new OptionsTransform(productNode);
      assert.equal(subject.ui.product.text.unavailable, 'nope');
    });
  });

  describe('isTruthy', () => {
    it('should return true if a true string is passed', () => {
      assert.equal(subject.isTruthy('true'), true)
    });

    it('should return true if a 1 string is passed', () => {
      assert.equal(subject.isTruthy('1'), true)
    });

    it('should return false if undefined', () => {
      assert.equal(subject.isTruthy(), false)
    });

    it('should return false if false string passed', () => {
      assert.equal(subject.isTruthy('false'), false)
    });

    it('should return false if 0 string passed', () => {
      assert.equal(subject.isTruthy('0'), false)
    });
  });

});
