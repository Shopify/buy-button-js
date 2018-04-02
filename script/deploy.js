"use strict";

const Uploader = require('@shopify/js-uploader');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const currentVersion = require('../package.json').version;
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

const uploader = new Uploader({
  s3: awsS3,
  dir: 'dist',
  destination: 'buy-button',
  version: currentVersion,
});

uploader.deployStaticFiles().catch((err) => {
  console.error(err);
  process.exit(1);
});
