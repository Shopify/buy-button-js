import View from '../view';

export default class ProductView extends View {
  get className() {
    return this.component.classes.product[this.component.options.layout];
  }

  get shouldResizeX() {
    return false;
  }

  get shouldResizeY() {
    return true;
  }

  get outerHeight() {
    return `${this.wrapper.clientHeight}px`;
  }

  /**
   * add event listener which triggers resize when the product image is loaded.
   */
  resizeOnLoad() {
    const productContents = this.component.config.product.contents;
    if (!(productContents.img || productContents.imgWithCarousel)) { return; }
    const image = this.wrapper.getElementsByClassName(this.component.classes.product.img)[0];
    if (!image) { return; }

    image.addEventListener('load', () => {
      this.resize();
    });
  }

  /**
   * renders string template using viewData to wrapper element.
   * Resizes iframe to match image size.
   */
  render() {
    super.render();
    this.resizeOnLoad();
  }


  get wrapperClass() {
    return `${this.component.currentImage ? 'has-image' : 'no-image'} ${this.component.classes.product[this.component.options.layout]}`;
  }

  wrapTemplate(html) {
    let ariaLabel;
    switch (this.component.options.buttonDestination) {
    case 'modal':
      ariaLabel = 'View details';
      break;
    case 'cart':
      ariaLabel = 'Add to cart';
      break;
    default:
      ariaLabel = 'Buy Now';
    }

    if (this.component.isButton) {
      return `<div class="${this.wrapperClass} ${this.component.classes.product.product}"><div tabindex="0" role="button" aria-label="${ariaLabel}" class="${this.component.classes.product.blockButton}">${html}</div></div>`;
    } else {
      return `<div class="${this.wrapperClass} ${this.component.classes.product.product}">${html}</div>`;
    }
  }

}
