function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target, ...sources) {
  sources.forEach((source) => {
    if (source) {
      Object.keys(source).forEach((key) => {
        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
          target[key] = merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      });
    }
  });
  return target;
}

export default merge;
