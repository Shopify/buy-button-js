import hogan from 'hogan.js';
import stylesTemplate from './templates/styles';
import conditionalStyles from './styles/embeds/conditional';

const googleFonts = [
  'Oswald',
  'Raleway',
  'Roboto',
  'Lato',
];

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

function isMedia(key) {
  return key.charAt(0) === '@';
}

function ruleDeclarations(rule) {
  return Object.keys(rule).filter((key) => !isPseudoSelector(key) && !isMedia(key)).map((key) => ({property: key, value: rule[key]}));
}

function selectorStyleGroup(selector, selectorClass) {
  const styleGroup = [];
  if (selector && selectorClass) {
    Object.keys(selector).forEach((decKey) => {
      if (selector && selectorClass) {
        if (isPseudoSelector(decKey)) {
          styleGroup.push({
            selector: `.${selectorClass}${decKey}`,
            declarations: ruleDeclarations(selector[decKey]),
          });
        } else if (isMedia(decKey)) {
          styleGroup.push({
            media: decKey,
            selector: `.${selectorClass}`,
            declarations: ruleDeclarations(selector[decKey]),
          });
        }
      }
    });
    const formattedSelector = selectorClass.split(' ').join('.');
    styleGroup.push({
      selector: `.${formattedSelector}`,
      declarations: ruleDeclarations(selector),
    });
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
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.styleTag = null;
  }

  load() {
    return new Promise((resolve) => {
      this.el.onload = () => {
        return this.loadFonts().then(() => {
          this.appendStyleTag();
          resolve();
        });
      };
      this.parent.appendChild(this.el);
    });
  }

  loadFonts() {
    if (!this.googleFonts.length) {
      return Promise.resolve();
    }
    this.el.contentWindow.ShopifyBuyConfig = {
      googleFonts: this.googleFonts,
    }
    const fontScript = this.document.createElement('script');
    return new Promise((resolve) => {
      fontScript.onload = () => {
        resolve();
      };
      fontScript.src = 'tmp/google-fonts.js';
      this.document.head.appendChild(fontScript);
    });
  }

  addClass(className) {
    if (this.parent.className.indexOf(className) < 0) {
      this.parent.className += ` ${className}`;
    }
  }

  setName(name) {
    this.el.setAttribute('name', name);
  }

  removeClass(className) {
    const newClass = this.parent.className.replace(className, '');
    this.parent.className = newClass;
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
          const styleGroup = selectorStyleGroup(this.customStylesHash[typeKey][key], this.classes[typeKey][key]);
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
    const compiled = hogan.compile(stylesTemplate);
    return `${this.stylesheet} \n ${compiled.render({selectors: this.customStyles})} \n ${this.conditionalCSS}`;
  }

  updateStyles(customStyles) {
    this.customStylesHash = customStyles;
    this.styleTag.innerHTML = this.css;
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
