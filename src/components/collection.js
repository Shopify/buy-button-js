import Widget from './widget';
import Product from './product';

const collectionDefaults = {
  className: 'collection'
}

export default class Collection extends Widget {
  constructor(config, props) {
    let collectionConfig = Object.assign(collectionDefaults, config);
    super(collectionConfig, props);
    this.config.productConfig = {};
    this.products = [];
  }

  getData() {
    return new Promise((resolve) => {
      return resolve([{
        title: 'test',
        selectedVariant: {
          title: 'testVariant',
          price: '$10'
        }
      },{
        title: 'cat hat',
        selectedVariant: {
          title: 'red',
          price: '$15'
        }
      }])
    });
  }

  render() {
    this.renderTarget.setHtml('');
    let config = Object.assign(this.config.productConfig, {
      parentNode: this.renderTarget.node,
      iframe: false
    });
    this.getData().then((data) => {
      this.config.parentNode.appendChild(this.renderTarget.el);
      this.products = data.map((p) => {
        let props = Object.assign({}, this.props);
        props.data = p;
        let product = new Product(config, props);
        product.render().then(() => {
          this.renderTarget.resize()
        });
      });
    });
  }
}
