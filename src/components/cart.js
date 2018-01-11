import merge from '../utils/merge';
import Component from '../component';
import CartToggle from './toggle';
import Template from '../template';
import Checkout from './checkout';
import formatMoney from '../utils/money';
import CartView from '../views/cart';
import CartUpdater from '../updaters/cart';

const NO_IMG_URL = '//sdks.shopifycdn.com/buy-button/latest/no-image.jpg';

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
      return toggle.init({lineItems: this.model.lineItems});
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
    }, this.options.DOMEvents);
  }

  /**
   * get HTML for cart line items.
   * @return {String} HTML
   */
  get lineItemsHtml() {
    return this.lineItemCache.reduce((acc, lineItem) => {
      const data = Object.assign({}, lineItem, this.options.viewData);
      data.classes = this.classes;
      data.lineItemImage = this.imageForLineItem(data);
      data.variantTitle = data.variant.title === 'Default Title' ? '' : data.variant.title;
      data.formattedPrice = formatMoney(data.variant.price * data.quantity, this.moneyFormat);
      return acc + this.childTemplate.render({data}, (output) => `<div id="${lineItem.id}" class=${this.classes.lineItem.lineItem}>${output}</div>`);
    }, '');
  }

  /**
   * get data to be passed to view.
   * @return {Object} viewData object.
   */
  get viewData() {
    return merge(this.model, this.options.viewData, {
      text: this.options.text,
      classes: this.classes,
      lineItemsHtml: this.lineItemsHtml,
      isEmpty: this.isEmpty,
      formattedTotal: this.formattedTotal,
    });
  }

  /**
   * get formatted cart subtotal based on moneyFormat
   * @return {String}
   */
  get formattedTotal() {
    return formatMoney(this.model.subtotalPrice, this.moneyFormat);
  }

  /**
   * whether cart is empty
   * @return {Boolean}
   */
  get isEmpty() {
    return this.model.lineItems.length < 1;
  }

  get wrapperClass() {
    return this.isVisible ? 'is-active' : '';
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
   * get model data either by calling client.createCart or loading from localStorage.
   * @return {Promise} promise resolving to cart instance.
   */
  fetchData() {
    const checkoutId = localStorage.getItem('checkoutId');
    if (checkoutId) {
      return this.props.client.checkout.fetch(checkoutId).then((checkout) => {
        this.model = checkout;
        this.updateCache(this.model.lineItems);
        return checkout;
      });
    } else {
      return this.props.client.checkout.create().then((checkout) => {
        localStorage.setItem('checkoutId', checkout.id);
        this.model = checkout;
        return checkout;
      });
    }
    // return this.props.client.fetchRecentCart();
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
    if (!this.config.moneyFormat) {
      this.fetchMoneyFormat().then((moneyFormat) => {
        this.moneyFormat = moneyFormat;
      });
    }
    return super.init(data)
      .then((cart) => {
        return this.toggles.map((toggle) => {
          return toggle.init({lineItems: cart.model.lineItems});
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
  }

  /**
   * opens cart
   */
  open() {
    this.isVisible = true;
    this.view.render();
    this.view.setFocus();
  }

  /**
   * toggles cart visibility
   * @param {Boolean} visible - desired state.
   */
  toggleVisibility(visible) {
    this.isVisible = visible || !this.isVisible;
    this.view.render();
    if (this.isVisible) {
      this.view.setFocus();
    }
  }

  onQuantityBlur(evt, target) {
    this.setQuantity(target, () => parseInt(target.value, 10));
  }

  onQuantityIncrement(qty, evt, target) {
    this.setQuantity(target, (prevQty) => prevQty + qty);
  }

  onCheckout() {
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
    const lineItem = {id, quantity};
    this.updateCacheItem(id, quantity);
    this._userEvent('updateItemQuantity');
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
    return this.props.client.checkout.addLineItems(this.model.id, [lineItem]).then((checkout) => {
      this.model = checkout;
      this.updateCache(this.model.lineItems);
      this.view.render();
      this.toggles.forEach((toggle) => toggle.view.render());
      this.view.setFocus();
      return checkout;
    });
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
      id: item.variant_id,
      name: item.title,
      sku: null,
      price: item.price,
      prevQuantity: item.quantity,
      quantity: parseFloat(quantity),
    };
  }
}
