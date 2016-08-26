import OptionsTransform from './options-transform';

class EmbedWrapper {
  constructor(element) {
    this.element = element;
  }

  render(ui) {
    return ui.createComponent(this.options.embedType, this.embedConfig).then((component) => {
      this.component = component;
      return this.component;
    }).catch(this.handleError.bind(this));
  }

  update(newOptions) {
    this.component.updateConfig({
      options: newOptions || this.options.ui,
    });
  }

  handleError(error) {
    this.element.innerHTML = `Buy Button ${error}`;
  }

  get options() {
    this.optionsTransform = this.optionsTransform || new OptionsTransform(this.element);
    return this.optionsTransform;
  }

  get embedConfig() {
    const config = {
      handle: this.options.handle,
      node: this.element,
      options: this.options.ui,
    };

    if (this.options.variantId) {
      config.variantId = parseInt(this.options.variantId, 10);
    }

    return config;
  }

  get shop() {
    return this.options.shop;
  }
}

export default EmbedWrapper;
