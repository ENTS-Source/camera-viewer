var express = require('express');
var config = require('../config');

var port = process.env.PORT || config.dev.apiPort;

var app = express();

app.get('/api/v1/camera/names', function(req, res) {
  // TODO: Make config
  res.json(['WOODSHOP', 'MAINROOM', 'METALSHOP', 'HALLWAY']);
});

app.listen(port, function(error) {
  if(error) {
    console.log(error);
    return;
  }

  console.log("Listening on port " + port);
});
