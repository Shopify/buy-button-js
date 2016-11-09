"use strict";

const path = require('path');
const fs = require('fs');
const currentVersion = require('../package.json').version;
const awsConfig = require('../config.json').aws;
const awsSDK = require('aws-sdk');
const Uploader = require('./util/uploader');

const awsS3 = new awsSDK.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
  params: {
    Bucket: awsConfig.bucket,
    ACL: 'public-read'
  }
});

const uploader = new Uploader({
  s3: awsS3,
  dir: 'dist',
  destination: 'buy-button',
  version: currentVersion,
});

uploader.deployStaticFiles();
uploader.npmPublish();
