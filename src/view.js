import morphdom from 'morphdom';
import Template from './template';
import Iframe from './iframe';
import styles from './styles/embeds/all';
import {addClassToElement, removeClassFromElement} from './utils/element-class';
import {trapFocus} from './utils/focus';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const ESC_KEY = 27;

export default class View {
  constructor(component) {
    this.component = component;
    this.iframe = null;
    this.node = this.component.node;
    this.template = new Template(this.component.options.templates, this.component.options.contents, this.component.options.order);
    this.eventsBound = false;
  }

  init() {
    this.component.node.className += ` shopify-buy-frame shopify-buy-frame--${this.component.typeKey}`;
    if (this.iframe || !this.component.options.iframe) {
      return Promise.resolve(this.iframe);
    }
    this.iframe = new Iframe(this.component.node, {
      classes: this.component.classes,
      customStyles: this.component.styles,
      stylesheet: styles[this.component.typeKey],
      browserFeatures: this.component.props.browserFeatures,
      googleFonts: this.component.googleFonts,
      name: this.component.name,
      width: this.component.options.layout === 'vertical' ? this.component.options.width : null,
    });
    this.iframe.addClass(this.className);
    return this.iframe.load();
  }

  /**
   * renders string template using viewData to wrapper element.
   */
  render() {
    this.component._userEvent('beforeRender');
    const html = this.template.render({data: this.component.viewData}, (data) => {
      return this.wrapTemplate(data);
    });
    if (!this.wrapper) {
      this.wrapper = this._createWrapper();
    }
    this.updateNode(this.wrapper, html);
    this.resize();
    this.component._userEvent('afterRender');
  }

  /**
   * delegates DOM events to event listeners.
   */
  delegateEvents() {
    if (this.eventsBound) {
      return;
    }

    this.closeComponentsOnEsc();

    Object.keys(this.component.DOMEvents).forEach((key) => {
      const [, eventName, selectorString] = key.match(delegateEventSplitter);
      if (selectorString) {
        this._on(eventName, selectorString, (evt, target) => {
          this.component.DOMEvents[key].call(this, evt, target);
        });
      } else {
        this.wrapper.addEventListener('click', (evt) => {
          this.component.DOMEvents[key].call(this, evt);
        });
      }
    });
    if (this.iframe) {
      this.iframe.el.onload = () => {
        this.iframe.el.onload = null;
        this.reloadIframe();
      };
    }

    this.eventsBound = true;
  }

  reloadIframe() {
    this.node.removeChild(this.iframe.el);
    this.wrapper = null;
    this.iframe = null;
    this.component.init();
  }

  append(wrapper) {
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.component.node.appendChild(wrapper);
    }
  }

  addClass(className) {
    if (this.iframe) {
      this.iframe.addClass(className);
    } else {
      addClassToElement(className, this.component.node);
    }
  }

  removeClass(className) {
    if (this.iframe) {
      this.iframe.removeClass(className);
    } else {
      removeClassFromElement(className, this.component.node);
    }
  }

  destroy() {
    this.node.parentNode.removeChild(this.node);
  }

  /**
   * update the contents of a DOM node with template
   * @param {String} className - class name to select node.
   * @param {Object} template - template to be rendered.
   */
  renderChild(className, template) {
    const selector = `.${className.split(' ').join('.')}`;
    const node = this.wrapper.querySelector(selector);
    const html = template.render({data: this.component.viewData});
    this.updateNode(node, html);
  }

  /**
   * call morpdom on a node with new HTML
   * @param {Object} node - DOM node to be updated.
   * @param {String} html - HTML to update DOM node with.
   */
  updateNode(node, html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    morphdom(node, div.firstElementChild);
  }

  /**
   * wrap HTML string in containing elements.
   * May be defined in subclass.
   * @param {String} html - HTML string.
   * @return {String} wrapped string.
   */
  wrapTemplate(html) {
    return `<div class="${this.component.classes[this.component.typeKey][this.component.typeKey]}">${html}</div>`;
  }

  /**
   * resize iframe if necessary.
   */
  resize() {
    if (!this.iframe || !this.wrapper) {
      return;
    }
    if (this.shouldResizeX) {
      this._resizeX();
    }
    if (this.shouldResizeY) {
      this._resizeY();
    }
  }

  /**
   * get total height of iframe contents
   * @return {String} value in pixels.
   */
  get outerHeight() {
    const style = window.getComputedStyle(this.wrapper, '');
    if (!style) {
      return `${this.wrapper.clientHeight}px`;
    }
    let height = style.getPropertyValue('height');
    if (!height || height === '0px' || height === 'auto') {
      const clientHeight = this.wrapper.clientHeight;
      height = style.getPropertyValue('height') || `${clientHeight}px`;
    }
    return height;
  }

  get className() {
    return '';
  }

  /**
   * Trap focus in the wrapper.
   */
  setFocus() {
    trapFocus(this.wrapper);
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

  animateRemoveNode(id) {
    const el = this.document.getElementById(id);
    addClassToElement('is-hidden', el);
    if (this.component.props.browserFeatures.animation) {
      el.addEventListener('animationend', () => {
        if (!el.parentNode) {
          return;
        }
        this.removeNode(el);
      });
    } else {
      this.removeNode(el);
    }
  }

  removeNode(el) {
    el.parentNode.removeChild(el);
    this.render();
  }

  _createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = this.component.classes[this.component.typeKey][this.component.typeKey];
    this.append(wrapper);
    return wrapper;
  }

  _resizeX() {
    this.iframe.el.style.width = `${this.document.body.clientWidth}px`;
  }

  _resizeY(value) {
    const newHeight = value || this.outerHeight;
    this.iframe.el.style.height = newHeight;
  }

  _on(eventName, selector, fn) {

    this.wrapper.addEventListener(eventName, (evt) => {
      const possibleTargets = Array.prototype.slice.call(this.wrapper.querySelectorAll(selector));
      const target = evt.target;

      possibleTargets.forEach((possibleTarget) => {
        let el = target;
        while (el && el !== this.wrapper) {
          if (el === possibleTarget) {
            return fn.call(possibleTarget, evt, possibleTarget);
          }
          el = el.parentNode;
        }
        return el;
      });
    }, eventName === 'blur');
  }
}
