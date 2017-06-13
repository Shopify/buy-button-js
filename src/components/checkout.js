export default class CheckoutNavigator {
  constructor(config) {
    this.config = config;
  }

  get params() {
    const config = Object.assign({}, this.config.window, {
      left: (window.outerWidth / 2) - 200,
      top: (window.outerHeight / 2) - 300,
    });

    return Object.keys(config).reduce((acc, key) => `${acc}${key}=${config[key]},`, '');
  }

  open(url) {
    if (this.config.cart.popup) {
      window.open(url, 'checkout', this.params);
    } else {
      window.location = url;
    }
  }
}
