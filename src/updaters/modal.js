import Updater from '../updater';
import Product from '../components/product';

export default class ModalUpdater extends Updater {
  updateConfig(config) {
    super.updateConfig(config);
    this.component.product = new Product(this.component.productConfig, this.component.props);
    return this.component.product.init(this.component.model).then(() => this.component.view.resize());
  }
}
