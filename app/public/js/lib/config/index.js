"use strict";

var angular = require('angular');

/**
 * Configuration object
 */
module.exports = angular.module('config', [])

/**
 * A mapping of environments to hostnames
 *
 * @constant {Object}
 */
.constant('ENV_HOSTNAMES', {
  dev: "localhost",
  staging: "friend-beast.herokuapp.com"
})

/**
 * Configuration object to store all the different
 * environment options
 *
 * @constant {Object}
 */
.constant('ENV_OPTIONS', {
  dev: {
    apiBase: "http://localhost:8081"
  },
  staging: {
    apiBase: "http://friend-beast.herokuapp.com"
  }
})

/**
 * Global configuration object
 *
 * @constant {Object} CONFIG
 */
.constant('CONFIG', {
  "yesScore": 3,
  "noScore": 0,

  "highWeightMultiplier": 2,
  "mediumWeightMultiplier": 1,
  "lowWeightMultiplier": 0.5
})

.factory('env', require('./services/env'))
.factory('currentEnvironment', require('./services/currentEnvironment'));
