'use strict';
var S3Uploader = require('../lib/uploader'),
    config = require('../../../scripts/services/config'),
    Q = require('q'),
    userRepo = require('../../user/lib/user-repository'),
    publisherRepo = require('../../publisher/lib/publisher-repository'),
    uploader = new S3Uploader(config.s3);

function validateUserProfile(req) {
  if (!req.user.userId) {
    return false;
  }
  return true;
}

function validateUserCover(req) {
  if (!req.user.userId) {
    return false;
  }
  return true;
}

function validatePublisherProfile(req) {
  if (!req.body.publisherId) {
    return false;
  }
  return true;
}

function validatePublisherCover(req) {
  if (!req.body.publisherId) {
    return false;
  }
  return true;
}

function validateUploadRequest(req) {
  var type = req.body.type;

  switch (type) {
    case "user-profile":
      return validateUserProfile(req);
    case "user-cover":
      return validateUserCover(req);
    case "publisher-profile":
      return validatePublisherProfile(req);
    case "publisher-cover":
      return validatePublisherCover(req);
    default:
      return "Type " + type + " is not valid.";
  }
}

function callUpdateFunction(req, res, file) {
  var type = req.body.type;
  var functionName;

  switch (type) {
    case "user-profile":
      functionName = updateUserProfile;
      break;
    case "user-cover":
      functionName = updateUserCover;
      break;
    case "publisher-profile":
      functionName = updatePublisherProfile;
      break;
    case "publisher-cover":
      functionName = updatePublisherCover;
      break;
  }
  return Q.fcall(functionName, req, res, file);
}

function updateUserProfile(req, res, file) {
  return userRepo.updateProfileImage(req.user.userId, {path: file, type:'cdn'}).then(function() {
    res.ok(req.files.file);
  });
}

function updateUserCover(req, res, file) {
  return userRepo.updateCoverImage(req.user.userId, {path: file, type:'cdn'}).then(function() {
    res.ok(req.files.file);
  });
}

function updatePublisherProfile(req, res, file) {
  return publisherRepo.updateProfileImage(req.body.publisherId, {path: file, type:'cdn'}).then(function() {
    res.ok(req.files.file);
  });
}

function updatePublisherCover(req, res, file) {
  return publisherRepo.updateCoverImage(req.body.publisherId, {path: file, type:'cdn'}).then(function() {
    res.ok(req.files.file);
  });
}

module.exports = function(req, res) {
  if (!req.files.file) {
    return res.error('No data sent');
  }

  var validation = validateUploadRequest(req);
  if (validation !== true) {
    res.error(validation);
    return;
  }

  uploader.upload([req.files.file]).then(function(filePath) {
    var file = filePath[0];
    callUpdateFunction(req, res, file).then(function(filePath) {
      res.ok(file);
    }, function(error) {
      res.error(error);
    });
  })
    .fail(function (error) {
      console.log(error);
    });
};
