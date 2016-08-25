export function withTracking(fn, event, properties) {
  return function () {
    const props = properties(...arguments)
    const returnValue = fn(...arguments);
    if (returnValue && returnValue.then) {
      return returnValue.then((val) => {
        trackEvent(event, props);
        return val;
      });
    }
    trackEvent(event, props);
    return returnValue;
  }
}

export function trackEvent(event, properties) {
  properties.pageurl = document.referrer;
  console.info(event, properties);
}
