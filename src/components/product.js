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

  get childrenHtml() {
    return this.model.options.reduce((acc, option) => {
      return acc + this.childTemplate.render({ data: option });
    }, '');
  }
}
