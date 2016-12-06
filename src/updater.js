import merge from './utils/merge';
import Template from './template';

export default class Updater {
  constructor(component) {
    this.component = component;
  }

  updateConfig(config) {
    this.component.config = merge(this.component.config, config.options);
    this.component.view.template = new Template(this.component.options.templates, this.component.options.contents, this.component.options.order);
    if (this.component.view.iframe) {
      this.component.view.iframe.updateStyles(this.component.styles, this.component.googleFonts);
    }
    this.component.view.render();
    this.component.view.resize();
  }
}
