import hogan from 'hogan.js';
import stylesTemplate from './templates/styles';
import defaultStyles from './styles/main';

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
};

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function ruleDeclarations(rule) {
  return Object.keys(rule).filter((key) => !isPseudoSelector(key)).map((key) => ({property: key, value: rule[key]}));
}

export default class iframe {
  constructor(parent, classes, customStyles) {
    this.el = document.createElement('iframe');
    this.el.scrolling = false;
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.customStylesHash = customStyles || {};
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
          styleGroup.push({
            selector: `.${this.classes[key]}`,
            declarations: ruleDeclarations(this.customStylesHash[key]),
          });
        }
      });
      customStyles = customStyles.concat(styleGroup);
    });

    return customStyles;
  }

  get defaultStyles() {
    return defaultStyles.map((rule) => ({selector: rule.selectors.join(', '), declarations: rule.declarations}));
  }

  updateStyles(customStyles) {
    this.customStylesHash = customStyles;
    const compiled = hogan.compile(stylesTemplate);
    const selectors = this.defaultStyles.concat(this.customStyles);
    this.styleTag.innerHTML = compiled.render({selectors});
  }

  appendStyleTag() {
    this.styleTag = this.document.createElement('style');
    const compiled = hogan.compile(stylesTemplate);
    const selectors = this.defaultStyles.concat(this.customStyles);
    this.styleTag.innerHTML = compiled.render({selectors});
    this.el.contentDocument.head.appendChild(this.styleTag);
  }
}
