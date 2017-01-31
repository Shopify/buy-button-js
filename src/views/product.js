import View from '../view';

const pollInterval = 200;

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

  /**
   * check size of image until it is resolved, then set height of iframe.
   */
  resizeUntilLoaded() {
    if (!this.iframe || !this.component.model.selectedVariantImage) {
      return;
    }
    const img = this.wrapper.getElementsByClassName(this.component.classes.product.img)[0];
    let intervals = 0;
    if (img) {
      const productResize = setInterval(() => {
        if (!img.naturalWidth && intervals < 30) {
          intervals++;
          return;
        }
        this.resize();
        clearInterval(productResize);
      }, pollInterval);
    }
  }

  /**
   * renders string template using viewData to wrapper element.
   * Resizes iframe to match image size.
   */
  render() {
    super.render();
    this.resizeUntilLoaded();
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
