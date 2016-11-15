import Frame from '../frame';

export default class CartFrame extends Frame {
  render() {
    if (!this.iframe) {
      return;
    }
    if (this.component.isVisible) {
      this.iframe.addClass('is-active');
      this.iframe.addClass('is-initialized');
    } else {
      this.iframe.removeClass('is-active');
    }
  }
}
