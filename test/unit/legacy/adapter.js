import ShopifyBuy from '../../../src/shopify-buy-ui';
import UI from '../../../src/ui';
import adapter, {Adapter} from '../../../src/legacy/adapter';
import EmbedWrapper from '../../../src/legacy/embed-wrapper';
import {product} from '../../fixtures/legacy/elements';

describe('legacy/adapter', () => {
  let subject;
  let productNode;

  beforeEach(() => {
    subject = new Adapter();
    productNode = product();
    document.body.appendChild(productNode);
  });

  afterEach(() => {
    document.body.removeChild(productNode);
  });

  it('should export a new adapter', () => {
    assert.isOk(adapter instanceof Adapter);
  });

  it('should create embed wrappers for each data-embed_type element', () => {
    subject.init();
    assert.equal(subject.elements.length, 1);
    assert.isOk(subject.elements[0] instanceof EmbedWrapper);
  });

  it('should create a client and ui for each shop', () => {
    let createComponentStub = sinon.stub(UI.prototype, 'createComponent', () => {
      return Promise.resolve();
    });
    let buildClientStub = sinon.stub(ShopifyBuy, 'buildClient');
    subject.init();
    assert.called(buildClientStub);
    assert.called(createComponentStub);
    buildClientStub.restore();
  });

});