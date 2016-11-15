import Container from '../container';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

export default class ModalContainer extends Container {

  /**
   * close modal.
   */
  close() {
    this.component.isVisible = false;
    removeClassFromElement('is-active', this.component.wrapper);
    if (!this.iframe) {
      return;
    }
    this.iframe.removeClass('is-active');
    removeClassFromElement('is-active', this.document.body);
    if (this.component.props.browserFeatures.transition) {
      this.iframe.parent.addEventListener('transitionend', () => {
        this.iframe.removeClass('is-block');
      });
    } else {
      this.iframe.removeClass('is-block');
    }
  }

  render() {
    addClassToElement('is-active', this.document.body);
    addClassToElement('is-active', this.component.wrapper);
    if (!this.iframe) {
      return;
    }
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
  }
}
