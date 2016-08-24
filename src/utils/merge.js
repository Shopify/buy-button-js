

function typeOf(value) {
  if (typeof Array.isArray !== 'undefined' && Array.isArray(value)) {
    return 'array';
  }

  if (Object.prototype.toString.call(value) === '[object Object]') {
   return 'object';
  }
}

function merge(target, ...sources) {
  sources.forEach((source) => {
    if (source) {
      let descriptors = Object.keys(source).reduce((descriptors, key) => {
        if (typeOf(source[key]) === 'object') {
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
