"use strict";

var Boom = require('boom');

var Answers = require('../models/answers');

/**
 * Export routes
 */
module.exports = [
  // --------------------------------------
  // Answers
  // --------------------------------------
  {
    method: 'GET',
    path: '/answers',
    config: {
      handler: getAnswers
    }
  },
  {
    method: 'POST',
    path: '/answers',
    config: {
      handler: createAnswers
    }
  }
];

/**
 * Formats an error message that is returned from Mongoose.
 *
 * @param err The error object
 * @returns {string} The error message string.
 */
function getErrorMessageFrom(err) {
  var errorMessage = '';

  if (err.errors) {
    for (var prop in err.errors) {
      if(err.errors.hasOwnProperty(prop)) {
        errorMessage += err.errors[prop].message + ' ';
      }
    }
  } else {
    errorMessage = err.message;
  }

  return errorMessage;
}

function getAnswers(request, reply) {
  try {
    Answers.find(function(err, attributes) {
      reply(attributes);
    });
  } catch (err) {
    reply(Boom.badRequest("Could not get answers"));
  }
}

function createAnswers(request, reply) {
  var answers = new Answers(request.payload);

  answers.save(function(err) {
    if (!err) {
      console.log(answers);
      reply(answers);
    } else {
      reply(Boom.forbidden(getErrorMessageFrom(err)));
    }
  });
}