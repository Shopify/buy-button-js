import Updater from '../updater';

export default class ProductSetUpdater extends Updater {
  updateConfig(config) {
    super.updateConfig(config);
    this.component.props.destroyComponent('modal');
    this.component.cart.updateConfig(config);
    this.component.renderProducts();
  }
}
