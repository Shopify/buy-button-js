import Updater from '../updater';

export default class ProductSetUpdater extends Updater {
  updateConfig(config) {
    super.updateConfig(config);
    this.component.products[0].updateConfig({
      options: Object.assign({}, config.options),
    });
    this.component.cart.updateConfig(config);
    this.component.renderProducts();
  }
}
