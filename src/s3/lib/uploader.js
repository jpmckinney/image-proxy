'use strict';

var Q = require('q'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    util = require('util');

/** @type {MimeHelper|exports} */
var mimeHelper = require('./mime-helper');

/**
 * General object for uploading images to s3.
 * Currently only supports images
 *
 * @param config {Object}
 * @constructor
 */
function S3ImageUploader(config) {
  this.config = config || {};

  AWS.config.update({
    accessKeyId: config.accessKeyId || null,
    secretAccessKey: config.secretAccessKey || null,
    region: config.region || null,
    sslEnabled: true
  });

  this.bucket = new AWS.S3();
}

/** @const {String} */
var BASE_PATH = 'user-images/';

/** @const {String} */
var CACHE_CONTROL = 'max-age=21600, s-maxage=86400, must-revalidate, proxy-revalidate';

/**
 /**
 * Upload images to S3 bucket.
 *
 * @param data {Array<{Object}>}
 * @returns {Q.Promise<T>}
 */
S3ImageUploader.prototype.upload = function (data) {
  data = [data];
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array.');
  }

  var i, self = this,
      length = data.length,
      promises = [];

  for (i = 0; i < length; i++) {
    /* jshint loopfunc:true */

    // Content type is parsed from 'data:image/jpeg;base64'
 //   var contentType = data[i].headers['content-type'];
    var contentType = 'image/png';
    var body = fs.readFileSync(data[i]);
    //var body = fs.readFileSync(data[i].path);

    if (!mimeHelper.isValidImage(contentType)) {
      throw new Error(util.format('Content type "%s" is not allowed.', contentType));
    }

    var params = {
      Bucket: this.config.bucket,
      Key: null,
      Body: body,
      ACL: 'public-read',
      ContentType: contentType,
      CacheControl: CACHE_CONTROL
    };

    // Need to scope params and promises array
    params.Key = BASE_PATH + data[i];
    // Save the promise
    promises.push(self.putObject(params));

    return Q.all(promises);
  }
};

/**
 * Wrapper for putObject() which returns a promise.
 *
 * @param params {Object}
 * @returns {Q.Promise<T>}
 */
S3ImageUploader.prototype.putObject = function (params) {
  var deferred = Q.defer();

  //noinspection JSCheckFunctionSignatures
  this.bucket.putObject(params, function (error, response) {
    return ((error) ? deferred.reject(error) : deferred.resolve(params.Key));
  });

  return deferred.promise;
};


module.exports = S3ImageUploader;
