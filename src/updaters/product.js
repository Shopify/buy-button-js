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

      if (this.component.view.iframe) {
        if (layout === 'vertical' && this.component.view.iframe.width === MAX_WIDTH) {
          this.component.view.iframe.setWidth(this.component.options.width);
        }

        if (layout === 'horizontal' && this.component.view.iframe.width && this.component.view.iframe.width !== MAX_WIDTH) {
          this.component.view.iframe.setWidth(MAX_WIDTH);
        }

        if (config.options.product.width && layout === 'vertical') {
          this.component.view.iframe.setWidth(config.options.product.width);
        }

        if (config.options.product.layout) {
          this.component.view.iframe.el.style.width = '100%';
        }
      }
    }

    if (this.component.view.iframe) {
      this.component.view.iframe.removeClass(this.component.classes.product.vertical);
      this.component.view.iframe.removeClass(this.component.classes.product.horizontal);
      this.component.view.iframe.addClass(this.component.classes.product[layout]);
      this.component.view.resizeUntilLoaded();
    }
    [...this.component.view.wrapper.querySelectorAll('img')].forEach((img) => {
      img.addEventListener('load', () => {
        // TODO: refactor this logic out from the views?
        this.component.view.resizeUntilLoaded();
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
