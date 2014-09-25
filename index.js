var app = require('./lib/proxy')();

var port = process.env.PORT || 5000;
var whitelist = process.env.WHITELIST || []; // [/\.gov$/, /google\.com$/]
app.listen(port, function () {
  console.log('Listening on ' + port);
});
