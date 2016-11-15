import Iframe from './iframe';
import styles from './styles/embeds/all';

const ESC_KEY = 27;

export default class Frame {
  constructor(component) {
    this.component = component;
    this.iframe = null;
  }

  init() {
    if (this.iframe || !this.component.options.iframe) {
      return Promise.resolve(this.iframe);
    }
    this.iframe = new Iframe(this.component.node, {
      classes: this.component.classes,
      customStyles: this.styles,
      stylesheet: styles[this.component.typeKey],
      browserFeatures: this.component.props.browserFeatures,
      googleFonts: this.component.googleFonts,
      name: this.component.name,
      width: this.component.options.layout === 'vertical' ? this.component.options.width : null,
    });
    this.component.node.className += ` shopify-buy-frame shopify-buy-frame--${this.component.typeKey}`;
    this.iframe.addClass(this.className);
    return this.iframe.load();
  }

  append(wrapper) {
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.component.node.appendChild(wrapper);
    }
  }

  /**
   * resize iframe if necessary.
   */
  resize() {
    if (!this.iframe || !this.component.wrapper) {
      return;
    }
    if (this.shouldResizeX) {
      this._resizeX();
    }
    if (this.shouldResizeY) {
      this._resizeY();
    }
  }

  _resizeX() {
    this.iframe.el.style.width = `${this.document.body.clientWidth}px`;
  }

  _resizeY(value) {
    const newHeight = value || this.outerHeight;
    this.iframe.el.style.height = newHeight;
  }

  /**
   * get total height of iframe contents
   * @return {String} value in pixels.
   */
  get outerHeight() {
    const style = window.getComputedStyle(this.component.wrapper, '');
    if (!style) {
      return `${this.component.wrapper.clientHeight}px`;
    }
    let height = style.getPropertyValue('height');
    if (!height || height === '0px' || height === 'auto') {
      const clientHeight = this.component.wrapper.clientHeight;
      height = style.getPropertyValue('height') || `${clientHeight}px`;
    }
    return height;
  }

  get className() {
    return '';
  }

  /**
   * determines if iframe will require horizontal resizing to contain its children.
   * May be defined in subclass.
   * @return {Boolean}
   */
  get shouldResizeX() {
    return false;
  }

  /**
   * determines if iframe will require vertical resizing to contain its children.
   * May be defined in subclass.
   * @return {Boolean}
   */
  get shouldResizeY() {
    return false;
  }

  /**
   * get styles for component and any components it contains as determined by manifest.
   * @return {Object} key-value pairs of CSS styles.
   */
  get styles() {
    return this.component.options.manifest.filter((component) => this.component.config[component].styles).reduce((hash, component) => {
      hash[component] = this.component.config[component].styles;
      return hash;
    }, {});
  }

  /**
   * get reference to document object.
   * @return {Objcet} instance of Document.
   */
  get document() {
    return this.iframe ? this.iframe.document : window.document;
  }

  closeComponentsOnEsc() {
    if (!this.iframe) {
      return;
    }
    this.document.addEventListener('keydown', (evt) => {
      if (evt.keyCode !== ESC_KEY) {
        return;
      }
      this.component.props.closeModal();
      this.component.props.closeCart();
    });
  }

}
