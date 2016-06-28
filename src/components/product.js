import Component from './component';
import Template from './template';

export default class Product extends Component {
  constructor(config, props) {
    super(config, props, 'product');
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents);
  }

  fetchData() {
    return this.props.client.fetchProduct(this.id);
  }

  render() {
    super.render.call(this, this.childrenHtml);
  }

  get events() {
    return Object.assign({}, this.options.events, {
      [`change .${this.config.option.classes.select}`]: this.onVariantChange.bind(this),
      [`click .${this.options.classes.button}`]: this.onButtonClick.bind(this)
    });
  }

  get windowParams() {
    return Object.keys(this.config.window).reduce((acc, key) => {
      return acc + `${key}=${this.config.window[key]},`;
    }, '');
  }

  onButtonClick(evt, product) {
    if (this.options.buttonTarget === 'cart') {
      this.props.addToCart(product.model);
    } else {
      this.openCheckout();
    }
  }

  openCheckout() {
    window.open(this.model.selectedVariant.checkoutUrl(1), 'checkout', this.windowParams);
  }

  onVariantChange(evt, product) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    const selectedOption = this.model.options.filter((option, index) => {
      return option.name === name;
    })[0];
    selectedOption.selected = value;
    this.render();
  }

  get childrenHtml() {
    return this.model.options.reduce((acc, option) => {
      const data = option;
      data.classes = this.config.option.classes;
      return acc + this.childTemplate.render({ data: data });
    }, '');
  }
}
