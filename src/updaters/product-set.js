import Updater from '../updater';

export default class ProductSetUpdater extends Updater {
  updateConfig(config) {
    super.updateConfig(config);
    if (this.component.products[0].modal) {
      this.component.products[0].modal.updateConfig(Object.assign({}, config, {
        options: Object.assign({}, config.options, {
          product: config.options.modalProduct,
        }),
      }));
    }
    this.component.cart.updateConfig(config);
    this.component.renderProducts();
  }
}
