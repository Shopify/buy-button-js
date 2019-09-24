import Cart from '../../src/components/cart';
import CartToggle from '../../src/components/toggle';
import Component from '../../src/component';
import Checkout from '../../src/components/checkout';
import Template from '../../src/template';
import CartUpdater from '../../src/updaters/cart';
import CartView from '../../src/views/cart';
import ShopifyBuy from '../../src/buybutton';
import * as formatMoney from '../../src/utils/money';
import * as elementClass from '../../src/utils/element-class';

let cart;

describe('Cart class', () => {
  const moneyFormat = '${{amount}}';
  let closeCartSpy;
  let trackSpy;

  beforeEach(() => {
    closeCartSpy = sinon.spy();
    trackSpy = sinon.spy();

    cart = new Cart({
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
      moneyFormat,
    }, {
      client: ShopifyBuy.buildClient({
        domain: 'test.myshopify.com',
        storefrontAccessToken: 123
      }),
      browserFeatures: {
        transition: true,
        animation: true,
        transform: true,
      },
      tracker: {
        trackMethod: (fn) => {
          return function () {
            fn(...arguments);
          };
        },
        track: trackSpy,
      },
      closeCart: closeCartSpy,
    });
  });

  afterEach(() => {
    cart.destroy();
  });

  describe('constructor', () => {
    it('instantiates child template, checkout, toggles, updater, view', () => {
      assert.instanceOf(cart.childTemplate, Template);
      assert.instanceOf(cart.checkout, Checkout);
      assert.instanceOf(cart.updater, CartUpdater);
      assert.instanceOf(cart.view, CartView);
      assert.instanceOf(cart.toggles[0], CartToggle);
    });
  });

  describe('createToggles()', () => {
    it('creates toggle instances for passed nodes', () => {
      cart.model.lineItems = [{}]
      const config = {
        toggles: [{
          node: document.body.appendChild(document.createElement('div'))
        }]
      }
      return cart.createToggles(config).then(() => {
        assert.equal(cart.toggles.length, 2);
      });
    });
  });

  describe('get lineItemsHtml', () => {
    const variantAmount = '5.00';
    let formatMoneySpy;

    beforeEach(() => {
      formatMoneySpy = sinon.spy(formatMoney, 'default');
    });

    afterEach(() => {
      formatMoneySpy.restore();
    });

    it('calls render and returns an html string', () => {
      cart.lineItemCache = [{
        id: 123,
        title: 'test',
        variantTitle: 'test2',
        quantity: 1,
        variant: {
          image: {
            src: 'cdn.shopify.com/image.jpg',
          },
          priceV2: {
            amount: '5.00',
            currencyCode: 'CAD',
          },
        },
        discountAllocations: [],
      }];

      const renderSpy = sinon.spy(cart.childTemplate, 'render');
      assert.include(cart.lineItemsHtml, 'data-line-item-id="123"');
      assert.calledOnce(renderSpy);
    });

    describe('price without discounts', () => {
      beforeEach(() => {
        cart.childTemplate.contents.price = true;
        cart.childTemplate.contents.priceWithDiscounts = false;
      });

      it('does not render discounts if discounts allocations are present', () => {
        const quantity = 2;
        const discountAmount = '2.00';
        cart.lineItemCache = [{
          id: 123,
          title: 'test',
          variantTitle: 'test2',
          quantity,
          variant: {
            image: {
              src: 'cdn.shopify.com/image.jpg',
            },
            priceV2: {
              amount: variantAmount,
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [
            {
              discountApplication: {
                title: 'BOGO',
                targetSelection: 'ENTITLED',
              },
              allocatedAmount: {
                amount: discountAmount,
                currencyCode: 'CAD',
              },
            },
          ],
        }];

        const cartLineItemsHtml = cart.lineItemsHtml;
        const fullPrice = variantAmount * quantity;
        const discountedPrice = fullPrice - discountAmount;

        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.fullPrice"');
        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.discount"');
        assert.include(cartLineItemsHtml, 'data-element="lineItem.price"');
        assert.notInclude(cartLineItemsHtml, `$${discountedPrice}.00`);
        assert.include(cartLineItemsHtml, `$${fullPrice}.00`);
      });
    });

    describe('price with discounts', () => {
      beforeEach(() => {
        cart.childTemplate.contents.price = false;
        cart.childTemplate.contents.priceWithDiscounts = true;
      });

      it('renders the full price with no discounts, if no discounts allocations are present', () => {
        const quantity = 2;
        cart.lineItemCache = [{
          id: 123,
          title: 'test',
          variantTitle: 'test2',
          quantity,
          variant: {
            image: {
              src: 'cdn.shopify.com/image.jpg',
            },
            priceV2: {
              amount: variantAmount,
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [],
        }];

        const cartLineItemsHtml = cart.lineItemsHtml;
        const fullPrice = variantAmount * quantity;

        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.fullPrice"');
        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.discount"');
        assert.include(cartLineItemsHtml, 'data-element="lineItem.price"');
        assert.include(cartLineItemsHtml, `$${fullPrice}.00`);

        assert.calledTwice(formatMoneySpy);
        assert.alwaysCalledWith(formatMoneySpy, fullPrice, moneyFormat);
      });

      it('renders the discount information if a discount allocation exists with a target selection of `ENTITLED`', () => {
        const discountAmount = '1.00';
        const discountTitle = 'BOGO';
        const quantity = 2;
        cart.lineItemCache = [{
          id: 123,
          title: 'test',
          variantTitle: 'test2',
          quantity,
          variant: {
            image: {
              src: 'cdn.shopify.com/image.jpg',
            },
            priceV2: {
              amount: variantAmount,
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [
            {
              discountApplication: {
                title: discountTitle,
                targetSelection: 'ENTITLED',
              },
              allocatedAmount: {
                amount: discountAmount,
                currencyCode: 'CAD',
              },
            },
          ],
        }];

        const cartLineItemsHtml = cart.lineItemsHtml;
        const fullPrice = variantAmount * quantity;
        const discountedPrice = fullPrice - discountAmount;

        assert.include(cartLineItemsHtml, 'data-element="lineItem.fullPrice"');
        assert.include(cartLineItemsHtml, `$${fullPrice}.00`);

        assert.include(cartLineItemsHtml, 'data-element="lineItem.discount"');
        assert.include(cartLineItemsHtml, `${discountTitle} (-$${discountAmount})`);

        assert.include(cartLineItemsHtml, 'data-element="lineItem.price"');
        assert.include(cartLineItemsHtml, `$${discountedPrice}.00`);
        
        assert.calledThrice(formatMoneySpy);
        assert.calledWith(formatMoneySpy.firstCall, fullPrice, moneyFormat);
        assert.calledWith(formatMoneySpy.secondCall, discountAmount, moneyFormat);
        assert.calledWith(formatMoneySpy.thirdCall, discountedPrice, moneyFormat);
      });

      it('renders the discount information if the discount allocation exists with a target of `EXPLICIT`', () => {
        const discountAmount = '1.00';
        const discountTitle = 'BOGO';
        const quantity = 2;
        cart.lineItemCache = [{
          id: 123,
          title: 'test',
          variantTitle: 'test2',
          quantity,
          variant: {
            image: {
              src: 'cdn.shopify.com/image.jpg',
            },
            priceV2: {
              amount: variantAmount,
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [
            {
              discountApplication: {
                title: discountTitle,
                targetSelection: 'EXPLICIT',
              },
              allocatedAmount: {
                amount: discountAmount,
                currencyCode: 'CAD',
              },
            },
          ],
        }];

        const cartLineItemsHtml = cart.lineItemsHtml;
        const fullPrice = variantAmount * quantity;
        const discountedPrice = fullPrice - discountAmount;

        assert.include(cartLineItemsHtml, 'data-element="lineItem.fullPrice"');
        assert.include(cartLineItemsHtml, `$${fullPrice}.00`);

        assert.include(cartLineItemsHtml, 'data-element="lineItem.discount"');
        assert.include(cartLineItemsHtml, `${discountTitle} (-$${discountAmount})`);

        assert.include(cartLineItemsHtml, 'data-element="lineItem.price"');
        assert.include(cartLineItemsHtml, `$${discountedPrice}.00`);
        
        assert.calledThrice(formatMoneySpy);
        assert.calledWith(formatMoneySpy.firstCall, fullPrice, moneyFormat);
        assert.calledWith(formatMoneySpy.secondCall, discountAmount, moneyFormat);
        assert.calledWith(formatMoneySpy.thirdCall, discountedPrice, moneyFormat);
      });

      it('does not render the discount information if the discount allocation exists with a target of `ALL`', () => {
        const quantity = 2;
        cart.lineItemCache = [{
          id: 123,
          title: 'test',
          variantTitle: 'test2',
          quantity,
          variant: {
            image: {
              src: 'cdn.shopify.com/image.jpg',
            },
            priceV2: {
              amount: variantAmount,
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [
            {
              discountApplication: {
                title: 'BOGO',
                targetSelection: 'ALL',
              },
              allocatedAmount: {
                amount: '1.00',
                currencyCode: 'CAD',
              },
            },
          ],
        }];

        const cartLineItemsHtml = cart.lineItemsHtml;
        const fullPrice = variantAmount * quantity;

        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.fullPrice"');
        assert.notInclude(cartLineItemsHtml, 'data-element="lineItem.discount"');
        assert.include(cartLineItemsHtml, 'data-element="lineItem.price"');
        assert.include(cartLineItemsHtml, `$${fullPrice}.00`);

        assert.calledTwice(formatMoneySpy);
        assert.alwaysCalledWith(formatMoneySpy, fullPrice, moneyFormat);
      });
    });
  });

  describe('imageForLineItem', () => {
    beforeEach(() => {
      cart.lineItem = {
        id: 123,
        title: 'Line Item',
        variant_title: 'Line Item title',
        line_price: 20,
        quantity: 1,
        variant: {
          image: { src: 'cdn.shopify.com/variant_image.jpg'},
        },
      }
    });

    it('returns the variant image if it exists', () => {
      const clientReturn = sinon.stub(cart.props.client.image.helpers, 'imageForSize').returns('cdn.shopify.com/variant_image.jpg');
      const variantImage = cart.lineItem.variant.image;
      const sourceReturned = cart.imageForLineItem(cart.lineItem);

      assert.calledOnce(clientReturn);
      assert.calledWith(clientReturn, variantImage);
      assert.equal(variantImage.src, sourceReturned);
    });

    afterEach(() => {
      cart.props.client.image.helpers.imageForSize.restore();
    });
  });

  describe('fetchData()', () => {
    it('calls fetchRecentCart on client', () => {
      localStorage.setItem(cart.localStorageCheckoutKey, 12345)
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.resolve({id: 12345, lineItems: []}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 12345, lineItems: []});
        assert.calledOnce(fetchCart);
        fetchCart.restore();
      });
    });

    it('calls createCart on client if localStorage is invalid', () => {
      localStorage.setItem(cart.localStorageCheckoutKey, 1);
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.reject({errors: [{ message: 'rejected.' }]}));
      const createCheckout = sinon.stub(cart.props.client.checkout, 'create').returns(Promise.resolve({id: 12345, lineItems: []}));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, {id: 12345, lineItems: []});
        assert.calledOnce(fetchCart);
        assert.calledOnce(createCheckout);
        assert.equal(localStorage.getItem(cart.localStorageCheckoutKey), 12345);
      });
    });

    it('calls createCart on client if checkout is completed', () => {
      const checkout = {id: 1111, lineItems: []};
      localStorage.setItem(cart.localStorageCheckoutKey, 123);
      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').returns(Promise.resolve({ completedAt: "04-12-2018", lineItems: []}));
      const createCheckout = sinon.stub(cart.props.client.checkout, 'create').returns(Promise.resolve(checkout));

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, checkout);
        assert.calledOnce(fetchCart);
        assert.calledOnce(createCheckout);
        assert.equal(localStorage.getItem(cart.localStorageCheckoutKey), checkout.id);
      });
    });

    it('calls sanitizeCheckout then updateCache with the new checkout', () => {
      localStorage.setItem(cart.localStorageCheckoutKey, 123);

      const checkout = {id: 1111, lineItems: [
        {id: 1112, variant: null},
        {id: 1113, variant: {id: 1114}},
        {id: 1115, variant: null},
      ]};
      const sanitizedCheckout = {id: 1111, lineItems: [
        {id: 1113, variant: {id: 1114}},
      ]};

      const fetchCart = sinon.stub(cart.props.client.checkout, 'fetch').resolves(checkout);
      const sanitizeCheckout = sinon.stub(cart, 'sanitizeCheckout').resolves(sanitizedCheckout);
      const updateCache = sinon.stub(cart, 'updateCache').resolves();

      return cart.fetchData().then((data) => {
        assert.deepEqual(data, sanitizedCheckout);
        assert.calledOnce(fetchCart);
        assert.calledOnce(sanitizeCheckout);
        assert.calledOnce(updateCache);
        assert.calledWith(sanitizeCheckout, checkout);
        assert.calledWith(updateCache, sanitizedCheckout.lineItems);

        fetchCart.restore();
        sanitizeCheckout.restore();
        updateCache.restore();
      });
    });
  });

  describe('fetchMoneyFormat()', () => {
    it('calls fetchShopInfo on client', () => {
      localStorage.setItem(cart.localStorageCheckoutKey, 12345)
      const fetchMoneyFormat = sinon.stub(cart.props.client.shop, 'fetchInfo').returns(Promise.resolve({ moneyFormat: '₿{{amount}}'}));

      return cart.fetchMoneyFormat().then((data) => {
        assert.deepEqual(data, '₿{{amount}}');
        assert.calledOnce(fetchMoneyFormat);
        fetchMoneyFormat.restore();
      });
    });
  });

  describe('sanitizeCheckout()', () => {
    it('calls removeLineItems for all line items with deleted variants', () => {
      const checkout = {id: 1111, lineItems: [
        {id: 1112, variant: null},
        {id: 1113, variant: {id: 1114}},
        {id: 1115, variant: null},
      ]};
      const sanitizedCheckout = {id: 1111, lineItems: [
        {id: 1113, variant: {id: 1114}},
      ]};
      const removeLineItems = sinon.stub(cart.props.client.checkout, 'removeLineItems').resolves(sanitizedCheckout);

      return cart.sanitizeCheckout(checkout).then((data) => {
        assert.deepEqual(data, sanitizedCheckout);
        assert.calledOnce(removeLineItems);
        assert.calledWith(removeLineItems, 1111, [1112, 1115]);

        removeLineItems.restore();
      });
    });
  });

  describe('setQuantity()', () => {
    const node = {
      getAttribute: () => 1234
    };

    beforeEach(() => {
      cart.model = {
        lineItems: [{
          id: 1234,
          quantity: 1,
          variant: {
            priceV2: {
              amount: '10.00',
              currencyCode: 'CAD',
            },
          },
        }],
      }
      cart.updateItem = sinon.spy();
      cart.cartItemTrackingInfo = sinon.spy();
    });

    it('calls updateItem', () => {
      cart.setQuantity(node, (n) => n + 1);
      assert.calledWith(cart.updateItem, 1234, 2);
    });
  });

  describe('updateItem()', () => {
    let updateLineItemsStub;
    let node;
    let quantityNode;
    let addClassToElementStub;
    const lineItemId = 123;
    const lineItemQuantity = 5;

    beforeEach(() => {
      node = document.createElement('div');
      node.setAttribute('id', lineItemId);

      quantityNode = document.createElement('div');
      quantityNode.setAttribute('class', cart.config.lineItem.classes.quantity);

      node.appendChild(quantityNode);
      document.body.appendChild(node);

      cart.model = {
        id: 123456,
      }
      updateLineItemsStub = sinon.stub(cart.props.client.checkout, 'updateLineItems').returns(Promise.resolve({lineItems: [{id: lineItemId, quantity: lineItemQuantity}]}))
      addClassToElementStub = sinon.stub(elementClass, 'addClassToElement');

      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();
    });

    afterEach(() => {
      updateLineItemsStub.restore();
      addClassToElementStub.restore();
      document.body.removeChild(node);
    });

    it('calls updateLineItem', () => {
      return cart.updateItem(lineItemId, lineItemQuantity).then(() => {
        assert.calledWith(updateLineItemsStub, 123456, [{id: lineItemId, quantity: lineItemQuantity}]);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
        assert.deepEqual(cart.model, {lineItems: [{id: lineItemId, quantity: lineItemQuantity}]});
      });
    });

    it('adds `is-loading` class to quantity element', () => {
      return cart.updateItem(lineItemId, lineItemQuantity).then(() => {
        assert.calledOnce(addClassToElementStub);
        assert.calledWith(addClassToElementStub, 'is-loading', quantityNode);
      });
    });
  });


  describe('addVariantToCart', () => {
    it('calls addLineItems on client', () => {
      cart.model = {
        id: 123456,
      }
      cart.view.setFocus = sinon.spy();
      const addLineItemsStub = sinon.stub(cart.props.client.checkout, 'addLineItems').returns(Promise.resolve({lineItems: [{id: 123, quantity: 1}]}));
      const render = sinon.stub(cart.view, 'render');
      const toggleRender = sinon.stub(cart.toggles[0].view, 'render');

      return cart.addVariantToCart({id: 123}).then(() => {
        assert.calledWith(addLineItemsStub, 123456, [{variantId: 123, quantity:1}]);
        assert.calledOnce(toggleRender);
        assert.called(cart.view.setFocus);
        assert.deepEqual(cart.model, {lineItems: [{id: 123, quantity: 1}]});
      });
    });
  });

  describe('get formattedTotal', () => {
    const subtotalPriceAmount = '10.00';
    const lineItemsSubtotalPriceAmount = '20.00';

    beforeEach(() => {
      cart.model = {
        subtotalPriceV2: {
          amount: subtotalPriceAmount,
          currentCode: 'CAD',
        },
        lineItemsSubtotalPrice: {
          amount: lineItemsSubtotalPriceAmount,
          currencyCode: 'CAD',
        },
      };
    });

    it('returns formatted subtotal price if contents discount field is true', () => {
      cart.config.cart.contents.discounts = true;

      assert.equal(cart.formattedTotal, `$${subtotalPriceAmount}`);
    });

    it('returns formatted line items subtotal price if contents discount field is false', () => {
      cart.config.cart.contents.discounts = false;

      assert.equal(cart.formattedTotal, `$${lineItemsSubtotalPriceAmount}`);
    });
  });

  describe('empty', () => {
    it('empties and rerenders the cart', () => {
      const removeLineItemsStub = sinon.stub(cart.props.client.checkout, 'removeLineItems').returns(Promise.resolve());
      cart.view.render = sinon.spy();
      cart.toggles[0].view.render = sinon.spy();

      return cart.empty().then(() => {
        assert.calledOnce(removeLineItemsStub);
        assert.calledOnce(cart.view.render);
        assert.calledOnce(cart.toggles[0].view.render);
      });
    });
  });

  describe('init', () => {
    let superInitStub;
    let fetchMoneyFormatStub;
    beforeEach(() => {
      superInitStub = sinon.stub(Component.prototype, 'init').resolves({model: {lineItems: [{id: 123, quantity: 5}]}});
      fetchMoneyFormatStub = sinon.stub(cart, 'fetchMoneyFormat').resolves();
    });

    afterEach(() => {
      superInitStub.restore();
      fetchMoneyFormatStub.restore();
    });

    it('calls fetchMoneyFormat when moneyFormat has not been set', () => {
      cart.moneyFormat = null;
      return cart.init().then(() => {
        assert.calledOnce(fetchMoneyFormatStub);
      });
    });

    it('does not call fetchMoneyFormat when moneyFormat has been set', () => {
      cart.moneyFormat = '₿{{amount}}';
      return cart.init().then(() => {
        assert.notCalled(fetchMoneyFormatStub);
      });
    });
  });

  describe('DOMEvents', () => {
    it('binds closeCart to click on cart close', () => {
      cart.DOMEvents[`click ${cart.selectors.cart.close}`]();
      assert.calledOnce(closeCartSpy);
    });

    describe('onQuantityIncrement bindings', () => {
      let quantityIncrementStub;

      beforeEach(() => {
        quantityIncrementStub = sinon.stub(cart, 'onQuantityIncrement');
      });

      afterEach(() => {
        quantityIncrementStub.restore();
      });

      it('binds onQuantityIncrement to click on quantity increment and passes a value of 1', () => {
        cart.DOMEvents[`click ${cart.selectors.lineItem.quantityIncrement}`]();
        assert.calledOnce(quantityIncrementStub);
        assert.calledWith(quantityIncrementStub, 1);
      });

      it('bind onQuantityIncrement to click on quantity decrement and passes a value of -1', () => {
        cart.DOMEvents[`click ${cart.selectors.lineItem.quantityDecrement}`]();
        assert.calledOnce(quantityIncrementStub);
        assert.calledWith(quantityIncrementStub, -1);
      });
    });

    it('binds onCheckout to click on cart button', () => {
      const onCheckoutStub = sinon.stub(cart, 'onCheckout');
      cart.DOMEvents[`click ${cart.selectors.cart.button}`]();
      assert.calledOnce(onCheckoutStub);
      onCheckoutStub.restore();
    });

    it('binds onQuantityBlur to blur on quantity input field', () => {
      const onQuantityBlurStub = sinon.stub(cart, 'onQuantityBlur');
      cart.DOMEvents[`blur ${cart.selectors.lineItem.quantityInput}`]();
      assert.calledOnce(onQuantityBlurStub);
      onQuantityBlurStub.restore();
    });

    it('binds setNote to blur on cart note field', () => {
      const setNoteStub = sinon.stub(cart, 'setNote');
      cart.DOMEvents[`blur ${cart.selectors.cart.note}`]();
      assert.calledOnce(setNoteStub);
      setNoteStub.restore();
    });
  });

  describe('viewData()', () => {
    let viewData;

    beforeEach(async () => {
      const lineItems = [
        {
          id: 1234,
          quantity: 2,
          variant: {
            id: 1111,
            title: 'test variant',
            priceV2: {
              amount: '20.00',
              currencyCode: 'CAD',
            },
          },
          discountAllocations: [],
        },
      ];
      cart.model = {
        id: 1,
        lineItems,
        note: 'test cart note',
        subtotalPrice: '123.00',
        subtotalPriceV2: {
          amount: '130.00',
          currencyCode: 'USD',
        },
        discountApplications: [],
      };
      cart.lineItemCache = lineItems;
      viewData = cart.viewData;
    });

    it('returns an object merged with model', () => {
      assert.equal(viewData.id, cart.model.id);
      assert.deepEqual(viewData.lineItems, cart.model.lineItems);
      assert.equal(viewData.subtotalPrice, cart.model.subtotalPrice);
      assert.equal(viewData.lineItemsSubtotalPrice, cart.model.lineItemsSubtotalPrice);
    });

    it('returns an object with text', () => {
      assert.deepEqual(viewData.text, cart.options.text);
    });

    it('returns an object with classes', () => {
      assert.deepEqual(viewData.classes, cart.classes);
    });

    it('returns an object with lineItemsHtml', () => {
      assert.equal(viewData.lineItemsHtml, cart.lineItemsHtml);
    });

    it('returns an object with isEmpty', () => {
      assert.equal(viewData.isEmpty, cart.isEmpty);
    });

    it('returns an object with formatted total', () => {
      assert.equal(viewData.formattedTotal, cart.formattedTotal);
    });

    it('returns an object with contents', () => {
      assert.deepEqual(viewData.contents, cart.options.contents);
    });

    it('returns an object with cart note', () => {
      assert.equal(viewData.cartNote, cart.cartNote);
    });
  });

  describe('onCheckout()', () => {
    let openCheckoutStub;
    let userEventStub;

    beforeEach(() => {
      openCheckoutStub = sinon.stub(cart.checkout, 'open');
      userEventStub = sinon.stub(cart, '_userEvent');
      cart.onCheckout();
    });

    afterEach(() => {
      openCheckoutStub.restore();
      userEventStub.restore();
    });

    it('triggers open checkout user event', () => {
      assert.calledOnce(userEventStub);
      assert.calledWith(userEventStub, 'openCheckout');
    });

    it('tracks open checkout', () => {
      assert.calledOnce(trackSpy);
      assert.calledWith(trackSpy, 'Open cart checkout', {});
    });

    it('open checkout', () => {
      assert.calledOnce(openCheckoutStub);
      assert.calledWith(openCheckoutStub, cart.model.webUrl);
    });
  });

  describe('get cartNote', () => {
    it('returns the note from the cart model', () => {
      const note = 'test cart note';
      cart.model.note = note;

      assert.equal(cart.cartNote, cart.model.note);
    });
  });

  describe('setNote()', () => {
    let updateAttributesStub;
    const mockCheckout = {
      lineItems: [
        {id: '1'},
        {id: '2'},
      ],
    };

    const note = 'test cart note';
    const event = {
      target: {
        value: note,
      },
    };

    beforeEach(() => {
      updateAttributesStub = sinon.stub(cart.props.client.checkout, 'updateAttributes').resolves(mockCheckout);
    });

    afterEach(() => {
      updateAttributesStub.restore();
    });

    it('calls updateAttributes on the cart', async () => {
      await cart.setNote(event);
      assert.calledOnce(updateAttributesStub);
      assert.calledWith(updateAttributesStub, cart.model.id, {note});
    });

    it('sets the cart model to the checkout returned from the client', async () => {
      await cart.setNote(event);
      assert.equal(cart.model, mockCheckout);
    });
  });

  describe('get cartDiscounts', () => {
    it('return an empty array if no discount applications exist', () => {
      cart.model = {
        lineItemsSubtotalPrice: {
          amount: '20.0',
          currencyCode: 'CAD',
        },
        discountApplications: [],
      };

      assert.equal(cart.cartDiscounts.length, 0);
    });

    it('returns an array of discount details if discount applications exist', () => {
      cart.model = {
        lineItemsSubtotalPrice: {
          amount: '20.0',
          currencyCode: 'CAD',
        },
        discountApplications: [
          {
            title: 'BOGO',
            targetSelection: 'ALL',
            value: {
              percentage: '20',
            },
          },
          {
            title: 'BOGO',
            targetSelection: 'ALL',
            value: {
              amount: '2.00',
              currencyCode: 'CAD',
            },
          },
        ],
      };

      assert.equal(cart.cartDiscounts.length, 2);
    });

    it('does not return discount details for a discount application with target selection `ENTITLED`', () => {
      cart.model = {
        lineItemsSubtotalPrice: {
          amount: '20.0',
          currencyCode: 'CAD',
        },
        discountApplications: [
          {
            title: 'BOGO',
            targetSelection: 'ENTITLED',
            value: {
              amount: '2.00',
              currencyCode: 'CAD',
            },
          },
        ],
      };

      assert.equal(cart.cartDiscounts.length, 0);
    });

    it('does not return discount details for a discount application with target selection `EXPLICIT`', () => {
      cart.model = {
        lineItemsSubtotalPrice: {
          amount: '20.0',
          currencyCode: 'CAD',
        },
        discountApplications: [
          {
            title: 'BOGO',
            targetSelection: 'EXPLICIT',
            value: {
              amount: '2.00',
              currencyCode: 'CAD',
            },
          },
        ],
      };

      assert.equal(cart.cartDiscounts.length, 0);
    });

    it('returns discount details for amount based discount applications with target selection `ALL`', () => {
      const discountTitle = 'BOGO';
      const discountAmount = '2.00';

      cart.model = {
        lineItemsSubtotalPrice: {
          amount: '20.0',
          currencyCode: 'CAD',
        },
        discountApplications: [
          {
            title: discountTitle,
            targetSelection: 'ALL',
            value: {
              amount: discountAmount,
              currencyCode: 'CAD',
            },
          },
        ],
      };

      const discounts = cart.cartDiscounts;
      assert.equal(discounts.length, 1);
      assert.deepEqual(discounts[0], {
        text: discountTitle,
        amount: `-$${discountAmount}`,
      });
    });

    it('returns discount details for percentage based discount applications with target selection `ALL`', () => {
      const discountTitle = 'BOGO';
      const discountPercentage = '20';
      const lineItemSubtotal = '20.0';

      cart.model = {
        lineItemsSubtotalPrice: {
          amount: lineItemSubtotal,
          currencyCode: 'CAD',
        },
        discountApplications: [
          {
            title: discountTitle,
            targetSelection: 'ALL',
            value: {
              percentage: discountPercentage,
            },
          },
        ],
      };

      const discounts = cart.cartDiscounts;
      assert.equal(discounts.length, 1);
      assert.deepEqual(discounts[0], {
        text: discountTitle,
        amount: `-$${discountPercentage / 100 * lineItemSubtotal}.00`,
      });
    });
  });

  describe('cartItemTrackingInfo', () => {
    it('returns tracking info for cart item', () => {
      const item = {
        title: 'Test Sunglasses',
        quantity: 2,
        variant: {
          id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzE5MzE1MjQzMDkwNDg',
          title: 'Black shades',
          priceV2: {
            amount: '50.0',
          },
          product: {
            id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xOTQ2Nzc3MjkxOTg2NA',
          },
        },
      };

      const trackingInfo = cart.cartItemTrackingInfo(item, '5');

      assert.deepEqual(trackingInfo, {
        id: item.variant.id,
        variantName: item.variant.title,
        productId: item.variant.product.id,
        name: item.title,
        price: item.variant.priceV2.amount,
        prevQuantity: item.quantity,
        quantity: 5,
        sku: null,
      });
    });
  });
});
