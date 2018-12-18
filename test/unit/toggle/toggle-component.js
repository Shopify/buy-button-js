import Toggle from '../../../src/components/toggle';
import ToggleView from '../../../src/views/toggle';

describe('Toggle Component class', () => {
  let toggle;
  let cart;
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  describe('constructor', () => {
    beforeEach(() => {
      cart = {
        node: document.createElement('div'),
      };
      document.body.appendChild(cart.node);
    });

    afterEach(() => {
      document.body.removeChild(cart.node);
    });

    it('sets typeKey to toggle', () => {
      toggle = new Toggle({node}, {cart});
      assert.equal(toggle.typeKey, 'toggle');
    });

    it('sets node to node in config if provided', () => {
      toggle = new Toggle({node}, {cart});
      assert.equal(toggle.node, node);
    });

    it('sets node to a div element before cart node if config does not provide node', () => {
      const div = document.createElement('div');
      const insertBeforeStub = sinon.stub(Node.prototype, 'insertBefore').returns(node);
      const createElementStub = sinon.stub(document, 'createElement').returns(div);

      toggle = new Toggle({}, {cart});
      assert.calledOnce(insertBeforeStub);
      assert.calledWith(insertBeforeStub, div, cart.node);
      assert.equal(toggle.node, node);

      insertBeforeStub.restore();
      createElementStub.restore();
    });

    it('creates a new toggle view', () => {
      toggle = new Toggle({node}, {cart});
      assert.instanceOf(toggle.view, ToggleView);
    });
  });

  describe('prototype methods', () => {
    let toggleVisibilitySpy;

    beforeEach(() => {
      toggleVisibilitySpy = sinon.spy();
      cart = {
        node: document.createElement('div'),
        toggleVisibility: toggleVisibilitySpy,
        model: {
          lineItems: [
            {
              id: 1,
              quantity: 1,
            },
            {
              id: 2,
              quantity: 2,
            },
          ],
        },
      };
      document.body.appendChild(cart.node);
      toggle = new Toggle({node}, {cart});
    });

    afterEach(() => {
      document.body.removeChild(cart.node);
    });

    describe('toggleCart()', () => {
      let stopPropagationSpy;

      beforeEach(() => {
        stopPropagationSpy = sinon.spy();
        const event = {
          stopPropagation: stopPropagationSpy,
        };
        toggle.toggleCart(event);
      });

      it('stops event propagation', () => {
        assert.calledOnce(stopPropagationSpy);
      });

      it('toggles visibility in cart', () => {
        assert.calledOnce(toggleVisibilitySpy);
      });
    });

    describe('getters', () => {
      describe('count', () => {
        it('returns the total quantity of all line items in cart model', () => {
          assert.equal(toggle.count, 3);
        });
      });

      describe('viewData', () => {
        it('returns an object with viewData from options', () => {
          toggle.config.toggle.viewData = {
            viewData: {},
          };
          assert.deepInclude(toggle.viewData, toggle.options.viewData);
        });

        it('returns an object that holds classes, text, and count', () => {
          toggle.config.toggle.text = 'text';
          const expectedObject = {
            classes: toggle.classes,
            text: toggle.options.text,
            count: toggle.count,
          };
          assert.deepInclude(toggle.viewData, expectedObject);
        });
      });

      describe('DOMEvents', () => {
        it('returns an object with DOMEvents from options', () => {
          toggle.config.toggle.DOMEvents = {
            DOMEvents: {},
          };
          assert.deepInclude(toggle.DOMEvents, toggle.options.DOMEvents);
        });

        it('returns an object with a click key holding toggleCart as its value', () => {
          const toggleCartStub = sinon.stub(toggle, 'toggleCart');
          toggle.DOMEvents.click();
          assert.calledOnce(toggleCartStub);
          toggleCartStub.restore();
        });
      });
    });
  });
});
