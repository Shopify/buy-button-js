import merge from '../utils/merge';
import Component from '../component';
import CartToggle from './toggle';
import Template from '../template';
import Checkout from './checkout';
import formatMoney from '../utils/money';
import CartView from '../views/cart';
import CartUpdater from '../updaters/cart';
import {addClassToElement} from '../utils/element-class';
import {removeTrapFocus} from '../utils/focus';

export const NO_IMG_URL = '//sdks.shopifycdn.com/buy-button/latest/no-image.jpg';

const LINE_ITEM_TARGET_SELECTIONS = ['ENTITLED', 'EXPLICIT'];
const CART_TARGET_SELECTION = 'ALL';

/**
 * Renders and cart embed.
 * @extends Component.
 */
export default class Cart extends Component {

  /**
   * create Cart.
   * @param {Object} config - configuration object.
   * @param {Object} props - data and utilities passed down from UI instance.
   */
  constructor(config, props) {
    super(config, props);
    this.addVariantToCart = this.addVariantToCart.bind(this);
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents, this.config.lineItem.order);
    this.node = config.node || document.body.appendChild(document.createElement('div'));
    this.isVisible = this.options.startOpen;
    this.lineItemCache = [];
    this.moneyFormat = this.globalConfig.moneyFormat;
    this.checkout = new Checkout(this.config);
    const toggles = this.globalConfig.toggles || [{
      node: this.node.parentNode.insertBefore(document.createElement('div'), this.node),
    }];
    this.toggles = toggles.map((toggle) => {
      return new CartToggle(merge({}, config, toggle), Object.assign({}, this.props, {cart: this}));
    });
    this.updater = new CartUpdater(this);
    this.view = new CartView(this);
  }

  createToggles(config) {
    this.toggles = this.toggles.concat(config.toggles.map((toggle) => {
      return new CartToggle(merge({}, config, toggle), Object.assign({}, this.props, {cart: this}));
    }));
    return Promise.all(this.toggles.map((toggle) => {
      return toggle.init({lineItems: this.lineItems});
    }));
  }

  /**
   * get key for configuration object.
   * @return {String}
   */
  get typeKey() {
    return 'cart';
  }

  /**
   * get events to be bound to DOM.
   * @return {Object}
   */
  get DOMEvents() {
    return merge({}, {
      [`click ${this.selectors.cart.close}`]: this.props.closeCart.bind(this),
      [`click ${this.selectors.lineItem.quantityIncrement}`]: this.onQuantityIncrement.bind(this, 1),
      [`click ${this.selectors.lineItem.quantityDecrement}`]: this.onQuantityIncrement.bind(this, -1),
      [`click ${this.selectors.cart.button}`]: this.onCheckout.bind(this),
      [`blur ${this.selectors.lineItem.quantityInput}`]: this.onQuantityBlur.bind(this),
      [`blur ${this.selectors.cart.note}`]: this.setNote.bind(this),
    }, this.options.DOMEvents);
  }

  /**
   * get cart line items.
   * @return {Array} HTML
   */
  get lineItems() {
    return this.model ? this.model.lineItems : [];
  }

  /**
   * get HTML for cart line items.
   * @return {String} HTML
   */
  get lineItemsHtml() {
    return this.lineItemCache.reduce((acc, lineItem) => {
      const data = Object.assign({}, lineItem, this.options.viewData);
      const fullPrice = data.variant.priceV2.amount * data.quantity;
      const formattedPrice = formatMoney(fullPrice, this.moneyFormat);
      const discountAllocations = data.discountAllocations;

      const {discounts, totalDiscount} = discountAllocations.reduce((discountAcc, discount) => {
        const targetSelection = discount.discountApplication.targetSelection;
        if (LINE_ITEM_TARGET_SELECTIONS.indexOf(targetSelection) > -1) {
          const discountAmount = discount.allocatedAmount.amount;
          const discountDisplayText = discount.discountApplication.title || discount.discountApplication.code;
          discountAcc.totalDiscount += discountAmount;
          discountAcc.discounts.push({discount: `${discountDisplayText} (-${formatMoney(discountAmount, this.moneyFormat)})`});
        }
        return discountAcc;
      }, {
        discounts: [],
        totalDiscount: 0,
      });
      data.discounts = discounts.length > 0 ? discounts : null;
      data.formattedFullPrice = totalDiscount > 0 ? formattedPrice : null;
      data.formattedActualPrice = formatMoney(fullPrice - totalDiscount, this.moneyFormat);
      data.formattedPrice = formattedPrice;

      data.classes = this.classes;
      data.text = this.config.lineItem.text;
      data.lineItemImage = this.imageForLineItem(data);
      data.variantTitle = data.variant.title === 'Default Title' ? '' : data.variant.title;
      return acc + this.childTemplate.render({data}, (output) => `<li id="${lineItem.id}" class=${this.classes.lineItem.lineItem}>${output}</li>`);
    }, '');
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    const modelData = this.model || {};
    return merge(modelData, this.options.viewData, {
      text: this.options.text,
      classes: this.classes,
      lineItemsHtml: this.lineItemsHtml,
      isEmpty: this.isEmpty,
      formattedTotal: this.formattedTotal,
      discounts: this.cartDiscounts,
      contents: this.options.contents,
      cartNote: this.cartNote,
      cartNoteId: this.cartNoteId,
    });
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedTotal() {
    if (!this.model) {
      return formatMoney(0, this.moneyFormat);
    }
    const total = this.options.contents.discounts ? this.model.subtotalPriceV2.amount : this.model.lineItemsSubtotalPrice.amount;
    return formatMoney(total, this.moneyFormat);
  }

  get cartDiscounts() {
    if (!this.options.contents.discounts || !this.model) {
      return [];
    }

    return this.model.discountApplications.reduce((discountArr, discount) => {
      if (discount.targetSelection === CART_TARGET_SELECTION) {
        let discountValue = 0;
        if (discount.value.amount) {
          discountValue = discount.value.amount;
        } else if (discount.value.percentage) {
          discountValue = (discount.value.percentage / 100) * this.model.lineItemsSubtotalPrice.amount;
        }

        if (discountValue > 0) {
          const discountDisplayText = discount.title || discount.code;
          discountArr.push({text: discountDisplayText, amount: `-${formatMoney(discountValue, this.moneyFormat)}`});
        }
      }
      return discountArr;
    }, []);
  }

  /**
   * whether cart is empty
   * @return {Boolean}
   */
  get isEmpty() {
    if (!this.model) {
      return true;
    }
    return this.model.lineItems.length < 1;
  }

  get cartNote() {
    return this.model && this.model.note;
  }

  get cartNoteId() {
    return `CartNote-${Date.now()}`;
  }

  get wrapperClass() {
    return this.isVisible ? 'is-active' : '';
  }

  get localStorageCheckoutKey() {
    return `${this.props.client.config.storefrontAccessToken}.${this.props.client.config.domain}.checkoutId`;
  }

  imageForLineItem(lineItem) {
    const imageSize = 180;
    const imageOptions = {
      maxWidth: imageSize,
      maxHeight: imageSize,
    };
    if (lineItem.variant.image) {
      return this.props.client.image.helpers.imageForSize(lineItem.variant.image, imageOptions);
    } else {
      return NO_IMG_URL;
    }
  }

  /**
   * sets model to null and removes checkout from localStorage
   * @return {Promise} promise resolving to the cart model
   */
  removeCheckout() {
    this.model = null;
    localStorage.removeItem(this.localStorageCheckoutKey);
    return this.model;
  }

  /**
   * get model data either by calling client.createCart or loading from localStorage.
   * @return {Promise} promise resolving to cart instance.
   */
  fetchData() {
    const checkoutId = localStorage.getItem(this.localStorageCheckoutKey);
    if (checkoutId) {
      return this.props.client.checkout.fetch(checkoutId).then((checkout) => {
        this.model = checkout;
        if (checkout.completedAt) {
          return this.removeCheckout();
        }
        return this.sanitizeCheckout(checkout).then((newCheckout) => {
          this.updateCache(newCheckout.lineItems);
          return newCheckout;
        });
      }).catch(() => {
        return this.removeCheckout();
      });
    } else {
      return Promise.resolve(null);
    }
  }

  sanitizeCheckout(checkout) {
    const lineItemsToDelete = checkout.lineItems.filter((item) => !item.variant);
    if (!lineItemsToDelete.length) {
      return Promise.resolve(checkout);
    }
    const lineItemIds = lineItemsToDelete.map((item) => item.id);
    return this.props.client.checkout.removeLineItems(checkout.id, lineItemIds).then((newCheckout) => {
      return newCheckout;
    });
  }

  fetchMoneyFormat() {
    return this.props.client.shop.fetchInfo().then((res) => {
      return res.moneyFormat;
    });
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initalizes toggle component.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    if (!this.moneyFormat) {
      this.fetchMoneyFormat().then((moneyFormat) => {
        this.moneyFormat = moneyFormat;
      });
    }
    return super.init(data)
      .then((cart) => {
        return this.toggles.map((toggle) => {
          const lineItems = cart.model ? cart.model.lineItems : [];
          return toggle.init({lineItems});
        });
      }).then(() => this);
  }

  destroy() {
    super.destroy();
    this.toggles.forEach((toggle) => toggle.destroy());
  }

  /**
   * closes cart
   */
  close() {
    this.isVisible = false;
    this.view.render();
    removeTrapFocus(this.view.wrapper);
  }

  /**
   * opens cart
   */
  open() {
    this.isVisible = true;
    this.view.render();
    this.setFocus();
  }

  /**
   * toggles cart visibility
   * @param {Boolean} visible - desired state.
   */
  toggleVisibility(visible) {
    this.isVisible = visible || !this.isVisible;
    this.view.render();
    if (this.isVisible) {
      this.setFocus();
    }
  }

  onQuantityBlur(evt, target) {
    this.setQuantity(target, () => parseInt(target.value, 10));
  }

  onQuantityIncrement(qty, evt, target) {
    this.setQuantity(target, (prevQty) => prevQty + qty);
  }

  onCheckout() {
    this._userEvent('openCheckout');
    this.props.tracker.track('Open cart checkout', {});
    this.checkout.open(this.model.webUrl);
  }

  /**
   * set quantity for a line item.
   * @param {Object} target - DOM node of line item
   * @param {Function} fn - function to return new quantity given currrent quantity.
   */
  setQuantity(target, fn) {
    const id = target.getAttribute('data-line-item-id');
    const item = this.model.lineItems.find((lineItem) => lineItem.id === id);
    const newQty = fn(item.quantity);
    return this.props.tracker.trackMethod(this.updateItem.bind(this), 'Update Cart', this.cartItemTrackingInfo(item, newQty))(id, newQty);
  }

  setNote(evt) {
    const note = evt.target.value;
    return this.props.client.checkout.updateAttributes(this.model.id, {note}).then((checkout) => {
      this.model = checkout;
      return checkout;
    });
  }

  /**
   * set cache using line items.
   * @param {Array} lineItems - array of GraphModel line item objects.
   */
  updateCache(lineItems) {
    const cachedLineItems = this.lineItemCache.reduce((acc, item) => {
      acc[item.id] = item;

      return acc;
    }, {});

    this.lineItemCache = lineItems.map((item) => {
      return Object.assign({}, cachedLineItems[item.id], item);
    });
    return this.lineItemCache;
  }

  /**
   * update cached line item.
   * @param {Number} id - lineItem id.
   * @param {Number} qty - quantity for line item.
   */
  updateCacheItem(lineItemId, quantity) {
    if (this.lineItemCache.length === 0) { return; }
    const lineItem = this.lineItemCache.find((item) => {
      return lineItemId === item.id;
    });
    lineItem.quantity = quantity;
    this.view.render();
  }

  /**
   * update line item.
   * @param {Number} id - lineItem id.
   * @param {Number} qty - quantity for line item.
   */
  updateItem(id, quantity) {
    this._userEvent('updateItemQuantity');
    const lineItem = {id, quantity};
    const lineItemEl = this.view.document.getElementById(id);
    if (lineItemEl) {
      const quantityEl = lineItemEl.getElementsByClassName(this.classes.lineItem.quantity)[0];
      if (quantityEl) {
        addClassToElement('is-loading', quantityEl);
      }
    }
    return this.props.client.checkout.updateLineItems(this.model.id, [lineItem]).then((checkout) => {
      this.model = checkout;
      this.updateCache(this.model.lineItems);
      this.toggles.forEach((toggle) => toggle.view.render());
      if (quantity > 0) {
        this.view.render();
      } else {
        this.view.animateRemoveNode(id);
      }
      return checkout;
    });
  }

  /**
   * add variant to cart.
   * @param {Object} variant - variant object.
   * @param {Number} [quantity=1] - quantity to be added.
   */
  addVariantToCart(variant, quantity = 1, openCart = true) {
    if (quantity <= 0) {
      return null;
    }
    if (openCart) {
      this.open();
    }
    const lineItem = {variantId: variant.id, quantity};
    if (this.model) {
      return this.props.client.checkout.addLineItems(this.model.id, [lineItem]).then((checkout) => {
        this.model = checkout;
        this.updateCache(this.model.lineItems);
        this.view.render();
        this.toggles.forEach((toggle) => toggle.view.render());
        if (!openCart) {
          this.setFocus();
        }
        return checkout;
      });
    } else {
      const input = {
        lineItems: [
          lineItem,
        ],
      };
      return this.props.client.checkout.create(input).then((checkout) => {
        localStorage.setItem(this.localStorageCheckoutKey, checkout.id);
        this.model = checkout;
        this.updateCache(this.model.lineItems);
        this.view.render();
        this.toggles.forEach((toggle) => toggle.view.render());
        if (!openCart) {
          this.setFocus();
        }
        return checkout;
      });
    }
  }

  /**
   * Remove all lineItems in the cart
   */
  empty() {
    const lineItemIds = this.model.lineItems ? this.model.lineItems.map((item) => item.id) : [];

    return this.props.client.checkout.removeLineItems(this.model.id, lineItemIds).then((checkout) => {
      this.model = checkout;
      this.view.render();
      this.toggles.forEach((toggle) => toggle.view.render());
      return checkout;
    });
  }

  /**
   * get info about line item to be sent to tracker
   * @return {Object}
   */
  cartItemTrackingInfo(item, quantity) {
    return {
      id: item.variant.id,
      variantName: item.variant.title,
      productId: item.variant.product.id,
      name: item.title,
      price: item.variant.priceV2.amount,
      prevQuantity: item.quantity,
      quantity: parseFloat(quantity),
      sku: null,
    };
  }

  setFocus() {
    setTimeout(() => {
      this.view.setFocus();
    }, 0);
  }
}
