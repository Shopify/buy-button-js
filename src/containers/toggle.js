import Container from '../container';

export default class ToggleContainer extends Container {
  get shouldResizeY() {
    return true;
  }

  get shouldResizeX() {
    return true;
  }

  get isVisible() {
    return this.component.count > 0;
  }

  render() {
    if (!this.iframe) {
      return;
    }
    this.iframe.parent.setAttribute('tabindex', 0);
    if (this.component.options.sticky) {
      this.iframe.addClass('is-sticky');
    }
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  }

  _resizeX() {
    this.iframe.el.style.width = `${this.component.wrapper.clientWidth}px`;
  }
}
