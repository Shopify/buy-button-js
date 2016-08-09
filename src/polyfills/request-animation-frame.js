const frameUtils = {};

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
if (window.requestAnimationFrame && window.cancelAnimationFrame) {
  frameUtils.requestAnimationFrame = window.requestAnimationFrame;
  frameUtils.cancelAnimationFrame = window.cancelAnimationFrame;
} else {
  for(var x = 0; x < vendors.length && !frameUtils.requestAnimationFrame; ++x) {
    frameUtils.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    frameUtils.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
    || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!frameUtils.requestAnimationFrame)
    frameUtils.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!frameUtils.cancelAnimationFrame)
    frameUtils.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

export default frameUtils;
