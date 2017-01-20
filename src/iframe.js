import Mustache from 'mustache';
import stylesTemplate from './templates/styles';
import conditionalStyles from './styles/embeds/conditional';
import {addClassToElement, removeClassFromElement} from './utils/element-class';

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
  scrolling: 'no',
};

const webfontScript = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

function isValue(test) {
  return typeof test === 'string' || typeof test === 'number';
}

function ruleDeclarations(rule) {
  return Object.keys(rule).filter((key) => {
    return isValue(rule[key]);
  }).map((key) => ({property: key, value: rule[key]}));
}

function selectorStyleGroup(selector, selectorClass, classes) {
  let styleGroup = [];
  if (selector && selectorClass) {
    let formattedSelector = selectorClass.split(' ').join('.');
    if (!isPseudoSelector(formattedSelector)) {
      formattedSelector = `.${formattedSelector}`;
    }
    styleGroup = Object.keys(selector).filter((decKey) => {
      return !isValue(selector[decKey]);
    }).reduce((acc, decKey) => {
      const className = classes[decKey] || decKey;
      return acc.concat(selectorStyleGroup(selector[decKey], className, classes).map((group) => {
        let groupSelector = '';
        if (isPseudoSelector(group.selector)) {
          groupSelector = `${formattedSelector}${group.selector}`;
        } else if (isMedia(decKey)) {
          groupSelector = formattedSelector;
        } else {
          groupSelector = `${formattedSelector} ${group.selector}`;
        }
        return {
          selector: groupSelector,
          declarations: group.declarations,
          media: isMedia(decKey) ? decKey : null,
        };
      }));
    }, []);
    const declarations = ruleDeclarations(selector);
    if (declarations.length) {
      styleGroup.push({
        selector: `${formattedSelector}`,
        declarations,
      });
    }
  }
  return styleGroup;
}

export default class iframe {
  constructor(node, config) {
    this.el = document.createElement('iframe');
    this.parent = node;
    this.stylesheet = config.stylesheet;
    this.customStylesHash = config.customStyles || {};
    this.classes = config.classes;
    this.browserFeatures = config.browserFeatures;
    this.googleFonts = config.googleFonts || [];
    this.name = config.name;
    if (config.width) {
      this.setWidth(config.width);
    }
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.el.setAttribute('name', config.name);
    this.styleTag = null;
  }

  load() {
    return new Promise((resolve) => {
      this.el.onload = () => {
        return this.loadFonts().then(() => {
          this.appendStyleTag();
          return resolve();
        });
      };
      this.parent.appendChild(this.el);
    });
  }

  loadFonts() {
    if (!this.googleFonts || !this.googleFonts.length) {
      return Promise.resolve(true);
    }
    return this.loadFontScript().then(() => {
      return new Promise((resolve) => {
        if (!window.WebFont) {
          return resolve();
        }
        window.WebFont.load({
          google: {
            families: this.googleFonts,
          },
          fontactive: () => {
            return resolve();
          },
          context: this.el.contentWindow || frames[this.name],
        });
        return window.setTimeout(() => {
          return resolve();
        }, 1000);
      });
    });
  }

  loadFontScript() {
    if (window.WebFont) {
      return Promise.resolve();
    }
    const fontScript = document.createElement('script');
    return new Promise((resolve) => {
      fontScript.onload = () => {
        resolve();
      };
      fontScript.src = webfontScript;
      document.head.appendChild(fontScript);
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  setWidth(width) {
    this.parent.style['max-width'] = width;
  }

  get width() {
    return this.parent.style['max-width'];
  }

  addClass(className) {
    addClassToElement(className, this.parent);
  }

  removeClass(className) {
    removeClassFromElement(className, this.parent);
  }

  setName(name) {
    this.el.setAttribute('name', name);
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
    Object.keys(this.customStylesHash).forEach((typeKey) => {
      if (this.customStylesHash[typeKey]) {
        Object.keys(this.customStylesHash[typeKey]).forEach((key) => {
          const styleGroup = selectorStyleGroup(this.customStylesHash[typeKey][key], this.classes[typeKey][key], this.classes[typeKey]);
          customStyles = customStyles.concat(styleGroup);
        });
      }
    });
    return customStyles;
  }

  get conditionalCSS() {
    if (this.browserFeatures.transition && this.browserFeatures.transform && this.browserFeatures.animation) {
      return '';
    }
    return conditionalStyles;
  }

  get css() {
    const compiled = Mustache.render(stylesTemplate, {selectors: this.customStyles});
    return `${this.stylesheet} \n ${compiled} \n ${this.conditionalCSS}`;
  }

  updateStyles(customStyles, googleFonts) {
    this.googleFonts = googleFonts;
    return this.loadFonts().then(() => {
      this.customStylesHash = customStyles;
      this.styleTag.innerHTML = this.css;
      return;
    });
  }

  appendStyleTag() {
    if (!this.document.head) {
      return;
    }
    this.styleTag = this.document.createElement('style');

    if (this.styleTag.styleSheet) {
      this.styleTag.styleSheet.cssText = this.css;
    } else {
      this.styleTag.appendChild(this.document.createTextNode(this.css));
    }

    this.document.head.appendChild(this.styleTag);
  }
}
