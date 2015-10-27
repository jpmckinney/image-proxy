'use strict';

var policy = require('s3-policy'),
    config = require('../../../scripts/services/config');

module.exports = function(req, res) {
    var policyInstance = policy({
        secret: config.s3.secretKey,
        length: 5000000,
        bucket: config.s3.bucket,
        key: config.s3.accessKey,
        expires: new Date(Date.now() + 60000),
        acl: 'public-read'
    });

    res.json(200, {
        policy: policyInstance.policy,
        signature: policyInstance.signature,
        key: config.s3.accessKey
    });
};