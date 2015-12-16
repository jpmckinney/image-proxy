// @see https://devcenter.heroku.com/articles/nodejs#write-your-app

var express = require('express')
  , fs      = require('fs') // node
  , gm      = require('gm')
  , http    = require('http') // node
  , https   = require('https') // node
  , mime    = require('mime')
  , url     = require('url') // node
  , config = require('../../../scripts/services/config')
  // @see http://aaronheckmann.posterous.com/graphicsmagick-on-heroku-with-nodejs
  , app = express()
  , imageMagick = gm.subClass({imageMagick: true})
  , whitelist = process.env.WHITELIST || [] // [/\.gov$/, /google\.com$/]
  , delay = parseInt(process.env.DELAY) || 5000
  , mimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png',
    // Common typos
    'image/jpg'
  ];

function retrieveRemote(res, next, remote, width, height, extension) {
  console.log('DEBUG - remote=' + remote);
  console.log('DEBUG - width=' + width);
  console.log('DEBUG - height=' + height);
  // @see http://nodejs.org/api/url.html#url_url
  var options = url.parse(remote);
  // @see https://github.com/substack/hyperquest
  options.agent = false;
  if (options.protocol !== 'http:' && options.protocol !== 'https:') {
    return res.status(404).send('Expected URI scheme to be HTTP or HTTPS');
  }
  if (!options.hostname) {
    return res.status(404).send('Expected URI host to be non-empty');
  }
  options.headers = {'User-Agent': 'image-proxy/0.0.6'}

  var agent = options.protocol === 'http:' ? http : https
    , timeout = false
      // @see http://nodejs.org/api/http.html#http_http_get_options_callback
    , request = agent.get(options, function (response) {
        if (timeout) {
          // Status code 504 already sent.
          return;
        }

        // @see http://nodejs.org/api/http.html#http_response_statuscode
        if ((response.statusCode === 301 || response.statusCode === 302) && response.headers['location']) {
          var redirect = url.parse(response.headers['location']);
          // @see https://tools.ietf.org/html/rfc7231#section-7.1.2
          if (!redirect.protocol) {
            redirect.protocol = options.protocol;
          }
          if (!redirect.hostname) {
            redirect.hostname = options.hostname;
          }
          if (!redirect.port) {
            redirect.port = options.port;
          }
          if (!redirect.hash) {
            redirect.hash = options.hash;
          }
          return retrieveRemote(res, next, url.format(redirect), weight, height, extension);
        }

        // The image must return status code 200.
        if (response.statusCode !== 200) {
          return res.status(404).send('Expected response code 200, got ' + response.statusCode);
        }

        // The image must be a valid content type.
        // @see http://nodejs.org/api/http.html#http_request_headers
        var mimeType;
        if (extension) {
          mimeType = mime.lookup(extension);
        }
        else {
          mimeType = (response.headers['content-type'] || '').replace(/;.*/, '');
          extension = mime.extension(mimeType);
        }
        if (mimeTypes.indexOf(mimeType) === -1) {
          return res.status(404).send('Expected content type ' + mimeTypes.join(', ') + ', got ' + mimeType);
        }

        // @see https://github.com/aheckmann/gm#constructor
        var im = imageMagick(response, 'image.' + extension);
        // @see http://www.imagemagick.org/Usage/thumbnails/#cut

        // Avoid resizing gif, any git, since resizing animated gifs does not work properly.
        if (mimeType !== 'image/gif') {
          if (width && width !== 'undefined') {
            if (height && height !== 'undefined') {
              im.resize(width, height, '^>');
            } else {
              im.resize(width, '>');
            }
          } else if (height && height !== 'undefined') {
            im.resize(null, height, '^>');
          }
        }

        im.gravity('Center'); // faces are most often near the center
        if (width && height && width !== 'undefined' && height !== 'undefined') {
          im.extent(width, height);
        }

        im.stream(function (err, stdout, stderr) {
            if (err) return next(err);
            // Log errors in production.
            stderr.pipe(process.stderr);
            // @see http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html
            res.writeHead(200, {
              'Content-Type': mimeType,
              'Cache-Control': 'max-age=31536000, public', // 1 year
            });
            stdout.pipe(res);
          });
      }).on('error', next);

  // Timeout after five seconds. Better luck next time.
  request.setTimeout(delay, function () {
    timeout = true; // if we abort, we'll get a "socket hang up" error
    return res.status(504).send();
  });
}

function handleRequest(req, res, next, width, height, extension) {
  // Validate parameters.
  if (whitelist.length) {
    var parts = url.parse(req.params.url);
    if (parts.hostname) {
      var any = false, _i, _len;
      if (typeof whitelist === 'string') {
        whitelist = whitelist.split(',');
      }
      for (_i = 0, _len = whitelist.length; _i < _len; _i++) {
        if (typeof whitelist[_i] === 'string') {
          // Escape periods and add anchor.
          whitelist[_i] = new RegExp(whitelist[_i].replace('.', '\\.') + '$')
        }
        if (whitelist[_i].test(parts.hostname)) {
          any = true;
          break;
        }
      }
      if (!any) { // if none
        return res.status(404).send('Expected URI host to be whitelisted');
      }
    }
  }
  retrieveRemote(res, next, 'http://s3.amazonaws.com/'+config.s3.bucket+'/' + req.params.url, width, height, extension);
}

module.exports = function () {
  app.get('/:url', function (req, res, next) {
    var defaultWidth = 1200;
    handleRequest(req, res, next, defaultWidth, null, null);
  });

  app.get('/:url/:width/:height.:extension?', function (req, res, next) {
    var width = req.params.width
      , height = req.params.height
      , extension = req.params.extension;

    if (isNaN(parseInt(width)) && width !== 'undefined') {
      return res.status(404).send('Expected width to be an integer');
    }
    if (isNaN(parseInt(height)) && height !== 'undefined') {
      return res.status(404).send('Expected height to be an integer');
    }
    handleRequest(req, res, next, width, height, extension);
  });

  return app;
};
