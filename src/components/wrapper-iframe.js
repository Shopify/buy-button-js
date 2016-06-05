export default class WrapperIframe {
  constructor (parentNode, document, className) {
    this.document = document;
    this.parentNode = parentNode;
    this.className = className;
  }

  attach () {
    this.el = this.document.createElement('iframe');
    this.el.style.width = '100%';
    this.el.style.overflow = 'hidden';
    this.el.style.border = 'none';
    this.el.scrolling = false;
    this.el.setAttribute('horizontalscrolling', 'no');
    this.el.setAttribute('verticalscrolling', 'no');
    this.parentNode.appendChild(this.el);
  }

  get style() {
    return "<style>body {margin: 0}</style>";
  }

  setHtml (html) {
    this.doc = this.el.contentWindow.document;
    this.doc.write(`${this.style}<div class="${this.className}">${html}</div>`);
    this.doc.close();
  }

  get node () {
    return this.el.contentWindow.document.querySelector(`.${this.className}`);
  }

  resize () {
    this.el.style.height = this.node.clientHeight + 'px';
  }
}

