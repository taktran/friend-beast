"use strict";

var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var answersSchema = new mongoose.Schema({
  // Store whatever you want!
  answers: 'mixed'
});
answersSchema.plugin(timestamps);

module.exports = mongoose.model('Answers', answersSchema);