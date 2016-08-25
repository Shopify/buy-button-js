const eventTypes = {
  ADD_TO_CART: 'Added product'
}

export default function track(fn, event, properties) {
  return function () {
    const returnValue = fn(...arguments);
    if (returnValue && returnValue.then) {
      return returnValue.then((val) => {
        console.log(event, properties(...arguments));
        return val;
      });
    }
    console.log(event, properties(...arguments));
    return returnValue;
  }
}

