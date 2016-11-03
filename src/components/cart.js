import Store from 'shopify-buy/lib/store';
import merge from '../utils/merge';
import Component from '../component';
import CartToggle from './toggle';
import Template from '../template';
import Checkout from './checkout';
import formatMoney from '../utils/money';
import {addClassToElement} from '../utils/element-class';

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
    this.store = new Store();
    this.childTemplate = new Template(this.config.lineItem.templates, this.config.lineItem.contents, this.config.lineItem.order);
    this.node = config.node || document.body.appendChild(document.createElement('div'));
    this.node.className = 'shopify-buy-cart-wrapper';
    this.isVisible = this.options.startOpen;
    this.checkout = new Checkout(this.config);
    const toggles = this.globalConfig.toggles || [{
      node: this.node.parentNode.insertBefore(document.createElement('div'), this.node),
    }];
    this.toggles = toggles.map((toggle) => {
      return new CartToggle(merge({}, config, toggle), Object.assign({}, this.props, {cart: this}));
    });
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
    return this.model.lineItems.reduce((acc, lineItem) => {
      const data = merge(lineItem, this.options.viewData);
      data.classes = this.classes;
      data.lineItemImage = data.image || {src: NO_IMG_URL};
      data.variantTitle = data.variant_title === 'Default Title' ? '' : data.variant_title;
      data.formattedPrice = formatMoney(data.line_price, this.globalConfig.moneyFormat);
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
    return formatMoney(this.model.subtotal, this.globalConfig.moneyFormat);
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

  /**
   * get model data either by calling client.createCart or loading from localStorage.
   * @return {Promise} promise resolving to cart instance.
   */
  fetchData() {
    if (this.store.getItem('lastCartId')) {
      return this.props.client.fetchCart(this.store.getItem('lastCartId'));
    } else {
      return this.props.client.createCart().then((cart) => {
        this.store.setItem('lastCartId', cart.id);
        return cart;
      });
    }
  }

  wrapTemplate(html) {
    return `<div class="${this.classes.cart.cart}">${html}</div>`;
  }

  /**
   * initializes component by creating model and rendering view.
   * Creates and initalizes toggle component.
   * @param {Object} [data] - data to initialize model with.
   * @return {Promise} promise resolving to instance.
   */
  init(data) {
    return super.init(data)
      .then((cart) => {
        return this.toggles.map((toggle) => {
          return toggle.init({lineItems: cart.model.lineItems});
        });
      }).then(() => this);
  }

  /**
   * renders string template using viewData to wrapper element.
   * Sets iframe class based on visibility.
   */
  render() {
    super.render();
    if (!this.iframe) {
      return;
    }
    if (this.isVisible) {
      this.iframe.addClass('is-active');
      this.iframe.addClass('is-initialized');
    } else {
      this.iframe.removeClass('is-active');
    }
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
    this.render();
  }

  /**
   * opens cart
   */
  open() {
    this.isVisible = true;
    this.render();
    this.setFocus();
  }

  /**
   * toggles cart visibility
   * @param {Boolean} visible - desired state.
   */
  toggleVisibility(visible) {
    this.isVisible = visible || !this.isVisible;
    this.render();
    if (this.isVisible) {
      this.setFocus();
    }
  }

  onQuantityBlur(evt, target) {
    this.setQuantity(target, () => target.value);
  }

  onQuantityIncrement(qty, evt, target) {
    this.setQuantity(target, (prevQty) => prevQty + qty);
  }

  onCheckout() {
    this.checkout.open(this.model.checkoutUrl);
  }

  /**
   * set quantity for a line item.
   * @param {Object} target - DOM node of line item
   * @param {Function} fn - function to return new quantity given currrent quantity.
   */
  setQuantity(target, fn) {
    const id = target.getAttribute('data-line-item-id');
    const item = this.model.lineItems.filter((lineItem) => lineItem.id === id)[0];
    const newQty = fn(item.quantity);
    return this.props.tracker.trackMethod(this.updateItem.bind(this), 'CART_UPDATE', this.cartItemTrackingInfo(item, newQty))(id, newQty);
  }

  /**
   * update line item.
   * @param {Number} id - lineItem id.
   * @param {Number} qty - quantity for line item.
   */
  updateItem(id, qty) {
    this._userEvent('updateItemQuantity');
    return this.model.updateLineItem(id, qty).then((cart) => {
      this.model = cart;
      this.toggles.forEach((toggle) => toggle.render());
      if (!this.iframe) {
        this.render();
        return cart;
      }
      if (qty > 0) {
        this.render();
      } else {
        this._animateRemoveItem(id);
      }
      return cart;
    });
  }

  /**
   * re-assign configuration and re-render component.
   * Update toggle component.
   * @param {Object} config - new configuration object.
   */
  updateConfig(config) {
    super.updateConfig(config);
    this.toggles.forEach((toggle) => toggle.updateConfig(config));
  }

  /**
   * add variant to cart.
   * @param {Object} variant - variant object.
   * @param {Number} [quantity=1] - quantity to be added.
   */
  addVariantToCart(variant, quantity = 1) {
    if (quantity <= 0) {
      return null;
    }
    this.open();
    return this.model.createLineItemsFromVariants({variant, quantity}).then((cart) => {
      this.render();
      this.toggles.forEach((toggle) => toggle.render());
      this.setFocus();
      return cart;
    });
  }

  /**
   * Remove all lineItems in the cart
   */
  empty() {
    return this.model.clearLineItems().then(() => {
      this.render();
      this.toggles.forEach((toggle) => toggle.render());
      return;
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

  _animateRemoveItem(id) {
    const el = this.document.getElementById(id);
    addClassToElement('is-hidden', el);
    if (this.props.browserFeatures.transition) {
      el.addEventListener('transitionend', () => {
        // eslint-disable-next-line
        // TODO: why is transitionend sometimes called twice?
        if (!el.parentNode) {
          return;
        }
        this._removeItem(el);
      });
    } else {
      this._removeItem(el);
    }
  }

  _removeItem(el) {
    el.parentNode.removeChild(el);
    this.render();
  }
}
