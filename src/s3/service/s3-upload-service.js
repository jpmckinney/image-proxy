'use strict';
var S3Uploader = require('../lib/uploader'),
    uploader = new S3Uploader({
      secretAccessKey: '614MeKYrFwtP7TuP9xflcYgNt9ws21NxOPqGUtCz',
      accessKeyId: 'AKIAJMKIBQFUGVPLL2EA',
      bucket: 'qmerce-static-media',
      region: 'us-east-1'
    });

function stringToJson(str) {
  var object = {};
  object['filePath'] = str;

  return object;
}

module.exports = function(out) {
//  module.exports = function(req, res, next) {
  var fileArr = [];
  fileArr.push(out);
  if (!fileArr) {
    return res.error();
  }

  return uploader.upload(out)
    .fail(function (error) {
      res.statusCode = 500;
      console.log(error);
      next(error);
    });
};
