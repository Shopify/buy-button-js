import frameUtils from './frame-utils';

function CustomEvent ( event, params ) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var evt = document.createEvent( 'CustomEvent' );
  evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
  return evt;
};

CustomEvent.prototype = window.Event.prototype;

const throttle = function(type, name, obj) {
  obj = obj || window;
    let running = false;
    const func = function() {
      if (running) { return; }
      running = true;
      frameUtils.requestAnimationFrame.call(window, function() {
        obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, func);
};

export default throttle;
