"use strict";

var mongoose = require('mongoose');

var answersSchema = new mongoose.Schema({
  question: 'string',

  // Store whatever you want!
  answers: 'mixed'
});

module.exports = mongoose.model('Answers', answersSchema);