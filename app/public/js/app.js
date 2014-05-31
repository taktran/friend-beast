/*jshint unused:false */
"use strict";

var _ = require('lodash');

var angular = require('angular');
require('angular-route');

// var templates = require('./templates');

// module.exports = angular.module('templates', [])
//   .run(templates);


module.exports = angular.module('app', [
  'ngRoute'

  // require('../form').name,
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
      })
      .otherwise({
        redirectTo: '/'
      });
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

    $scope.save = function() {
      answersService.add({
        answers: {
          hello: 'yes'
        }
      });
    };
  }
])

.factory('answersService', require('./lib/answersService'));
