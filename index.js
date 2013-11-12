// @see https://devcenter.heroku.com/articles/nodejs#write-your-app

var express = require('express')
  , fs      = require('fs') // node
  , gm      = require('gm')
  , http    = require('http') // node
  , https   = require('https') // node
  , mime    = require('mime') // express
  , url     = require('url') // node
  // @see http://aaronheckmann.posterous.com/graphicsmagick-on-heroku-with-nodejs
  , imageMagick = gm.subClass({imageMagick: true})
  , app = express.createServer(express.logger())
  , mimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/jpg',
  ];

app.get('/:url/:width/:height', function (req, res, next) {
  var width = req.params.width
    , height = req.params.height
    , retrieve = function (remote) {
      // @see http://nodejs.org/api/url.html#url_url
      var parts = url.parse(remote);
      if (['https:', 'http:'].indexOf(parts.protocol) === -1) {
        return res.send('Expected URI scheme to be HTTP or HTTPS', 404);
      }
      if (!parts.hostname) {
        return res.send('Expected URI host to be non-empty', 404);
      }

      var agent = parts.protocol === 'http:' ? http : https
        // @see http://nodejs.org/api/http.html#http_http_get_options_callback
        , request = agent.get(remote, function (res2) {
          // @see http://nodejs.org/api/http.html#http_response_statuscode
          if ([301, 302].indexOf(res2.statusCode) !== -1 && res2.headers['location']) {
            return retrieve(res2.headers['location']);
          }

          // The remote image must return status code 200.
          if (res2.statusCode !== 200) {
            return res.send('Expected response code 200, got ' + res2.statusCode, 404);
          }

          // The remote image must be a valid content type.
          // @see http://nodejs.org/api/http.html#http_request_headers
          var mimeType = res2.headers['content-type'].replace(/;.+/, '');
          if (mimeTypes.indexOf(mimeType) === -1) {
            return res.send('Expected content type ' + mimeTypes.join(', ') + ', got ' + mimeType, 404);
          }

          // @see https://github.com/aheckmann/gm#constructor
          imageMagick(res2, 'image.' + mime.extension(mimeType))
          // @see http://www.imagemagick.org/Usage/thumbnails/#cut
          .resize(width, height + '^>')
          .gravity('Center') // faces are most often near the center
          .extent(width, height)
          .stream(function (err, stdout, stderr) {
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
      request.setTimeout(5000, function () {
        return res.send(504);
      });
    };

  // Validate query string parameters.
  if (whitelist.length) {
    var parts = url.parse(req.params.url)
      , any = false;
    for (var _i = 0, _len = whitelist.length; _i < _len; _i++) {
      if (whitelist[_i].test(parts.hostname)) {
        any = true;
        break;
      }
    }
    if (!any) { // if none
      return res.send('Expected URI host to be whitelisted', 404);
    }
  }
  if (isNaN(parseInt(width))) {
    return res.send('Expected width to be an integer', 404);
  }
  if (parseInt(width) > 1000) {
    return res.send('Expected width to be less than or equal to 1000', 404);
  }
  if (isNaN(parseInt(height))) {
    return res.send('Expected height to be an integer', 404);
  }
  if (parseInt(height) > 1000) {
    return res.send('Expected height to be less than or equal to 1000', 404);
  }

  retrieve(req.params.url);
});

var port = process.env.PORT || 5000;
var whitelist = process.env.WHITELIST || []; // [/\.gov$/, /google\.com$/]
app.listen(port, function () {
  console.log('Listening on ' + port);
});
