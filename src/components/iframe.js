import stylesTemplate from '../templates/styles';
import Handlebars from 'handlebars';

export default class Iframe {
  constructor(parent, styles, classes) {
    this.stylesConfig = styles || {};
    this.classes = classes;

    this.div = document.createElement('div');
    this.div.setAttribute('data-embed_type', this.classes.data);

    this.el = document.createElement('iframe');
    this.el.style.width = '100%';
    this.el.style.overflow = 'hidden';
    this.el.style.border = "none";
    this.el.scrolling = false;
    this.el.setAttribute("horizontalscrolling", "no");
    this.el.setAttribute("verticalscrolling", "no");
    this.div.appendChild(this.el);
    parent.appendChild(this.div);
    this.loadCSS();
    this.el.contentDocument.body.style.margin = 0;
  }

  loadCSS() {
    let cssURL = './styles/main.css';

    let link = this.document.createElement('link');
    let img = this.document.createElement('img');

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

  appendStyleTag() {
    let style = this.el.contentDocument.createElement('style');
    style.innerHTML = Handlebars.compile(stylesTemplate)({selectors: this.styles});
    this.el.contentDocument.head.appendChild(style);
  }

  get styles() {
    return Object.keys(this.stylesConfig).map((key) => {
      return {
        selector: `.${this.classes[key]}`,
        declarations: Object.keys(this.stylesConfig[key]).map((styleKey) => {
          return {
            name: styleKey,
            value: this.stylesConfig[key][styleKey]
          }
        })
      }
    });
  }

  get document() {
    return this.el.contentDocument;
  }
}

