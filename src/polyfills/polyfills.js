import frameUtils from './request-animation-frame';
import CustomEvent from './custom-event';

const polyfills = Object.assign({}, frameUtils, {
  constructors: {
    CustomEvent,
  }
});

export default polyfills;
