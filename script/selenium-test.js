#!/usr/bin/env node
/* eslint-env node */
/* eslint no-var: 0, prefer-template: 0 */
/* globals require process */

var childProcess = require('child_process');
var path = require('path');
var npm = require('global-npm');
var pkg = require('../package.json');
var npmDo = require('./util/npm-do');

require('./util/work-from-root')();

function log(who, what) {
  process.stdout.write('[' + who + '] ' + what);
}

function runTests() {
  return new Promise(function (resolve, reject) {
    npmDo('wdio', 'wdio.conf.js', function (status) {
      if (status === 0) {
        resolve(status);
      } else {
        reject(status);
      }
    });
  });
}

function bootSelenium() {
  return new Promise(function (resolve, reject) {
    var resolved = false;
    var selenium = childProcess.exec('java -jar selenium-standalone.jar');

    // Selenium outputs everything on STDERR because it's hateful
    selenium.stderr.on('data', function (data) {
      if (data.toString().match(/Selenium Server is up and running/) && !resolved) {
        resolved = true;
        resolve(selenium);
      } else if (!resolved) {
        log('selenium', data);
      }
    });

    selenium.on('close', function (status) {
      if (!resolved) {
        log('selenium-failure', status + '\n');
        reject(status);
      }
    });
  });
}

function bootAppServer() {
  return new Promise(function (resolve, reject) {
    npm.load(pkg, function () {
      var resolved = false;
      var serverBin = path.join(npm.bin, 'http-server');

      var appServer = childProcess.exec(serverBin);

      appServer.stdout.on('data', function (data) {
        log('server', data);

        if (data.match(/Available on:/) && !resolved) {
          resolved = true;
          resolve(appServer);
        }
      });

      appServer.stderr.on('data', function (data) {
        log('server-error', data);
      });

      appServer.on('close', function (status) {
        if (!resolved) {
          log('server-failure', status + '\n');
          reject(status);
        }
      });
    });
  });
}

var waitToDie;

Promise.all([bootAppServer(), bootSelenium()]).then(function (processes) {
  var appServer = processes[0];
  var selenium = processes[1];

  waitToDie = function () {
    return new Promise(function (resolve) {
      var appServerDead = false;
      var seleniumDead = false;
      var resolved = false;

      function maybeResolveDead() {
        if (appServerDead && seleniumDead && !resolved) {
          resolved = true;
          resolve();
        }
      }

      appServer.on('close', function () {
        appServerDead = true;

        maybeResolveDead(appServer);
      });
      appServer.on('exit', function () {
        appServerDead = true;

        maybeResolveDead();
      });
      selenium.on('close', function () {
        seleniumDead = true;

        maybeResolveDead();
      });
      selenium.on('exit', function () {
        seleniumDead = true;

        maybeResolveDead();
      });

      appServer.kill();
      selenium.kill();
    });
  };

  function exitAfterTests(status) {
    var timer = setTimeout(function () {
      process.exit();
    }, 5000);

    waitToDie().then(function () {
      clearTimeout(timer);
      process.exit(status);
    });
  }

  return runTests().then(exitAfterTests).catch(exitAfterTests);
}).catch(function (error) {
  log('global-failure', error + '\n');
  if (waitToDie) {
    waitToDie().then(function () {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
