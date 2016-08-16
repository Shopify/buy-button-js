import OptionsTransform from './options-transform';

class EmbedWrapper {
  constructor(element) {
    this.optionsTransform = new OptionsTransform(element);
    this.shop = this.optionsTransform.legacyOptions.shop;

    this.embedConfig = {
      handle: this.optionsTransform.handle,
      node: element,
      options: this.optionsTransform.uiOptions,
    };

    if (this.optionsTransform.legacyOptions.variant_id) {
      this.embedConfig.variantId = parseInt(this.optionsTransform.legacyOptions.variant_id, 10);
    }
  }
  render(ui) {
    return ui.createComponent(this.optionsTransform.embedType, this.embedConfig).then((component) => {
      this.component = component;
      return this.component;
    });
  }
}

export default EmbedWrapper;
