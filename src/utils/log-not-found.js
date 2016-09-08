import logger from './logger';

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

export default function logNotFound(component) {
  let errInfo = '';
  if (component.id) {
    if (isArray(component.id)) {
      errInfo = `for ids ${component.id.join(', ')}.`;
    } else {
      errInfo = `for id ${component.id}.`;
    }
  } else if (component.handle) {
    errInfo = `for handle "${component.handle}".`;
  }
  const message = `Not Found: ${component.typeKey} not found ${errInfo}`;
  logger.warn(message);
}
