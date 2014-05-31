"use strict";

var Hapi = require('hapi');

var host = '0.0.0.0';
var port = process.env.PORT || 8081;

var server = new Hapi.Server(host, port, {
  // docs: true
  cors: true
});

// Initialise mongo
var db = require('./db');
db.init();

// Initialise routes
server.route(require('./routes'));

server.start(function() {
  console.log("Server started at:", server.info.uri);
});

