import View from '../view';

const ENTER_KEY = 13;

export default class ToggleView extends View {
  get shouldResizeY() {
    return true;
  }

  get shouldResizeX() {
    return true;
  }

  get isVisible() {
    return this.component.count > 0;
  }

  get stickyClass() {
    return this.component.options.sticky ? 'is-sticky' : 'is-inline';
  }

  get outerHeight() {
    return `${this.wrapper.clientHeight}px`;
  }

  render() {
    if (!this.iframe) {
      return;
    }
    super.render();
    this.iframe.parent.setAttribute('tabindex', 0);
    if (this.component.options.sticky) {
      this.iframe.addClass('is-sticky');
    }
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
    this.resize();
  }

  delegateEvents() {
    super.delegateEvents();
    if (!this.iframe) {
      return;
    }
    this.iframe.parent.addEventListener('keydown', (evt) => {
      if (evt.keyCode !== ENTER_KEY) {
        return;
      }
      this.component.props.cart.toggleVisibility(this.component.props.cart);
    });
  }

  wrapTemplate(html) {
    return `<div class="${this.stickyClass} ${this.component.classes.toggle.toggle}">${html}</div>`;
  }

  _resizeX() {
    this.iframe.el.style.width = `${this.wrapper.clientWidth}px`;
  }
}
