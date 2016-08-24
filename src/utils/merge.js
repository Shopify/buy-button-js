function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target, ...sources) {
  sources.forEach((source) => {
    if (source) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          source[key] = merge(target[key] || {}, source[key]);
        }
        target[key] = source[key];
      });
    }
  });
  return target;
}

export default merge;
