"use strict";

const path = require('path');
const request = require('request');
const fs = require('fs');
const mime = require('mime-types');
const exec = require('child_process').exec;
const defaultContentType = 'application/javascript';

const getContentType = function(filePath) {
  return mime.lookup(filePath) || defaultContentType;
}

const run = function (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
      resolve(stdout, stderr);
    });
  });
}


/**
 * @param {Object} config
 * @param {S3} config.s3 - aws s3 instance
 * @param {Array} config.files - array of file paths to upload
 * @param {String} config.dir - directory to upload all files from
 * @param {String} config.destination - name of s3 directory to upload to
 * @param {Number|String} config.version - version number
 * @param {Boolean} [true] config.latest - whether to upload /latest file
 */

const Uploader = function(config) {
  this.config = Object.assign({}, {
    latest: true,
  }, config);
  if (config.files) {
    this.filePaths = files;
  }
  if (config.dir) {
    this.filePaths = fs.readdirSync(config.dir).map(function (file) {
      return config.dir + '/' + file;
    });
  }
}

Uploader.prototype.deployStaticFiles = function () {
  return Promise.all(this.filePaths.map(function (filePath) {
    const uploadPaths = [];
    const basename = path.basename(filePath);
    const contents = fs.readFileSync(filePath);

    if (this.config.version) {
      uploadPaths.push(this.config.destination + '/' + this.config.version + '/' + basename);
      if (this.config.latest) {
        uploadPaths.push(this.config.destination + '/latest/' + basename);
      }
    } else {
      uploadPaths.push(this.config.destination + '/' + basename);
    }

    return Promise.all(uploadPaths.map(function (uploadPath) {
      return this.deployStaticFile(this.config.dir + '/' + basename, uploadPath);
    }.bind(this)));
  }.bind(this)));
}

Uploader.prototype.deployStaticFile = function(filePath, destination) {
  return this.config.s3.putObject({
    body: fs.readFileSync(filePath),
    key: destination,
    contentType: getContentType(filePath),
  }).promise().then(function (data) {
    console.info('Uploaded "' + filePath + '" to S3 as "' + s3Key + '"');
    return data;
  }, function (error) {
    if(error) {
      throw new Error('Error uploading ' + filePath, error);
    }
  });
}

Uploader.prototype.purgeStaticFiles = function () {
  return Promise.all(this.filePaths.map(function (filePath) {
    return this.purgeStaticFile(filePath);
  }.bind(this)));
}

Uploader.prototype.purgeStaticFile = function(assetUrl, headers) {
  if (!headers) headers = {};

  return new Promise(function (resolve, reject) {
    request({
      method: 'PURGE',
      url: assetUrl,
      headers: headers
    }, function(error) {
      if (error) {
        return reject('Error purging ' + assetUrl, error);
      }
      console.info('Purged ' + assetUrl);
      return resolve();
    })
  })
}

Uploader.prototype.npmPublish = function () {
  return run('npm install').then(function (stdout, stderr) {
    return run ('npm publish');
  }).catch(function (err) {
    console.log(err);
    return false;
  });
}

module.exports = Uploader;
