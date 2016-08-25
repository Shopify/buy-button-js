import merge from '../utils/merge';
import Component from '../component';

export default class CartToggle extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = this.props.cart.node.parentNode.insertBefore(document.createElement('div'), this.props.cart.node);
  }

  get isVisible() {
    return this.count > 0;
  }

  get typeKey() {
    return 'toggle';
  }

  get count() {
    return this.props.cart.model.lineItems.reduce((acc, lineItem) => {
      return acc + lineItem.quantity;
    }, 0);
  }

  get viewData() {
    return {
      classes: this.classes,
      text: this.text,
      count: this.count,
    };
  }

  get DOMEvents() {
    return merge({}, this.options.DOMEvents, {
      [`click .${this.classes.toggle.toggle}`]: this.props.cart.toggleVisibility.bind(this.props.cart),
    });
  }

  render() {
    super.render();
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  }
}
