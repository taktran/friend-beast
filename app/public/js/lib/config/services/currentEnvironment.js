var _ = require('lodash');

/**
 * currentEnvironment
 *
 * Get the current environment based on the current hostname
 *
 * @return {String} Current environment. `undefined` if not found
 */
module.exports = function(
  $window,
  ENV_HOSTNAMES
) {
  "use strict";

  var hostname = $window.location.hostname;
  var environment = _.reduce(ENV_HOSTNAMES, function(memo, value, env) {
    // Only find first environment that matches
    if (memo) { return memo; }

    var foundEnv;
    if (_.isArray(value)) {
      if (_.contains(value, hostname)) {
        foundEnv = env;
      }
    } else {
      if (value === hostname) {
        foundEnv = env;
      }
    }

    return foundEnv;
  }, undefined);

  return environment;
};

module.exports["$inject"] = [
  '$window',
  'ENV_HOSTNAMES'
];