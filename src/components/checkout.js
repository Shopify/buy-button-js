export default class Checkout {
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
    window.open(url, 'checkout', this.params);
  }
}
