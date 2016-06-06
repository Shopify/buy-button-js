import Iframe from './iframe';

export default class ComponentContainer {
  constructor(config, props) {
    this.config = config;
    this.props = props;
    this.model = null;
    this.iframe = this.config.iframe ? new Iframe(this.config.entryNode) : null;
    this.document = this.config.iframe ? this.iframe.document : window.document;
    this.wrapper = null;
  }

  init() {
    this.getData().then((data) => {
      this.model = data;
      this.render();
    });
  }

  resize() {
    if (this.config.iframe) {
      this.iframe.el.style.height = this.wrapper.clientHeight + 'px';
    }
  }

  render() {
    this.wrapper = this.wrapper || this._createWrapper();
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
