import Product from '../../../src/components/product';
import Cart from '../../../src/components/cart';
import Modal from '../../../src/components/modal';
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
let product;
let testProductCopy;
let configCopy;

describe('Product Updater class', () => {
  let props;
  let closeModalSpy;

  beforeEach(() => {
    closeModalSpy = sinon.spy();
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
        return Promise.resolve(new Cart(config, {
          tracker: {
            trackMethod: (fn) => {
              return function(...params) {
                fn(...params);
              };
            },
          },
        }));
      },
      createModal() {
        return new Modal(config, props);
      },
      closeModal: closeModalSpy,
    };
    sinon.stub(props.client.shop, 'fetchInfo').resolves(shopFixture);
    sinon.stub(props.client.product, 'fetch').resolves(productFixture);
    configCopy = Object.assign({}, config);
    configCopy.node = document.createElement('div');
    configCopy.node.setAttribute('id', 'fixture');
    document.body.appendChild(configCopy.node);
    testProductCopy = Object.assign({}, productFixture);
    product = new Product(configCopy, props);
  });

  afterEach(() => {
    document.body.removeChild(configCopy.node);
  });

  describe('updateConfig()', () => {
    const newConfig = {
      options: {
        modalProduct: {
          layout: 'vertical',
        },
      },
    };

    beforeEach(async () => {
      await product.init(testProductCopy);
    });

    it('calls updateConfig on cart', () => {
      const cartUpdateConfigSpy = sinon.stub(product.cart, 'updateConfig');
      product.updateConfig(newConfig);
      assert.calledWith(cartUpdateConfigSpy, newConfig);
    });

    it('calls updateConfig on modal if modal exists', async () => {
      const modalProduct = new Product({
        node: configCopy.node,
        options: Object.assign({}, configCopy.options, {
          product: Object.assign({}, configCopy.options.product, {
            buttonDestination: 'modal',
          }),
        }),
      }, props);
      await modalProduct.init(testProductCopy);
      await modalProduct.openModal();
      const cartUpdateConfigSpy = sinon.spy();
      modalProduct.cart = {
        updateConfig: cartUpdateConfigSpy,
      };
      const modalUpdateConfigSpy = sinon.spy(modalProduct.modal, 'updateConfig');
      modalProduct.updateConfig(newConfig);
      assert.calledWith(modalUpdateConfigSpy, sinon.match.object);
      assert.equal(modalProduct.modal.config.product.layout, 'vertical');
      assert.calledWith(cartUpdateConfigSpy, newConfig);
      modalUpdateConfigSpy.restore();
      modalProduct.modal.destroy();
    });

    describe('when updating ID, storefront ID, variant ID, or storefront variant ID', () => {
      let initSpy;

      beforeEach(() => {
        initSpy = sinon.spy(product, 'init');
      });

      it('calls init if ID updated', () => {
        product.updateConfig({id: 123});
        assert.calledOnce(initSpy);
        assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
      });

      it('calls init if storefront ID updated', () => {
        product.updateConfig({storefrontId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw=='});
        assert.calledOnce(initSpy);
        assert.equal(product.storefrontId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzEyMw==');
      });

      it('calls init if variant ID updated', () => {
        product.updateConfig({variantId: 12347});
        assert.calledOnce(initSpy);
        assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Nw==');
      });

      it('calls init if storefront variant ID updated', () => {
        product.updateConfig({storefrontVariantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng=='});
        assert.calledOnce(initSpy);
        assert.equal(product.defaultStorefrontVariantId, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xMjM0Ng==');
      });
    });
  });
});
