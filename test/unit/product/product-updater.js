import Product from '../../../src/components/product';
import Updater from '../../../src/updater';
import Cart from '../../../src/components/cart';
import ShopifyBuy from '../../../src/buybutton';
import shopFixture from '../../fixtures/shop-info';
import productFixture from '../../fixtures/product-fixture';

const config = {
  id: 123,
  options: {
    product: {
      iframe: false,
    },
  },
};
const newConfig = {
  config: 'config',
  options: {
    config: 'config',
  },
};
let product;
let wrapper;
let configCopy;
let props;
let initStub;
let superUpdateConfigStub;

describe('Product Updater class', () => {
  beforeEach(() => {
    props = {
      client: ShopifyBuy.buildClient({
        domain: 'test.myshopify.com',
        storefrontAccessToken: 123,
      }),
      browserFeatures: {
        transition: true,
        animation: true,
        transform: true,
      },
      createCart() {
        return Promise.resolve(new Cart(config, {}));
      },
    };
    wrapper = document.createElement('div');
    sinon.stub(props.client.shop, 'fetchInfo').resolves(shopFixture);
    sinon.stub(props.client.product, 'fetch').resolves(productFixture);
    configCopy = Object.assign({}, config);
    configCopy.node = document.createElement('div');
    configCopy.node.setAttribute('id', 'fixture');
    document.body.appendChild(configCopy.node);
    product = new Product(configCopy, props);
    product.view.wrapper = wrapper;
    initStub = sinon.stub(product, 'init');
    superUpdateConfigStub = sinon.stub(Updater.prototype, 'updateConfig');
  });

  afterEach(() => {
    document.body.removeChild(configCopy.node);
    initStub.restore();
    superUpdateConfigStub.restore();
  });

  describe('updateConfig()', () => {
    describe('if id or variant id is supplied in config', () => {
      it('calls init and returns if id is updated', () => {
        product.updateConfig({id: 123});
        assert.calledOnce(initStub);
        assert.notCalled(superUpdateConfigStub);
        assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
      });

      it('calls init and returns if storefront id is updated', () => {
        product.updateConfig({storefrontId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw=='});
        assert.calledOnce(initStub);
        assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
      });

      it('calls init and returns if variant id is updated', () => {
        product.updateConfig({variantId: 12347});
        assert.calledOnce(initStub);
        assert.notCalled(superUpdateConfigStub);
        assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==');
      });

      it('calls init and returns if storefront variant id is updated', () => {
        product.updateConfig({storefrontVariantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng=='});
        assert.calledOnce(initStub);
        assert.notCalled(superUpdateConfigStub);
        assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng==');
      });
    });

    describe('when the component is in an iframe', () => {
      let addClassStub;
      let removeClassStub;
      let resizeStub;

      beforeEach(async () => {
        product.config.product.iframe = true;
        product.config.product.layout = 'layout';
        product = Object.defineProperty(product, 'classes', {
          value: {
            product: {
              vertical: 'vertical',
              horizontal: 'horizontal',
              layout: 'layout',
            },
          },
        });
        await product.view.init();
        addClassStub = sinon.spy(product.view.iframe, 'addClass');
        removeClassStub = sinon.spy(product.view.iframe, 'removeClass');
        resizeStub = sinon.stub(product.view, 'resize');
      });

      afterEach(() => {
        addClassStub.restore();
        removeClassStub.restore();
        resizeStub.restore();
      });

      describe('when config options contains product', () => {
        let setWidthStub;

        beforeEach(() => {
          product.view.iframe = Object.defineProperty(product.view.iframe, 'width', {
            writable: true,
          });
          setWidthStub = sinon.stub(product.view.iframe, 'setWidth');
        });

        afterEach(() => {
          setWidthStub.restore();
        });

        it('sets iframe width to width in options if layout is vertical and iframe width is 950px', () => {
          newConfig.options.product = {
            layout: 'vertical',
          };
          product.config.product.width = '50px';
          product.view.iframe.width = '950px';
          product.updateConfig(newConfig);
          assert.calledOnce(setWidthStub);
          assert.calledWith(setWidthStub, '50px');
        });

        it('sets iframe width to 950px if layout is horizontal and iframe width is not 950px', () => {
          newConfig.options.product = {
            layout: 'horizontal',
          };
          product.view.iframe.width = '10px';
          product.updateConfig(newConfig);
          assert.calledOnce(setWidthStub);
          assert.calledWith(setWidthStub, '950px');
        });

        it('sets iframe width to width in config if layout and width in config is vertical', () => {
          newConfig.options.product = {
            layout: 'vertical',
            width: 'vertical',
          };
          product.updateConfig(newConfig);
          assert.calledOnce(setWidthStub);
          assert.calledWith(setWidthStub, 'vertical');
        });

        it('sets iframe width to 100% if layout exists and does not meet previous criterias', () => {
          newConfig.options.product = {
            layout: 'vertical',
          };
          product.updateConfig(newConfig);
          assert.equal(product.view.iframe.el.style.width, '100%');
        });
      });

      it('removes vertical and horizontal class from iframe', () => {
        product.updateConfig(newConfig);
        assert.calledTwice(removeClassStub);
        assert.calledWith(removeClassStub.getCall(0), product.classes.product.vertical);
        assert.calledWith(removeClassStub.getCall(1), product.classes.product.horizontal);
      });

      it('adds layout class to iframe', () => {
        product.updateConfig(newConfig);
        assert.calledOnce(addClassStub);
        assert.calledWith(addClassStub, product.classes.product.layout);
      });

      it('resizes view', () => {
        product.updateConfig(newConfig);
        assert.calledOnce(resizeStub);
      });
    });

    it('adds an event listener on load to resize view for each image in the wrapper', () => {
      const resizeStub = sinon.stub(product.view, 'resize');
      const addEventListenerStub = sinon.stub(EventTarget.prototype, 'addEventListener');

      const image1 = document.createElement('img');
      wrapper.appendChild(image1);
      const image2 = document.createElement('img');
      wrapper.appendChild(image2);

      product.updateConfig(newConfig);
      assert.calledTwice(addEventListenerStub);
      assert.calledWith(addEventListenerStub.getCall(0), 'load', sinon.match.func);
      assert.calledWith(addEventListenerStub.getCall(1), 'load', sinon.match.func);

      addEventListenerStub.getCall(0).args[1]();
      assert.calledOnce(resizeStub);
      addEventListenerStub.getCall(1).args[1]();
      assert.calledTwice(resizeStub);

      resizeStub.restore();
      addEventListenerStub.restore();
    });

    it('calls super updateConfig', () => {
      product.updateConfig(newConfig);
      assert.calledOnce(superUpdateConfigStub);
      assert.calledWith(superUpdateConfigStub, newConfig);
    });

    it('updates config of cart if cart exists', () => {
      const updateConfigSpy = sinon.spy();
      product.cart = {
        updateConfig: updateConfigSpy,
      };
      product.updateConfig(newConfig);
      assert.calledOnce(updateConfigSpy);
      assert.calledWith(updateConfigSpy, newConfig);
    });

    it('updates config of modal if modal exists', () => {
      const updateConfigSpy = sinon.spy();
      product = Object.defineProperty(product, 'modalProductConfig', {
        value: {
          modalProductConfig: 'modalProductConfig',
        },
      });
      product.modal = {
        updateConfig: updateConfigSpy,
      };
      const expectedObject = {
        config: 'config',
        options: JSON.parse(JSON.stringify(product.config)),
      };
      expectedObject.options.product = product.modalProductConfig;

      product.updateConfig(newConfig);
      assert.calledOnce(updateConfigSpy);
      assert.calledWith(updateConfigSpy, expectedObject);
    });
  });
});
