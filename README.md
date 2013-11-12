# Image Proxy

A simple Express app for proxying and manipulating images, specifically headshots.

The code is just over 100 lines, making it easy to tailor to your needs.

## Getting Started

    npm install
    node index.js
    curl -I http://localhost:5000/http%3A%2F%2Fwww.opennorth.ca%2Fimg%2Fheader_logo.png/352/72

The URL structure is `/:url/:width/:height`. The `:url` parameter must be escaped/encoded. If the remote image's width or height is greater than the given `:width` or `:height`, it will be resized, maintaining aspect ratio, and cropped. If smaller, it will be padded with white pixels. The equivalent ImageMagick command is:

    convert in.jpg -thumbnail 100x100^> -gravity center -extent 100x100 out.jpg

The `Cache-Control` header sets a `max-age` of one year.

## Deployment

### Heroku

    git clone https://github.com/opennorth/image-proxy.git
    heroku create
    heroku config:set NODE_ENV=production
    git push heroku master
    heroku apps:open

### AWS CloudFront

Create a distribution and set the "Origin Domain Name" to the domain name of your Heroku app.

## Features

Image proxy:

* Supports HTTP and HTTPS
* Follows 301 and 302 redirects
* Sets a maximum timeout for the remote server
* Handles complex MIME types like `image/jpeg; charset=utf-8`
* Optional whitelisting using regular expressions

Image manipulation:

* Accepts a custom width and height, up to a maximum extent
* Resizes, centers and crops the image

HTTP server:

* No query string parameters (preferred by CloudFront)
* Adds a Cache-Control header

If you need more features, see [node-imageable](https://github.com/sdepold/node-imageable) and [node-imageable-server](https://github.com/dawanda/node-imageable-server).

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opennorth/image-proxy](http://github.com/opennorth/image-proxy), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

## Acknowledgements

This project is developed by [Open North](http://www.opennorth.ca/) through a partnership with the [Participatory Politics Foundation](http://www.participatorypolitics.org/) and is inspired by [node-connect-image-proxy](https://github.com/mysociety/node-connect-image-proxy).

Copyright (c) 2013 Open North Inc., released under the MIT license
