import Product from '../../../src/components/product';
import Cart from '../../../src/components/cart';
import ShopifyBuy from '../../../src/buybutton';
import shopFixture from '../../fixtures/shop-info';
import productFixture from '../../fixtures/product-fixture';
import View from '../../../src/view';

const config = {
  id: 123,
  options: {
    product: {
      iframe: false,
    },
  },
};
const props = {
  client: ShopifyBuy.buildClient({
    domain: 'test.myshopify.com',
    storefrontAccessToken: 123,
  }),
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
};
let product;
let testProductCopy;
let configCopy;

describe('Product View class', () => {
  let fetchInfoStub;
  let fetchStub;

  beforeEach(() => {
    fetchInfoStub = sinon.stub(props.client.shop, 'fetchInfo').resolves(shopFixture);
    fetchStub = sinon.stub(props.client.product, 'fetch').resolves(productFixture);
    configCopy = Object.assign({}, config);
    configCopy.node = document.createElement('div');
    configCopy.node.setAttribute('id', 'fixture');
    document.body.appendChild(configCopy.node);
    testProductCopy = Object.assign({}, productFixture);
    product = new Product(configCopy, props);
  });

  afterEach(() => {
    fetchInfoStub.restore();
    fetchStub.restore();
    document.body.removeChild(configCopy.node);
  });

  describe('resizeOnLoad', () => {
    let resizeStub;
    let addEventListenerStub;
    let wrapper;

    beforeEach(() => {
      resizeStub = sinon.stub(View.prototype, 'resize');
      addEventListenerStub = sinon.stub(EventTarget.prototype, 'addEventListener');
      product = Object.defineProperty(product, 'classes', {
        value: {
          product: {
            img: 'img-class',
          },
        },
      });
      wrapper = document.createElement('div');
      product.view.wrapper = wrapper;
    });

    afterEach(() => {
      resizeStub.restore();
      addEventListenerStub.restore();
    });

    it('does not add event listener if product contents do not have an image or image with carousel', () => {
      product.config.product.contents = {
        img: null,
        imgWithCarousel: null,
      };

      product.view.resizeOnLoad();
      assert.notCalled(addEventListenerStub);
    });

    it('does not add event listener if there is no image in the wrapper', () => {
      const node = document.createElement('div');
      node.className += 'not-img-class';
      wrapper.appendChild(node);
      product.config.product.contents = {
        img: {id: '123'},
        imgWithCarousel: null,
      };

      product.view.resizeOnLoad();
      assert.notCalled(addEventListenerStub);
    });

    it('adds resize event listener on load if product contents have an image and there is an image in the wrapper', () => {
      const node = document.createElement('div');
      node.className += 'img-class';
      wrapper.appendChild(node);
      product.config.product.contents = {
        img: {id: '123'},
        imgWithCarousel: null,
      };

      product.view.resizeOnLoad();
      assert.calledOnce(addEventListenerStub);
      assert.calledWith(addEventListenerStub, 'load', sinon.match.func);
      addEventListenerStub.getCall(0).args[1]();
      assert.calledOnce(resizeStub);
    });

    it('adds resize event listener on load if product contents have an image with a carousel and there is an image in the wrapper', () => {
      const node = document.createElement('div');
      node.className += 'img-class';
      wrapper.appendChild(node);
      product.config.product.contents = {
        img: null,
        imgWithCarousel: {id: '123'},
      };

      product.view.resizeOnLoad();
      assert.calledOnce(addEventListenerStub);
      assert.calledWith(addEventListenerStub, 'load', sinon.match.func);
      addEventListenerStub.getCall(0).args[1]();
      assert.calledOnce(resizeStub);
    });
  });

  describe('render', () => {
    let superRenderStub;
    let resizeOnLoadStub;

    beforeEach(() => {
      superRenderStub = sinon.stub(View.prototype, 'render');
      resizeOnLoadStub = sinon.stub(product.view, 'resizeOnLoad');
    });

    afterEach(() => {
      superRenderStub.restore();
      resizeOnLoadStub.restore();
    });

    it('calls super render', () => {
      product.view.render();
      assert.calledOnce(superRenderStub);
    });

    it('resizes on load', () => {
      product.view.render();
      assert.calledOnce(resizeOnLoadStub);
    });
  });

  describe('wrapTemplate()', () => {
    beforeEach(async () => {
      await product.init(testProductCopy);
      product = Object.defineProperty(product, 'isButton', {
        writable: true,
      });
    });

    it('wraps html in a div with wrapper class and product class if the component is not a button', () => {
      product.isButton = false;
      const htmlString = product.view.wrapTemplate('test');
      assert.equal(htmlString, `<div class="${product.view.wrapperClass} ${product.classes.product.product}">test</div>`);
    });

    describe('if the component is a button', () => {
      it('wraps html in a button with "View details" as aria label if button destination is modal', () => {
        product.isButton = true;
        product.config.product.buttonDestination = 'modal';
        const htmlString = product.view.wrapTemplate('test');
        assert.equal(htmlString, `<div class="${product.view.wrapperClass} ${product.classes.product.product}"><div tabindex="0" role="button" aria-label="View details" class="${product.classes.product.blockButton}">test</div></div>`);
      });

      it('wraps html in a button with "Add to cart" as aria label if button destination is cart', () => {
        product.isButton = true;
        product.config.product.buttonDestination = 'cart';
        const htmlString = product.view.wrapTemplate('test');
        assert.equal(htmlString, `<div class="${product.view.wrapperClass} ${product.classes.product.product}"><div tabindex="0" role="button" aria-label="Add to cart" class="${product.classes.product.blockButton}">test</div></div>`);
      });

      it('wraps html in a button with "Buy Now" as aria label if button destination is checkout', () => {
        product.isButton = true;
        product.config.product.buttonDestination = 'checkout';
        const htmlString = product.view.wrapTemplate('test');
        assert.equal(htmlString, `<div class="${product.view.wrapperClass} ${product.classes.product.product}"><div tabindex="0" role="button" aria-label="Buy Now" class="${product.classes.product.blockButton}">test</div></div>`);
      });
    });
  });

  describe('getters', () => {
    describe('className', () => {
      it('returns product class name of layout', () => {
        product.view.component = {
          classes: {
            product: {
              layout: 'class-name',
            },
          },
          options: {
            layout: 'layout',
          },
        };
        assert.equal(product.view.className, product.view.component.classes.product.layout);
      });
    });

    describe('shouldResizeX', () => {
      it('returns false', () => {
        assert.isFalse(product.view.shouldResizeX);
      });
    });

    describe('shouldResizeY', () => {
      it('returns true', () => {
        assert.isTrue(product.view.shouldResizeY);
      });
    });

    describe('outerHeight', () => {
      it('returns client height of wrapper', () => {
        product.view.wrapper = {
          clientHeight: 50,
        };
        assert.equal(product.view.outerHeight, '50px');
      });
    });

    describe('wrapperClass', () => {
      beforeEach(() => {
        product.view.component = Object.defineProperty(product.view.component, 'currentImage', {
          writable: true,
        });
      });

      it('contains has-image class if component has a current image', () => {
        product.view.component.currentImage = {id: '123'};
        assert.include(product.view.wrapperClass, 'has-image');
      });

      it('contains no-image class if component does not have a current image', () => {
        product.view.component.currentImage = null;
        assert.include(product.view.wrapperClass, 'no-image');
      });

      it('contains the product class name of layout', () => {
        product.view.component = {
          classes: {
            product: {
              layout: 'class-name',
            },
          },
          options: {
            layout: 'layout',
          },
        };
        assert.include(product.view.wrapperClass, product.view.component.classes.product.layout);
      });
    });
  });
});
