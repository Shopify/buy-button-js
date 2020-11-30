import merge from '../utils/merge';
import Component from '../component';
import ToggleView from '../views/toggle';


export default class CartToggle extends Component {
  constructor(config, props) {
    super(config, props);
    this.typeKey = 'toggle';
    this.node = config.node || this.props.cart.node.parentNode.insertBefore(document.createElement('div'), this.props.cart.node);
    this.view = new ToggleView(this);
  }

  get count() {
    if (!this.props.cart.model) {
      return 0;
    }
    return this.props.cart.model.lineItems.reduce((acc, lineItem) => {
      return acc + lineItem.quantity;
    }, 0);
  }

  get viewData() {
    return Object.assign({}, this.options.viewData, {
      classes: this.classes,
      text: this.options.text,
      count: this.count,
    });
  }

  get DOMEvents() {
    return merge({}, {
      click: this.toggleCart.bind(this),
    }, this.options.DOMEvents);
  }

  toggleCart(evt) {
    evt.stopPropagation();
    this.props.setActiveEl(this.view.node);
    this.props.cart.toggleVisibility();
  }
}
