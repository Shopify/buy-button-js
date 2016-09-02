function wrapConsole(logCommand) {
  const logMethod = function () {
    /* eslint-disable no-console */
    if (console[logCommand]) {
      console[logCommand](...arguments);
    } else {
      console.log(...arguments);
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
};

export default logger;
