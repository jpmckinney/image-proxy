# Image Proxy

A simple Express app for proxying and manipulating images.

## Getting Started

    npm install
    node web.js
    curl -I http://localhost:5000/http%3A%2F%2Fwww.opennorth.ca%2Fimg%2Fheader_logo.png/352/72

The URL structure is `/:url/:width/:height`. The `:url` parameter must be escaped/encoded. If the remote image's width or height is greater than the given `:width` or `:height`, it will be resized, maintaining aspect ratio, and cropped. If smaller, it will be padded with white pixels. The equivalent ImageMagick command is:

    convert in.jpg -thumbnail 100x100^> -gravity center -extent 100x100 out.jpg

## Deployment

### Heroku

    git clone https://github.com/opennorth/image-proxy.git
    heroku create
    heroku config:set NODE_ENV=production
    git push heroku master
    heroku apps:open

## AWS CloudFront

Create a distribution and set the "Origin Domain Name" to the domain name of your Heroku app. Use all default settings. CloudFront will cache your images for a year.

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opennorth/image-proxy](http://github.com/opennorth/image-proxy), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

## Acknowledgements

This project is developed by [Open North](http://www.opennorth.ca/) through a partnership with the [Participatory Politics Foundation](http://www.participatorypolitics.org/).

Copyright (c) 2013 Open North Inc., released under the MIT license
