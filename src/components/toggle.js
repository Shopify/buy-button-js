import merge from '../utils/merge';
import Component from '../component';
import ToggleFrame from '../frames/toggle';

const ENTER_KEY = 13;

export default class CartToggle extends Component {
  constructor(config, props) {
    super(config, props);
    this.node = config.node || this.props.cart.node.parentNode.insertBefore(document.createElement('div'), this.props.cart.node);
    this.frame = new ToggleFrame(this);
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
    return Object.assign({}, this.options.viewData, {
      classes: this.classes,
      text: this.options.text,
      count: this.count,
    });
  }

  get shouldResizeX() {
    return true;
  }

  get outerHeight() {
    return `${this.wrapper.clientHeight}px`;
  }

  get stickyClass() {
    return this.options.sticky ? 'is-sticky' : 'is-inline';
  }

  get DOMEvents() {
    return merge({}, {
      click: this.props.cart.toggleVisibility.bind(this.props.cart),
    }, this.options.DOMEvents);
  }

  delegateEvents() {
    super.delegateEvents();
    if (!this.iframe) {
      return;
    }
    this.iframe.parent.addEventListener('keydown', (evt) => {
      if (evt.keyCode !== ENTER_KEY) {
        return;
      }
      this.props.cart.toggleVisibility(this.props.cart);
    });
  }

  wrapTemplate(html) {
    return `<div class="${this.stickyClass} ${this.classes.toggle.toggle}">${html}</div>`;
  }

  render() {
    super.render();
    this.frame.render();
  }
}
