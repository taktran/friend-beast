/*jshint unused:false */
"use strict";

var _ = require('lodash');

var angular = require('angular');
require('angular-route');

module.exports = angular.module('header', [
  'ngRoute',

  require('../config').name,
])

.config([
  '$routeProvider',
  function(
    $routeProvider
  ) {
    $routeProvider
      .when('/header', {
        templateUrl: 'templates/header.html',
        controller: 'HeaderCtrl'
      });
  }
])

/**
 * HeaderCtrl controller
 */
.controller('HeaderCtrl', [
  "$rootScope",
  "$scope",
  "$log",
  function(
    $rootScope,
    $scope,
    $log
  ) {
    console.log("header");
  }
]);
