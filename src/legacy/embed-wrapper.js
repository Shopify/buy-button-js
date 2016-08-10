import {attributes} from './legacy-attributes';
import OptionsTransform from './options-transform';

class EmbedWrapper {
  constructor(element) {
    this.element = element;
    const options = attributes.reduce((opts, attr) => {
      opts[attr] = this.element.getAttribute(`data-${attr}`);
      return opts;
    }, {});
    this.shop = options.shop;
    this.embedType = options.embed_type;
    this.handle = options[`${this.embedType}_handle`];
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
