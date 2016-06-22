import merge from 'deepmerge';
import componentDefaults from '../defaults/components';
import Iframe from './iframe';

export default class Component {
  constructor(config, props, type) {
    this.id = config.id;
    this.type = type;
    this.config = merge(componentDefaults, config.options);
    this.props = props;
    this.iframe = this.options.iframe ? new Iframe(this.el) : null;
  }

  get client() {
    return this.props.client;
  }

  get options() {
    return this.config[this.type];
  }

  get templates() {
    return this.options.templates;
  }

  get contents() {
    return this.options.contents;
  }

  get styles() {
    return this.options.styles;
  }

  get el() {
    return this.config.node || document.getElementsByTagName('script')[0];
  }
}
