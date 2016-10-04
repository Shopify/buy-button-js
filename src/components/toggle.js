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

  get shouldResizeY() {
    return this.options.sticky;
  }

  get shouldResizeX() {
    return this.options.sticky;
  }

  get stickyClass() {
    return this.options.sticky ? 'is-sticky' : 'is-inline';
  }

  get DOMEvents() {
    return merge({}, {
      click: this.props.cart.toggleVisibility.bind(this.props.cart),
    }, this.options.DOMEvents);
  }

  wrapTemplate(html) {
    return `<div class="${this.stickyClass} ${this.classes.toggle.toggle}">${html}</div>`;
  }

  render() {
    super.render();
    if (this.options.sticky) {
      this.iframe.addClass('is-sticky');
    }
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  }
}
