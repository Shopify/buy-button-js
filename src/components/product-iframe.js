import Product from './product';
import Iframe from './iframe';

const defaults = {
  entryNode: document.getElementsByTagName('script')[0],
  productConfig: {}
}

class ProductIframe {
  constructor(config, data, props) {
    this.config = Object.assign(defaults, config);
    this.data = data || null;
    this.props = props;
  }

  render() {
    if (!this.iframe) {
      this.iframe = new Iframe(document);
      this.iframe.attach();
    }
    this.config.entryNode.parentNode.insertBefore(this.iframe.el, this.config.entryNode);

    this.widget = new Product(Object.assign(this.config, {
      entryNode: this.iframe.document.body
    }), this.data, this.props);

    this.widget.render().then(() => {
      this.iframe.resize(this.widget.div);
    });
  }
}

export default ProductIframe;
