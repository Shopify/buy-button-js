import Toggle from '../../../src/components/toggle';
import ToggleView from '../../../src/views/toggle';

describe('Toggle Component class', () => {
  let toggle;
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  describe('constructor', () => {
    it('sets typeKey to toggle', () => {
      toggle = new Toggle({node}, {});
      assert.equal(toggle.typeKey, 'toggle');
    });

    it('sets node to node in config if provided', () => {
      toggle = new Toggle({node}, {});
      assert.equal(toggle.node, node);
    });

    it('sets node to a div element before cart node if config does not provide node', () => {
      const cart = {
        node: document.createElement('div'),
      };
      document.body.appendChild(cart.node);
      const div = document.createElement('div');
      const insertBeforeStub = sinon.stub(Node.prototype, 'insertBefore').returns(node);
      const createElementStub = sinon.stub(document, 'createElement').returns(div);

      toggle = new Toggle({}, {cart});
      assert.calledOnce(insertBeforeStub);
      assert.calledWith(insertBeforeStub, div, cart.node);
      assert.equal(toggle.node, node);

      insertBeforeStub.restore();
      createElementStub.restore();
      document.body.removeChild(cart.node);
    });

    it('creates a new toggle view', () => {
      toggle = new Toggle({node}, {});
      assert.instanceOf(toggle.view, ToggleView);
    });
  });

  describe('prototype methods', () => {
    let toggleVisibilitySpy;
    let cart;

    beforeEach(() => {
      toggleVisibilitySpy = sinon.spy();
      cart = {
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
      toggle = new Toggle({node}, {cart});
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
