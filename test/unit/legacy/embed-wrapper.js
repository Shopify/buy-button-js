import EmbedWrapper from '../../../src/legacy/embed-wrapper';
import OptionsTransform from '../../../src/legacy/options-transform';
import {product, productWithVariant} from '../../fixtures/legacy/elements';

describe('legacy/embed-wrapper', () => {
  let subject;
  let productNode;

  beforeEach(() => {
    productNode = product();
    subject = new EmbedWrapper(productNode);
  });

  it('should export a new adapter', () => {
    assert.isOk(subject instanceof EmbedWrapper);
  });

  it('should create an OptionsTransform', () => {
    assert.isOk(subject.optionsTransform instanceof OptionsTransform);
  });

  it('should set the embeds shop', () => {
    assert.equal(subject.shop, 'can-i-buy-a-feeling.myshopify.com');
  });

  it('should set the embedConfig', () => {
    assert.deepEqual(subject.embedConfig, {
      handle: 'anger',
      node: productNode,
      options: subject.optionsTransform.uiOptions,
    });
  });

  it('should set the embedConfig variantId if set', () => {
    productNode = productWithVariant();
    subject = new EmbedWrapper(productNode);
    assert.equal(subject.embedConfig.variantId, 20100569478);
  });

  it('should not set the embedConfig variantId if not set', () => {
    assert.equal(subject.embedConfig.variantId, undefined);
  });

  describe('.render()', () => {

    it('should create a client and ui for each shop', () => {
      let uiMock = {createComponent: ()=> true};
      let createComponentStub = sinon.stub(uiMock, 'createComponent', () => Promise.resolve());

      subject.render(uiMock);

      assert.calledWith(createComponentStub, 'product', {
        handle: 'anger',
        node: productNode,
        options: subject.optionsTransform.uiOptions,
      });
    });

  });

});

