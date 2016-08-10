import {attributes} from './legacy-attributes';
import OptionsTransform from './options-transform';

class EmbedWrapper {
  constructor(element) {
    this.element = element;
    this.options = {};
    this.generateEmbedOptions();
  }
  generateEmbedOptions() {
    const options = {};
    attributes.forEach((attr) => {
      options[attr] = this.element.getAttribute(`data-${attr}`);
    });
    this.embedType = options.embed_type;
    this.handle = options[`${this.embed_type}_handle`];
    this.options = new OptionsTransform(this.embedType, options);
  }
  render(ui) {
    ui.createComponent(this.embedType, {
      handle: this.handle,
      node: this.element,
      options: this.options.process(),
    });
  }
}

export default EmbedWrapper;
