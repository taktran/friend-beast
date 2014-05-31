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
  },

  // --------------------------------------
  // Graphing endpoints
  // --------------------------------------
  {
    method: 'GET',
    path: '/graph/values',
    config: {
      handler: getAnswerValues
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

function getAnswerValues(request, reply) {
  try {
    // Answers.find(function(err, answers) {
    //   var values = [];

    //   _.each(answers, function(a) {
    //     if (values[""])
    //   });

    //   reply(values);
    // });
    reply({
      "q1": [
        {
          answer: "1",
          number: 10
        },
        {
          answer: "2",
          number: 30
        },
        {
          answer: "3",
          number: 15
        }
      ],
      "q2": [
        {
          answer: "1",
          number: 5
        },
        {
          answer: "2",
          number: 3
        },
        {
          answer: "3",
          number: 20
        }
      ]
    });
  } catch (err) {
    reply(Boom.badRequest("Could not get answers"));
  }
}

function getAnswers(request, reply) {
  try {
    Answers.find(function(err, answers) {
      reply(answers);
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