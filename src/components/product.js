import Component from './component';

export default class Product extends Component {
  constructor(config, props) {
    super(config, props, 'product');
    this.childTemplate = new Template(this.config.option.templates, this.config.option.contents);
  }

  fetchData() {
    return this.props.client.fetchProduct(this.id);
  }


  get childrenHtml() {
    this.model.options.forEach((option) => {

    });
  }
}
