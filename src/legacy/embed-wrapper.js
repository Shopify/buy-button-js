import OptionsTransform from './options-transform';

class EmbedWrapper {
  constructor(element) {
    this.element = element;
    this.optionsTransform = new OptionsTransform(this.embedType, this.element);
    this.shop = this.optionsTransform.legacyOptions.shop;
    this.embedType = this.optionsTransform.legacyOptions.embed_type;
    this.variantId = parseInt(this.optionsTransform.legacyOptions.variant_id, 10);
    this.handle = this.optionsTransform.legacyOptions[`${this.embedType}_handle`];
    this.options = this.optionsTransform.uiArguments;
  }
  render(ui) {
    return ui.createComponent(this.embedType, {
      handle: this.handle,
      node: this.element,
      options: this.options,
    }).then((component) => {
      this.component = component;
      return this.component;
    });
  }
}

export default EmbedWrapper;
