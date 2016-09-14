"use strict";

const path = require('path');
const fs = require('fs');
const currentVersion = require('../package.json').version.split('.')[0];
const S3_DIR = 'shopify-buy-ui';
const filePaths = process.argv.slice(2, process.argv.length);
const awsConfig = require('../config.json').aws;
const awsSDK = require('aws-sdk');

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
    Key: s3Key
  }, function(error) {
    if(error) {
      return console.error('Error uploading ' + filePath, error);
    }

    console.info('Uploaded "' + filePath + '" to S3 as "' + s3Key + '"');
  });
}


if(!filePaths.length) {
  console.info('No file paths specified');
}

filePaths.map(function(filePath) {
  const basename = path.basename(filePath);
  const latestName = S3_DIR + '/latest/' + basename;
  const majorName = S3_DIR + '/' + currentVersion + '/' + basename;

  uploadFile(filePath, latestName);

  awsS3.getObject({Key: majorName}, function(error, data) {
    if(error && error.code == 'NoSuchKey') {
      return uploadFile(filePath, majorName);
    }

    if(error) {
      return console.error('Error getting object - ' + majorName, error);
    }
  });
});

