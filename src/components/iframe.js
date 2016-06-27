import hogan from 'hogan.js';
import stylesTemplate from '../templates/styles';

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
  constructor(parent, classes, rawStyles) {
    this.el = document.createElement('iframe');
    this.el.scrolling = false;
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));
    this.rawStyles = rawStyles || {};
    this.classes = classes;
    this.div = document.createElement('div');
    this.div.appendChild(this.el);
    parent.appendChild(this.div);
    this.loadCSS();
  }

  get document() {
    return this.el.contentDocument;
  }

  loadCSS() {
    const cssURL = 'src/styles/main.css';

    const link = this.document.createElement('link');
    const img = this.document.createElement('img');

    img.style.opacity = 0;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssURL;

    this.document.head.appendChild(link);
    this.document.body.appendChild(img);

    img.src = cssURL;
    img.onerror = () => {
      this.document.body.removeChild(img);
      this.appendStyleTag();
    }
  }

   get styles() {
    return Object.keys(this.rawStyles).map((key) => {
      return {
        selector: `.${this.classes[key]}`,
        declarations: Object.keys(this.rawStyles[key]).map((styleKey) => {
          return {
            name: styleKey,
            value: this.rawStyles[key][styleKey]
          }
        })
      }
    });
  }

  appendStyleTag() {
    let style = this.document.createElement('style');
    let compiled = hogan.compile(stylesTemplate)
    style.innerHTML = compiled.render({selectors: this.styles});
    this.el.contentDocument.head.appendChild(style);
  }
}
