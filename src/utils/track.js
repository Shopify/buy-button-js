export default class Tracker {
  trackMethod(fn, event, properties) {
    const self = this;
    return function () {
      const returnValue = fn(...arguments);
      if (returnValue && returnValue.then) {
        return returnValue.then((val) => {
          self.callTricorder(event, properties);
          return val;
        });
      }
      self.callTricorder(event, properties);
      return returnValue;
    }
  }

  callTricorder(eventName, properties) {
    switch(eventName) {
      case 'CART_UPDATE':
        if (properties.quantity < 1) {
          return this.track('CART_REMOVE', properties);
        }
        if (properties.quantity < properties.prevQuantity) {
          return this.track('CART_DECREMENT', properties);
        }
        return this.track('CART_INCREMENT', properties);
      default:
        return this.track(eventName, properties);
    }
  }

  track(eventName, properties) {
    console.info(eventName, properties);
  }
}
