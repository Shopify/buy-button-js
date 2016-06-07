import Iframe from './iframe';
import View from './view';

export default class ComponentContainer {
  constructor(config, props) {
    this.config = config;
    this.props = props || {};
    this.iframe = this.config.iframe ? new Iframe(this.config.entryNode, this.config.styles, this.config.classes) : null;
    this.document = this.config.iframe ? this.iframe.document : window.document;
    this.wrapper = null;
    if (!this.props.model) {
      this.init();
    }
  }

  init() {
    this.getData().then((data) => {
      this.props.model = data;
      this.render();
    });
  }

  resize() {
    if (this.config.iframe) {
      this.iframe.el.style.height = this.wrapper.clientHeight + 'px';
    }
  }

  render(wrapper) {
    this.wrapper = wrapper || (this.wrapper || this._createWrapper());

    let view = new View(this.config, this.props.model, this.events);
    view.render(this.wrapper);

    this.wrapper.setAttribute('id', view.id);
  }

  _createWrapper(parent, className) {
    let wrapper = this.document.createElement('div');
    wrapper.className = className || this.config.className;
    if (parent) {
      parent.appendChild(wrapper);
    } else {
      if (this.iframe) {
        this.document.body.appendChild(wrapper);
      } else {
        this.config.entryNode.appendChild(wrapper);
      }
    }
    return wrapper;
  }
}
