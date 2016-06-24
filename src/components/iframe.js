const iframeStyles = {
  width: '100%',
  overflow: 'hidden',
  border: 'none',
};

const iframeAttrs = {
  horizontalscrolling: 'no',
  verticalscrolling: 'no',
};

export default class iframe {
  constructor(parent) {
    this.el = document.createElement('iframe');
    this.el.scrolling = false;
    Object.keys(iframeStyles).forEach((key) => {
      this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach((key) => this.el.setAttribute(key, iframeAttrs[key]));

    this.div = document.createElement('div');
    this.div.appendChild(this.el);
    parent.appendChild(this.div);
  }

  get document() {
    return this.el.contentDocument;
  }
}
