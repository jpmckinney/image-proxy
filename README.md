# Image Proxy.

[![NPM version](https://badge.fury.io/js/image-proxy.svg)](https://badge.fury.io/js/image-proxy)
[![Build Status](https://secure.travis-ci.org/jpmckinney/image-proxy.png)](https://travis-ci.org/jpmckinney/image-proxy)
[![Dependency Status](https://david-dm.org/jpmckinney/image-proxy.svg)](https://david-dm.org/jpmckinney/image-proxy)
[![Coverage Status](https://coveralls.io/repos/jpmckinney/image-proxy/badge.png)](https://coveralls.io/r/jpmckinney/image-proxy)

A simple Express app for proxying and manipulating images, specifically headshots.

The code is just over 100 lines, making it easy to tailor to your needs.

## Getting Started

    npm install
    npm start
    curl -I http://localhost:5000/http%3A%2F%2Fwww.opennorth.ca%2Fimg%2Fheader_logo.png/352/72.jpg

The URL structure is `/:url/:width/:height.:extension?`. The `:url` parameter must be escaped/encoded. If the remote image's width or height is greater than the given `:width` or `:height`, it will be resized, maintaining aspect ratio, and cropped. If smaller, it will be padded with white pixels. If an optional `:extension` parameter is provided, the image will be transcoded to the corresponding file format. The equivalent ImageMagick command for the example URL above is:

    convert input.jpg -thumbnail 352x72^> -gravity center -extent 352x72 output.jpg

The `Cache-Control` header sets a `max-age` of one year.

## Features

Image proxy:

* Supports HTTP and HTTPS
* Follows 301 and 302 redirects
* Sets a maximum timeout for the remote server
* Handles complex MIME types like `image/jpeg; charset=utf-8`
* Optional whitelisting using regular expressions

Image manipulation:

* Accepts a custom width and height, up to 1000x1000
* Resizes, centers and crops the image
* Optionally transcodes to another file format

HTTP server:

* No query string parameters (preferred by CloudFront)
* Adds a Cache-Control header

If you need more features, see [node-imageable](https://github.com/sdepold/node-imageable) and [node-imageable-server](https://github.com/dawanda/node-imageable-server).

### Environment variables

* `DELAY`: The timeout delay in milliseconds, after which the proxy will respond with a HTTP 504 Gateway Timeout server error. Default: `5000`
* `WHITELIST`: A comma-separated list of domains to whitelist, e.g. `.gov,facebook.com`, which will be transformed into the regular expressions `/\.gov$/` and `/facebook\.com$/`.
* `PORT`: If running the server, changes the port on which it listens. Default: `5000`

## Deployment

### Heroku

    git clone https://github.com/jpmckinney/image-proxy.git
    heroku create
    heroku config:set NODE_ENV=production
    git push heroku master
    heroku apps:open

### AWS CloudFront

Create a distribution and set the "Origin Domain Name" to the domain name of your Heroku app.

## Testing

    npm test

## Acknowledgements

This project is inspired by [node-connect-image-proxy](https://github.com/mysociety/node-connect-image-proxy).

Copyright (c) 2013 James McKinney, released under the MIT license
