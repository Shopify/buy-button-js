import Component from '../component';

export default class CartToggle extends Component {
  constructor(config, props) {
    super(config, props, 'toggle');
    this.node = this.props.cart.node.parentNode.insertBefore(document.createElement('div'), this.props.cart.node);
  }

  get viewData() {
    return {
      classes: this.classes,
      text: this.text,
      count: this.props.cart.model.lineItems.length
    };
  }

  get DOMEvents() {
    return Object.assign({}, this.options.DOMEvents, {
      [`click .${this.classes.toggle}`]: this.props.cart.toggleVisibility.bind(this.props.cart),
    });
  }
}
