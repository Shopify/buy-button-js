import Component from '../component';

export default class CartToggle extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = this.props.cart.node.parentNode.insertBefore(document.createElement('div'), this.props.cart.node);
  }

  get typeKey() {
    return 'toggle';
  }

  get viewData() {
    return {
      classes: this.classes,
      text: this.text,
      count: this.props.cart.model.lineItems.reduce((acc, lineItem) => {
        return acc + lineItem.quantity;
      }, 0),
    };
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.toggle.toggle}`]: this.props.cart.toggleVisibility.bind(this.props.cart),
    });
  }
}
