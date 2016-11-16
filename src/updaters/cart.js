import Updater from '../updater';

export default class CartUpdater extends Updater {
  updateConfig(config) {
    super.updateConfig(config);
    this.component.toggles.forEach((toggle) => toggle.updateConfig(config));
  }
}
