function wrapConsole(logCommand) {
  const logMethod = function () {
    const hostConsole = window.console;
    const args = Array.prototype.slice.apply(arguments).join(' ');
    /* eslint-disable no-console */
    if (hostConsole) {
      hostConsole[logCommand](args);
    }
    /* eslint-enable no-console */
  };

  return function () {
    const args = [...arguments];

    args.unshift('[SHOPIFY-BUY-UI]: ');
    logMethod(...args);
  };
}

const logger = {
  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error'),
  log: wrapConsole('log'),
};

export default logger;
