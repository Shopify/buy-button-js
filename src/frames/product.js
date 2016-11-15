import Frame from '../frame';

const pollInterval = 200;

export default class ProductFrame extends Frame {
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
    const img = this.component.wrapper.getElementsByClassName(this.component.classes.product.img)[0];
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
}
