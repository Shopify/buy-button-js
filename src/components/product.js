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
      [`change .${this.config.option.classes.select}`]: this.onOptionSelect.bind(this),
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

  onOptionSelect(evt) {
    const target = evt.target;
    const value = target.options[target.selectedIndex].value;
    const name = target.getAttribute('name');
    this.updateVariant(name, value);
  }

  updateVariant(optionName, value) {
    const updatedOption = this.model.options.filter((option) => {
      return option.name === optionName;
    })[0];
    updatedOption.selected = value;
    this.render();
    return updatedOption;
  }

  decorateValues(option) {
    return option.values.map((value) => {
      return {
        name: value,
        selected: value === option.selected
      }
    });
  }

  get childrenHtml() {
    return this.model.options.reduce((acc, option) => {
      const data = option;
      data.decoratedValues = this.decorateValues(option);
      data.classes = this.config.option.classes;
      return acc + this.childTemplate.render({ data: data });
    }, '');
  }
}
