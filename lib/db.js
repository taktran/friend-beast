"use strict";

/**
 * Set up database
 */

var mongoose = require('mongoose');
var env = require("./env");
var db = mongoose.connection;

db.on('error', console.error);

var dbUrl;
if (env === "development") {
  dbUrl = 'mongodb://localhost/friend-beast';
} else if (env === "staging") {
  dbUrl = process.env.MONGOHQ_URL;
} else if (env === "production") {
  dbUrl = process.env.MONGOHQ_URL;
}

module.exports = {
  init: function() {
    mongoose.connect(dbUrl);
  },
  instance: db,
  dbUrl: dbUrl
};