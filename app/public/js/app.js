/*jshint unused:false */
"use strict";

var _ = require('lodash');

var angular = require('angular');
require('angular-route');

// var templates = require('./templates');

// module.exports = angular.module('templates', [])
//   .run(templates);


module.exports = angular.module('app', [
  'ngRoute',

  require('./lib/config').name,
  require('./lib/header').name,
  require('./lib/admin').name
])

.config([
  '$routeProvider',
  function(
    $routeProvider
  ) {
    $routeProvider
      .when('/', {
        templateUrl: 'templates/app.html',
        controller:'AppCtrl'
      });
      // No, catchall
      // .otherwise({
      //   redirectTo: '/'
      // });
  }
])

/**
 * Application controller
 */
.controller('AppCtrl', [
  "$rootScope",
  "$scope",
  "$log",
  "answersService",
  function(
    $rootScope,
    $scope,
    $log,
    answersService
  ) {
    $rootScope.log = function() {
      $log.log.apply(null, arguments);
    };

    $scope.restart = function() {
      $scope.hasSubmit = false;
    };

    $scope.save = function() {
      var formAnswers = $("#answers").serializeArray();
      var answers = {};

      _.each(formAnswers, function(a) {
        var val = a.value;
        if (!_.isEmpty(val)) {
          answers[a.name] = val;
        }
      });

      if (!_.isEmpty(answers)) {
        answersService.add({
          answers: answers
        }).then(function(results) {
          $rootScope.log(results);
          $scope.hasSubmit = true;
        });
      }
    };
  }
])

.factory('answersService', require('./lib/answersService'));
