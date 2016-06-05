export default class Iframe {
  constructor(document) {
    this.documentParent = document;
    this.el;
  }

  get document() {
    return this.el.contentWindow.document;
  }

  attach() {
    this.el = this.documentParent.createElement('iframe');
    this.el.style.width = '100%';
    this.el.style.overflow = 'hidden';
    this.el.style.border = "none";
    this.el.scrolling = false;
    this.el.setAttribute("horizontalscrolling", "no");
    this.el.setAttribute("verticalscrolling", "no");
  }

  resize(contents) {
    console.log(contents);
    this.document.querySelector('body').style.margin = 0;
    this.el.style.height = contents.clientHeight + 'px';
  }
}
