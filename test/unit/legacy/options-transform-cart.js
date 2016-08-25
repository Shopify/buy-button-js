import OptionsTransform from '../../../src/legacy/options-transform';
import {cart} from '../../fixtures/legacy/elements';

describe('legacy/options-transform/cart', () => {
  let subject;
  let cartNode;

  beforeEach(() => {
    cartNode = cart();
    subject = new OptionsTransform(cartNode);
  });

  it('should define embedType', () => {
    assert.equal(subject.embedType, 'cart');
  });

  it('should parse legacy options from the element', () => {
    assert.deepEqual(subject.legacy, {
      embed_type: 'cart',
      shop: 'can-i-buy-a-feeling.myshopify.com',
    });
  });

  describe('data-has_image', () => {
    it('should hide the image', () => {
      cartNode = cart({has_image: 'false'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.contents.img, false);
    });
  });


  describe('data-redirect_to', () => {
    it('should set buttonDestination to modal if vaue is "product"', () => {
      cartNode = cart({redirect_to: 'product'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.buttonDestination, 'onlineStore');
    });

    it('should set the buttonDestination', () => {
      cartNode = cart({redirect_to: 'checkout'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.buttonDestination, 'checkout');
    });

    it('should style the product when destination is modal', () => {
      cartNode = cart({redirect_to: 'modal'});
      subject = new OptionsTransform(cartNode);
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
      cartNode = cart({product_modal: 'false'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.buttonDestination, undefined);
      assert.equal(subject.ui.product.contents.options, undefined);
    });

    it('should style the product when true', () => {
      cartNode = cart({product_modal: 'true'});
      subject = new OptionsTransform(cartNode);
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
      cartNode = cart({buy_button_text: 'test text'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.text.button, 'test text');
    });
  });

  describe('data-button_background_color', () => {
    it('should set all the button styles', () => {
      cartNode = cart({button_background_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.styles.button['background-color'], '#abc123');
      assert.equal(subject.ui.cart.styles.button['background-color'], '#abc123');
      assert.equal(subject.ui.toggle.styles.toggle['background-color'], '#abc123');
    });
  });

  describe('data-button_text_color', () => {
    it('should set all the button styles', () => {
      cartNode = cart({button_text_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.product.styles.button.color, '#abc123');
      assert.equal(subject.ui.cart.styles.button.color, '#abc123');
      assert.equal(subject.ui.modalProduct.styles.button.color, '#abc123');
      assert.equal(subject.ui.toggle.styles.toggle.color, '#abc123');
    });
  });

  describe('data-background_color', () => {
    it('should set modal background', () => {
      cartNode = cart({background_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.modal.styles.wrapper['background-color'], '#abc123');
      assert.equal(subject.ui.modal.styles.footer['background-color'], '#abc123');
      assert.equal(subject.ui.modal.styles.footer['background-image'], 'none');
    })

    it('should set cart styles', () => {
      cartNode = cart({background_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.styles.cart['background-color'], '#abc123');
      assert.equal(subject.ui.cart.styles.header['background-color'], 'transparent');
      assert.equal(subject.ui.cart.styles.lineItems['background-color'], 'transparent');
      assert.equal(subject.ui.cart.styles.footer['background-color'], 'transparent');
    });
  });

  describe('data-checkout_button_text', () => {
    it('should set the text of the checkout button', () => {
      cartNode = cart({checkout_button_text: 'nope'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.text.button, 'nope');
    });
  });

  describe('data-text_color_transform', () => {
    it('should set the color of the line items', () => {
      cartNode = cart({text_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.styles.lineItems.color, '#abc123');
      assert.equal(subject.ui.cart.styles.subtotal.color, '#abc123');
    });
  });

  describe('data-accent_color_transform', () => {
    it('should set the color of the line items', () => {
      cartNode = cart({accent_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.lineItem.styles.variantTitle.color, '#abc123');
      assert.equal(subject.ui.lineItem.styles.quantity.color, '#abc123');
      assert.equal(subject.ui.lineItem.styles.quantityInput.color, '#abc123');
      assert.equal(subject.ui.lineItem.styles.quantityButton.color, '#abc123');
    });
    it('should set the color of the cart accents', () => {
      cartNode = cart({accent_color: 'abc123'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.styles.title.color, '#abc123');
      assert.equal(subject.ui.cart.styles.close.color, '#abc123');
      assert.equal(subject.ui.cart.styles.footer['border-top'], '1px solid #abc123');
    });
  });

  describe('data-cart_title', () => {
    it('should set the text of the cart title', () => {
      cartNode = cart({cart_title: 'your cart'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.text.title, 'your cart');
    });
  });

  describe('data-cart_total_text', () => {
    it('should set the text of the cart total label', () => {
      cartNode = cart({cart_total_text: 'your total'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.text.total, 'your total');
    });
  });

  describe('data-discount_notice_text', () => {
    it('should set the text of the cart total label', () => {
      cartNode = cart({discount_notice_text: 'nope'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.text.notice, 'nope');
    });
  });

  describe('data-empty_cart_text', () => {
    it('should set the text of the empty cart', () => {
      cartNode = cart({empty_cart_text: 'nope'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.cart.text.empty, 'nope');
    });
  });

  describe('data-next_page_button_text', () => {
    it('should set the text of the empty cart', () => {
      cartNode = cart({next_page_button_text: 'nope'});
      subject = new OptionsTransform(cartNode);
      assert.equal(subject.ui.productSet.text.nextPageButton, 'nope');
    });
  });

});
