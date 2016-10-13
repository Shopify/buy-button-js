"use strict";

const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const currentVersion = require('../package.json').version;
const s3Dir = 'buy-button';
const awsConfig = require('../config.json').aws;
const awsSDK = require('aws-sdk');
const distDir = 'dist';
const filePaths = fs.readdirSync(distDir);
const defaultContentType = 'application/javascript';

const awsS3 = new awsSDK.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
  params: {
    Bucket: awsConfig.bucket,
    ACL: 'public-read'
  }
});

const uploadFile = function(filePath, s3Key) {
  awsS3.putObject({
    Body: fs.readFileSync(filePath),
    Key: s3Key,
    ContentType: getContentType(filePath),
  }, function(error) {
    if(error) {
      return console.error('Error uploading ' + filePath, error);
    }

    console.info('Uploaded "' + filePath + '" to S3 as "' + s3Key + '"');
  });
}

const getContentType = function(filePath) {
  return mime.lookup(filePath) || defaultContentType;
}

filePaths.map(function(filePath) {
  const basename = path.basename(filePath);
  const latestName = s3Dir + '/latest/' + basename;
  const versionedName = s3Dir + '/' + currentVersion + '/' + basename;

  uploadFile(filePath, latestName);
  uploadFile(filePath, versionedName);
});
