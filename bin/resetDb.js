"use strict";

/**
 * Reset the database
 *
 * WARNING! Makes sure you want to do this!
 */

var db = require('../lib/db');
db.init();
var env = require('../lib/env');

var Answers = require('../lib/models/answers');

// Delete all documents
if (env === "development" || env === "staging") {
  Answers.remove({}, function(err, p) {
    console.log('\nDeleted', p, " documents\n");
  });
} else {
  console.log("Not deleting records from anything other than development and staging!");
}