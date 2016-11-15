import Container from '../container';

const pollInterval = 200;

export default class ProductSetContainer extends Container {
  constructor(component) {
    super(component);
    this.height = 0;
    this.resizeCompleted = false;
  }

  /**
   * resize iframe until it is tall enough to contain all products.
   */
  resizeUntilFits() {
    if (!this.iframe || this.resizeCompleted) {
      return;
    }
    const maxResizes = this.component.products.length;
    let resizes = 0;

    this.height = this.outerHeight;
    this.resize();
    const productSetResize = setInterval(() => {
      const currentHeight = this.outerHeight;
      if (parseInt(currentHeight, 10) > parseInt(this.height, 10)) {
        resizes++;
        this.height = currentHeight;
        this.resize(currentHeight);
      }
      if (resizes > maxResizes) {
        this.resizeCompleted = true;
        clearInterval(productSetResize);
      }
    }, pollInterval);
  }

  get shouldResizeY() {
    return true;
  }
}
