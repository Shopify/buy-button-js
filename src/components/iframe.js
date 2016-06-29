import hogan from 'hogan.js';
import stylesTemplate from '../templates/styles';
import defaultStyles from '../styles/main';

const iframeStyles = {
  width: '100%',
  overflow: 'hidden',
  border: 'none',
};

const iframeAttrs = {
  horizontalscrolling: 'no',
  verticalscrolling: 'no',
  allowTransparency: 'true',
  frameBorder: '0'
};

export default class iframe {
  constructor(parent, classes, customStyles) {
    this.el = document.createElement('iframe');
    this.el.scrolling = false;
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.rawCustomStyles = customStyles || {};
    this.classes = classes;
    this.div = document.createElement('div');
    this.div.appendChild(this.el);
    this.styleTag = null;
    parent.appendChild(this.div);
    this.appendStyleTag();
  }

  get document() {
    return this.el.contentDocument;
  }

  get customStyles() {
    return Object.keys(this.rawCustomStyles).map((key) => {
      return {
        selector: `.${this.classes[key]}`,
        declarations: Object.keys(this.rawCustomStyles[key]).map((decKey) => {
          return {
            property: decKey,
            value: this.rawCustomStyles[key][decKey]
          }
        })
      }
    });
  }

  get defaultStyles() {
    return defaultStyles.map((rule) => {
      return {
        selector: rule.selectors.join(', '),
        declarations: rule.declarations
      }
    });
  }

  updateStyles(customStyles) {
    this.rawCustomStyles = customStyles;
    let compiled = hogan.compile(stylesTemplate)
    const selectors = this.defaultStyles.concat(this.customStyles);
    this.styleTag.innerHTML = compiled.render({selectors: selectors});
  }

  appendStyleTag() {
    this.styleTag = this.document.createElement('style');
    let compiled = hogan.compile(stylesTemplate)
    const selectors = this.defaultStyles.concat(this.customStyles);
    this.styleTag.innerHTML = compiled.render({selectors: selectors});
    this.el.contentDocument.head.appendChild(this.styleTag);
  }
}
