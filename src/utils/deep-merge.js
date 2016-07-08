export default function deepmerge(target, source, shallow) {
  const array = '[object Array]';
  const object = '[object Object]';
  let targetMeta;
  let sourceMeta;
  function setMeta(value) {
    let meta;
    let jclass = {}.toString.call(value);
    if (value === undefined) return 0;
    if (typeof value !== 'object') return false;
    if (jclass === array) {
      return 1;
    }
    if (jclass === object) return 2;
  };
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      targetMeta = setMeta(target[key]);
      sourceMeta = setMeta(source[key]);
      if (source[key] !== target[key]) {
        if (!shallow && sourceMeta && targetMeta && targetMeta === sourceMeta) {
          target[key] = deepmerge(target[key], source[key], true);
        } else if (sourceMeta !== 0) {
          target[key] = source[key];
        }
      }
    }
    else break; // ownProperties are always first (see jQuery's isPlainObject function)
  }
  return target;
};
