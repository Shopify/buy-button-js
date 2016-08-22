import OptionsTransform from '../../../src/legacy/options-transform';
import {collection} from '../../fixtures/legacy/elements';

describe('legacy/options-transform/collection', () => {
  let subject;
  let collectionNode;

  beforeEach(() => {
    collectionNode = collection();
    subject = new OptionsTransform(collectionNode);
  });

  it('should define embedType', () => {
    assert.equal(subject.embedType, 'collection');
  });

  it('should parse legacy options from the element', () => {
    assert.deepEqual(subject.legacyOptions, {
      embed_type: 'collection',
      shop: 'can-i-buy-a-feeling.myshopify.com',
      collection_handle: "premium-feelings",
    });
  });

  describe('data-display_size', () => {
    it('should not handle display_size="compact"', () => {
      collectionNode = collection({display_size: 'compact'});
      subject = new OptionsTransform(collectionNode);
      assert.notEqual(subject.uiOptions.product.styles.wrapper.width, '230px');
    });
  })

  describe('data-has_image', () => {

    it('should hide the image', () => {
      collectionNode = collection({has_image: 'false'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.contents.img, false);
    });

  });

  describe('data-variant_id', () => {

    it('should do nothing', () => {
      collectionNode = collection({variant_id: 123});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.contents.options, undefined);
    });

  });

  describe('data-redirect_to', () => {

    it('should set buttonDestination to modal if vaue is "product"', () => {
      collectionNode = collection({redirect_to: 'product'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.buttonDestination, 'modal');
    });

    it('should set the buttonDestination', () => {
      collectionNode = collection({redirect_to: 'checkout'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.buttonDestination, 'checkout');
    });

    it('should style the product when destination is modal', () => {
      collectionNode = collection({redirect_to: 'modal'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.buttonDestination, 'modal');
      assert.equal(subject.uiOptions.product.contents.options, false);
      assert.equal(subject.uiOptions.product.contents.button, false);
      assert.equal(subject.uiOptions.product.styles.title['text-align'], 'center');
      assert.equal(subject.uiOptions.product.styles.title['margin-top'], '20px');
      assert.equal(subject.uiOptions.product.styles.prices['margin-left'], '0px');
      assert.equal(subject.uiOptions.product.styles.prices.display, 'block');
      assert.equal(subject.uiOptions.product.styles.prices['text-align'], 'center');
      assert.equal(subject.uiOptions.product.styles.prices['margin-bottom'], '15px');
    });

  });

  describe('data-product_modal', () => {
    it('should do nothing', () => {
      collectionNode = collection({product_modal: 'false'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.buttonDestination, undefined);
      assert.equal(subject.uiOptions.product.contents.options, undefined);
    });

    it('should style the product when true', () => {
      collectionNode = collection({product_modal: 'true'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.buttonDestination, 'modal');
      assert.equal(subject.uiOptions.product.contents.options, false);
      assert.equal(subject.uiOptions.product.contents.button, false);
      assert.equal(subject.uiOptions.product.styles.title['text-align'], 'center');
      assert.equal(subject.uiOptions.product.styles.title['margin-top'], '20px');
      assert.equal(subject.uiOptions.product.styles.prices['margin-left'], '0px');
      assert.equal(subject.uiOptions.product.styles.prices.display, 'block');
      assert.equal(subject.uiOptions.product.styles.prices['text-align'], 'center');
      assert.equal(subject.uiOptions.product.styles.prices['margin-bottom'], '15px');
    });

  });

  describe('data-buy_button_text', () => {
    it('should set the text of the buy button', () => {
      collectionNode = collection({buy_button_text: 'test text'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.text.button, 'test text');
    });
  });

  describe('data-button_background_color', () => {
    it('should set all the button styles', () => {
      collectionNode = collection({button_background_color: 'abc123'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.styles.button['background-color'], '#abc123');
      assert.equal(subject.uiOptions.cart.styles.button['background-color'], '#abc123');
      assert.equal(subject.uiOptions.modalProduct.styles.button['background-color'], '#abc123');
      assert.equal(subject.uiOptions.toggle.styles.toggle['background-color'], '#abc123');
    });
  });

  describe('data-button_text_color', () => {
    it('should set all the button styles', () => {
      collectionNode = collection({button_text_color: 'abc123'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.styles.button.color, '#abc123');
      assert.equal(subject.uiOptions.cart.styles.button.color, '#abc123');
      assert.equal(subject.uiOptions.modalProduct.styles.button.color, '#abc123');
      assert.equal(subject.uiOptions.toggle.styles.toggle.color, '#abc123');
    });
  });


  describe('data-background_color', () => {
    it('should set not collection styles', () => {
      collectionNode = collection({background_color: 'abc123'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.product.styles.wrapper['background-color'], undefined);
    });

    it('should set modal background', () => {
      collectionNode = collection({background_color: 'abc123'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.modal.styles.wrapper['background-color'], '#abc123');
      assert.equal(subject.uiOptions.modal.styles.footer['background-color'], '#abc123');
      assert.equal(subject.uiOptions.modal.styles.footer['background-image'], 'none');
    })

    it('should set cart styles', () => {
      collectionNode = collection({background_color: 'abc123'});
      subject = new OptionsTransform(collectionNode);
      assert.equal(subject.uiOptions.cart.styles.cart['background-color'], '#abc123');
      assert.equal(subject.uiOptions.cart.styles.header['background-color'], 'transparent');
      assert.equal(subject.uiOptions.cart.styles.lineItems['background-color'], 'transparent');
      assert.equal(subject.uiOptions.cart.styles.footer['background-color'], 'transparent');
    });
  });

});