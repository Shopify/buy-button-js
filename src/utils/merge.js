function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target, ...sources) {
  sources.forEach((source) => {
    if (source) {
      var shit = Object.keys(source).reduce((acc, key) => {
        if (isObject(source[key])) {
          source[key] = merge(target[key] || {}, source[key]);
        }
        target[key] = source[key];
      }, {});
      return Object.assign(target, shit);
    }
  });
  return target;
}

export default merge;
