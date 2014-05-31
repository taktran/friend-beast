"use strict";

/**
 * answersService
 */
module.exports = function(
  $http,
  $q,
  env
) {

  var apiBase = env.option('apiBase');
  var GET_URL = apiBase + "/answers";
  var POST_URL = apiBase + "/answers";

  return {
    all: function() {
      var deferred = $q.defer();

      $http.get(GET_URL).success(function(results) {
        deferred.resolve(results);
      });

      return deferred.promise;
    },
    add: function(answers) {
      var deferred = $q.defer();

      $http.post(POST_URL, answers).success(function(results) {
        deferred.resolve(results);
      });

      return deferred.promise;
    }
  };
};

module.exports["$inject"] = [
  "$http",
  "$q",
  "env"
];