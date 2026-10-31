import View from '../view';
import Template from '../template';

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
    if (this.component.isButton) {
      let ariaLabel;
      switch (this.component.options.buttonDestination) {
      case 'modal':
        ariaLabel = this.component.options.text.isButtonModalAccessibilityLabel;
        break;
      case 'cart':
        ariaLabel = this.component.options.text.isButtonCartAccessibilityLabel;
        break;
      default:
        ariaLabel = this.component.options.text.isButtonCheckoutAccessibilityLabel;
      }

      const template = new Template(this.component.options.templates, {title: true, price: true}, this.component.options.order);
      const summaryHtml = template.render({data: this.component.viewData});
      return `<div class="${this.wrapperClass} ${this.component.classes.product.product}"><div class="visuallyhidden">${summaryHtml}</div><div tabindex="0" role="button" aria-label="${ariaLabel}" class="${this.component.classes.product.blockButton}">${html}</div></div>`;
    } else {
      return `<div class="${this.wrapperClass} ${this.component.classes.product.product}">${html}</div>`;
    }
  }

}
