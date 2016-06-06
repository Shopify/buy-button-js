export default class Iframe {
  constructor(parent) {
    this.el = document.createElement('iframe');
    this.el.style.width = '100%';
    this.el.style.overflow = 'hidden';
    this.el.style.border = "none";
    this.el.scrolling = false;
    this.el.setAttribute("horizontalscrolling", "no");
    this.el.setAttribute("verticalscrolling", "no");
    parent.appendChild(this.el);
    this.el.contentDocument.body.style.margin = 0;
  }

  get document() {
    return this.el.contentDocument;
  }
}

