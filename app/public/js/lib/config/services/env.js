/**
 * env
 *
 * Environment singleton object to get environment
 * options.
 */
module.exports = function(
  $window,
  ENV_OPTIONS,
  currentEnvironment
) {
  "use strict";

  return {
    /**
     * Get environment option from `ENV_OPTIONS`
     * hash.
     *
     * @param {String} Option to get
     * @return {String|Object} Environment object
     */
    option: function(opt) {
      if (!currentEnvironment) { return; }

      var envOptions = ENV_OPTIONS[currentEnvironment];
      if (!envOptions) { return; }

      return envOptions[opt];
    }
  };
};

module.exports["$inject"] = [
  '$window',
  'ENV_OPTIONS',
  'currentEnvironment'
];