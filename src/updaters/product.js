import Updater from '../updater';

const MAX_WIDTH = '950px';

export default class ProductUpdater extends Updater {
  updateConfig(config) {
    if (config.id || config.variantId) {
      this.component.id = config.id || this.component.id;
      this.component.defaultVariantId = config.variantId || this.component.defaultVariantId;
      this.component.init();
      return;
    }

    let layout = this.component.options.layout;

    if (config.options && config.options.product) {
      if (config.options.product.layout) {
        layout = config.options.product.layout;
      }

      if (layout === 'vertical' && this.component.iframe.width === MAX_WIDTH) {
        this.component.iframe.setWidth(this.component.options.width);
      }

      if (layout === 'horizontal' && this.component.iframe.width && this.component.iframe.width !== MAX_WIDTH) {
        this.component.iframe.setWidth(MAX_WIDTH);
      }

      if (config.options.product.width && layout === 'vertical') {
        this.component.iframe.setWidth(config.options.product.width);
      }

      if (config.options.product.layout) {
        this.component.iframe.el.style.width = '100%';
      }
    }

    if (this.component.iframe) {
      this.component.iframe.removeClass(this.component.classes.product.vertical);
      this.component.iframe.removeClass(this.component.classes.product.horizontal);
      this.component.iframe.addClass(this.component.classes.product[layout]);
      this.component.resizeUntilLoaded();
    }
    [...this.component.view.wrapper.querySelectorAll('img')].forEach((img) => {
      img.addEventListener('load', () => {
        this.component.resizeUntilLoaded();
      });
    });
    super.updateConfig(config);
    if (this.component.cart) {
      this.component.cart.updateConfig(config);
    }
    if (this.component.modal) {
      this.component.modal.updateConfig(Object.assign({}, config, {
        options: Object.assign({}, this.component.config, {
          product: this.component.modalProductConfig,
        }),
      }));
    }
  }
}
