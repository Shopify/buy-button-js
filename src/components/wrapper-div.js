export default class WrapperDiv {
  constructor (parentNode, document, className) {
    this.document = document;
    this.parentNode = parentNode;
    this.className = className;
  }

  attach () {
    this.el = this.document.createElement('div');
    this.el.className = this.className;
    this.parentNode.appendChild(this.el);
  }

  setHtml (html) {
    this.el.innerHTML = html;
  }

  resize () {}
}

