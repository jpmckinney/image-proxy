var nock = require('nock')
  , request = require('supertest')
  , app = require('../lib/image-proxy')()
  , mock = nock('http://httpbin.org')
      // Redirect
      .get('/redirect-to?url=http://dummyimage.com/500/500')
      .reply(302, null, {
        'Location': 'http://dummyimage.com/500/500'
      })
      // Empty Location header
      .get('/redirect-to?url')
      .reply(302, null, {
        'Location': ''
      })
      // Non-200
      .get('/status/404')
      .reply(404)
      // Empty Content-Type header
      .get('/response-headers?Content-Type')
      .reply(200)
      // Non-image
      .get('/response-headers?Content-Type=text/plain')
      .reply(200, null, {
        'Content-Type': 'text/plain'
      })
      // Complex Content-Type header
      .get('/response-headers?Content-Type=image/png;%20charset=utf-8')
      .reply(200, '', {
        'Content-Type': 'image/png; charset=utf-8'
      })
      // Timeout
      .get('/delay/1')
      .delayConnection(1000)
      .reply(200, '', {
        'Content-Type': 'image/png'
      });


describe('GET /:url/:width/:height', function () {
  it('fails if a host is not in the whitelist', function (done) {
    request(app)
      .get('/http%3A%2F%2Fgoogle.com/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected URI host to be whitelisted', done);
  });

  it('fails if width is a non-integer', function (done) {
    request(app)
      .get('/http%3A%2F%2Fdummyimage.com%2F500%2F500/noninteger/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected width to be an integer', done);
  });
  it('fails if width is too large', function (done) {
    request(app)
      .get('/http%3A%2F%2Fdummyimage.com%2F500%2F500/1001/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected width to be less than or equal to 1000', done);
  });
  it('fails if height is a non-integer', function (done) {
    request(app)
      .get('/http%3A%2F%2Fdummyimage.com%2F500%2F500/100/noninteger')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected height to be an integer', done);
  });
  it('fails if height is too large', function (done) {
    request(app)
      .get('/http%3A%2F%2Fdummyimage.com%2F500%2F500/100/1001')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected height to be less than or equal to 1000', done);
  });

  it('fails if the protocol is unsupported', function (done) {
    request(app)
      .get('/ftp%3A%2F%2Fhttpbin.org/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected URI scheme to be HTTP or HTTPS', done);
  });
  it('fails if the host is empty', function (done) {
    request(app)
      .get('/http%3A%2F%2F%2Fpath/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected URI host to be non-empty', done);
  });

  it('follows 301 and 302 redirects', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fredirect-to%3Furl%3Dhttp%3A%2F%2Fdummyimage.com%2F500%2F500/100/100')
      .expect('Content-Type', 'image/png')
      .expect('Cache-Control', 'max-age=31536000, public')
      .expect(200, done);
  });
  it('fails if a redirect has no Location header', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fredirect-to%3Furl/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected response code 200, got 302', done);
  });

  it('fails if the status code is not 200', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fstatus%2F404/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected response code 200, got 404', done);
  });

  it('fails if the content type is empty', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fresponse-headers%3FContent-Type/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected content type image/gif, image/jpeg, image/png, image/jpg, got undefined', done);
  });
  it('fails if the content type is invalid', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fresponse-headers%3FContent-Type%3Dtext%2Fplain/100/100')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(404, 'Expected content type image/gif, image/jpeg, image/png, image/jpg, got text/plain', done);
  });
  it('parses a complex content type', function (done) {
    request(app)
      .get('/http%3A%2F%2Fhttpbin.org%2Fresponse-headers%3FContent-Type%3Dimage%2Fpng%3B%20charset%3Dutf-8/100/100')
      .expect('Content-Type', 'image/png')
      .expect(200, done);
  });

  // it('timesout if the request takes longer than 5 seconds', function (done) {
  //   request(app)
  //     .get('/http%3A%2F%2Fhttpbin.org%2Fdelay%2F1/100/100')
  //     .expect(504, done);
  // });

  it('supports HTTP', function (done) {
    request(app)
      .get('/http%3A%2F%2Fdummyimage.com%2F500%2F500/100/100')
      .expect('Content-Type', 'image/png')
      .expect('Cache-Control', 'max-age=31536000, public')
      .expect(200, done);
  });
  it('supports HTTPS', function (done) {
    request(app)
      .get('/https%3A%2F%2Fdummyimage.com%2F500%2F500/100/100')
      .expect('Content-Type', 'image/png')
      .expect('Cache-Control', 'max-age=31536000, public')
      .expect(200, done);
  });
});
