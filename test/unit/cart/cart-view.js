import Cart from '../../../src/components/cart';
import ShopifyBuy from '../../../src/buybutton';
import View from '../../../src/view';
import * as elementClass from '../../../src/utils/element-class';

const config = {
  options: {
    cart: {
      contents: {
        title: false,
        note: true,
      },
      text: {
        notice: 'test',
      },
    },
  },
};

const props = {
  client: ShopifyBuy.buildClient({
    domain: 'test.myshopify.com',
    storefrontAccessToken: 123,
  }),
  browserFeatures: {
    transition: true,
    animation: true,
    transform: true,
  },
};

describe('Cart View class', () => {
  let cart;
  let removeClassFromElementStub;
  let removeClassStub;

  beforeEach(() => {
    cart = new Cart(config, props);
    cart.view.iframe = {
      el: document.createElement('iframe'),
    };
    removeClassFromElementStub = sinon.stub(elementClass, 'removeClassFromElement');
    removeClassStub = sinon.stub(View.prototype, 'removeClass');
  });

  afterEach(() => {
    cart.destroy();
    removeClassFromElementStub.restore();
    removeClassStub.restore();
  });

  describe('render', () => {
    let superRenderStub;
    let addClassStub;
    let addClassToElementStub;

    beforeEach(() => {
      superRenderStub = sinon.stub(View.prototype, 'render');
      addClassStub = sinon.stub(View.prototype, 'addClass');
      addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');
    });

    afterEach(() => {
      superRenderStub.restore();
      addClassStub.restore();
      addClassToElementStub.restore();
    });

    it('calls super render', () => {
      cart.view.render();
      assert.calledOnce(superRenderStub);
    });

    describe('component is visible', () => {
      beforeEach(() => {
        cart.isVisible = true;
      });

      it('adds is-active, is-visible, and is-initialized classes to the view', () => {
        cart.view.render();
        assert.calledThrice(addClassStub);
        assert.calledWith(addClassStub, 'is-active');
        assert.calledWith(addClassStub, 'is-visible');
        assert.calledWith(addClassStub, 'is-initialized');
      });

      it('adds is-block class to the iframe element if it exists', () => {
        cart.view.iframe = {
          el: '<iframe />',
        };
        cart.view.render();
        assert.calledOnce(addClassToElementStub);
        assert.calledWith(addClassToElementStub, 'is-block', cart.view.iframe.el);
      });

      it('does not add the is-block class to the iframe element if it does not exist', () => {
        cart.view.iframe = null;
        cart.view.render();
        assert.notCalled(addClassToElementStub);
      });
    });

    describe('component is not visible', () => {
      beforeEach(() => {
        cart.isVisible = false;
      });

      it('removes is-active class from the view', () => {
        cart.view.render();
        assert.calledWith(removeClassStub, 'is-active');
      });

      it('removes is-visible class from the view if the browser does not support the transition feature', () => {
        cart.props.browserFeatures.transition = false;
        cart.view.render();
        assert.calledWith(removeClassStub, 'is-visible');
      });

      it('does not remove the is-visible class from the view if the browser supports the transition feature', () => {
        cart.props.browserFeatures.transition = true;
        cart.view.render();
        assert.neverCalledWith(removeClassStub, 'is-visible');
      });

      it('removes is-block class from the iframe element if the browser does not support the transition feature and the iframe exists', () => {
        cart.view.iframe = {
          el: '<iframe />',
        };
        cart.props.browserFeatures.transition = false;
        cart.view.render();
        assert.calledOnce(removeClassFromElementStub);
        assert.calledWith(removeClassFromElementStub, 'is-block', cart.view.iframe.el);
      });

      it('does not remove is-block class from the iframe element if the iframe exists and the browser supports the transition feature', () => {
        cart.view.iframe = {
          el: '<iframe />',
        };
        cart.props.browserFeatures.transition = true;
        cart.view.render();
        assert.notCalled(removeClassFromElementStub);
      });

      it('does not remove is-block class from the iframe element if the iframe does not exists and the browser does not support the transition feature', () => {
        cart.view.iframe = null;
        cart.props.browserFeatures.transition = false;
        cart.view.render();
        assert.notCalled(removeClassFromElementStub);
      });

      it('does not remove is-block class from the iframe element if the iframe does not exists and the browser supports the transition feature', () => {
        cart.view.iframe = null;
        cart.props.browserFeatures.transition = true;
        cart.view.render();
        assert.notCalled(removeClassFromElementStub);
      });
    });
  });

  describe('delegateEvents', () => {
    let superDelegateEventsStub;
    let addEventListenerStub;

    beforeEach(() => {
      superDelegateEventsStub = sinon.stub(View.prototype, 'delegateEvents');
      addEventListenerStub = sinon.stub(cart.node, 'addEventListener');
    });

    afterEach(() => {
      superDelegateEventsStub.restore();
      addEventListenerStub.restore();
    });

    it('calls super delegateEvents', () => {
      cart.view.delegateEvents();
      assert.calledOnce(superDelegateEventsStub);
    });

    it('does not add a transitionend event listener if the browser does not support the transition feature', () => {
      cart.props.browserFeatures.transition = false;
      cart.view.delegateEvents();
      assert.notCalled(addEventListenerStub);
    });

    describe('browser supports transition feature', () => {
      beforeEach(() => {
        cart.props.browserFeatures.transition = true;
      });

      it('adds a transitionend event listener to the node', () => {
        cart.view.delegateEvents();
        assert.calledOnce(addEventListenerStub);
        assert.calledWith(addEventListenerStub, 'transitionend');
      });

      it('removes the is-visible class from the view on transitionend if the component is not visible', () => {
        cart.view.delegateEvents();
        cart.isVisible = false;
        addEventListenerStub.getCall(0).args[1]();

        assert.calledOnce(removeClassStub);
        assert.calledWith(removeClassStub, 'is-visible');
      });

      it('does not remove the is-visible class from the view on transitionend if the component is visible', () => {
        cart.view.delegateEvents();
        cart.isVisible = true;
        addEventListenerStub.getCall(0).args[1]();

        assert.notCalled(removeClassStub);
      });

      it('removes the is-block class from the iframe element on transitionend if the component is not visible and the iframe exists', () => {
        cart.view.iframe = {
          el: '<iframe />',
        };
        cart.view.delegateEvents();
        cart.isVisible = false;
        addEventListenerStub.getCall(0).args[1]();

        assert.calledOnce(removeClassFromElementStub);
        assert.calledWith(removeClassFromElementStub, 'is-block', cart.view.iframe.el);
      });

      it('does not remove the is-block class from the iframe element on transitionend if the component is visible', () => {
        cart.view.iframe = {
          el: '<iframe />',
        };
        cart.view.delegateEvents();
        cart.isVisible = true;
        addEventListenerStub.getCall(0).args[1]();

        assert.notCalled(removeClassFromElementStub);
      });

      it('does not remove the is-block class from the iframe element on transitionend if the component is not visible and the iframe does not exist', () => {
        cart.view.iframe = null
        cart.view.delegateEvents();
        cart.isVisible = false;
        addEventListenerStub.getCall(0).args[1]();

        assert.notCalled(removeClassFromElementStub);
      });

      it('does not remove the is-block class from the iframe element on transitionend if the component is visible and the iframe does not exist', () => {
        cart.view.iframe = null
        cart.view.delegateEvents();
        cart.isVisible = true;
        addEventListenerStub.getCall(0).args[1]();

        assert.notCalled(removeClassFromElementStub);
      });
    });
  });

  describe('wrapTemplate', () => {
    it('return the argument wrapped in a div with the cart class', () => {
      const html = '<div>test html</div>';
      const mockClass = 'mockClass';
      cart.classes.cart.cart = mockClass;
      cart.view.wrapTemplate(html);
      assert.equal(cart.view.wrapTemplate(html), `<div class="${mockClass}">${html}</div>`);
    });
  });

  describe('get wrapperClass', () => {
    it('returns `is-active` if the cart is visible', () => {
      cart.isVisible = true;
      assert.equal(cart.view.wrapperClass, 'is-active');
    });

    it('returns an empty string if the cart is not visible', () => {
      cart.isVisible = false;
      assert.equal(cart.view.wrapperClass, '');
    });
  });
});
