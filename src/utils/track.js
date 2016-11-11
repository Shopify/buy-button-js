export default class Tracker {
  constructor(lib) {
    this.lib = lib || null;
  }

  trackMethod(fn, event, properties) {
    const self = this;
    return function () {
      const returnValue = fn(...arguments);
      if (returnValue && returnValue.then) {
        return returnValue.then((val) => {
          self.callLib(event, properties);
          return val;
        });
      }
      self.callLib(event, properties);
      return returnValue;
    }
  }

  callLib(eventName, properties) {
    switch(eventName) {
      case 'Update Cart':
        if (properties.quantity < 1) {
          return this.track('Removed Product', properties);
        }
        if (properties.prevQuantity && (properties.quantity < properties.prevQuantity)) {
          return;
        }
        this.track('Added Product', properties);
      default:
        return this.track(eventName, properties);
    }
  }

  trackPageview() {
    if (this.lib && this.lib.page) {
      this.lib.page();
    }
  }

  trackComponent(type, properties) {
    switch(type) {
      case 'product':
        return this.track('Viewed Product', properties);
      case 'collection':
        return this.track('Viewed Product Category', properties);
    }
  }

  track(eventName, properties) {
    properties.pageurl = document.referrer;
    if (this.lib && this.lib.track) {
      this.lib.track(eventName, properties);
    }
  }
}
