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
    if (this.wrapper && this._closeOnBgClick) {
      this.wrapper.removeEventListener('click', this._closeOnBgClick);
    }
    removeClassFromElement('is-active', this.wrapper);
    removeClassFromElement('is-active', this.document.body);
    removeClassFromElement('shopify-buy-modal-is-active', document.body);
    removeClassFromElement('shopify-buy-modal-is-active', document.getElementsByTagName('html')[0]);
    if (!this.iframe) {
      removeClassFromElement('is-active', this.component.node);
      removeClassFromElement('is-block', this.component.node);
      return;
    }
    this.iframe.removeClass('is-block');
    if (this.component.props.browserFeatures.transition) {
      this.iframe.parent.addEventListener('transitionend', () => {
        this.iframe.removeClass('is-active');
      });
    } else {
      this.iframe.removeClass('is-active');
    }
  }

  /**
   * delegates DOM events to event listeners.
   * Adds event listener to wrapper to close modal on click.
   */
  delegateEvents() {
    super.delegateEvents();
    this._closeOnBgClick = this.component.closeOnBgClick.bind(this.component);
    this.wrapper.addEventListener('click', this._closeOnBgClick);
  }

  render() {
    if (!this.component.isVisible) {
      return;
    }
    super.render();
    addClassToElement('is-active', this.document.body);
    addClassToElement('shopify-buy-modal-is-active', document.body);
    addClassToElement('shopify-buy-modal-is-active', document.getElementsByTagName('html')[0]);
    addClassToElement('is-active', this.wrapper);
    if (this.iframe) {
      this.iframe.addClass('is-active');
      this.iframe.addClass('is-block');
    } else {
      addClassToElement('is-active', this.component.node);
      addClassToElement('is-block', this.component.node);
    }
  }
}
