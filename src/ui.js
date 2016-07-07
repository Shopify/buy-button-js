import Product from './components/product';

const DATA_ATTRIBUTE = 'data-shopify-buy-ui';
export default class UI {
  constructor(client) {
    this.client = client;
    this.components = {
      product: [],
    };

    this.componentTypes = {
      product: Product,
    };
  }

  queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll(`script[${DATA_ATTRIBUTE}]`)[0];
    this.entry.removeAttribute(DATA_ATTRIBUTE);
    const div = document.createElement('div');
    this.entry.appendChild(div);
    return div;
  }

  componentProps(type) {
    const typeProperties = {
      product: {},
    }[type];
    return Object.assign({}, typeProperties, {
      client: this.client,
    });
  }

  createComponent(type, config) {
    config.node = config.node || this.queryEntryNode();
    const component = new this.componentTypes[type](config, this.componentProps(type));
    this.components[type].push(component);
    return component.init().then(() => component);
  }
}
