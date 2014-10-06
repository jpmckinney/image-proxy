var app = require('./lib/proxy')();

var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log('Listening on ' + port);
});
