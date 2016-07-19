export default class Checkout {
  constructor(config) {
    this.config = config;
  }

  get params() {
    return Object.keys(this.config.window).reduce((acc, key) => `${acc}${key}=${this.config.window[key]},`, '');
  }

  open(url) {
    window.open(url, 'checkout', this.params);
  }
}
