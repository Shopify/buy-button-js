import frameUtils from './frame-utils';

interface CustomEventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  detail?: any;
}

function CustomEventPolyfill(event: string, params?: CustomEventInit): CustomEvent {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(event, params.bubbles || false, params.cancelable || false, params.detail);
  return evt;
}

// Use the native CustomEvent constructor if available, otherwise use polyfill
const CustomEventConstructor = typeof window.CustomEvent === 'function' 
  ? window.CustomEvent 
  : CustomEventPolyfill as any as typeof window.CustomEvent;

const throttle = function(type: string, name: string, obj?: EventTarget): void {
  obj = obj || window;
  let running = false;
  
  const func = function(): void {
    if (running) { return; }
    running = true;
    
    frameUtils.requestAnimationFrame.call(window, function() {
      obj!.dispatchEvent(new CustomEventConstructor(name));
      running = false;
    });
  };
  
  obj.addEventListener(type, func);
};

export default throttle;