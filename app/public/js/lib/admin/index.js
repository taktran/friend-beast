"use strict";

var angular = require('angular');
require('angular-route');

module.exports = angular.module('admin', [
  'ngRoute',

  require('../config').name,
])

.config([
  '$routeProvider',
  function(
    $routeProvider
  ) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'templates/admin.html',
        controller:'AdminCtrl'
      });
  }
])

.controller('AdminCtrl', require('./controllers/AdminCtrl'));