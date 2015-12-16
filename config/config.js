'use strict';

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    app: {
        name: 'apester-image-proxy'
    },
    port: '@@nodePort',
    s3: {
        secretAccessKey: '@@s3SecretAccessKey',
        accessKeyId: '@@s3AccessKeyId',
        bucket: '@@s3Bucket',
        region: '@@s3Region'
    }
};

module.exports = config;
