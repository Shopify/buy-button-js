import ShopifyBuy from '../../../src/shopify-buy-ui';
import adapter, {Adapter} from '../../../src/legacy/adapter';
import EmbedWrapper from '../../../src/legacy/embed-wrapper';
import {product} from '../../fixtures/legacy/elements';

describe('legacy/adapter', () => {
  let subject;
  let productNode;

  beforeEach(() => {
    subject = new Adapter;
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
    let uiMock = {createComponent: ()=> true};
    let createComponentStub = sinon.stub(uiMock, 'createComponent', () => Promise.resolve());
    let buildClientStub = sinon.stub(ShopifyBuy, 'buildClient');
    let initStub = sinon.stub(ShopifyBuy.UI, 'init', () => uiMock);
    subject.init();
    assert.called(buildClientStub);
    assert.called(initStub);
    assert.called(createComponentStub);
    buildClientStub.restore();
    initStub.restore();
  });

});
