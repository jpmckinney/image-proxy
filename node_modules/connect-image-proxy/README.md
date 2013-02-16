# Middleware for proxying and manipulating images

This module allows you to manipulate and convert images on the fly.

It provides:

  * Resizing of images
  * Conversion of images to grayscale
  * Conversion of images into different formats
  * Only proxies images from the same domain that the proxy is running on - not an open proxy (this could be easily changed in future)


## Installation

    npm install connect-image-proxy

and then in your code (eg an Express app):

    var image_proxy = require('connect-image-proxy');

    app.configure(function(){
      ....

      // mount the proxy at '/proxy'
      app.use( '/proxy', image_proxy() );
      ....
    });


## Usage

  * Resize: hostname/route/?url=[url]&resize=1&height=[height]&width=[width]
  * Grayscale: hostname/route/?url=[url]&grayscale=1
  * Conversion [JPG, PNG, GIF]: hostname/route/?url=[url]&format=[format]
  * Conversion + Grayscale + Resize: hostname/route/?url=[url]&format=png&grayscale=1&resize=1&height=[height]&width=[width]


## Example app

There is an example app in the `examples` folder that demonstrates the basic features.


## TODO

  * Allow user to specify a list of hostnames to proxy for, not just the same host as the proxy is running on.
  * Add proper caching headers, or at least repeat the cache headers of the original image.