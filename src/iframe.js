import hogan from 'hogan.js';
import stylesTemplate from './templates/styles';

const iframeStyles = {
  width: '100%',
  overflow: 'hidden',
  border: 'none',
};

const iframeAttrs = {
  horizontalscrolling: 'no',
  verticalscrolling: 'no',
  allowTransparency: 'true',
  frameBorder: '0',
  scrolling: 'false',
};

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function ruleDeclarations(rule) {
  return Object.keys(rule).filter((key) => !isPseudoSelector(key)).map((key) => ({property: key, value: rule[key]}));
}

export default class iframe {
  constructor(parent, classes, customStyles, stylesheet) {
    this.el = document.createElement('iframe');
    this.parent = parent;
    this.stylesheet = stylesheet;
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.customStylesHash = customStyles || {};
    this.classes = classes;
    this.styleTag = null;
  }

  load() {
    return new Promise((resolve) => {
      this.el.onload = () => {
        this.appendStyleTag();
        resolve();
      };
      this.parent.appendChild(this.el);
    });
  }

  addClass(className) {
    this.parent.classList.add(className);
  }

  removeClass(className) {
    this.parent.classList.remove(className);
  }

  get document() {
    let doc;
    if (this.el.contentWindow && this.el.contentWindow.document.body) {
      doc = this.el.contentWindow.document;
    } else if (this.el.document && this.el.document.body) {
      doc = this.el.document;
    } else if (this.el.contentDocument && this.el.contentDocument.body) {
      doc = this.el.contentDocument;
    }
    return doc;
  }

  get customStyles() {
    let customStyles = [];

    Object.keys(this.customStylesHash).forEach((key) => {
      const styleGroup = [];

      Object.keys(this.customStylesHash[key]).forEach((decKey) => {
        if (isPseudoSelector(decKey)) {
          styleGroup.push({
            selector: `.${this.classes[key]}${decKey}`,
            declarations: ruleDeclarations(this.customStylesHash[key][decKey]),
          });
        } else {
          const selector = this.classes[key].split(' ').join('.');
          styleGroup.push({
            selector: `.${selector}`,
            declarations: ruleDeclarations(this.customStylesHash[key]),
          });
        }
      });
      customStyles = customStyles.concat(styleGroup);
    });

    return customStyles;
  }

  get defaultStyles() {
    return this.stylesheet.map((rule) => ({selector: rule.selectors.join(', '), declarations: rule.declarations}));
  }

  updateStyles(customStyles) {
    this.customStylesHash = customStyles;
    const compiled = hogan.compile(stylesTemplate);
    const selectors = this.defaultStyles.concat(this.customStyles);
    this.styleTag.innerHTML = compiled.render({selectors});
  }

  appendStyleTag() {
    if (!this.document.head) {
      return;
    }
    this.styleTag = this.document.createElement('style');
    const compiled = hogan.compile(stylesTemplate);
    const selectors = this.defaultStyles.concat(this.customStyles);

    if (this.styleTag.styleSheet) {
      this.styleTag.styleSheet.cssText = compiled.render({selectors});
    } else {
      this.styleTag.appendChild(this.document.createTextNode(compiled.render({selectors})));
    }

    this.document.head.appendChild(this.styleTag);
  }
}
