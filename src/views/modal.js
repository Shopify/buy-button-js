import View from '../view';
import {addClassToElement, removeClassFromElement} from '../utils/element-class';

export default class ModalView extends View {
  wrapTemplate(html) {
    return `<div class="${this.component.classes.modal.overlay}"><div class="${this.component.classes.modal.modal}">${html}</div></div>`;
  }

  /**
   * close modal.
   */
  close() {
    this.component.isVisible = false;
    removeClassFromElement('is-active', this.wrapper);
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

  /**
   * delegates DOM events to event listeners.
   * Adds event listener to wrapper to close modal on click.
   */
  delegateEvents() {
    super.delegateEvents();
    this.wrapper.addEventListener('click', this.component.closeOnBgClick.bind(this));
  }

  render() {
    if (!this.component.isVisible) {
      return;
    }
    super.render();
    addClassToElement('is-active', this.document.body);
    addClassToElement('is-active', this.wrapper);
    if (!this.iframe) {
      return;
    }
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
  }
}
