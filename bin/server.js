"use strict";

var Hapi = require('hapi');

var host = '0.0.0.0';
var port = process.env.PORT || 8081;
var publicDir = 'app/public';

var server = new Hapi.Server(host, port, {
  // docs: true
  cors: true
});

// Initialise mongo
var db = require('../lib/db');
db.init();

// Initialise api routes
server.route(require('../lib/routes/api'));

// Serve static files
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: publicDir,
      listing: false,
      index: true
    }
  }
});

server.start(function() {
  console.log("Server started at:", server.info.uri);
});

