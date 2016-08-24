function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target, ...sources) {
  sources.forEach((source) => {
    if (source) {
      let descriptors = Object.keys(source).reduce((descriptors, key) => {
        if (isObject(source[key])) {
          source[key] = merge(target[key] || {}, source[key]);
        }
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
        return descriptors;
      }, {});
      Object.defineProperties(target, descriptors);
    }
  });
  return target;
}

export default merge;
