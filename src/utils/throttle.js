import polyfills from '../polyfills/polyfills';

const throttle = function(type, name, obj) {
  obj = obj || window;
    let running = false;
    const func = function() {
      if (running) { return; }
      running = true;
      polyfills.requestAnimationFrame(function() {
        obj.dispatchEvent(new polyfills.constructors.CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, func);
};

export default throttle;
