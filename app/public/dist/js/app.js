(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        });
      }
    };
  }
])

.factory('answersService', require('./lib/answersService'));

},{"./lib/answersService":2,"./lib/config":3,"./lib/header":6,"angular":8,"angular-route":7,"lodash":11}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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

},{"./services/currentEnvironment":4,"./services/env":5,"angular":8}],4:[function(require,module,exports){
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
},{"lodash":11}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
/*jshint unused:false */
"use strict";

var _ = require('lodash');

var angular = require('angular');
require('angular-route');

var headtrackr = require('headtrackr');

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
    // set up video and canvas elements needed

    var videoInput = document.getElementById('vid');
    var canvasInput = document.getElementById('compare');
    var canvasOverlay = document.getElementById('overlay');
    var debugOverlay = document.getElementById('debug');
    var overlayContext = canvasOverlay.getContext('2d');
    canvasOverlay.style.position = "absolute";
    canvasOverlay.style.top = '0px';
    canvasOverlay.style.zIndex = '100001';
    canvasOverlay.style.display = 'block';
    debugOverlay.style.position = "absolute";
    debugOverlay.style.top = '0px';
    debugOverlay.style.zIndex = '100002';
    debugOverlay.style.display = 'none';

    // add some custom messaging

    var statusMessages = {
      "whitebalance" : "checking for stability of camera whitebalance",
      "detecting" : "Detecting face",
      "hints" : "Hmm. Detecting the face is taking a long time",
      "redetecting" : "Lost track of face, redetecting",
      "lost" : "Lost track of face",
      "found" : "Tracking face"
    };

    var supportMessages = {
      "no getUserMedia" : "Unfortunately, <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html'>getUserMedia</a> is not supported in your browser. Try <a href='http://www.opera.com/browser/'>downloading Opera 12</a> or <a href='http://caniuse.com/stream'>another browser that supports getUserMedia</a>. Now using fallback video for facedetection.",
      "no camera" : "No camera found. Using fallback video for facedetection."
    };

    document.addEventListener("headtrackrStatus", function(event) {
      var messagep;

      if (event.status in supportMessages) {
        messagep = document.getElementById('gUMMessage');
        messagep.innerHTML = supportMessages[event.status];
      } else if (event.status in statusMessages) {
        messagep = document.getElementById('headtrackerMessage');
        messagep.innerHTML = statusMessages[event.status];
      }
    }, true);

    // the face tracking setup

    var htracker = new headtrackr.Tracker({altVideo : {ogv : "./media/capture5.ogv", mp4 : "./media/capture5.mp4"}, calcAngles : true, ui : false, headPosition : false, debug : debugOverlay});
    htracker.init(videoInput, canvasInput);
    htracker.start();

    // for each facetracking event received draw rectangle around tracked face on canvas

    /*jshint -W016 */
    document.addEventListener("facetrackingEvent", function( event ) {
      // clear canvas
      overlayContext.clearRect(0,0,320,240);
      // once we have stable tracking, draw rectangle
      if (event.detection === "CS") {
        overlayContext.translate(event.x, event.y);
        overlayContext.rotate(event.angle-(Math.PI/2));
        overlayContext.strokeStyle = "#00CC00";

        var xVal = (-(event.width/2)) >> 0;
        var yVal = (-(event.height/2)) >> 0;
        overlayContext.strokeRect(xVal, yVal, event.width, event.height);
        overlayContext.rotate((Math.PI/2)-event.angle);
        overlayContext.translate(-event.x, -event.y);
      }
    });

    // turn off or on the canvas showing probability
    function showProbabilityCanvas() {
      var debugCanvas = document.getElementById('debug');
      if (debugCanvas.style.display === 'none') {
        debugCanvas.style.display = 'block';
      } else {
        debugCanvas.style.display = 'none';
      }
    }
  }
]);

},{"../config":3,"angular":8,"angular-route":7,"headtrackr":10,"lodash":11}],7:[function(require,module,exports){
/**
 * @license AngularJS v1.2.17-build.163+sha.fafcd62
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name ngRoute
 * @description
 *
 * # ngRoute
 *
 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 *
 * <div doc-module-components="ngRoute"></div>
 */
 /* global -ngRouteModule */
var ngRouteModule = angular.module('ngRoute', ['ng']).
                        provider('$route', $RouteProvider);

/**
 * @ngdoc provider
 * @name $routeProvider
 * @function
 *
 * @description
 *
 * Used for configuring routes.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 * ## Dependencies
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 */
function $RouteProvider(){
  function inherit(parent, extra) {
    return angular.extend(new (angular.extend(function() {}, {prototype:parent}))(), extra);
  }

  var routes = {};

  /**
   * @ngdoc method
   * @name $routeProvider#when
   *
   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
   *    contains redundant trailing slash or is missing one, the route will still match and the
   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
   *    route definition.
   *
   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
   *        to the next slash are matched and stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain named groups starting with a colon and ending with a star:
   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
   *
   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
   *
   *    * `color: brown`
   *    * `largecode: code/with/slashes`.
   *
   *
   * @param {Object} route Mapping information to be assigned to `$route.current` on route
   *    match.
   *
   *    Object properties:
   *
   *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
   *      newly created scope or the name of a {@link angular.Module#controller registered
   *      controller} if passed as a string.
   *    - `controllerAs` – `{string=}` – A controller alias name. If present the controller will be
   *      published to scope under the `controllerAs` name.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used by {@link
   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
   *      This property takes precedence over `templateUrl`.
   *
   *      If `template` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
   *
   *      If `templateUrl` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *      be injected into the controller. If any of these dependencies are promises, the router
   *      will wait for them all to be resolved or one to be rejected before the controller is
   *      instantiated.
   *      If all the promises are resolved successfully, the values of the resolved promises are
   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
   *      fired. If any of the promises are rejected the
   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired. The map object
   *      is:
   *
   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
   *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
   *        and the return value is treated as the dependency. If the result is a promise, it is
   *        resolved before its value is injected into the controller. Be aware that
   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
   *
   *    - `redirectTo` – {(string|function())=} – value to update
   *      {@link ng.$location $location} path with and trigger route redirection.
   *
   *      If `redirectTo` is a function, it will be called with the following parameters:
   *
   *      - `{Object.<string>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route templateUrl.
   *      - `{string}` - current `$location.path()`
   *      - `{Object}` - current `$location.search()`
   *
   *      The custom `redirectTo` function is expected to return a string which will be used
   *      to update `$location.path()` and `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - {boolean=} - reload route when only `$location.search()`
   *      or `$location.hash()` changes.
   *
   *      If the option is set to `false` and url in the browser changes, then
   *      `$routeUpdate` event is broadcasted on the root scope.
   *
   *    - `[caseInsensitiveMatch=false]` - {boolean=} - match routes without being case sensitive
   *
   *      If the option is set to `true`, then the particular route can be matched without being
   *      case sensitive
   *
   * @returns {Object} self
   *
   * @description
   * Adds a new route definition to the `$route` service.
   */
  this.when = function(path, route) {
    routes[path] = angular.extend(
      {reloadOnSearch: true},
      route,
      path && pathRegExp(path, route)
    );

    // create redirection for trailing slashes
    if (path) {
      var redirectPath = (path[path.length-1] == '/')
            ? path.substr(0, path.length-1)
            : path +'/';

      routes[redirectPath] = angular.extend(
        {redirectTo: path},
        pathRegExp(redirectPath, route)
      );
    }

    return this;
  };

   /**
    * @param path {string} path
    * @param opts {Object} options
    * @return {?Object}
    *
    * @description
    * Normalizes the given path, returning a regular expression
    * and the original path.
    *
    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
    */
  function pathRegExp(path, opts) {
    var insensitive = opts.caseInsensitiveMatch,
        ret = {
          originalPath: path,
          regexp: path
        },
        keys = ret.keys = [];

    path = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)([\?\*])?/g, function(_, slash, key, option){
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (star && '(.+?)' || '([^/]+)')
          + (optional || '')
          + ')'
          + (optional || '');
      })
      .replace(/([\/$\*])/g, '\\$1');

    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
    return ret;
  }

  /**
   * @ngdoc method
   * @name $routeProvider#otherwise
   *
   * @description
   * Sets route definition that will be used on route change when no other route definition
   * is matched.
   *
   * @param {Object} params Mapping information to be assigned to `$route.current`.
   * @returns {Object} self
   */
  this.otherwise = function(params) {
    this.when(null, params);
    return this;
  };


  this.$get = ['$rootScope',
               '$location',
               '$routeParams',
               '$q',
               '$injector',
               '$http',
               '$templateCache',
               '$sce',
      function($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {

    /**
     * @ngdoc service
     * @name $route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as define in route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     * @property {Object} routes Object with all route configuration Objects as its properties.
     *
     * @description
     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
     * It watches `$location.url()` and tries to map the path to an existing route definition.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
     *
     * The `$route` service is typically used in conjunction with the
     * {@link ngRoute.directive:ngView `ngView`} directive and the
     * {@link ngRoute.$routeParams `$routeParams`} service.
     *
     * @example
     * This example shows how changing the URL hash causes the `$route` to match a route against the
     * URL, and the `ngView` pulls in the partial.
     *
     * Note that this example is using {@link ng.directive:script inlined templates}
     * to get it working on jsfiddle as well.
     *
     * <example name="$route-service" module="ngRouteExample"
     *          deps="angular-route.js" fixBase="true">
     *   <file name="index.html">
     *     <div ng-controller="MainController">
     *       Choose:
     *       <a href="Book/Moby">Moby</a> |
     *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
     *       <a href="Book/Gatsby">Gatsby</a> |
     *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
     *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
     *
     *       <div ng-view></div>
     *
     *       <hr />
     *
     *       <pre>$location.path() = {{$location.path()}}</pre>
     *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
     *       <pre>$route.current.params = {{$route.current.params}}</pre>
     *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
     *       <pre>$routeParams = {{$routeParams}}</pre>
     *     </div>
     *   </file>
     *
     *   <file name="book.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *   </file>
     *
     *   <file name="chapter.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *     Chapter Id: {{params.chapterId}}
     *   </file>
     *
     *   <file name="script.js">
     *     angular.module('ngRouteExample', ['ngRoute'])
     *
     *      .controller('MainController', function($scope, $route, $routeParams, $location) {
     *          $scope.$route = $route;
     *          $scope.$location = $location;
     *          $scope.$routeParams = $routeParams;
     *      })
     *
     *      .controller('BookController', function($scope, $routeParams) {
     *          $scope.name = "BookController";
     *          $scope.params = $routeParams;
     *      })
     *
     *      .controller('ChapterController', function($scope, $routeParams) {
     *          $scope.name = "ChapterController";
     *          $scope.params = $routeParams;
     *      })
     *
     *     .config(function($routeProvider, $locationProvider) {
     *       $routeProvider
     *        .when('/Book/:bookId', {
     *         templateUrl: 'book.html',
     *         controller: 'BookController',
     *         resolve: {
     *           // I will cause a 1 second delay
     *           delay: function($q, $timeout) {
     *             var delay = $q.defer();
     *             $timeout(delay.resolve, 1000);
     *             return delay.promise;
     *           }
     *         }
     *       })
     *       .when('/Book/:bookId/ch/:chapterId', {
     *         templateUrl: 'chapter.html',
     *         controller: 'ChapterController'
     *       });
     *
     *       // configure html5 to get links working on jsfiddle
     *       $locationProvider.html5Mode(true);
     *     });
     *
     *   </file>
     *
     *   <file name="protractor.js" type="protractor">
     *     it('should load and compile correct template', function() {
     *       element(by.linkText('Moby: Ch1')).click();
     *       var content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: ChapterController/);
     *       expect(content).toMatch(/Book Id\: Moby/);
     *       expect(content).toMatch(/Chapter Id\: 1/);
     *
     *       element(by.partialLinkText('Scarlet')).click();
     *
     *       content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: BookController/);
     *       expect(content).toMatch(/Book Id\: Scarlet/);
     *     });
     *   </file>
     * </example>
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeStart
     * @eventType broadcast on root scope
     * @description
     * Broadcasted before a route change. At this  point the route services starts
     * resolving all of the dependencies needed for the route change to occur.
     * Typically this involves fetching the view template as well as any dependencies
     * defined in `resolve` route property. Once  all of the dependencies are resolved
     * `$routeChangeSuccess` is fired.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} next Future route information.
     * @param {Route} current Current route information.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeSuccess
     * @eventType broadcast on root scope
     * @description
     * Broadcasted after a route dependencies are resolved.
     * {@link ngRoute.directive:ngView ngView} listens for the directive
     * to instantiate the controller and render the view.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} current Current route information.
     * @param {Route|Undefined} previous Previous route information, or undefined if current is
     * first route entered.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeError
     * @eventType broadcast on root scope
     * @description
     * Broadcasted if any of the resolve promises are rejected.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current route information.
     * @param {Route} previous Previous route information.
     * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
     */

    /**
     * @ngdoc event
     * @name $route#$routeUpdate
     * @eventType broadcast on root scope
     * @description
     *
     * The `reloadOnSearch` property has been set to false, and we are reusing the same
     * instance of the Controller.
     */

    var forceReload = false,
        $route = {
          routes: routes,

          /**
           * @ngdoc method
           * @name $route#reload
           *
           * @description
           * Causes `$route` service to reload the current route even if
           * {@link ng.$location $location} hasn't changed.
           *
           * As a result of that, {@link ngRoute.directive:ngView ngView}
           * creates new scope, reinstantiates the controller.
           */
          reload: function() {
            forceReload = true;
            $rootScope.$evalAsync(updateRoute);
          }
        };

    $rootScope.$on('$locationChangeSuccess', updateRoute);

    return $route;

    /////////////////////////////////////////////////////

    /**
     * @param on {string} current url
     * @param route {Object} route regexp to match the url against
     * @return {?Object}
     *
     * @description
     * Check if the route matches the current url.
     *
     * Inspired by match in
     * visionmedia/express/lib/router/router.js.
     */
    function switchRouteMatcher(on, route) {
      var keys = route.keys,
          params = {};

      if (!route.regexp) return null;

      var m = route.regexp.exec(on);
      if (!m) return null;

      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];

        var val = 'string' == typeof m[i]
              ? decodeURIComponent(m[i])
              : m[i];

        if (key && val) {
          params[key.name] = val;
        }
      }
      return params;
    }

    function updateRoute() {
      var next = parseRoute(),
          last = $route.current;

      if (next && last && next.$$route === last.$$route
          && angular.equals(next.pathParams, last.pathParams)
          && !next.reloadOnSearch && !forceReload) {
        last.params = next.params;
        angular.copy(last.params, $routeParams);
        $rootScope.$broadcast('$routeUpdate', last);
      } else if (next || last) {
        forceReload = false;
        $rootScope.$broadcast('$routeChangeStart', next, last);
        $route.current = next;
        if (next) {
          if (next.redirectTo) {
            if (angular.isString(next.redirectTo)) {
              $location.path(interpolate(next.redirectTo, next.params)).search(next.params)
                       .replace();
            } else {
              $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search()))
                       .replace();
            }
          }
        }

        $q.when(next).
          then(function() {
            if (next) {
              var locals = angular.extend({}, next.resolve),
                  template, templateUrl;

              angular.forEach(locals, function(value, key) {
                locals[key] = angular.isString(value) ?
                    $injector.get(value) : $injector.invoke(value);
              });

              if (angular.isDefined(template = next.template)) {
                if (angular.isFunction(template)) {
                  template = template(next.params);
                }
              } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                if (angular.isFunction(templateUrl)) {
                  templateUrl = templateUrl(next.params);
                }
                templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                if (angular.isDefined(templateUrl)) {
                  next.loadedTemplateUrl = templateUrl;
                  template = $http.get(templateUrl, {cache: $templateCache}).
                      then(function(response) { return response.data; });
                }
              }
              if (angular.isDefined(template)) {
                locals['$template'] = template;
              }
              return $q.all(locals);
            }
          }).
          // after route change
          then(function(locals) {
            if (next == $route.current) {
              if (next) {
                next.locals = locals;
                angular.copy(next.params, $routeParams);
              }
              $rootScope.$broadcast('$routeChangeSuccess', next, last);
            }
          }, function(error) {
            if (next == $route.current) {
              $rootScope.$broadcast('$routeChangeError', next, last, error);
            }
          });
      }
    }


    /**
     * @returns {Object} the current active route, by matching it against the URL
     */
    function parseRoute() {
      // Match a route
      var params, match;
      angular.forEach(routes, function(route, path) {
        if (!match && (params = switchRouteMatcher($location.path(), route))) {
          match = inherit(route, {
            params: angular.extend({}, $location.search(), params),
            pathParams: params});
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
    }

    /**
     * @returns {string} interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      angular.forEach((string||'').split(':'), function(segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }
  }];
}

ngRouteModule.provider('$routeParams', $RouteParamsProvider);


/**
 * @ngdoc service
 * @name $routeParams
 * @requires $route
 *
 * @description
 * The `$routeParams` service allows you to retrieve the current set of route parameters.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * The route parameters are a combination of {@link ng.$location `$location`}'s
 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
 *
 * In case of parameter name collision, `path` params take precedence over `search` params.
 *
 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
 * (but its properties will likely change) even when a route change occurs.
 *
 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
 * Instead you can use `$route.current.params` to access the new route's parameters.
 *
 * @example
 * ```js
 *  // Given:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Route: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Then
 *  $routeParams ==> {chapterId:1, sectionId:2, search:'moby'}
 * ```
 */
function $RouteParamsProvider() {
  this.$get = function() { return {}; };
}

ngRouteModule.directive('ngView', ngViewFactory);
ngRouteModule.directive('ngView', ngViewFillContentFactory);


/**
 * @ngdoc directive
 * @name ngView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * @animations
 * enter - animation is used to bring new content into the browser.
 * leave - animation is used to animate existing content away.
 *
 * The enter and leave animation occur concurrently.
 *
 * @scope
 * @priority 400
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
 *                  $anchorScroll} to scroll the viewport after the view is updated.
 *
 *                  - If the attribute is not set, disable scrolling.
 *                  - If the attribute is set without value, enable scrolling.
 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
 *                    as an expression yields a truthy value.
 * @example
    <example name="ngView-directive" module="ngViewExample"
             deps="angular-route.js;angular-animate.js"
             animations="true" fixBase="true">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          Choose:
          <a href="Book/Moby">Moby</a> |
          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="Book/Gatsby">Gatsby</a> |
          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="Book/Scarlet">Scarlet Letter</a><br/>

          <div class="view-animate-container">
            <div ng-view class="view-animate"></div>
          </div>
          <hr />

          <pre>$location.path() = {{main.$location.path()}}</pre>
          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
          <pre>$route.current.params = {{main.$route.current.params}}</pre>
          <pre>$route.current.scope.name = {{main.$route.current.scope.name}}</pre>
          <pre>$routeParams = {{main.$routeParams}}</pre>
        </div>
      </file>

      <file name="book.html">
        <div>
          controller: {{book.name}}<br />
          Book Id: {{book.params.bookId}}<br />
        </div>
      </file>

      <file name="chapter.html">
        <div>
          controller: {{chapter.name}}<br />
          Book Id: {{chapter.params.bookId}}<br />
          Chapter Id: {{chapter.params.chapterId}}
        </div>
      </file>

      <file name="animations.css">
        .view-animate-container {
          position:relative;
          height:100px!important;
          position:relative;
          background:white;
          border:1px solid black;
          height:40px;
          overflow:hidden;
        }

        .view-animate {
          padding:10px;
        }

        .view-animate.ng-enter, .view-animate.ng-leave {
          -webkit-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;
          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

          display:block;
          width:100%;
          border-left:1px solid black;

          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
        }

        .view-animate.ng-enter {
          left:100%;
        }
        .view-animate.ng-enter.ng-enter-active {
          left:0;
        }
        .view-animate.ng-leave.ng-leave-active {
          left:-100%;
        }
      </file>

      <file name="script.js">
        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
          .config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {
              $routeProvider
                .when('/Book/:bookId', {
                  templateUrl: 'book.html',
                  controller: 'BookCtrl',
                  controllerAs: 'book'
                })
                .when('/Book/:bookId/ch/:chapterId', {
                  templateUrl: 'chapter.html',
                  controller: 'ChapterCtrl',
                  controllerAs: 'chapter'
                });

              // configure html5 to get links working on jsfiddle
              $locationProvider.html5Mode(true);
          }])
          .controller('MainCtrl', ['$route', '$routeParams', '$location',
            function($route, $routeParams, $location) {
              this.$route = $route;
              this.$location = $location;
              this.$routeParams = $routeParams;
          }])
          .controller('BookCtrl', ['$routeParams', function($routeParams) {
            this.name = "BookCtrl";
            this.params = $routeParams;
          }])
          .controller('ChapterCtrl', ['$routeParams', function($routeParams) {
            this.name = "ChapterCtrl";
            this.params = $routeParams;
          }]);

      </file>

      <file name="protractor.js" type="protractor">
        it('should load and compile correct template', function() {
          element(by.linkText('Moby: Ch1')).click();
          var content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: ChapterCtrl/);
          expect(content).toMatch(/Book Id\: Moby/);
          expect(content).toMatch(/Chapter Id\: 1/);

          element(by.partialLinkText('Scarlet')).click();

          content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: BookCtrl/);
          expect(content).toMatch(/Book Id\: Scarlet/);
        });
      </file>
    </example>
 */


/**
 * @ngdoc event
 * @name ngView#$viewContentLoaded
 * @eventType emit on the current ngView scope
 * @description
 * Emitted every time the ngView content is reloaded.
 */
ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
function ngViewFactory(   $route,   $anchorScroll,   $animate) {
  return {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    link: function(scope, $element, attr, ctrl, $transclude) {
        var currentScope,
            currentElement,
            previousElement,
            autoScrollExp = attr.autoscroll,
            onloadExp = attr.onload || '';

        scope.$on('$routeChangeSuccess', update);
        update();

        function cleanupLastView() {
          if(previousElement) {
            previousElement.remove();
            previousElement = null;
          }
          if(currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if(currentElement) {
            $animate.leave(currentElement, function() {
              previousElement = null;
            });
            previousElement = currentElement;
            currentElement = null;
          }
        }

        function update() {
          var locals = $route.current && $route.current.locals,
              template = locals && locals.$template;

          if (angular.isDefined(template)) {
            var newScope = scope.$new();
            var current = $route.current;

            // Note: This will also link all children of ng-view that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-view on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function(clone) {
              $animate.enter(clone, null, currentElement || $element, function onNgViewEnter () {
                if (angular.isDefined(autoScrollExp)
                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                  $anchorScroll();
                }
              });
              cleanupLastView();
            });

            currentElement = clone;
            currentScope = current.scope = newScope;
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
    }
  };
}

// This directive is called during the $transclude call of the first `ngView` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as ngView
// is called.
ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
function ngViewFillContentFactory($compile, $controller, $route) {
  return {
    restrict: 'ECA',
    priority: -400,
    link: function(scope, $element) {
      var current = $route.current,
          locals = current.locals;

      $element.html(locals.$template);

      var link = $compile($element.contents());

      if (current.controller) {
        locals.$scope = scope;
        var controller = $controller(current.controller, locals);
        if (current.controllerAs) {
          scope[current.controllerAs] = controller;
        }
        $element.data('$ngControllerController', controller);
        $element.children().data('$ngControllerController', controller);
      }

      link(scope);
    }
  };
}


})(window, window.angular);

},{}],8:[function(require,module,exports){
require('./lib/angular.min.js');

module.exports = angular;

},{"./lib/angular.min.js":9}],9:[function(require,module,exports){
/*
 AngularJS v1.2.16
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(O,U,s){'use strict';function t(b){return function(){var a=arguments[0],c,a="["+(b?b+":":"")+a+"] http://errors.angularjs.org/1.2.16/"+(b?b+"/":"")+a;for(c=1;c<arguments.length;c++)a=a+(1==c?"?":"&")+"p"+(c-1)+"="+encodeURIComponent("function"==typeof arguments[c]?arguments[c].toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof arguments[c]?"undefined":"string"!=typeof arguments[c]?JSON.stringify(arguments[c]):arguments[c]);return Error(a)}}function ab(b){if(null==b||Ca(b))return!1;
var a=b.length;return 1===b.nodeType&&a?!0:w(b)||M(b)||0===a||"number"===typeof a&&0<a&&a-1 in b}function q(b,a,c){var d;if(b)if(P(b))for(d in b)"prototype"==d||("length"==d||"name"==d||b.hasOwnProperty&&!b.hasOwnProperty(d))||a.call(c,b[d],d);else if(b.forEach&&b.forEach!==q)b.forEach(a,c);else if(ab(b))for(d=0;d<b.length;d++)a.call(c,b[d],d);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d);return b}function Qb(b){var a=[],c;for(c in b)b.hasOwnProperty(c)&&a.push(c);return a.sort()}function Sc(b,
a,c){for(var d=Qb(b),e=0;e<d.length;e++)a.call(c,b[d[e]],d[e]);return d}function Rb(b){return function(a,c){b(c,a)}}function bb(){for(var b=ka.length,a;b;){b--;a=ka[b].charCodeAt(0);if(57==a)return ka[b]="A",ka.join("");if(90==a)ka[b]="0";else return ka[b]=String.fromCharCode(a+1),ka.join("")}ka.unshift("0");return ka.join("")}function Sb(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function D(b){var a=b.$$hashKey;q(arguments,function(a){a!==b&&q(a,function(a,c){b[c]=a})});Sb(b,a);return b}function Y(b){return parseInt(b,
10)}function Tb(b,a){return D(new (D(function(){},{prototype:b})),a)}function C(){}function Da(b){return b}function aa(b){return function(){return b}}function E(b){return"undefined"===typeof b}function B(b){return"undefined"!==typeof b}function X(b){return null!=b&&"object"===typeof b}function w(b){return"string"===typeof b}function vb(b){return"number"===typeof b}function Na(b){return"[object Date]"===wa.call(b)}function M(b){return"[object Array]"===wa.call(b)}function P(b){return"function"===typeof b}
function cb(b){return"[object RegExp]"===wa.call(b)}function Ca(b){return b&&b.document&&b.location&&b.alert&&b.setInterval}function Tc(b){return!(!b||!(b.nodeName||b.prop&&b.attr&&b.find))}function Uc(b,a,c){var d=[];q(b,function(b,g,f){d.push(a.call(c,b,g,f))});return d}function db(b,a){if(b.indexOf)return b.indexOf(a);for(var c=0;c<b.length;c++)if(a===b[c])return c;return-1}function Oa(b,a){var c=db(b,a);0<=c&&b.splice(c,1);return a}function ba(b,a){if(Ca(b)||b&&b.$evalAsync&&b.$watch)throw Pa("cpws");
if(a){if(b===a)throw Pa("cpi");if(M(b))for(var c=a.length=0;c<b.length;c++)a.push(ba(b[c]));else{c=a.$$hashKey;q(a,function(b,c){delete a[c]});for(var d in b)a[d]=ba(b[d]);Sb(a,c)}}else(a=b)&&(M(b)?a=ba(b,[]):Na(b)?a=new Date(b.getTime()):cb(b)?a=RegExp(b.source):X(b)&&(a=ba(b,{})));return a}function Ub(b,a){a=a||{};for(var c in b)!b.hasOwnProperty(c)||"$"===c.charAt(0)&&"$"===c.charAt(1)||(a[c]=b[c]);return a}function xa(b,a){if(b===a)return!0;if(null===b||null===a)return!1;if(b!==b&&a!==a)return!0;
var c=typeof b,d;if(c==typeof a&&"object"==c)if(M(b)){if(!M(a))return!1;if((c=b.length)==a.length){for(d=0;d<c;d++)if(!xa(b[d],a[d]))return!1;return!0}}else{if(Na(b))return Na(a)&&b.getTime()==a.getTime();if(cb(b)&&cb(a))return b.toString()==a.toString();if(b&&b.$evalAsync&&b.$watch||a&&a.$evalAsync&&a.$watch||Ca(b)||Ca(a)||M(a))return!1;c={};for(d in b)if("$"!==d.charAt(0)&&!P(b[d])){if(!xa(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c.hasOwnProperty(d)&&"$"!==d.charAt(0)&&a[d]!==s&&!P(a[d]))return!1;
return!0}return!1}function Vb(){return U.securityPolicy&&U.securityPolicy.isActive||U.querySelector&&!(!U.querySelector("[ng-csp]")&&!U.querySelector("[data-ng-csp]"))}function eb(b,a){var c=2<arguments.length?ya.call(arguments,2):[];return!P(a)||a instanceof RegExp?a:c.length?function(){return arguments.length?a.apply(b,c.concat(ya.call(arguments,0))):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}}function Vc(b,a){var c=a;"string"===typeof b&&"$"===b.charAt(0)?c=
s:Ca(a)?c="$WINDOW":a&&U===a?c="$DOCUMENT":a&&(a.$evalAsync&&a.$watch)&&(c="$SCOPE");return c}function qa(b,a){return"undefined"===typeof b?s:JSON.stringify(b,Vc,a?"  ":null)}function Wb(b){return w(b)?JSON.parse(b):b}function Qa(b){"function"===typeof b?b=!0:b&&0!==b.length?(b=K(""+b),b=!("f"==b||"0"==b||"false"==b||"no"==b||"n"==b||"[]"==b)):b=!1;return b}function ha(b){b=y(b).clone();try{b.empty()}catch(a){}var c=y("<div>").append(b).html();try{return 3===b[0].nodeType?K(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,
function(a,b){return"<"+K(b)})}catch(d){return K(c)}}function Xb(b){try{return decodeURIComponent(b)}catch(a){}}function Yb(b){var a={},c,d;q((b||"").split("&"),function(b){b&&(c=b.split("="),d=Xb(c[0]),B(d)&&(b=B(c[1])?Xb(c[1]):!0,a[d]?M(a[d])?a[d].push(b):a[d]=[a[d],b]:a[d]=b))});return a}function Zb(b){var a=[];q(b,function(b,d){M(b)?q(b,function(b){a.push(za(d,!0)+(!0===b?"":"="+za(b,!0)))}):a.push(za(d,!0)+(!0===b?"":"="+za(b,!0)))});return a.length?a.join("&"):""}function wb(b){return za(b,
!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function za(b,a){return encodeURIComponent(b).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,a?"%20":"+")}function Wc(b,a){function c(a){a&&d.push(a)}var d=[b],e,g,f=["ng:app","ng-app","x-ng-app","data-ng-app"],h=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;q(f,function(a){f[a]=!0;c(U.getElementById(a));a=a.replace(":","\\:");b.querySelectorAll&&(q(b.querySelectorAll("."+a),c),q(b.querySelectorAll("."+
a+"\\:"),c),q(b.querySelectorAll("["+a+"]"),c))});q(d,function(a){if(!e){var b=h.exec(" "+a.className+" ");b?(e=a,g=(b[2]||"").replace(/\s+/g,",")):q(a.attributes,function(b){!e&&f[b.name]&&(e=a,g=b.value)})}});e&&a(e,g?[g]:[])}function $b(b,a){var c=function(){b=y(b);if(b.injector()){var c=b[0]===U?"document":ha(b);throw Pa("btstrpd",c);}a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);a.unshift("ng");c=ac(a);c.invoke(["$rootScope","$rootElement","$compile","$injector","$animate",
function(a,b,c,d,e){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},d=/^NG_DEFER_BOOTSTRAP!/;if(O&&!d.test(O.name))return c();O.name=O.name.replace(d,"");Ea.resumeBootstrap=function(b){q(b,function(b){a.push(b)});c()}}function fb(b,a){a=a||"_";return b.replace(Xc,function(b,d){return(d?a:"")+b.toLowerCase()})}function xb(b,a,c){if(!b)throw Pa("areq",a||"?",c||"required");return b}function Ra(b,a,c){c&&M(b)&&(b=b[b.length-1]);xb(P(b),a,"not a function, got "+(b&&"object"==typeof b?
b.constructor.name||"Object":typeof b));return b}function Aa(b,a){if("hasOwnProperty"===b)throw Pa("badname",a);}function bc(b,a,c){if(!a)return b;a=a.split(".");for(var d,e=b,g=a.length,f=0;f<g;f++)d=a[f],b&&(b=(e=b)[d]);return!c&&P(b)?eb(e,b):b}function yb(b){var a=b[0];b=b[b.length-1];if(a===b)return y(a);var c=[a];do{a=a.nextSibling;if(!a)break;c.push(a)}while(a!==b);return y(c)}function Yc(b){var a=t("$injector"),c=t("ng");b=b.angular||(b.angular={});b.$$minErr=b.$$minErr||t;return b.module||
(b.module=function(){var b={};return function(e,g,f){if("hasOwnProperty"===e)throw c("badname","module");g&&b.hasOwnProperty(e)&&(b[e]=null);return b[e]||(b[e]=function(){function b(a,d,e){return function(){c[e||"push"]([a,d,arguments]);return n}}if(!g)throw a("nomod",e);var c=[],d=[],m=b("$injector","invoke"),n={_invokeQueue:c,_runBlocks:d,requires:g,name:e,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:b("$provide","value"),constant:b("$provide",
"constant","unshift"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider","register"),directive:b("$compileProvider","directive"),config:m,run:function(a){d.push(a);return this}};f&&m(f);return n}())}}())}function Zc(b){D(b,{bootstrap:$b,copy:ba,extend:D,equals:xa,element:y,forEach:q,injector:ac,noop:C,bind:eb,toJson:qa,fromJson:Wb,identity:Da,isUndefined:E,isDefined:B,isString:w,isFunction:P,isObject:X,isNumber:vb,isElement:Tc,isArray:M,
version:$c,isDate:Na,lowercase:K,uppercase:Fa,callbacks:{counter:0},$$minErr:t,$$csp:Vb});Sa=Yc(O);try{Sa("ngLocale")}catch(a){Sa("ngLocale",[]).provider("$locale",ad)}Sa("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:bd});a.provider("$compile",cc).directive({a:cd,input:dc,textarea:dc,form:dd,script:ed,select:fd,style:gd,option:hd,ngBind:id,ngBindHtml:jd,ngBindTemplate:kd,ngClass:ld,ngClassEven:md,ngClassOdd:nd,ngCloak:od,ngController:pd,ngForm:qd,ngHide:rd,ngIf:sd,ngInclude:td,
ngInit:ud,ngNonBindable:vd,ngPluralize:wd,ngRepeat:xd,ngShow:yd,ngStyle:zd,ngSwitch:Ad,ngSwitchWhen:Bd,ngSwitchDefault:Cd,ngOptions:Dd,ngTransclude:Ed,ngModel:Fd,ngList:Gd,ngChange:Hd,required:ec,ngRequired:ec,ngValue:Id}).directive({ngInclude:Jd}).directive(zb).directive(fc);a.provider({$anchorScroll:Kd,$animate:Ld,$browser:Md,$cacheFactory:Nd,$controller:Od,$document:Pd,$exceptionHandler:Qd,$filter:gc,$interpolate:Rd,$interval:Sd,$http:Td,$httpBackend:Ud,$location:Vd,$log:Wd,$parse:Xd,$rootScope:Yd,
$q:Zd,$sce:$d,$sceDelegate:ae,$sniffer:be,$templateCache:ce,$timeout:de,$window:ee,$$rAF:fe,$$asyncCallback:ge})}])}function Ta(b){return b.replace(he,function(a,b,d,e){return e?d.toUpperCase():d}).replace(ie,"Moz$1")}function Ab(b,a,c,d){function e(b){var e=c&&b?[this.filter(b)]:[this],l=a,k,m,n,p,r,z;if(!d||null!=b)for(;e.length;)for(k=e.shift(),m=0,n=k.length;m<n;m++)for(p=y(k[m]),l?p.triggerHandler("$destroy"):l=!l,r=0,p=(z=p.children()).length;r<p;r++)e.push(Ga(z[r]));return g.apply(this,arguments)}
var g=Ga.fn[b],g=g.$original||g;e.$original=g;Ga.fn[b]=e}function N(b){if(b instanceof N)return b;w(b)&&(b=ca(b));if(!(this instanceof N)){if(w(b)&&"<"!=b.charAt(0))throw Bb("nosel");return new N(b)}if(w(b)){var a=b;b=U;var c;if(c=je.exec(a))b=[b.createElement(c[1])];else{var d=b,e;b=d.createDocumentFragment();c=[];if(Cb.test(a)){d=b.appendChild(d.createElement("div"));e=(ke.exec(a)||["",""])[1].toLowerCase();e=ea[e]||ea._default;d.innerHTML="<div>&#160;</div>"+e[1]+a.replace(le,"<$1></$2>")+e[2];
d.removeChild(d.firstChild);for(a=e[0];a--;)d=d.lastChild;a=0;for(e=d.childNodes.length;a<e;++a)c.push(d.childNodes[a]);d=b.firstChild;d.textContent=""}else c.push(d.createTextNode(a));b.textContent="";b.innerHTML="";b=c}Db(this,b);y(U.createDocumentFragment()).append(this)}else Db(this,b)}function Eb(b){return b.cloneNode(!0)}function Ha(b){hc(b);var a=0;for(b=b.childNodes||[];a<b.length;a++)Ha(b[a])}function ic(b,a,c,d){if(B(d))throw Bb("offargs");var e=la(b,"events");la(b,"handle")&&(E(a)?q(e,
function(a,c){Fb(b,c,a);delete e[c]}):q(a.split(" "),function(a){E(c)?(Fb(b,a,e[a]),delete e[a]):Oa(e[a]||[],c)}))}function hc(b,a){var c=b[gb],d=Ua[c];d&&(a?delete Ua[c].data[a]:(d.handle&&(d.events.$destroy&&d.handle({},"$destroy"),ic(b)),delete Ua[c],b[gb]=s))}function la(b,a,c){var d=b[gb],d=Ua[d||-1];if(B(c))d||(b[gb]=d=++me,d=Ua[d]={}),d[a]=c;else return d&&d[a]}function jc(b,a,c){var d=la(b,"data"),e=B(c),g=!e&&B(a),f=g&&!X(a);d||f||la(b,"data",d={});if(e)d[a]=c;else if(g){if(f)return d&&d[a];
D(d,a)}else return d}function Gb(b,a){return b.getAttribute?-1<(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+a+" "):!1}function hb(b,a){a&&b.setAttribute&&q(a.split(" "),function(a){b.setAttribute("class",ca((" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+ca(a)+" "," ")))})}function ib(b,a){if(a&&b.setAttribute){var c=(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");q(a.split(" "),function(a){a=ca(a);-1===c.indexOf(" "+a+" ")&&
(c+=a+" ")});b.setAttribute("class",ca(c))}}function Db(b,a){if(a){a=a.nodeName||!B(a.length)||Ca(a)?[a]:a;for(var c=0;c<a.length;c++)b.push(a[c])}}function kc(b,a){return jb(b,"$"+(a||"ngController")+"Controller")}function jb(b,a,c){b=y(b);9==b[0].nodeType&&(b=b.find("html"));for(a=M(a)?a:[a];b.length;){for(var d=b[0],e=0,g=a.length;e<g;e++)if((c=b.data(a[e]))!==s)return c;b=y(d.parentNode||11===d.nodeType&&d.host)}}function lc(b){for(var a=0,c=b.childNodes;a<c.length;a++)Ha(c[a]);for(;b.firstChild;)b.removeChild(b.firstChild)}
function mc(b,a){var c=kb[a.toLowerCase()];return c&&nc[b.nodeName]&&c}function ne(b,a){var c=function(c,e){c.preventDefault||(c.preventDefault=function(){c.returnValue=!1});c.stopPropagation||(c.stopPropagation=function(){c.cancelBubble=!0});c.target||(c.target=c.srcElement||U);if(E(c.defaultPrevented)){var g=c.preventDefault;c.preventDefault=function(){c.defaultPrevented=!0;g.call(c)};c.defaultPrevented=!1}c.isDefaultPrevented=function(){return c.defaultPrevented||!1===c.returnValue};var f=Ub(a[e||
c.type]||[]);q(f,function(a){a.call(b,c)});8>=S?(c.preventDefault=null,c.stopPropagation=null,c.isDefaultPrevented=null):(delete c.preventDefault,delete c.stopPropagation,delete c.isDefaultPrevented)};c.elem=b;return c}function Ia(b){var a=typeof b,c;"object"==a&&null!==b?"function"==typeof(c=b.$$hashKey)?c=b.$$hashKey():c===s&&(c=b.$$hashKey=bb()):c=b;return a+":"+c}function Va(b){q(b,this.put,this)}function oc(b){var a,c;"function"==typeof b?(a=b.$inject)||(a=[],b.length&&(c=b.toString().replace(oe,
""),c=c.match(pe),q(c[1].split(qe),function(b){b.replace(re,function(b,c,d){a.push(d)})})),b.$inject=a):M(b)?(c=b.length-1,Ra(b[c],"fn"),a=b.slice(0,c)):Ra(b,"fn",!0);return a}function ac(b){function a(a){return function(b,c){if(X(b))q(b,Rb(a));else return a(b,c)}}function c(a,b){Aa(a,"service");if(P(b)||M(b))b=n.instantiate(b);if(!b.$get)throw Wa("pget",a);return m[a+h]=b}function d(a,b){return c(a,{$get:b})}function e(a){var b=[],c,d,g,h;q(a,function(a){if(!k.get(a)){k.put(a,!0);try{if(w(a))for(c=
Sa(a),b=b.concat(e(c.requires)).concat(c._runBlocks),d=c._invokeQueue,g=0,h=d.length;g<h;g++){var f=d[g],l=n.get(f[0]);l[f[1]].apply(l,f[2])}else P(a)?b.push(n.invoke(a)):M(a)?b.push(n.invoke(a)):Ra(a,"module")}catch(m){throw M(a)&&(a=a[a.length-1]),m.message&&(m.stack&&-1==m.stack.indexOf(m.message))&&(m=m.message+"\n"+m.stack),Wa("modulerr",a,m.stack||m.message||m);}}});return b}function g(a,b){function c(d){if(a.hasOwnProperty(d)){if(a[d]===f)throw Wa("cdep",l.join(" <- "));return a[d]}try{return l.unshift(d),
a[d]=f,a[d]=b(d)}catch(e){throw a[d]===f&&delete a[d],e;}finally{l.shift()}}function d(a,b,e){var g=[],h=oc(a),f,l,k;l=0;for(f=h.length;l<f;l++){k=h[l];if("string"!==typeof k)throw Wa("itkn",k);g.push(e&&e.hasOwnProperty(k)?e[k]:c(k))}a.$inject||(a=a[f]);return a.apply(b,g)}return{invoke:d,instantiate:function(a,b){var c=function(){},e;c.prototype=(M(a)?a[a.length-1]:a).prototype;c=new c;e=d(a,c,b);return X(e)||P(e)?e:c},get:c,annotate:oc,has:function(b){return m.hasOwnProperty(b+h)||a.hasOwnProperty(b)}}}
var f={},h="Provider",l=[],k=new Va,m={$provide:{provider:a(c),factory:a(d),service:a(function(a,b){return d(a,["$injector",function(a){return a.instantiate(b)}])}),value:a(function(a,b){return d(a,aa(b))}),constant:a(function(a,b){Aa(a,"constant");m[a]=b;p[a]=b}),decorator:function(a,b){var c=n.get(a+h),d=c.$get;c.$get=function(){var a=r.invoke(d,c);return r.invoke(b,null,{$delegate:a})}}}},n=m.$injector=g(m,function(){throw Wa("unpr",l.join(" <- "));}),p={},r=p.$injector=g(p,function(a){a=n.get(a+
h);return r.invoke(a.$get,a)});q(e(b),function(a){r.invoke(a||C)});return r}function Kd(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;q(a,function(a){b||"a"!==K(a.nodeName)||(b=a)});return b}function g(){var b=c.hash(),d;b?(d=f.getElementById(b))?d.scrollIntoView():(d=e(f.getElementsByName(b)))?d.scrollIntoView():"top"===b&&a.scrollTo(0,0):a.scrollTo(0,0)}var f=a.document;b&&d.$watch(function(){return c.hash()},
function(){d.$evalAsync(g)});return g}]}function ge(){this.$get=["$$rAF","$timeout",function(b,a){return b.supported?function(a){return b(a)}:function(b){return a(b,0,!1)}}]}function se(b,a,c,d){function e(a){try{a.apply(null,ya.call(arguments,1))}finally{if(z--,0===z)for(;u.length;)try{u.pop()()}catch(b){c.error(b)}}}function g(a,b){(function T(){q(F,function(a){a()});v=b(T,a)})()}function f(){x=null;J!=h.url()&&(J=h.url(),q(ma,function(a){a(h.url())}))}var h=this,l=a[0],k=b.location,m=b.history,
n=b.setTimeout,p=b.clearTimeout,r={};h.isMock=!1;var z=0,u=[];h.$$completeOutstandingRequest=e;h.$$incOutstandingRequestCount=function(){z++};h.notifyWhenNoOutstandingRequests=function(a){q(F,function(a){a()});0===z?a():u.push(a)};var F=[],v;h.addPollFn=function(a){E(v)&&g(100,n);F.push(a);return a};var J=k.href,A=a.find("base"),x=null;h.url=function(a,c){k!==b.location&&(k=b.location);m!==b.history&&(m=b.history);if(a){if(J!=a)return J=a,d.history?c?m.replaceState(null,"",a):(m.pushState(null,"",
a),A.attr("href",A.attr("href"))):(x=a,c?k.replace(a):k.href=a),h}else return x||k.href.replace(/%27/g,"'")};var ma=[],L=!1;h.onUrlChange=function(a){if(!L){if(d.history)y(b).on("popstate",f);if(d.hashchange)y(b).on("hashchange",f);else h.addPollFn(f);L=!0}ma.push(a);return a};h.baseHref=function(){var a=A.attr("href");return a?a.replace(/^(https?\:)?\/\/[^\/]*/,""):""};var Q={},da="",H=h.baseHref();h.cookies=function(a,b){var d,e,g,h;if(a)b===s?l.cookie=escape(a)+"=;path="+H+";expires=Thu, 01 Jan 1970 00:00:00 GMT":
w(b)&&(d=(l.cookie=escape(a)+"="+escape(b)+";path="+H).length+1,4096<d&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!"));else{if(l.cookie!==da)for(da=l.cookie,d=da.split("; "),Q={},g=0;g<d.length;g++)e=d[g],h=e.indexOf("="),0<h&&(a=unescape(e.substring(0,h)),Q[a]===s&&(Q[a]=unescape(e.substring(h+1))));return Q}};h.defer=function(a,b){var c;z++;c=n(function(){delete r[c];e(a)},b||0);r[c]=!0;return c};h.defer.cancel=function(a){return r[a]?(delete r[a],
p(a),e(C),!0):!1}}function Md(){this.$get=["$window","$log","$sniffer","$document",function(b,a,c,d){return new se(b,d,a,c)}]}function Nd(){this.$get=function(){function b(b,d){function e(a){a!=n&&(p?p==a&&(p=a.n):p=a,g(a.n,a.p),g(a,n),n=a,n.n=null)}function g(a,b){a!=b&&(a&&(a.p=b),b&&(b.n=a))}if(b in a)throw t("$cacheFactory")("iid",b);var f=0,h=D({},d,{id:b}),l={},k=d&&d.capacity||Number.MAX_VALUE,m={},n=null,p=null;return a[b]={put:function(a,b){if(k<Number.MAX_VALUE){var c=m[a]||(m[a]={key:a});
e(c)}if(!E(b))return a in l||f++,l[a]=b,f>k&&this.remove(p.key),b},get:function(a){if(k<Number.MAX_VALUE){var b=m[a];if(!b)return;e(b)}return l[a]},remove:function(a){if(k<Number.MAX_VALUE){var b=m[a];if(!b)return;b==n&&(n=b.p);b==p&&(p=b.n);g(b.n,b.p);delete m[a]}delete l[a];f--},removeAll:function(){l={};f=0;m={};n=p=null},destroy:function(){m=h=l=null;delete a[b]},info:function(){return D({},h,{size:f})}}}var a={};b.info=function(){var b={};q(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};
return b}}function ce(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function cc(b,a){var c={},d="Directive",e=/^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,g=/(([\d\w\-_]+)(?:\:([^;]+))?;?)/,f=/^(on[a-z]+|formaction)$/;this.directive=function l(a,e){Aa(a,"directive");w(a)?(xb(e,"directiveFactory"),c.hasOwnProperty(a)||(c[a]=[],b.factory(a+d,["$injector","$exceptionHandler",function(b,d){var e=[];q(c[a],function(c,g){try{var f=b.invoke(c);P(f)?f={compile:aa(f)}:!f.compile&&f.link&&(f.compile=
aa(f.link));f.priority=f.priority||0;f.index=g;f.name=f.name||a;f.require=f.require||f.controller&&f.name;f.restrict=f.restrict||"A";e.push(f)}catch(l){d(l)}});return e}])),c[a].push(e)):q(a,Rb(l));return this};this.aHrefSanitizationWhitelist=function(b){return B(b)?(a.aHrefSanitizationWhitelist(b),this):a.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(b){return B(b)?(a.imgSrcSanitizationWhitelist(b),this):a.imgSrcSanitizationWhitelist()};this.$get=["$injector","$interpolate",
"$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document","$sce","$animate","$$sanitizeUri",function(a,b,m,n,p,r,z,u,F,v,J,A){function x(a,b,c,d,e){a instanceof y||(a=y(a));q(a,function(b,c){3==b.nodeType&&b.nodeValue.match(/\S+/)&&(a[c]=y(b).wrap("<span></span>").parent()[0])});var g=L(a,b,a,c,d,e);ma(a,"ng-scope");return function(b,c,d){xb(b,"scope");var e=c?Ja.clone.call(a):a;q(d,function(a,b){e.data("$"+b+"Controller",a)});d=0;for(var f=e.length;d<f;d++){var l=
e[d].nodeType;1!==l&&9!==l||e.eq(d).data("$scope",b)}c&&c(e,b);g&&g(b,e,e);return e}}function ma(a,b){try{a.addClass(b)}catch(c){}}function L(a,b,c,d,e,g){function f(a,c,d,e){var g,k,m,r,n,p,z;g=c.length;var I=Array(g);for(n=0;n<g;n++)I[n]=c[n];z=n=0;for(p=l.length;n<p;z++)k=I[z],c=l[n++],g=l[n++],m=y(k),c?(c.scope?(r=a.$new(),m.data("$scope",r)):r=a,(m=c.transclude)||!e&&b?c(g,r,k,d,Q(a,m||b)):c(g,r,k,d,e)):g&&g(a,k.childNodes,s,e)}for(var l=[],k,m,r,n,p=0;p<a.length;p++)k=new Hb,m=da(a[p],[],k,
0===p?d:s,e),(g=m.length?ia(m,a[p],k,b,c,null,[],[],g):null)&&g.scope&&ma(y(a[p]),"ng-scope"),k=g&&g.terminal||!(r=a[p].childNodes)||!r.length?null:L(r,g?g.transclude:b),l.push(g,k),n=n||g||k,g=null;return n?f:null}function Q(a,b){return function(c,d,e){var g=!1;c||(c=a.$new(),g=c.$$transcluded=!0);d=b(c,d,e);if(g)d.on("$destroy",eb(c,c.$destroy));return d}}function da(a,b,c,d,f){var k=c.$attr,l;switch(a.nodeType){case 1:T(b,na(Ka(a).toLowerCase()),"E",d,f);var m,r,n;l=a.attributes;for(var p=0,z=
l&&l.length;p<z;p++){var u=!1,F=!1;m=l[p];if(!S||8<=S||m.specified){r=m.name;n=na(r);W.test(n)&&(r=fb(n.substr(6),"-"));var J=n.replace(/(Start|End)$/,"");n===J+"Start"&&(u=r,F=r.substr(0,r.length-5)+"end",r=r.substr(0,r.length-6));n=na(r.toLowerCase());k[n]=r;c[n]=m=ca(m.value);mc(a,n)&&(c[n]=!0);N(a,b,m,n);T(b,n,"A",d,f,u,F)}}a=a.className;if(w(a)&&""!==a)for(;l=g.exec(a);)n=na(l[2]),T(b,n,"C",d,f)&&(c[n]=ca(l[3])),a=a.substr(l.index+l[0].length);break;case 3:t(b,a.nodeValue);break;case 8:try{if(l=
e.exec(a.nodeValue))n=na(l[1]),T(b,n,"M",d,f)&&(c[n]=ca(l[2]))}catch(x){}}b.sort(E);return b}function H(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw ja("uterdir",b,c);1==a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return y(d)}function R(a,b,c){return function(d,e,g,f,l){e=H(e[0],b,c);return a(d,e,g,f,l)}}function ia(a,c,d,e,g,f,l,n,p){function u(a,b,c,d){if(a){c&&(a=R(a,c,d));a.require=G.require;if(Q===
G||G.$$isolateScope)a=qc(a,{isolateScope:!0});l.push(a)}if(b){c&&(b=R(b,c,d));b.require=G.require;if(Q===G||G.$$isolateScope)b=qc(b,{isolateScope:!0});n.push(b)}}function F(a,b,c){var d,e="data",g=!1;if(w(a)){for(;"^"==(d=a.charAt(0))||"?"==d;)a=a.substr(1),"^"==d&&(e="inheritedData"),g=g||"?"==d;d=null;c&&"data"===e&&(d=c[a]);d=d||b[e]("$"+a+"Controller");if(!d&&!g)throw ja("ctreq",a,t);}else M(a)&&(d=[],q(a,function(a){d.push(F(a,b,c))}));return d}function J(a,e,g,f,p){function u(a,b){var c;2>arguments.length&&
(b=a,a=s);D&&(c=lb);return p(a,b,c)}var I,x,v,A,R,H,lb={},da;I=c===g?d:Ub(d,new Hb(y(g),d.$attr));x=I.$$element;if(Q){var T=/^\s*([@=&])(\??)\s*(\w*)\s*$/;f=y(g);H=e.$new(!0);ia&&ia===Q.$$originalDirective?f.data("$isolateScope",H):f.data("$isolateScopeNoTemplate",H);ma(f,"ng-isolate-scope");q(Q.scope,function(a,c){var d=a.match(T)||[],g=d[3]||c,f="?"==d[2],d=d[1],l,m,n,p;H.$$isolateBindings[c]=d+g;switch(d){case "@":I.$observe(g,function(a){H[c]=a});I.$$observers[g].$$scope=e;I[g]&&(H[c]=b(I[g])(e));
break;case "=":if(f&&!I[g])break;m=r(I[g]);p=m.literal?xa:function(a,b){return a===b};n=m.assign||function(){l=H[c]=m(e);throw ja("nonassign",I[g],Q.name);};l=H[c]=m(e);H.$watch(function(){var a=m(e);p(a,H[c])||(p(a,l)?n(e,a=H[c]):H[c]=a);return l=a},null,m.literal);break;case "&":m=r(I[g]);H[c]=function(a){return m(e,a)};break;default:throw ja("iscp",Q.name,c,a);}})}da=p&&u;L&&q(L,function(a){var b={$scope:a===Q||a.$$isolateScope?H:e,$element:x,$attrs:I,$transclude:da},c;R=a.controller;"@"==R&&(R=
I[a.name]);c=z(R,b);lb[a.name]=c;D||x.data("$"+a.name+"Controller",c);a.controllerAs&&(b.$scope[a.controllerAs]=c)});f=0;for(v=l.length;f<v;f++)try{A=l[f],A(A.isolateScope?H:e,x,I,A.require&&F(A.require,x,lb),da)}catch(G){m(G,ha(x))}f=e;Q&&(Q.template||null===Q.templateUrl)&&(f=H);a&&a(f,g.childNodes,s,p);for(f=n.length-1;0<=f;f--)try{A=n[f],A(A.isolateScope?H:e,x,I,A.require&&F(A.require,x,lb),da)}catch(B){m(B,ha(x))}}p=p||{};for(var v=-Number.MAX_VALUE,A,L=p.controllerDirectives,Q=p.newIsolateScopeDirective,
ia=p.templateDirective,T=p.nonTlbTranscludeDirective,E=!1,D=p.hasElementTranscludeDirective,Z=d.$$element=y(c),G,t,V,Xa=e,O,N=0,S=a.length;N<S;N++){G=a[N];var ra=G.$$start,W=G.$$end;ra&&(Z=H(c,ra,W));V=s;if(v>G.priority)break;if(V=G.scope)A=A||G,G.templateUrl||(K("new/isolated scope",Q,G,Z),X(V)&&(Q=G));t=G.name;!G.templateUrl&&G.controller&&(V=G.controller,L=L||{},K("'"+t+"' controller",L[t],G,Z),L[t]=G);if(V=G.transclude)E=!0,G.$$tlb||(K("transclusion",T,G,Z),T=G),"element"==V?(D=!0,v=G.priority,
V=H(c,ra,W),Z=d.$$element=y(U.createComment(" "+t+": "+d[t]+" ")),c=Z[0],mb(g,y(ya.call(V,0)),c),Xa=x(V,e,v,f&&f.name,{nonTlbTranscludeDirective:T})):(V=y(Eb(c)).contents(),Z.empty(),Xa=x(V,e));if(G.template)if(K("template",ia,G,Z),ia=G,V=P(G.template)?G.template(Z,d):G.template,V=Y(V),G.replace){f=G;V=Cb.test(V)?y(V):[];c=V[0];if(1!=V.length||1!==c.nodeType)throw ja("tplrt",t,"");mb(g,Z,c);S={$attr:{}};V=da(c,[],S);var $=a.splice(N+1,a.length-(N+1));Q&&pc(V);a=a.concat(V).concat($);B(d,S);S=a.length}else Z.html(V);
if(G.templateUrl)K("template",ia,G,Z),ia=G,G.replace&&(f=G),J=C(a.splice(N,a.length-N),Z,d,g,Xa,l,n,{controllerDirectives:L,newIsolateScopeDirective:Q,templateDirective:ia,nonTlbTranscludeDirective:T}),S=a.length;else if(G.compile)try{O=G.compile(Z,d,Xa),P(O)?u(null,O,ra,W):O&&u(O.pre,O.post,ra,W)}catch(aa){m(aa,ha(Z))}G.terminal&&(J.terminal=!0,v=Math.max(v,G.priority))}J.scope=A&&!0===A.scope;J.transclude=E&&Xa;p.hasElementTranscludeDirective=D;return J}function pc(a){for(var b=0,c=a.length;b<c;b++)a[b]=
Tb(a[b],{$$isolateScope:!0})}function T(b,e,g,f,k,n,r){if(e===k)return null;k=null;if(c.hasOwnProperty(e)){var p;e=a.get(e+d);for(var z=0,u=e.length;z<u;z++)try{p=e[z],(f===s||f>p.priority)&&-1!=p.restrict.indexOf(g)&&(n&&(p=Tb(p,{$$start:n,$$end:r})),b.push(p),k=p)}catch(F){m(F)}}return k}function B(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;q(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});q(b,function(b,g){"class"==g?(ma(e,b),a["class"]=(a["class"]?
a["class"]+" ":"")+b):"style"==g?(e.attr("style",e.attr("style")+";"+b),a.style=(a.style?a.style+";":"")+b):"$"==g.charAt(0)||a.hasOwnProperty(g)||(a[g]=b,d[g]=c[g])})}function C(a,b,c,d,e,g,f,l){var k=[],m,r,z=b[0],u=a.shift(),F=D({},u,{templateUrl:null,transclude:null,replace:null,$$originalDirective:u}),x=P(u.templateUrl)?u.templateUrl(b,c):u.templateUrl;b.empty();n.get(v.getTrustedResourceUrl(x),{cache:p}).success(function(n){var p,J;n=Y(n);if(u.replace){n=Cb.test(n)?y(n):[];p=n[0];if(1!=n.length||
1!==p.nodeType)throw ja("tplrt",u.name,x);n={$attr:{}};mb(d,b,p);var v=da(p,[],n);X(u.scope)&&pc(v);a=v.concat(a);B(c,n)}else p=z,b.html(n);a.unshift(F);m=ia(a,p,c,e,b,u,g,f,l);q(d,function(a,c){a==p&&(d[c]=b[0])});for(r=L(b[0].childNodes,e);k.length;){n=k.shift();J=k.shift();var A=k.shift(),R=k.shift(),v=b[0];if(J!==z){var H=J.className;l.hasElementTranscludeDirective&&u.replace||(v=Eb(p));mb(A,y(J),v);ma(y(v),H)}J=m.transclude?Q(n,m.transclude):R;m(r,n,v,d,J)}k=null}).error(function(a,b,c,d){throw ja("tpload",
d.url);});return function(a,b,c,d,e){k?(k.push(b),k.push(c),k.push(d),k.push(e)):m(r,b,c,d,e)}}function E(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function K(a,b,c,d){if(b)throw ja("multidir",b.name,c.name,a,ha(d));}function t(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:aa(function(a,b){var c=b.parent(),e=c.data("$binding")||[];e.push(d);ma(c.data("$binding",e),"ng-binding");a.$watch(d,function(a){b[0].nodeValue=a})})})}function O(a,b){if("srcdoc"==
b)return v.HTML;var c=Ka(a);if("xlinkHref"==b||"FORM"==c&&"action"==b||"IMG"!=c&&("src"==b||"ngSrc"==b))return v.RESOURCE_URL}function N(a,c,d,e){var g=b(d,!0);if(g){if("multiple"===e&&"SELECT"===Ka(a))throw ja("selmulti",ha(a));c.push({priority:100,compile:function(){return{pre:function(c,d,l){d=l.$$observers||(l.$$observers={});if(f.test(e))throw ja("nodomevents");if(g=b(l[e],!0,O(a,e)))l[e]=g(c),(d[e]||(d[e]=[])).$$inter=!0,(l.$$observers&&l.$$observers[e].$$scope||c).$watch(g,function(a,b){"class"===
e&&a!=b?l.$updateClass(a,b):l.$set(e,a)})}}}})}}function mb(a,b,c){var d=b[0],e=b.length,g=d.parentNode,f,l;if(a)for(f=0,l=a.length;f<l;f++)if(a[f]==d){a[f++]=c;l=f+e-1;for(var k=a.length;f<k;f++,l++)l<k?a[f]=a[l]:delete a[f];a.length-=e-1;break}g&&g.replaceChild(c,d);a=U.createDocumentFragment();a.appendChild(d);c[y.expando]=d[y.expando];d=1;for(e=b.length;d<e;d++)g=b[d],y(g).remove(),a.appendChild(g),delete b[d];b[0]=c;b.length=1}function qc(a,b){return D(function(){return a.apply(null,arguments)},
a,b)}var Hb=function(a,b){this.$$element=a;this.$attr=b||{}};Hb.prototype={$normalize:na,$addClass:function(a){a&&0<a.length&&J.addClass(this.$$element,a)},$removeClass:function(a){a&&0<a.length&&J.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=rc(a,b),d=rc(b,a);0===c.length?J.removeClass(this.$$element,d):0===d.length?J.addClass(this.$$element,c):J.setClass(this.$$element,c,d)},$set:function(a,b,c,d){var e=mc(this.$$element[0],a);e&&(this.$$element.prop(a,b),d=e);this[a]=b;d?this.$attr[a]=
d:(d=this.$attr[a])||(this.$attr[a]=d=fb(a,"-"));e=Ka(this.$$element);if("A"===e&&"href"===a||"IMG"===e&&"src"===a)this[a]=b=A(b,"src"===a);!1!==c&&(null===b||b===s?this.$$element.removeAttr(d):this.$$element.attr(d,b));(c=this.$$observers)&&q(c[a],function(a){try{a(b)}catch(c){m(c)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers={}),e=d[a]||(d[a]=[]);e.push(b);u.$evalAsync(function(){e.$$inter||b(c[a])});return b}};var Z=b.startSymbol(),ra=b.endSymbol(),Y="{{"==Z||"}}"==ra?
Da:function(a){return a.replace(/\{\{/g,Z).replace(/}}/g,ra)},W=/^ngAttr[A-Z]/;return x}]}function na(b){return Ta(b.replace(te,""))}function rc(b,a){var c="",d=b.split(/\s+/),e=a.split(/\s+/),g=0;a:for(;g<d.length;g++){for(var f=d[g],h=0;h<e.length;h++)if(f==e[h])continue a;c+=(0<c.length?" ":"")+f}return c}function Od(){var b={},a=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,d){Aa(a,"controller");X(a)?D(b,a):b[a]=d};this.$get=["$injector","$window",function(c,d){return function(e,g){var f,
h,l;w(e)&&(f=e.match(a),h=f[1],l=f[3],e=b.hasOwnProperty(h)?b[h]:bc(g.$scope,h,!0)||bc(d,h,!0),Ra(e,h,!0));f=c.instantiate(e,g);if(l){if(!g||"object"!=typeof g.$scope)throw t("$controller")("noscp",h||e.name,l);g.$scope[l]=f}return f}}]}function Pd(){this.$get=["$window",function(b){return y(b.document)}]}function Qd(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,arguments)}}]}function sc(b){var a={},c,d,e;if(!b)return a;q(b.split("\n"),function(b){e=b.indexOf(":");c=K(ca(b.substr(0,
e)));d=ca(b.substr(e+1));c&&(a[c]=a[c]?a[c]+(", "+d):d)});return a}function tc(b){var a=X(b)?b:s;return function(c){a||(a=sc(b));return c?a[K(c)]||null:a}}function uc(b,a,c){if(P(c))return c(b,a);q(c,function(c){b=c(b,a)});return b}function Td(){var b=/^\s*(\[|\{[^\{])/,a=/[\}\]]\s*$/,c=/^\)\]\}',?\n/,d={"Content-Type":"application/json;charset=utf-8"},e=this.defaults={transformResponse:[function(d){w(d)&&(d=d.replace(c,""),b.test(d)&&a.test(d)&&(d=Wb(d)));return d}],transformRequest:[function(a){return X(a)&&
"[object File]"!==wa.call(a)&&"[object Blob]"!==wa.call(a)?qa(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ba(d),put:ba(d),patch:ba(d)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},g=this.interceptors=[],f=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(a,b,c,d,n,p){function r(a){function c(a){var b=D({},a,{data:uc(a.data,a.headers,d.transformResponse)});return 200<=a.status&&300>a.status?
b:n.reject(b)}var d={method:"get",transformRequest:e.transformRequest,transformResponse:e.transformResponse},g=function(a){function b(a){var c;q(a,function(b,d){P(b)&&(c=b(),null!=c?a[d]=c:delete a[d])})}var c=e.headers,d=D({},a.headers),g,f,c=D({},c.common,c[K(a.method)]);b(c);b(d);a:for(g in c){a=K(g);for(f in d)if(K(f)===a)continue a;d[g]=c[g]}return d}(a);D(d,a);d.headers=g;d.method=Fa(d.method);(a=Ib(d.url)?b.cookies()[d.xsrfCookieName||e.xsrfCookieName]:s)&&(g[d.xsrfHeaderName||e.xsrfHeaderName]=
a);var f=[function(a){g=a.headers;var b=uc(a.data,tc(g),a.transformRequest);E(a.data)&&q(g,function(a,b){"content-type"===K(b)&&delete g[b]});E(a.withCredentials)&&!E(e.withCredentials)&&(a.withCredentials=e.withCredentials);return z(a,b,g).then(c,c)},s],h=n.when(d);for(q(v,function(a){(a.request||a.requestError)&&f.unshift(a.request,a.requestError);(a.response||a.responseError)&&f.push(a.response,a.responseError)});f.length;){a=f.shift();var k=f.shift(),h=h.then(a,k)}h.success=function(a){h.then(function(b){a(b.data,
b.status,b.headers,d)});return h};h.error=function(a){h.then(null,function(b){a(b.data,b.status,b.headers,d)});return h};return h}function z(b,c,g){function f(a,b,c,e){v&&(200<=a&&300>a?v.put(s,[a,b,sc(c),e]):v.remove(s));l(b,a,c,e);d.$$phase||d.$apply()}function l(a,c,d,e){c=Math.max(c,0);(200<=c&&300>c?p.resolve:p.reject)({data:a,status:c,headers:tc(d),config:b,statusText:e})}function k(){var a=db(r.pendingRequests,b);-1!==a&&r.pendingRequests.splice(a,1)}var p=n.defer(),z=p.promise,v,q,s=u(b.url,
b.params);r.pendingRequests.push(b);z.then(k,k);(b.cache||e.cache)&&(!1!==b.cache&&"GET"==b.method)&&(v=X(b.cache)?b.cache:X(e.cache)?e.cache:F);if(v)if(q=v.get(s),B(q)){if(q.then)return q.then(k,k),q;M(q)?l(q[1],q[0],ba(q[2]),q[3]):l(q,200,{},"OK")}else v.put(s,z);E(q)&&a(b.method,s,c,f,g,b.timeout,b.withCredentials,b.responseType);return z}function u(a,b){if(!b)return a;var c=[];Sc(b,function(a,b){null===a||E(a)||(M(a)||(a=[a]),q(a,function(a){X(a)&&(a=qa(a));c.push(za(b)+"="+za(a))}))});0<c.length&&
(a+=(-1==a.indexOf("?")?"?":"&")+c.join("&"));return a}var F=c("$http"),v=[];q(g,function(a){v.unshift(w(a)?p.get(a):p.invoke(a))});q(f,function(a,b){var c=w(a)?p.get(a):p.invoke(a);v.splice(b,0,{response:function(a){return c(n.when(a))},responseError:function(a){return c(n.reject(a))}})});r.pendingRequests=[];(function(a){q(arguments,function(a){r[a]=function(b,c){return r(D(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){q(arguments,function(a){r[a]=function(b,c,d){return r(D(d||
{},{method:a,url:b,data:c}))}})})("post","put");r.defaults=e;return r}]}function ue(b){if(8>=S&&(!b.match(/^(get|post|head|put|delete|options)$/i)||!O.XMLHttpRequest))return new O.ActiveXObject("Microsoft.XMLHTTP");if(O.XMLHttpRequest)return new O.XMLHttpRequest;throw t("$httpBackend")("noxhr");}function Ud(){this.$get=["$browser","$window","$document",function(b,a,c){return ve(b,ue,b.defer,a.angular.callbacks,c[0])}]}function ve(b,a,c,d,e){function g(a,b){var c=e.createElement("script"),d=function(){c.onreadystatechange=
c.onload=c.onerror=null;e.body.removeChild(c);b&&b()};c.type="text/javascript";c.src=a;S&&8>=S?c.onreadystatechange=function(){/loaded|complete/.test(c.readyState)&&d()}:c.onload=c.onerror=function(){d()};e.body.appendChild(c);return d}var f=-1;return function(e,l,k,m,n,p,r,z){function u(){v=f;A&&A();x&&x.abort()}function F(a,d,e,g,f){L&&c.cancel(L);A=x=null;0===d&&(d=e?200:"file"==sa(l).protocol?404:0);a(1223===d?204:d,e,g,f||"");b.$$completeOutstandingRequest(C)}var v;b.$$incOutstandingRequestCount();
l=l||b.url();if("jsonp"==K(e)){var J="_"+(d.counter++).toString(36);d[J]=function(a){d[J].data=a};var A=g(l.replace("JSON_CALLBACK","angular.callbacks."+J),function(){d[J].data?F(m,200,d[J].data):F(m,v||-2);d[J]=Ea.noop})}else{var x=a(e);x.open(e,l,!0);q(n,function(a,b){B(a)&&x.setRequestHeader(b,a)});x.onreadystatechange=function(){if(x&&4==x.readyState){var a=null,b=null;v!==f&&(a=x.getAllResponseHeaders(),b="response"in x?x.response:x.responseText);F(m,v||x.status,b,a,x.statusText||"")}};r&&(x.withCredentials=
!0);if(z)try{x.responseType=z}catch(s){if("json"!==z)throw s;}x.send(k||null)}if(0<p)var L=c(u,p);else p&&p.then&&p.then(u)}}function Rd(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler","$sce",function(c,d,e){function g(g,k,m){for(var n,p,r=0,z=[],u=g.length,F=!1,v=[];r<u;)-1!=(n=g.indexOf(b,r))&&-1!=(p=g.indexOf(a,n+f))?(r!=n&&z.push(g.substring(r,n)),z.push(r=c(F=g.substring(n+f,p))),
r.exp=F,r=p+h,F=!0):(r!=u&&z.push(g.substring(r)),r=u);(u=z.length)||(z.push(""),u=1);if(m&&1<z.length)throw vc("noconcat",g);if(!k||F)return v.length=u,r=function(a){try{for(var b=0,c=u,f;b<c;b++)"function"==typeof(f=z[b])&&(f=f(a),f=m?e.getTrusted(m,f):e.valueOf(f),null===f||E(f)?f="":"string"!=typeof f&&(f=qa(f))),v[b]=f;return v.join("")}catch(h){a=vc("interr",g,h.toString()),d(a)}},r.exp=g,r.parts=z,r}var f=b.length,h=a.length;g.startSymbol=function(){return b};g.endSymbol=function(){return a};
return g}]}function Sd(){this.$get=["$rootScope","$window","$q",function(b,a,c){function d(d,f,h,l){var k=a.setInterval,m=a.clearInterval,n=c.defer(),p=n.promise,r=0,z=B(l)&&!l;h=B(h)?h:0;p.then(null,null,d);p.$$intervalId=k(function(){n.notify(r++);0<h&&r>=h&&(n.resolve(r),m(p.$$intervalId),delete e[p.$$intervalId]);z||b.$apply()},f);e[p.$$intervalId]=n;return p}var e={};d.cancel=function(a){return a&&a.$$intervalId in e?(e[a.$$intervalId].reject("canceled"),clearInterval(a.$$intervalId),delete e[a.$$intervalId],
!0):!1};return d}]}function ad(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",posSuf:"",negPre:"(\u00a4",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January February March April May June July August September October November December".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(b){return 1===b?"one":"other"}}}}function wc(b){b=b.split("/");for(var a=b.length;a--;)b[a]=wb(b[a]);return b.join("/")}function xc(b,a,c){b=sa(b,c);a.$$protocol=
b.protocol;a.$$host=b.hostname;a.$$port=Y(b.port)||we[b.protocol]||null}function yc(b,a,c){var d="/"!==b.charAt(0);d&&(b="/"+b);b=sa(b,c);a.$$path=decodeURIComponent(d&&"/"===b.pathname.charAt(0)?b.pathname.substring(1):b.pathname);a.$$search=Yb(b.search);a.$$hash=decodeURIComponent(b.hash);a.$$path&&"/"!=a.$$path.charAt(0)&&(a.$$path="/"+a.$$path)}function oa(b,a){if(0===a.indexOf(b))return a.substr(b.length)}function Ya(b){var a=b.indexOf("#");return-1==a?b:b.substr(0,a)}function Jb(b){return b.substr(0,
Ya(b).lastIndexOf("/")+1)}function zc(b,a){this.$$html5=!0;a=a||"";var c=Jb(b);xc(b,this,b);this.$$parse=function(a){var e=oa(c,a);if(!w(e))throw Kb("ipthprfx",a,c);yc(e,this,b);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Zb(this.$$search),b=this.$$hash?"#"+wb(this.$$hash):"";this.$$url=wc(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$rewrite=function(d){var e;if((e=oa(b,d))!==s)return d=e,(e=oa(a,e))!==s?c+(oa("/",e)||e):b+d;if((e=oa(c,
d))!==s)return c+e;if(c==d+"/")return c}}function Lb(b,a){var c=Jb(b);xc(b,this,b);this.$$parse=function(d){var e=oa(b,d)||oa(c,d),e="#"==e.charAt(0)?oa(a,e):this.$$html5?e:"";if(!w(e))throw Kb("ihshprfx",d,a);yc(e,this,b);d=this.$$path;var g=/^\/?.*?:(\/.*)/;0===e.indexOf(b)&&(e=e.replace(b,""));g.exec(e)||(d=(e=g.exec(d))?e[1]:d);this.$$path=d;this.$$compose()};this.$$compose=function(){var c=Zb(this.$$search),e=this.$$hash?"#"+wb(this.$$hash):"";this.$$url=wc(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=
b+(this.$$url?a+this.$$url:"")};this.$$rewrite=function(a){if(Ya(b)==Ya(a))return a}}function Ac(b,a){this.$$html5=!0;Lb.apply(this,arguments);var c=Jb(b);this.$$rewrite=function(d){var e;if(b==Ya(d))return d;if(e=oa(c,d))return b+a+e;if(c===d+"/")return c}}function nb(b){return function(){return this[b]}}function Bc(b,a){return function(c){if(E(c))return this[b];this[b]=a(c);this.$$compose();return this}}function Vd(){var b="",a=!1;this.hashPrefix=function(a){return B(a)?(b=a,this):b};this.html5Mode=
function(b){return B(b)?(a=b,this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(c,d,e,g){function f(a){c.$broadcast("$locationChangeSuccess",h.absUrl(),a)}var h,l=d.baseHref(),k=d.url();a?(l=k.substring(0,k.indexOf("/",k.indexOf("//")+2))+(l||"/"),e=e.history?zc:Ac):(l=Ya(k),e=Lb);h=new e(l,"#"+b);h.$$parse(h.$$rewrite(k));g.on("click",function(a){if(!a.ctrlKey&&!a.metaKey&&2!=a.which){for(var b=y(a.target);"a"!==K(b[0].nodeName);)if(b[0]===g[0]||!(b=b.parent())[0])return;
var e=b.prop("href");X(e)&&"[object SVGAnimatedString]"===e.toString()&&(e=sa(e.animVal).href);var f=h.$$rewrite(e);e&&(!b.attr("target")&&f&&!a.isDefaultPrevented())&&(a.preventDefault(),f!=d.url()&&(h.$$parse(f),c.$apply(),O.angular["ff-684208-preventDefault"]=!0))}});h.absUrl()!=k&&d.url(h.absUrl(),!0);d.onUrlChange(function(a){h.absUrl()!=a&&(c.$evalAsync(function(){var b=h.absUrl();h.$$parse(a);c.$broadcast("$locationChangeStart",a,b).defaultPrevented?(h.$$parse(b),d.url(b)):f(b)}),c.$$phase||
c.$digest())});var m=0;c.$watch(function(){var a=d.url(),b=h.$$replace;m&&a==h.absUrl()||(m++,c.$evalAsync(function(){c.$broadcast("$locationChangeStart",h.absUrl(),a).defaultPrevented?h.$$parse(a):(d.url(h.absUrl(),b),f(a))}));h.$$replace=!1;return m});return h}]}function Wd(){var b=!0,a=this;this.debugEnabled=function(a){return B(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:
a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=c.console||{},e=b[a]||b.log||C;a=!1;try{a=!!e.apply}catch(l){}return a?function(){var a=[];q(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,arguments)}}()}}]}function fa(b,a){if("constructor"===b)throw Ba("isecfld",a);return b}function Za(b,
a){if(b){if(b.constructor===b)throw Ba("isecfn",a);if(b.document&&b.location&&b.alert&&b.setInterval)throw Ba("isecwindow",a);if(b.children&&(b.nodeName||b.prop&&b.attr&&b.find))throw Ba("isecdom",a);}return b}function ob(b,a,c,d,e){e=e||{};a=a.split(".");for(var g,f=0;1<a.length;f++){g=fa(a.shift(),d);var h=b[g];h||(h={},b[g]=h);b=h;b.then&&e.unwrapPromises&&(ta(d),"$$v"in b||function(a){a.then(function(b){a.$$v=b})}(b),b.$$v===s&&(b.$$v={}),b=b.$$v)}g=fa(a.shift(),d);return b[g]=c}function Cc(b,
a,c,d,e,g,f){fa(b,g);fa(a,g);fa(c,g);fa(d,g);fa(e,g);return f.unwrapPromises?function(f,l){var k=l&&l.hasOwnProperty(b)?l:f,m;if(null==k)return k;(k=k[b])&&k.then&&(ta(g),"$$v"in k||(m=k,m.$$v=s,m.then(function(a){m.$$v=a})),k=k.$$v);if(!a)return k;if(null==k)return s;(k=k[a])&&k.then&&(ta(g),"$$v"in k||(m=k,m.$$v=s,m.then(function(a){m.$$v=a})),k=k.$$v);if(!c)return k;if(null==k)return s;(k=k[c])&&k.then&&(ta(g),"$$v"in k||(m=k,m.$$v=s,m.then(function(a){m.$$v=a})),k=k.$$v);if(!d)return k;if(null==
k)return s;(k=k[d])&&k.then&&(ta(g),"$$v"in k||(m=k,m.$$v=s,m.then(function(a){m.$$v=a})),k=k.$$v);if(!e)return k;if(null==k)return s;(k=k[e])&&k.then&&(ta(g),"$$v"in k||(m=k,m.$$v=s,m.then(function(a){m.$$v=a})),k=k.$$v);return k}:function(g,f){var k=f&&f.hasOwnProperty(b)?f:g;if(null==k)return k;k=k[b];if(!a)return k;if(null==k)return s;k=k[a];if(!c)return k;if(null==k)return s;k=k[c];if(!d)return k;if(null==k)return s;k=k[d];return e?null==k?s:k=k[e]:k}}function xe(b,a){fa(b,a);return function(a,
d){return null==a?s:(d&&d.hasOwnProperty(b)?d:a)[b]}}function ye(b,a,c){fa(b,c);fa(a,c);return function(c,e){if(null==c)return s;c=(e&&e.hasOwnProperty(b)?e:c)[b];return null==c?s:c[a]}}function Dc(b,a,c){if(Mb.hasOwnProperty(b))return Mb[b];var d=b.split("."),e=d.length,g;if(a.unwrapPromises||1!==e)if(a.unwrapPromises||2!==e)if(a.csp)g=6>e?Cc(d[0],d[1],d[2],d[3],d[4],c,a):function(b,g){var f=0,h;do h=Cc(d[f++],d[f++],d[f++],d[f++],d[f++],c,a)(b,g),g=s,b=h;while(f<e);return h};else{var f="var p;\n";
q(d,function(b,d){fa(b,c);f+="if(s == null) return undefined;\ns="+(d?"s":'((k&&k.hasOwnProperty("'+b+'"))?k:s)')+'["'+b+'"];\n'+(a.unwrapPromises?'if (s && s.then) {\n pw("'+c.replace(/(["\r\n])/g,"\\$1")+'");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n':"")});var f=f+"return s;",h=new Function("s","k","pw",f);h.toString=aa(f);g=a.unwrapPromises?function(a,b){return h(a,b,ta)}:h}else g=ye(d[0],d[1],c);else g=xe(d[0],c);"hasOwnProperty"!==
b&&(Mb[b]=g);return g}function Xd(){var b={},a={csp:!1,unwrapPromises:!1,logPromiseWarnings:!0};this.unwrapPromises=function(b){return B(b)?(a.unwrapPromises=!!b,this):a.unwrapPromises};this.logPromiseWarnings=function(b){return B(b)?(a.logPromiseWarnings=b,this):a.logPromiseWarnings};this.$get=["$filter","$sniffer","$log",function(c,d,e){a.csp=d.csp;ta=function(b){a.logPromiseWarnings&&!Ec.hasOwnProperty(b)&&(Ec[b]=!0,e.warn("[$parse] Promise found in the expression `"+b+"`. Automatic unwrapping of promises in Angular expressions is deprecated."))};
return function(d){var e;switch(typeof d){case "string":if(b.hasOwnProperty(d))return b[d];e=new Nb(a);e=(new $a(e,c,a)).parse(d,!1);"hasOwnProperty"!==d&&(b[d]=e);return e;case "function":return d;default:return C}}}]}function Zd(){this.$get=["$rootScope","$exceptionHandler",function(b,a){return ze(function(a){b.$evalAsync(a)},a)}]}function ze(b,a){function c(a){return a}function d(a){return f(a)}var e=function(){var f=[],k,m;return m={resolve:function(a){if(f){var c=f;f=s;k=g(a);c.length&&b(function(){for(var a,
b=0,d=c.length;b<d;b++)a=c[b],k.then(a[0],a[1],a[2])})}},reject:function(a){m.resolve(h(a))},notify:function(a){if(f){var c=f;f.length&&b(function(){for(var b,d=0,e=c.length;d<e;d++)b=c[d],b[2](a)})}},promise:{then:function(b,g,h){var m=e(),u=function(d){try{m.resolve((P(b)?b:c)(d))}catch(e){m.reject(e),a(e)}},F=function(b){try{m.resolve((P(g)?g:d)(b))}catch(c){m.reject(c),a(c)}},v=function(b){try{m.notify((P(h)?h:c)(b))}catch(d){a(d)}};f?f.push([u,F,v]):k.then(u,F,v);return m.promise},"catch":function(a){return this.then(null,
a)},"finally":function(a){function b(a,c){var d=e();c?d.resolve(a):d.reject(a);return d.promise}function d(e,g){var f=null;try{f=(a||c)()}catch(h){return b(h,!1)}return f&&P(f.then)?f.then(function(){return b(e,g)},function(a){return b(a,!1)}):b(e,g)}return this.then(function(a){return d(a,!0)},function(a){return d(a,!1)})}}}},g=function(a){return a&&P(a.then)?a:{then:function(c){var d=e();b(function(){d.resolve(c(a))});return d.promise}}},f=function(a){var b=e();b.reject(a);return b.promise},h=function(c){return{then:function(g,
f){var h=e();b(function(){try{h.resolve((P(f)?f:d)(c))}catch(b){h.reject(b),a(b)}});return h.promise}}};return{defer:e,reject:f,when:function(h,k,m,n){var p=e(),r,z=function(b){try{return(P(k)?k:c)(b)}catch(d){return a(d),f(d)}},u=function(b){try{return(P(m)?m:d)(b)}catch(c){return a(c),f(c)}},F=function(b){try{return(P(n)?n:c)(b)}catch(d){a(d)}};b(function(){g(h).then(function(a){r||(r=!0,p.resolve(g(a).then(z,u,F)))},function(a){r||(r=!0,p.resolve(u(a)))},function(a){r||p.notify(F(a))})});return p.promise},
all:function(a){var b=e(),c=0,d=M(a)?[]:{};q(a,function(a,e){c++;g(a).then(function(a){d.hasOwnProperty(e)||(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise}}}function fe(){this.$get=["$window","$timeout",function(b,a){var c=b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame,d=b.cancelAnimationFrame||b.webkitCancelAnimationFrame||b.mozCancelAnimationFrame||b.webkitCancelRequestAnimationFrame,e=!!c,g=e?
function(a){var b=c(a);return function(){d(b)}}:function(b){var c=a(b,16.66,!1);return function(){a.cancel(c)}};g.supported=e;return g}]}function Yd(){var b=10,a=t("$rootScope"),c=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$injector","$exceptionHandler","$parse","$browser",function(d,e,g,f){function h(){this.$id=bb();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this["this"]=this.$root=this;
this.$$destroyed=!1;this.$$asyncQueue=[];this.$$postDigestQueue=[];this.$$listeners={};this.$$listenerCount={};this.$$isolateBindings={}}function l(b){if(p.$$phase)throw a("inprog",p.$$phase);p.$$phase=b}function k(a,b){var c=g(a);Ra(c,b);return c}function m(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function n(){}h.prototype={constructor:h,$new:function(a){a?(a=new h,a.$root=this.$root,a.$$asyncQueue=this.$$asyncQueue,a.$$postDigestQueue=
this.$$postDigestQueue):(a=function(){},a.prototype=this,a=new a,a.$id=bb());a["this"]=a;a.$$listeners={};a.$$listenerCount={};a.$parent=this;a.$$watchers=a.$$nextSibling=a.$$childHead=a.$$childTail=null;a.$$prevSibling=this.$$childTail;this.$$childHead?this.$$childTail=this.$$childTail.$$nextSibling=a:this.$$childHead=this.$$childTail=a;return a},$watch:function(a,b,d){var e=k(a,"watch"),g=this.$$watchers,f={fn:b,last:n,get:e,exp:a,eq:!!d};c=null;if(!P(b)){var h=k(b||C,"listener");f.fn=function(a,
b,c){h(c)}}if("string"==typeof a&&e.constant){var l=f.fn;f.fn=function(a,b,c){l.call(this,a,b,c);Oa(g,f)}}g||(g=this.$$watchers=[]);g.unshift(f);return function(){Oa(g,f);c=null}},$watchCollection:function(a,b){var c=this,d,e,f,h=1<b.length,l=0,k=g(a),m=[],n={},p=!0,q=0;return this.$watch(function(){d=k(c);var a,b;if(X(d))if(ab(d))for(e!==m&&(e=m,q=e.length=0,l++),a=d.length,q!==a&&(l++,e.length=q=a),b=0;b<a;b++)e[b]!==e[b]&&d[b]!==d[b]||e[b]===d[b]||(l++,e[b]=d[b]);else{e!==n&&(e=n={},q=0,l++);a=
0;for(b in d)d.hasOwnProperty(b)&&(a++,e.hasOwnProperty(b)?e[b]!==d[b]&&(l++,e[b]=d[b]):(q++,e[b]=d[b],l++));if(q>a)for(b in l++,e)e.hasOwnProperty(b)&&!d.hasOwnProperty(b)&&(q--,delete e[b])}else e!==d&&(e=d,l++);return l},function(){p?(p=!1,b(d,d,c)):b(d,f,c);if(h)if(X(d))if(ab(d)){f=Array(d.length);for(var a=0;a<d.length;a++)f[a]=d[a]}else for(a in f={},d)Fc.call(d,a)&&(f[a]=d[a]);else f=d})},$digest:function(){var d,g,f,h,k=this.$$asyncQueue,m=this.$$postDigestQueue,q,x,s=b,L,Q=[],y,H,R;l("$digest");
c=null;do{x=!1;for(L=this;k.length;){try{R=k.shift(),R.scope.$eval(R.expression)}catch(B){p.$$phase=null,e(B)}c=null}a:do{if(h=L.$$watchers)for(q=h.length;q--;)try{if(d=h[q])if((g=d.get(L))!==(f=d.last)&&!(d.eq?xa(g,f):"number"==typeof g&&"number"==typeof f&&isNaN(g)&&isNaN(f)))x=!0,c=d,d.last=d.eq?ba(g):g,d.fn(g,f===n?g:f,L),5>s&&(y=4-s,Q[y]||(Q[y]=[]),H=P(d.exp)?"fn: "+(d.exp.name||d.exp.toString()):d.exp,H+="; newVal: "+qa(g)+"; oldVal: "+qa(f),Q[y].push(H));else if(d===c){x=!1;break a}}catch(w){p.$$phase=
null,e(w)}if(!(h=L.$$childHead||L!==this&&L.$$nextSibling))for(;L!==this&&!(h=L.$$nextSibling);)L=L.$parent}while(L=h);if((x||k.length)&&!s--)throw p.$$phase=null,a("infdig",b,qa(Q));}while(x||k.length);for(p.$$phase=null;m.length;)try{m.shift()()}catch(T){e(T)}},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;this!==p&&(q(this.$$listenerCount,eb(null,m,this)),a.$$childHead==this&&(a.$$childHead=this.$$nextSibling),a.$$childTail==this&&
(a.$$childTail=this.$$prevSibling),this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling),this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling),this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=this.$root=null,this.$$listeners={},this.$$watchers=this.$$asyncQueue=this.$$postDigestQueue=[],this.$destroy=this.$digest=this.$apply=C,this.$on=this.$watch=function(){return C})}},$eval:function(a,b){return g(a)(this,b)},$evalAsync:function(a){p.$$phase||
p.$$asyncQueue.length||f.defer(function(){p.$$asyncQueue.length&&p.$digest()});this.$$asyncQueue.push({scope:this,expression:a})},$$postDigest:function(a){this.$$postDigestQueue.push(a)},$apply:function(a){try{return l("$apply"),this.$eval(a)}catch(b){e(b)}finally{p.$$phase=null;try{p.$digest()}catch(c){throw e(c),c;}}},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);
var e=this;return function(){c[db(c,b)]=null;m(e,1,a)}},$emit:function(a,b){var c=[],d,g=this,f=!1,h={name:a,targetScope:g,stopPropagation:function(){f=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},l=[h].concat(ya.call(arguments,1)),k,m;do{d=g.$$listeners[a]||c;h.currentScope=g;k=0;for(m=d.length;k<m;k++)if(d[k])try{d[k].apply(null,l)}catch(n){e(n)}else d.splice(k,1),k--,m--;if(f)break;g=g.$parent}while(g);return h},$broadcast:function(a,b){for(var c=this,d=this,g={name:a,
targetScope:this,preventDefault:function(){g.defaultPrevented=!0},defaultPrevented:!1},f=[g].concat(ya.call(arguments,1)),h,k;c=d;){g.currentScope=c;d=c.$$listeners[a]||[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,f)}catch(l){e(l)}else d.splice(h,1),h--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}return g}};var p=new h;return p}]}function bd(){var b=/^\s*(https?|ftp|mailto|tel|file):/,a=/^\s*(https?|ftp|file):|data:image\//;
this.aHrefSanitizationWhitelist=function(a){return B(a)?(b=a,this):b};this.imgSrcSanitizationWhitelist=function(b){return B(b)?(a=b,this):a};this.$get=function(){return function(c,d){var e=d?a:b,g;if(!S||8<=S)if(g=sa(c).href,""!==g&&!g.match(e))return"unsafe:"+g;return c}}}function Ae(b){if("self"===b)return b;if(w(b)){if(-1<b.indexOf("***"))throw ua("iwcard",b);b=b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08").replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return RegExp("^"+
b+"$")}if(cb(b))return RegExp("^"+b.source+"$");throw ua("imatcher");}function Gc(b){var a=[];B(b)&&q(b,function(b){a.push(Ae(b))});return a}function ae(){this.SCE_CONTEXTS=ga;var b=["self"],a=[];this.resourceUrlWhitelist=function(a){arguments.length&&(b=Gc(a));return b};this.resourceUrlBlacklist=function(b){arguments.length&&(a=Gc(b));return a};this.$get=["$injector",function(c){function d(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=
function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var e=function(a){throw ua("unsafe");};c.has("$sanitize")&&(e=c.get("$sanitize"));var g=d(),f={};f[ga.HTML]=d(g);f[ga.CSS]=d(g);f[ga.URL]=d(g);f[ga.JS]=d(g);f[ga.RESOURCE_URL]=d(f[ga.URL]);return{trustAs:function(a,b){var c=f.hasOwnProperty(a)?f[a]:null;if(!c)throw ua("icontext",a,b);if(null===b||b===s||""===b)return b;if("string"!==typeof b)throw ua("itype",a);return new c(b)},
getTrusted:function(c,d){if(null===d||d===s||""===d)return d;var g=f.hasOwnProperty(c)?f[c]:null;if(g&&d instanceof g)return d.$$unwrapTrustedValue();if(c===ga.RESOURCE_URL){var g=sa(d.toString()),m,n,p=!1;m=0;for(n=b.length;m<n;m++)if("self"===b[m]?Ib(g):b[m].exec(g.href)){p=!0;break}if(p)for(m=0,n=a.length;m<n;m++)if("self"===a[m]?Ib(g):a[m].exec(g.href)){p=!1;break}if(p)return d;throw ua("insecurl",d.toString());}if(c===ga.HTML)return e(d);throw ua("unsafe");},valueOf:function(a){return a instanceof
g?a.$$unwrapTrustedValue():a}}}]}function $d(){var b=!0;this.enabled=function(a){arguments.length&&(b=!!a);return b};this.$get=["$parse","$sniffer","$sceDelegate",function(a,c,d){if(b&&c.msie&&8>c.msieDocumentMode)throw ua("iequirks");var e=ba(ga);e.isEnabled=function(){return b};e.trustAs=d.trustAs;e.getTrusted=d.getTrusted;e.valueOf=d.valueOf;b||(e.trustAs=e.getTrusted=function(a,b){return b},e.valueOf=Da);e.parseAs=function(b,c){var d=a(c);return d.literal&&d.constant?d:function(a,c){return e.getTrusted(b,
d(a,c))}};var g=e.parseAs,f=e.getTrusted,h=e.trustAs;q(ga,function(a,b){var c=K(b);e[Ta("parse_as_"+c)]=function(b){return g(a,b)};e[Ta("get_trusted_"+c)]=function(b){return f(a,b)};e[Ta("trust_as_"+c)]=function(b){return h(a,b)}});return e}]}function be(){this.$get=["$window","$document",function(b,a){var c={},d=Y((/android (\d+)/.exec(K((b.navigator||{}).userAgent))||[])[1]),e=/Boxee/i.test((b.navigator||{}).userAgent),g=a[0]||{},f=g.documentMode,h,l=/^(Moz|webkit|O|ms)(?=[A-Z])/,k=g.body&&g.body.style,
m=!1,n=!1;if(k){for(var p in k)if(m=l.exec(p)){h=m[0];h=h.substr(0,1).toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in k&&"webkit");m=!!("transition"in k||h+"Transition"in k);n=!!("animation"in k||h+"Animation"in k);!d||m&&n||(m=w(g.body.style.webkitTransition),n=w(g.body.style.webkitAnimation))}return{history:!(!b.history||!b.history.pushState||4>d||e),hashchange:"onhashchange"in b&&(!f||7<f),hasEvent:function(a){if("input"==a&&9==S)return!1;if(E(c[a])){var b=g.createElement("div");c[a]="on"+
a in b}return c[a]},csp:Vb(),vendorPrefix:h,transitions:m,animations:n,android:d,msie:S,msieDocumentMode:f}}]}function de(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(b,a,c,d){function e(e,h,l){var k=c.defer(),m=k.promise,n=B(l)&&!l;h=a.defer(function(){try{k.resolve(e())}catch(a){k.reject(a),d(a)}finally{delete g[m.$$timeoutId]}n||b.$apply()},h);m.$$timeoutId=h;g[h]=k;return m}var g={};e.cancel=function(b){return b&&b.$$timeoutId in g?(g[b.$$timeoutId].reject("canceled"),
delete g[b.$$timeoutId],a.defer.cancel(b.$$timeoutId)):!1};return e}]}function sa(b,a){var c=b;S&&(W.setAttribute("href",c),c=W.href);W.setAttribute("href",c);return{href:W.href,protocol:W.protocol?W.protocol.replace(/:$/,""):"",host:W.host,search:W.search?W.search.replace(/^\?/,""):"",hash:W.hash?W.hash.replace(/^#/,""):"",hostname:W.hostname,port:W.port,pathname:"/"===W.pathname.charAt(0)?W.pathname:"/"+W.pathname}}function Ib(b){b=w(b)?sa(b):b;return b.protocol===Hc.protocol&&b.host===Hc.host}
function ee(){this.$get=aa(O)}function gc(b){function a(d,e){if(X(d)){var g={};q(d,function(b,c){g[c]=a(c,b)});return g}return b.factory(d+c,e)}var c="Filter";this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+c)}}];a("currency",Ic);a("date",Jc);a("filter",Be);a("json",Ce);a("limitTo",De);a("lowercase",Ee);a("number",Kc);a("orderBy",Lc);a("uppercase",Fe)}function Be(){return function(b,a,c){if(!M(b))return b;var d=typeof c,e=[];e.check=function(a){for(var b=0;b<e.length;b++)if(!e[b](a))return!1;
return!0};"function"!==d&&(c="boolean"===d&&c?function(a,b){return Ea.equals(a,b)}:function(a,b){if(a&&b&&"object"===typeof a&&"object"===typeof b){for(var d in a)if("$"!==d.charAt(0)&&Fc.call(a,d)&&c(a[d],b[d]))return!0;return!1}b=(""+b).toLowerCase();return-1<(""+a).toLowerCase().indexOf(b)});var g=function(a,b){if("string"==typeof b&&"!"===b.charAt(0))return!g(a,b.substr(1));switch(typeof a){case "boolean":case "number":case "string":return c(a,b);case "object":switch(typeof b){case "object":return c(a,
b);default:for(var d in a)if("$"!==d.charAt(0)&&g(a[d],b))return!0}return!1;case "array":for(d=0;d<a.length;d++)if(g(a[d],b))return!0;return!1;default:return!1}};switch(typeof a){case "boolean":case "number":case "string":a={$:a};case "object":for(var f in a)(function(b){"undefined"!=typeof a[b]&&e.push(function(c){return g("$"==b?c:c&&c[b],a[b])})})(f);break;case "function":e.push(a);break;default:return b}d=[];for(f=0;f<b.length;f++){var h=b[f];e.check(h)&&d.push(h)}return d}}function Ic(b){var a=
b.NUMBER_FORMATS;return function(b,d){E(d)&&(d=a.CURRENCY_SYM);return Mc(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,2).replace(/\u00A4/g,d)}}function Kc(b){var a=b.NUMBER_FORMATS;return function(b,d){return Mc(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}function Mc(b,a,c,d,e){if(null==b||!isFinite(b)||X(b))return"";var g=0>b;b=Math.abs(b);var f=b+"",h="",l=[],k=!1;if(-1!==f.indexOf("e")){var m=f.match(/([\d\.]+)e(-?)(\d+)/);m&&"-"==m[2]&&m[3]>e+1?f="0":(h=f,k=!0)}if(k)0<e&&(-1<b&&1>b)&&(h=b.toFixed(e));
else{f=(f.split(Nc)[1]||"").length;E(e)&&(e=Math.min(Math.max(a.minFrac,f),a.maxFrac));f=Math.pow(10,e);b=Math.round(b*f)/f;b=(""+b).split(Nc);f=b[0];b=b[1]||"";var m=0,n=a.lgSize,p=a.gSize;if(f.length>=n+p)for(m=f.length-n,k=0;k<m;k++)0===(m-k)%p&&0!==k&&(h+=c),h+=f.charAt(k);for(k=m;k<f.length;k++)0===(f.length-k)%n&&0!==k&&(h+=c),h+=f.charAt(k);for(;b.length<e;)b+="0";e&&"0"!==e&&(h+=d+b.substr(0,e))}l.push(g?a.negPre:a.posPre);l.push(h);l.push(g?a.negSuf:a.posSuf);return l.join("")}function Ob(b,
a,c){var d="";0>b&&(d="-",b=-b);for(b=""+b;b.length<a;)b="0"+b;c&&(b=b.substr(b.length-a));return d+b}function $(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(0<c||e>-c)e+=c;0===e&&-12==c&&(e=12);return Ob(e,a,d)}}function pb(b,a){return function(c,d){var e=c["get"+b](),g=Fa(a?"SHORT"+b:b);return d[g][e]}}function Jc(b){function a(a){var b;if(b=a.match(c)){a=new Date(0);var g=0,f=0,h=b[8]?a.setUTCFullYear:a.setFullYear,l=b[8]?a.setUTCHours:a.setHours;b[9]&&(g=Y(b[9]+b[10]),f=Y(b[9]+b[11]));
h.call(a,Y(b[1]),Y(b[2])-1,Y(b[3]));g=Y(b[4]||0)-g;f=Y(b[5]||0)-f;h=Y(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));l.call(a,g,f,h,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,e){var g="",f=[],h,l;e=e||"mediumDate";e=b.DATETIME_FORMATS[e]||e;w(c)&&(c=Ge.test(c)?Y(c):a(c));vb(c)&&(c=new Date(c));if(!Na(c))return c;for(;e;)(l=He.exec(e))?(f=f.concat(ya.call(l,1)),e=f.pop()):(f.push(e),e=null);q(f,function(a){h=
Ie[a];g+=h?h(c,b.DATETIME_FORMATS):a.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function Ce(){return function(b){return qa(b,!0)}}function De(){return function(b,a){if(!M(b)&&!w(b))return b;a=Y(a);if(w(b))return a?0<=a?b.slice(0,a):b.slice(a,b.length):"";var c=[],d,e;a>b.length?a=b.length:a<-b.length&&(a=-b.length);0<a?(d=0,e=a):(d=b.length+a,e=b.length);for(;d<e;d++)c.push(b[d]);return c}}function Lc(b){return function(a,c,d){function e(a,b){return Qa(b)?function(b,c){return a(c,b)}:a}
function g(a,b){var c=typeof a,d=typeof b;return c==d?("string"==c&&(a=a.toLowerCase(),b=b.toLowerCase()),a===b?0:a<b?-1:1):c<d?-1:1}if(!M(a)||!c)return a;c=M(c)?c:[c];c=Uc(c,function(a){var c=!1,d=a||Da;if(w(a)){if("+"==a.charAt(0)||"-"==a.charAt(0))c="-"==a.charAt(0),a=a.substring(1);d=b(a);if(d.constant){var f=d();return e(function(a,b){return g(a[f],b[f])},c)}}return e(function(a,b){return g(d(a),d(b))},c)});for(var f=[],h=0;h<a.length;h++)f.push(a[h]);return f.sort(e(function(a,b){for(var d=
0;d<c.length;d++){var e=c[d](a,b);if(0!==e)return e}return 0},d))}}function va(b){P(b)&&(b={link:b});b.restrict=b.restrict||"AC";return aa(b)}function Oc(b,a,c,d){function e(a,c){c=c?"-"+fb(c,"-"):"";d.removeClass(b,(a?qb:rb)+c);d.addClass(b,(a?rb:qb)+c)}var g=this,f=b.parent().controller("form")||sb,h=0,l=g.$error={},k=[];g.$name=a.name||a.ngForm;g.$dirty=!1;g.$pristine=!0;g.$valid=!0;g.$invalid=!1;f.$addControl(g);b.addClass(La);e(!0);g.$addControl=function(a){Aa(a.$name,"input");k.push(a);a.$name&&
(g[a.$name]=a)};g.$removeControl=function(a){a.$name&&g[a.$name]===a&&delete g[a.$name];q(l,function(b,c){g.$setValidity(c,!0,a)});Oa(k,a)};g.$setValidity=function(a,b,c){var d=l[a];if(b)d&&(Oa(d,c),d.length||(h--,h||(e(b),g.$valid=!0,g.$invalid=!1),l[a]=!1,e(!0,a),f.$setValidity(a,!0,g)));else{h||e(b);if(d){if(-1!=db(d,c))return}else l[a]=d=[],h++,e(!1,a),f.$setValidity(a,!1,g);d.push(c);g.$valid=!1;g.$invalid=!0}};g.$setDirty=function(){d.removeClass(b,La);d.addClass(b,tb);g.$dirty=!0;g.$pristine=
!1;f.$setDirty()};g.$setPristine=function(){d.removeClass(b,tb);d.addClass(b,La);g.$dirty=!1;g.$pristine=!0;q(k,function(a){a.$setPristine()})}}function pa(b,a,c,d){b.$setValidity(a,c);return c?d:s}function Je(b,a,c){var d=c.prop("validity");X(d)&&b.$parsers.push(function(c){if(b.$error[a]||!(d.badInput||d.customError||d.typeMismatch)||d.valueMissing)return c;b.$setValidity(a,!1)})}function ub(b,a,c,d,e,g){var f=a.prop("validity");if(!e.android){var h=!1;a.on("compositionstart",function(a){h=!0});
a.on("compositionend",function(){h=!1;l()})}var l=function(){if(!h){var e=a.val();Qa(c.ngTrim||"T")&&(e=ca(e));if(d.$viewValue!==e||f&&""===e&&!f.valueMissing)b.$$phase?d.$setViewValue(e):b.$apply(function(){d.$setViewValue(e)})}};if(e.hasEvent("input"))a.on("input",l);else{var k,m=function(){k||(k=g.defer(function(){l();k=null}))};a.on("keydown",function(a){a=a.keyCode;91===a||(15<a&&19>a||37<=a&&40>=a)||m()});if(e.hasEvent("paste"))a.on("paste cut",m)}a.on("change",l);d.$render=function(){a.val(d.$isEmpty(d.$viewValue)?
"":d.$viewValue)};var n=c.ngPattern;n&&((e=n.match(/^\/(.*)\/([gim]*)$/))?(n=RegExp(e[1],e[2]),e=function(a){return pa(d,"pattern",d.$isEmpty(a)||n.test(a),a)}):e=function(c){var e=b.$eval(n);if(!e||!e.test)throw t("ngPattern")("noregexp",n,e,ha(a));return pa(d,"pattern",d.$isEmpty(c)||e.test(c),c)},d.$formatters.push(e),d.$parsers.push(e));if(c.ngMinlength){var p=Y(c.ngMinlength);e=function(a){return pa(d,"minlength",d.$isEmpty(a)||a.length>=p,a)};d.$parsers.push(e);d.$formatters.push(e)}if(c.ngMaxlength){var r=
Y(c.ngMaxlength);e=function(a){return pa(d,"maxlength",d.$isEmpty(a)||a.length<=r,a)};d.$parsers.push(e);d.$formatters.push(e)}}function Pb(b,a){b="ngClass"+b;return["$animate",function(c){function d(a,b){var c=[],d=0;a:for(;d<a.length;d++){for(var e=a[d],m=0;m<b.length;m++)if(e==b[m])continue a;c.push(e)}return c}function e(a){if(!M(a)){if(w(a))return a.split(" ");if(X(a)){var b=[];q(a,function(a,c){a&&b.push(c)});return b}}return a}return{restrict:"AC",link:function(g,f,h){function l(a,b){var c=
f.data("$classCounts")||{},d=[];q(a,function(a){if(0<b||c[a])c[a]=(c[a]||0)+b,c[a]===+(0<b)&&d.push(a)});f.data("$classCounts",c);return d.join(" ")}function k(b){if(!0===a||g.$index%2===a){var k=e(b||[]);if(!m){var r=l(k,1);h.$addClass(r)}else if(!xa(b,m)){var q=e(m),r=d(k,q),k=d(q,k),k=l(k,-1),r=l(r,1);0===r.length?c.removeClass(f,k):0===k.length?c.addClass(f,r):c.setClass(f,r,k)}}m=ba(b)}var m;g.$watch(h[b],k,!0);h.$observe("class",function(a){k(g.$eval(h[b]))});"ngClass"!==b&&g.$watch("$index",
function(c,d){var f=c&1;if(f!==d&1){var k=e(g.$eval(h[b]));f===a?(f=l(k,1),h.$addClass(f)):(f=l(k,-1),h.$removeClass(f))}})}}}]}var K=function(b){return w(b)?b.toLowerCase():b},Fc=Object.prototype.hasOwnProperty,Fa=function(b){return w(b)?b.toUpperCase():b},S,y,Ga,ya=[].slice,Ke=[].push,wa=Object.prototype.toString,Pa=t("ng"),Ea=O.angular||(O.angular={}),Sa,Ka,ka=["0","0","0"];S=Y((/msie (\d+)/.exec(K(navigator.userAgent))||[])[1]);isNaN(S)&&(S=Y((/trident\/.*; rv:(\d+)/.exec(K(navigator.userAgent))||
[])[1]));C.$inject=[];Da.$inject=[];var ca=function(){return String.prototype.trim?function(b){return w(b)?b.trim():b}:function(b){return w(b)?b.replace(/^\s\s*/,"").replace(/\s\s*$/,""):b}}();Ka=9>S?function(b){b=b.nodeName?b:b[0];return b.scopeName&&"HTML"!=b.scopeName?Fa(b.scopeName+":"+b.nodeName):b.nodeName}:function(b){return b.nodeName?b.nodeName:b[0].nodeName};var Xc=/[A-Z]/g,$c={full:"1.2.16",major:1,minor:2,dot:16,codeName:"badger-enumeration"},Ua=N.cache={},gb=N.expando="ng-"+(new Date).getTime(),
me=1,Pc=O.document.addEventListener?function(b,a,c){b.addEventListener(a,c,!1)}:function(b,a,c){b.attachEvent("on"+a,c)},Fb=O.document.removeEventListener?function(b,a,c){b.removeEventListener(a,c,!1)}:function(b,a,c){b.detachEvent("on"+a,c)};N._data=function(b){return this.cache[b[this.expando]]||{}};var he=/([\:\-\_]+(.))/g,ie=/^moz([A-Z])/,Bb=t("jqLite"),je=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,Cb=/<|&#?\w+;/,ke=/<([\w:]+)/,le=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ea=
{option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ea.optgroup=ea.option;ea.tbody=ea.tfoot=ea.colgroup=ea.caption=ea.thead;ea.th=ea.td;var Ja=N.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;"complete"===U.readyState?setTimeout(a):(this.on("DOMContentLoaded",a),N(O).on("load",a))},toString:function(){var b=
[];q(this,function(a){b.push(""+a)});return"["+b.join(", ")+"]"},eq:function(b){return 0<=b?y(this[b]):y(this[this.length+b])},length:0,push:Ke,sort:[].sort,splice:[].splice},kb={};q("multiple selected checked disabled readOnly required open".split(" "),function(b){kb[K(b)]=b});var nc={};q("input select option textarea button form details".split(" "),function(b){nc[Fa(b)]=!0});q({data:jc,inheritedData:jb,scope:function(b){return y(b).data("$scope")||jb(b.parentNode||b,["$isolateScope","$scope"])},
isolateScope:function(b){return y(b).data("$isolateScope")||y(b).data("$isolateScopeNoTemplate")},controller:kc,injector:function(b){return jb(b,"$injector")},removeAttr:function(b,a){b.removeAttribute(a)},hasClass:Gb,css:function(b,a,c){a=Ta(a);if(B(c))b.style[a]=c;else{var d;8>=S&&(d=b.currentStyle&&b.currentStyle[a],""===d&&(d="auto"));d=d||b.style[a];8>=S&&(d=""===d?s:d);return d}},attr:function(b,a,c){var d=K(a);if(kb[d])if(B(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));
else return b[a]||(b.attributes.getNamedItem(a)||C).specified?d:s;else if(B(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),null===b?s:b},prop:function(b,a,c){if(B(c))b[a]=c;else return b[a]},text:function(){function b(b,d){var e=a[b.nodeType];if(E(d))return e?b[e]:"";b[e]=d}var a=[];9>S?(a[1]="innerText",a[3]="nodeValue"):a[1]=a[3]="textContent";b.$dv="";return b}(),val:function(b,a){if(E(a)){if("SELECT"===Ka(b)&&b.multiple){var c=[];q(b.options,function(a){a.selected&&
c.push(a.value||a.text)});return 0===c.length?null:c}return b.value}b.value=a},html:function(b,a){if(E(a))return b.innerHTML;for(var c=0,d=b.childNodes;c<d.length;c++)Ha(d[c]);b.innerHTML=a},empty:lc},function(b,a){N.prototype[a]=function(a,d){var e,g;if(b!==lc&&(2==b.length&&b!==Gb&&b!==kc?a:d)===s){if(X(a)){for(e=0;e<this.length;e++)if(b===jc)b(this[e],a);else for(g in a)b(this[e],g,a[g]);return this}e=b.$dv;g=e===s?Math.min(this.length,1):this.length;for(var f=0;f<g;f++){var h=b(this[f],a,d);e=
e?e+h:h}return e}for(e=0;e<this.length;e++)b(this[e],a,d);return this}});q({removeData:hc,dealoc:Ha,on:function a(c,d,e,g){if(B(g))throw Bb("onargs");var f=la(c,"events"),h=la(c,"handle");f||la(c,"events",f={});h||la(c,"handle",h=ne(c,f));q(d.split(" "),function(d){var g=f[d];if(!g){if("mouseenter"==d||"mouseleave"==d){var m=U.body.contains||U.body.compareDocumentPosition?function(a,c){var d=9===a.nodeType?a.documentElement:a,e=c&&c.parentNode;return a===e||!!(e&&1===e.nodeType&&(d.contains?d.contains(e):
a.compareDocumentPosition&&a.compareDocumentPosition(e)&16))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};f[d]=[];a(c,{mouseleave:"mouseout",mouseenter:"mouseover"}[d],function(a){var c=a.relatedTarget;c&&(c===this||m(this,c))||h(a,d)})}else Pc(c,d,h),f[d]=[];g=f[d]}g.push(e)})},off:ic,one:function(a,c,d){a=y(a);a.on(c,function g(){a.off(c,d);a.off(c,g)});a.on(c,d)},replaceWith:function(a,c){var d,e=a.parentNode;Ha(a);q(new N(c),function(c){d?e.insertBefore(c,d.nextSibling):
e.replaceChild(c,a);d=c})},children:function(a){var c=[];q(a.childNodes,function(a){1===a.nodeType&&c.push(a)});return c},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,c){q(new N(c),function(c){1!==a.nodeType&&11!==a.nodeType||a.appendChild(c)})},prepend:function(a,c){if(1===a.nodeType){var d=a.firstChild;q(new N(c),function(c){a.insertBefore(c,d)})}},wrap:function(a,c){c=y(c)[0];var d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},remove:function(a){Ha(a);
var c=a.parentNode;c&&c.removeChild(a)},after:function(a,c){var d=a,e=a.parentNode;q(new N(c),function(a){e.insertBefore(a,d.nextSibling);d=a})},addClass:ib,removeClass:hb,toggleClass:function(a,c,d){c&&q(c.split(" "),function(c){var g=d;E(g)&&(g=!Gb(a,c));(g?ib:hb)(a,c)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){if(a.nextElementSibling)return a.nextElementSibling;for(a=a.nextSibling;null!=a&&1!==a.nodeType;)a=a.nextSibling;return a},find:function(a,c){return a.getElementsByTagName?
a.getElementsByTagName(c):[]},clone:Eb,triggerHandler:function(a,c,d){c=(la(a,"events")||{})[c];d=d||[];var e=[{preventDefault:C,stopPropagation:C}];q(c,function(c){c.apply(a,e.concat(d))})}},function(a,c){N.prototype[c]=function(c,e,g){for(var f,h=0;h<this.length;h++)E(f)?(f=a(this[h],c,e,g),B(f)&&(f=y(f))):Db(f,a(this[h],c,e,g));return B(f)?f:this};N.prototype.bind=N.prototype.on;N.prototype.unbind=N.prototype.off});Va.prototype={put:function(a,c){this[Ia(a)]=c},get:function(a){return this[Ia(a)]},
remove:function(a){var c=this[a=Ia(a)];delete this[a];return c}};var pe=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,qe=/,/,re=/^\s*(_?)(\S+?)\1\s*$/,oe=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Wa=t("$injector"),Le=t("$animate"),Ld=["$provide",function(a){this.$$selectors={};this.register=function(c,d){var e=c+"-animation";if(c&&"."!=c.charAt(0))throw Le("notcsel",c);this.$$selectors[c.substr(1)]=e;a.factory(e,d)};this.classNameFilter=function(a){1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?
a:null);return this.$$classNameFilter};this.$get=["$timeout","$$asyncCallback",function(a,d){return{enter:function(a,c,f,h){f?f.after(a):(c&&c[0]||(c=f.parent()),c.append(a));h&&d(h)},leave:function(a,c){a.remove();c&&d(c)},move:function(a,c,d,h){this.enter(a,c,d,h)},addClass:function(a,c,f){c=w(c)?c:M(c)?c.join(" "):"";q(a,function(a){ib(a,c)});f&&d(f)},removeClass:function(a,c,f){c=w(c)?c:M(c)?c.join(" "):"";q(a,function(a){hb(a,c)});f&&d(f)},setClass:function(a,c,f,h){q(a,function(a){ib(a,c);hb(a,
f)});h&&d(h)},enabled:C}}]}],ja=t("$compile");cc.$inject=["$provide","$$sanitizeUriProvider"];var te=/^(x[\:\-_]|data[\:\-_])/i,vc=t("$interpolate"),Me=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,we={http:80,https:443,ftp:21},Kb=t("$location");Ac.prototype=Lb.prototype=zc.prototype={$$html5:!1,$$replace:!1,absUrl:nb("$$absUrl"),url:function(a,c){if(E(a))return this.$$url;var d=Me.exec(a);d[1]&&this.path(decodeURIComponent(d[1]));(d[2]||d[1])&&this.search(d[3]||"");this.hash(d[5]||"",c);return this},protocol:nb("$$protocol"),
host:nb("$$host"),port:nb("$$port"),path:Bc("$$path",function(a){return"/"==a.charAt(0)?a:"/"+a}),search:function(a,c){switch(arguments.length){case 0:return this.$$search;case 1:if(w(a))this.$$search=Yb(a);else if(X(a))this.$$search=a;else throw Kb("isrcharg");break;default:E(c)||null===c?delete this.$$search[a]:this.$$search[a]=c}this.$$compose();return this},hash:Bc("$$hash",Da),replace:function(){this.$$replace=!0;return this}};var Ba=t("$parse"),Ec={},ta,Ma={"null":function(){return null},"true":function(){return!0},
"false":function(){return!1},undefined:C,"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return B(d)?B(e)?d+e:d:B(e)?e:s},"-":function(a,c,d,e){d=d(a,c);e=e(a,c);return(B(d)?d:0)-(B(e)?e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"^":function(a,c,d,e){return d(a,c)^e(a,c)},"=":C,"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,c,d,e){return d(a,c)==e(a,
c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,c,d,e){return d(a,c)<=e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},"||":function(a,c,d,e){return d(a,c)||e(a,c)},"&":function(a,c,d,e){return d(a,c)&e(a,c)},"|":function(a,c,d,e){return e(a,c)(a,c,d(a,c))},"!":function(a,c,d){return!d(a,c)}},Ne={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},
Nb=function(a){this.options=a};Nb.prototype={constructor:Nb,lex:function(a){this.text=a;this.index=0;this.ch=s;this.lastCh=":";this.tokens=[];var c;for(a=[];this.index<this.text.length;){this.ch=this.text.charAt(this.index);if(this.is("\"'"))this.readString(this.ch);else if(this.isNumber(this.ch)||this.is(".")&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdent(this.ch))this.readIdent(),this.was("{,")&&("{"===a[0]&&(c=this.tokens[this.tokens.length-1]))&&(c.json=-1===c.text.indexOf("."));
else if(this.is("(){}[].,;:?"))this.tokens.push({index:this.index,text:this.ch,json:this.was(":[,")&&this.is("{[")||this.is("}]:,")}),this.is("{[")&&a.unshift(this.ch),this.is("}]")&&a.shift(),this.index++;else if(this.isWhitespace(this.ch)){this.index++;continue}else{var d=this.ch+this.peek(),e=d+this.peek(2),g=Ma[this.ch],f=Ma[d],h=Ma[e];h?(this.tokens.push({index:this.index,text:e,fn:h}),this.index+=3):f?(this.tokens.push({index:this.index,text:d,fn:f}),this.index+=2):g?(this.tokens.push({index:this.index,
text:this.ch,fn:g,json:this.was("[,:")&&this.is("+-")}),this.index+=1):this.throwError("Unexpected next character ",this.index,this.index+1)}this.lastCh=this.ch}return this.tokens},is:function(a){return-1!==a.indexOf(this.ch)},was:function(a){return-1!==a.indexOf(this.lastCh)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=a&&"9">=a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===
a},isIdent:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,c,d){d=d||this.index;c=B(c)?"s "+c+"-"+this.index+" ["+this.text.substring(c,d)+"]":" "+d;throw Ba("lexerr",a,c,this.text);},readNumber:function(){for(var a="",c=this.index;this.index<this.text.length;){var d=K(this.text.charAt(this.index));if("."==d||this.isNumber(d))a+=d;else{var e=this.peek();if("e"==d&&this.isExpOperator(e))a+=
d;else if(this.isExpOperator(d)&&e&&this.isNumber(e)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||e&&this.isNumber(e)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}a*=1;this.tokens.push({index:c,text:a,json:!0,fn:function(){return a}})},readIdent:function(){for(var a=this,c="",d=this.index,e,g,f,h;this.index<this.text.length;){h=this.text.charAt(this.index);if("."===h||this.isIdent(h)||this.isNumber(h))"."===h&&(e=this.index),c+=h;else break;
this.index++}if(e)for(g=this.index;g<this.text.length;){h=this.text.charAt(g);if("("===h){f=c.substr(e-d+1);c=c.substr(0,e-d);this.index=g;break}if(this.isWhitespace(h))g++;else break}d={index:d,text:c};if(Ma.hasOwnProperty(c))d.fn=Ma[c],d.json=Ma[c];else{var l=Dc(c,this.options,this.text);d.fn=D(function(a,c){return l(a,c)},{assign:function(d,e){return ob(d,c,e,a.text,a.options)}})}this.tokens.push(d);f&&(this.tokens.push({index:e,text:".",json:!1}),this.tokens.push({index:e+1,text:f,json:!1}))},
readString:function(a){var c=this.index;this.index++;for(var d="",e=a,g=!1;this.index<this.text.length;){var f=this.text.charAt(this.index),e=e+f;if(g)"u"===f?(f=this.text.substring(this.index+1,this.index+5),f.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+f+"]"),this.index+=4,d+=String.fromCharCode(parseInt(f,16))):d=(g=Ne[f])?d+g:d+f,g=!1;else if("\\"===f)g=!0;else{if(f===a){this.index++;this.tokens.push({index:c,text:e,string:d,json:!0,fn:function(){return d}});return}d+=
f}this.index++}this.throwError("Unterminated quote",c)}};var $a=function(a,c,d){this.lexer=a;this.$filter=c;this.options=d};$a.ZERO=D(function(){return 0},{constant:!0});$a.prototype={constructor:$a,parse:function(a,c){this.text=a;this.json=c;this.tokens=this.lexer.lex(a);c&&(this.assignment=this.logicalOR,this.functionCall=this.fieldAccess=this.objectIndex=this.filterChain=function(){this.throwError("is not valid json",{text:a,index:0})});var d=c?this.primary():this.statements();0!==this.tokens.length&&
this.throwError("is an unexpected token",this.tokens[0]);d.literal=!!d.literal;d.constant=!!d.constant;return d},primary:function(){var a;if(this.expect("("))a=this.filterChain(),this.consume(")");else if(this.expect("["))a=this.arrayDeclaration();else if(this.expect("{"))a=this.object();else{var c=this.expect();(a=c.fn)||this.throwError("not a primary expression",c);c.json&&(a.constant=!0,a.literal=!0)}for(var d;c=this.expect("(","[",".");)"("===c.text?(a=this.functionCall(a,d),d=null):"["===c.text?
(d=a,a=this.objectIndex(a)):"."===c.text?(d=a,a=this.fieldAccess(a)):this.throwError("IMPOSSIBLE");return a},throwError:function(a,c){throw Ba("syntax",c.text,a,c.index+1,this.text,this.text.substring(c.index));},peekToken:function(){if(0===this.tokens.length)throw Ba("ueoe",this.text);return this.tokens[0]},peek:function(a,c,d,e){if(0<this.tokens.length){var g=this.tokens[0],f=g.text;if(f===a||f===c||f===d||f===e||!(a||c||d||e))return g}return!1},expect:function(a,c,d,e){return(a=this.peek(a,c,d,
e))?(this.json&&!a.json&&this.throwError("is not valid json",a),this.tokens.shift(),a):!1},consume:function(a){this.expect(a)||this.throwError("is unexpected, expecting ["+a+"]",this.peek())},unaryFn:function(a,c){return D(function(d,e){return a(d,e,c)},{constant:c.constant})},ternaryFn:function(a,c,d){return D(function(e,g){return a(e,g)?c(e,g):d(e,g)},{constant:a.constant&&c.constant&&d.constant})},binaryFn:function(a,c,d){return D(function(e,g){return c(e,g,a,d)},{constant:a.constant&&d.constant})},
statements:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.filterChain()),!this.expect(";"))return 1===a.length?a[0]:function(c,d){for(var e,g=0;g<a.length;g++){var f=a[g];f&&(e=f(c,d))}return e}},filterChain:function(){for(var a=this.expression(),c;;)if(c=this.expect("|"))a=this.binaryFn(a,c.fn,this.filter());else return a},filter:function(){for(var a=this.expect(),c=this.$filter(a.text),d=[];;)if(a=this.expect(":"))d.push(this.expression());else{var e=
function(a,e,h){h=[h];for(var l=0;l<d.length;l++)h.push(d[l](a,e));return c.apply(a,h)};return function(){return e}}},expression:function(){return this.assignment()},assignment:function(){var a=this.ternary(),c,d;return(d=this.expect("="))?(a.assign||this.throwError("implies assignment but ["+this.text.substring(0,d.index)+"] can not be assigned to",d),c=this.ternary(),function(d,g){return a.assign(d,c(d,g),g)}):a},ternary:function(){var a=this.logicalOR(),c,d;if(this.expect("?")){c=this.ternary();
if(d=this.expect(":"))return this.ternaryFn(a,c,this.ternary());this.throwError("expected :",d)}else return a},logicalOR:function(){for(var a=this.logicalAND(),c;;)if(c=this.expect("||"))a=this.binaryFn(a,c.fn,this.logicalAND());else return a},logicalAND:function(){var a=this.equality(),c;if(c=this.expect("&&"))a=this.binaryFn(a,c.fn,this.logicalAND());return a},equality:function(){var a=this.relational(),c;if(c=this.expect("==","!=","===","!=="))a=this.binaryFn(a,c.fn,this.equality());return a},
relational:function(){var a=this.additive(),c;if(c=this.expect("<",">","<=",">="))a=this.binaryFn(a,c.fn,this.relational());return a},additive:function(){for(var a=this.multiplicative(),c;c=this.expect("+","-");)a=this.binaryFn(a,c.fn,this.multiplicative());return a},multiplicative:function(){for(var a=this.unary(),c;c=this.expect("*","/","%");)a=this.binaryFn(a,c.fn,this.unary());return a},unary:function(){var a;return this.expect("+")?this.primary():(a=this.expect("-"))?this.binaryFn($a.ZERO,a.fn,
this.unary()):(a=this.expect("!"))?this.unaryFn(a.fn,this.unary()):this.primary()},fieldAccess:function(a){var c=this,d=this.expect().text,e=Dc(d,this.options,this.text);return D(function(c,d,h){return e(h||a(c,d))},{assign:function(e,f,h){return ob(a(e,h),d,f,c.text,c.options)}})},objectIndex:function(a){var c=this,d=this.expression();this.consume("]");return D(function(e,g){var f=a(e,g),h=d(e,g),l;if(!f)return s;(f=Za(f[h],c.text))&&(f.then&&c.options.unwrapPromises)&&(l=f,"$$v"in f||(l.$$v=s,l.then(function(a){l.$$v=
a})),f=f.$$v);return f},{assign:function(e,g,f){var h=d(e,f);return Za(a(e,f),c.text)[h]=g}})},functionCall:function(a,c){var d=[];if(")"!==this.peekToken().text){do d.push(this.expression());while(this.expect(","))}this.consume(")");var e=this;return function(g,f){for(var h=[],l=c?c(g,f):g,k=0;k<d.length;k++)h.push(d[k](g,f));k=a(g,f,l)||C;Za(l,e.text);Za(k,e.text);h=k.apply?k.apply(l,h):k(h[0],h[1],h[2],h[3],h[4]);return Za(h,e.text)}},arrayDeclaration:function(){var a=[],c=!0;if("]"!==this.peekToken().text){do{if(this.peek("]"))break;
var d=this.expression();a.push(d);d.constant||(c=!1)}while(this.expect(","))}this.consume("]");return D(function(c,d){for(var f=[],h=0;h<a.length;h++)f.push(a[h](c,d));return f},{literal:!0,constant:c})},object:function(){var a=[],c=!0;if("}"!==this.peekToken().text){do{if(this.peek("}"))break;var d=this.expect(),d=d.string||d.text;this.consume(":");var e=this.expression();a.push({key:d,value:e});e.constant||(c=!1)}while(this.expect(","))}this.consume("}");return D(function(c,d){for(var e={},l=0;l<
a.length;l++){var k=a[l];e[k.key]=k.value(c,d)}return e},{literal:!0,constant:c})}};var Mb={},ua=t("$sce"),ga={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},W=U.createElement("a"),Hc=sa(O.location.href,!0);gc.$inject=["$provide"];Ic.$inject=["$locale"];Kc.$inject=["$locale"];var Nc=".",Ie={yyyy:$("FullYear",4),yy:$("FullYear",2,0,!0),y:$("FullYear",1),MMMM:pb("Month"),MMM:pb("Month",!0),MM:$("Month",2,1),M:$("Month",1,1),dd:$("Date",2),d:$("Date",1),HH:$("Hours",2),H:$("Hours",
1),hh:$("Hours",2,-12),h:$("Hours",1,-12),mm:$("Minutes",2),m:$("Minutes",1),ss:$("Seconds",2),s:$("Seconds",1),sss:$("Milliseconds",3),EEEE:pb("Day"),EEE:pb("Day",!0),a:function(a,c){return 12>a.getHours()?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){a=-1*a.getTimezoneOffset();return a=(0<=a?"+":"")+(Ob(Math[0<a?"floor":"ceil"](a/60),2)+Ob(Math.abs(a%60),2))}},He=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,Ge=/^\-?\d+$/;Jc.$inject=["$locale"];var Ee=aa(K),Fe=aa(Fa);Lc.$inject=
["$parse"];var cd=aa({restrict:"E",compile:function(a,c){8>=S&&(c.href||c.name||c.$set("href",""),a.append(U.createComment("IE fix")));if(!c.href&&!c.xlinkHref&&!c.name)return function(a,c){var g="[object SVGAnimatedString]"===wa.call(c.prop("href"))?"xlink:href":"href";c.on("click",function(a){c.attr(g)||a.preventDefault()})}}}),zb={};q(kb,function(a,c){if("multiple"!=a){var d=na("ng-"+c);zb[d]=function(){return{priority:100,link:function(a,g,f){a.$watch(f[d],function(a){f.$set(c,!!a)})}}}}});q(["src",
"srcset","href"],function(a){var c=na("ng-"+a);zb[c]=function(){return{priority:99,link:function(d,e,g){var f=a,h=a;"href"===a&&"[object SVGAnimatedString]"===wa.call(e.prop("href"))&&(h="xlinkHref",g.$attr[h]="xlink:href",f=null);g.$observe(c,function(a){a&&(g.$set(h,a),S&&f&&e.prop(f,g[h]))})}}}});var sb={$addControl:C,$removeControl:C,$setValidity:C,$setDirty:C,$setPristine:C};Oc.$inject=["$element","$attrs","$scope","$animate"];var Qc=function(a){return["$timeout",function(c){return{name:"form",
restrict:a?"EAC":"E",controller:Oc,compile:function(){return{pre:function(a,e,g,f){if(!g.action){var h=function(a){a.preventDefault?a.preventDefault():a.returnValue=!1};Pc(e[0],"submit",h);e.on("$destroy",function(){c(function(){Fb(e[0],"submit",h)},0,!1)})}var l=e.parent().controller("form"),k=g.name||g.ngForm;k&&ob(a,k,f,k);if(l)e.on("$destroy",function(){l.$removeControl(f);k&&ob(a,k,s,k);D(f,sb)})}}}}}]},dd=Qc(),qd=Qc(!0),Oe=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
Pe=/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,Qe=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,Rc={text:ub,number:function(a,c,d,e,g,f){ub(a,c,d,e,g,f);e.$parsers.push(function(a){var c=e.$isEmpty(a);if(c||Qe.test(a))return e.$setValidity("number",!0),""===a?null:c?a:parseFloat(a);e.$setValidity("number",!1);return s});Je(e,"number",c);e.$formatters.push(function(a){return e.$isEmpty(a)?"":""+a});d.min&&(a=function(a){var c=parseFloat(d.min);return pa(e,"min",e.$isEmpty(a)||a>=c,a)},e.$parsers.push(a),
e.$formatters.push(a));d.max&&(a=function(a){var c=parseFloat(d.max);return pa(e,"max",e.$isEmpty(a)||a<=c,a)},e.$parsers.push(a),e.$formatters.push(a));e.$formatters.push(function(a){return pa(e,"number",e.$isEmpty(a)||vb(a),a)})},url:function(a,c,d,e,g,f){ub(a,c,d,e,g,f);a=function(a){return pa(e,"url",e.$isEmpty(a)||Oe.test(a),a)};e.$formatters.push(a);e.$parsers.push(a)},email:function(a,c,d,e,g,f){ub(a,c,d,e,g,f);a=function(a){return pa(e,"email",e.$isEmpty(a)||Pe.test(a),a)};e.$formatters.push(a);
e.$parsers.push(a)},radio:function(a,c,d,e){E(d.name)&&c.attr("name",bb());c.on("click",function(){c[0].checked&&a.$apply(function(){e.$setViewValue(d.value)})});e.$render=function(){c[0].checked=d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,c,d,e){var g=d.ngTrueValue,f=d.ngFalseValue;w(g)||(g=!0);w(f)||(f=!1);c.on("click",function(){a.$apply(function(){e.$setViewValue(c[0].checked)})});e.$render=function(){c[0].checked=e.$viewValue};e.$isEmpty=function(a){return a!==g};
e.$formatters.push(function(a){return a===g});e.$parsers.push(function(a){return a?g:f})},hidden:C,button:C,submit:C,reset:C,file:C},dc=["$browser","$sniffer",function(a,c){return{restrict:"E",require:"?ngModel",link:function(d,e,g,f){f&&(Rc[K(g.type)]||Rc.text)(d,e,g,f,c,a)}}}],rb="ng-valid",qb="ng-invalid",La="ng-pristine",tb="ng-dirty",Re=["$scope","$exceptionHandler","$attrs","$element","$parse","$animate",function(a,c,d,e,g,f){function h(a,c){c=c?"-"+fb(c,"-"):"";f.removeClass(e,(a?qb:rb)+c);
f.addClass(e,(a?rb:qb)+c)}this.$modelValue=this.$viewValue=Number.NaN;this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$name=d.name;var l=g(d.ngModel),k=l.assign;if(!k)throw t("ngModel")("nonassign",d.ngModel,ha(e));this.$render=C;this.$isEmpty=function(a){return E(a)||""===a||null===a||a!==a};var m=e.inheritedData("$formController")||sb,n=0,p=this.$error={};e.addClass(La);h(!0);this.$setValidity=function(a,c){p[a]!==
!c&&(c?(p[a]&&n--,n||(h(!0),this.$valid=!0,this.$invalid=!1)):(h(!1),this.$invalid=!0,this.$valid=!1,n++),p[a]=!c,h(c,a),m.$setValidity(a,c,this))};this.$setPristine=function(){this.$dirty=!1;this.$pristine=!0;f.removeClass(e,tb);f.addClass(e,La)};this.$setViewValue=function(d){this.$viewValue=d;this.$pristine&&(this.$dirty=!0,this.$pristine=!1,f.removeClass(e,La),f.addClass(e,tb),m.$setDirty());q(this.$parsers,function(a){d=a(d)});this.$modelValue!==d&&(this.$modelValue=d,k(a,d),q(this.$viewChangeListeners,
function(a){try{a()}catch(d){c(d)}}))};var r=this;a.$watch(function(){var c=l(a);if(r.$modelValue!==c){var d=r.$formatters,e=d.length;for(r.$modelValue=c;e--;)c=d[e](c);r.$viewValue!==c&&(r.$viewValue=c,r.$render())}return c})}],Fd=function(){return{require:["ngModel","^?form"],controller:Re,link:function(a,c,d,e){var g=e[0],f=e[1]||sb;f.$addControl(g);a.$on("$destroy",function(){f.$removeControl(g)})}}},Hd=aa({require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),
ec=function(){return{require:"?ngModel",link:function(a,c,d,e){if(e){d.required=!0;var g=function(a){if(d.required&&e.$isEmpty(a))e.$setValidity("required",!1);else return e.$setValidity("required",!0),a};e.$formatters.push(g);e.$parsers.unshift(g);d.$observe("required",function(){g(e.$viewValue)})}}}},Gd=function(){return{require:"ngModel",link:function(a,c,d,e){var g=(a=/\/(.*)\//.exec(d.ngList))&&RegExp(a[1])||d.ngList||",";e.$parsers.push(function(a){if(!E(a)){var c=[];a&&q(a.split(g),function(a){a&&
c.push(ca(a))});return c}});e.$formatters.push(function(a){return M(a)?a.join(", "):s});e.$isEmpty=function(a){return!a||!a.length}}}},Se=/^(true|false|\d+)$/,Id=function(){return{priority:100,compile:function(a,c){return Se.test(c.ngValue)?function(a,c,g){g.$set("value",a.$eval(g.ngValue))}:function(a,c,g){a.$watch(g.ngValue,function(a){g.$set("value",a)})}}}},id=va(function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBind);a.$watch(d.ngBind,function(a){c.text(a==s?"":a)})}),kd=["$interpolate",
function(a){return function(c,d,e){c=a(d.attr(e.$attr.ngBindTemplate));d.addClass("ng-binding").data("$binding",c);e.$observe("ngBindTemplate",function(a){d.text(a)})}}],jd=["$sce","$parse",function(a,c){return function(d,e,g){e.addClass("ng-binding").data("$binding",g.ngBindHtml);var f=c(g.ngBindHtml);d.$watch(function(){return(f(d)||"").toString()},function(c){e.html(a.getTrustedHtml(f(d))||"")})}}],ld=Pb("",!0),nd=Pb("Odd",0),md=Pb("Even",1),od=va({compile:function(a,c){c.$set("ngCloak",s);a.removeClass("ng-cloak")}}),
pd=[function(){return{scope:!0,controller:"@",priority:500}}],fc={};q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var c=na("ng-"+a);fc[c]=["$parse",function(d){return{compile:function(e,g){var f=d(g[c]);return function(c,d,e){d.on(K(a),function(a){c.$apply(function(){f(c,{$event:a})})})}}}}]});var sd=["$animate",function(a){return{transclude:"element",priority:600,terminal:!0,restrict:"A",
$$tlb:!0,link:function(c,d,e,g,f){var h,l,k;c.$watch(e.ngIf,function(g){Qa(g)?l||(l=c.$new(),f(l,function(c){c[c.length++]=U.createComment(" end ngIf: "+e.ngIf+" ");h={clone:c};a.enter(c,d.parent(),d)})):(k&&(k.remove(),k=null),l&&(l.$destroy(),l=null),h&&(k=yb(h.clone),a.leave(k,function(){k=null}),h=null))})}}}],td=["$http","$templateCache","$anchorScroll","$animate","$sce",function(a,c,d,e,g){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:Ea.noop,compile:function(f,
h){var l=h.ngInclude||h.src,k=h.onload||"",m=h.autoscroll;return function(f,h,q,s,u){var F=0,v,y,A,x=function(){y&&(y.remove(),y=null);v&&(v.$destroy(),v=null);A&&(e.leave(A,function(){y=null}),y=A,A=null)};f.$watch(g.parseAsResourceUrl(l),function(g){var l=function(){!B(m)||m&&!f.$eval(m)||d()},q=++F;g?(a.get(g,{cache:c}).success(function(a){if(q===F){var c=f.$new();s.template=a;a=u(c,function(a){x();e.enter(a,null,h,l)});v=c;A=a;v.$emit("$includeContentLoaded");f.$eval(k)}}).error(function(){q===
F&&x()}),f.$emit("$includeContentRequested")):(x(),s.template=null)})}}}}],Jd=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(c,d,e,g){d.html(g.template);a(d.contents())(c)}}}],ud=va({priority:450,compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),vd=va({terminal:!0,priority:1E3}),wd=["$locale","$interpolate",function(a,c){var d=/{}/g;return{restrict:"EA",link:function(e,g,f){var h=f.count,l=f.$attr.when&&g.attr(f.$attr.when),k=f.offset||
0,m=e.$eval(l)||{},n={},p=c.startSymbol(),r=c.endSymbol(),s=/^when(Minus)?(.+)$/;q(f,function(a,c){s.test(c)&&(m[K(c.replace("when","").replace("Minus","-"))]=g.attr(f.$attr[c]))});q(m,function(a,e){n[e]=c(a.replace(d,p+h+"-"+k+r))});e.$watch(function(){var c=parseFloat(e.$eval(h));if(isNaN(c))return"";c in m||(c=a.pluralCat(c-k));return n[c](e,g,!0)},function(a){g.text(a)})}}}],xd=["$parse","$animate",function(a,c){var d=t("ngRepeat");return{transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,
link:function(e,g,f,h,l){var k=f.ngRepeat,m=k.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),n,p,r,s,u,F,v={$id:Ia};if(!m)throw d("iexp",k);f=m[1];h=m[2];(m=m[3])?(n=a(m),p=function(a,c,d){F&&(v[F]=a);v[u]=c;v.$index=d;return n(e,v)}):(r=function(a,c){return Ia(c)},s=function(a){return a});m=f.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);if(!m)throw d("iidexp",f);u=m[3]||m[1];F=m[2];var B={};e.$watchCollection(h,function(a){var f,h,m=g[0],n,v={},H,R,w,C,T,t,
E=[];if(ab(a))T=a,n=p||r;else{n=p||s;T=[];for(w in a)a.hasOwnProperty(w)&&"$"!=w.charAt(0)&&T.push(w);T.sort()}H=T.length;h=E.length=T.length;for(f=0;f<h;f++)if(w=a===T?f:T[f],C=a[w],C=n(w,C,f),Aa(C,"`track by` id"),B.hasOwnProperty(C))t=B[C],delete B[C],v[C]=t,E[f]=t;else{if(v.hasOwnProperty(C))throw q(E,function(a){a&&a.scope&&(B[a.id]=a)}),d("dupes",k,C);E[f]={id:C};v[C]=!1}for(w in B)B.hasOwnProperty(w)&&(t=B[w],f=yb(t.clone),c.leave(f),q(f,function(a){a.$$NG_REMOVED=!0}),t.scope.$destroy());
f=0;for(h=T.length;f<h;f++){w=a===T?f:T[f];C=a[w];t=E[f];E[f-1]&&(m=E[f-1].clone[E[f-1].clone.length-1]);if(t.scope){R=t.scope;n=m;do n=n.nextSibling;while(n&&n.$$NG_REMOVED);t.clone[0]!=n&&c.move(yb(t.clone),null,y(m));m=t.clone[t.clone.length-1]}else R=e.$new();R[u]=C;F&&(R[F]=w);R.$index=f;R.$first=0===f;R.$last=f===H-1;R.$middle=!(R.$first||R.$last);R.$odd=!(R.$even=0===(f&1));t.scope||l(R,function(a){a[a.length++]=U.createComment(" end ngRepeat: "+k+" ");c.enter(a,null,y(m));m=a;t.scope=R;t.clone=
a;v[t.id]=t})}B=v})}}}],yd=["$animate",function(a){return function(c,d,e){c.$watch(e.ngShow,function(c){a[Qa(c)?"removeClass":"addClass"](d,"ng-hide")})}}],rd=["$animate",function(a){return function(c,d,e){c.$watch(e.ngHide,function(c){a[Qa(c)?"addClass":"removeClass"](d,"ng-hide")})}}],zd=va(function(a,c,d){a.$watch(d.ngStyle,function(a,d){d&&a!==d&&q(d,function(a,d){c.css(d,"")});a&&c.css(a)},!0)}),Ad=["$animate",function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases=
{}}],link:function(c,d,e,g){var f,h,l,k=[];c.$watch(e.ngSwitch||e.on,function(d){var n,p=k.length;if(0<p){if(l){for(n=0;n<p;n++)l[n].remove();l=null}l=[];for(n=0;n<p;n++){var r=h[n];k[n].$destroy();l[n]=r;a.leave(r,function(){l.splice(n,1);0===l.length&&(l=null)})}}h=[];k=[];if(f=g.cases["!"+d]||g.cases["?"])c.$eval(e.change),q(f,function(d){var e=c.$new();k.push(e);d.transclude(e,function(c){var e=d.element;h.push(c);a.enter(c,e.parent(),e)})})})}}}],Bd=va({transclude:"element",priority:800,require:"^ngSwitch",
link:function(a,c,d,e,g){e.cases["!"+d.ngSwitchWhen]=e.cases["!"+d.ngSwitchWhen]||[];e.cases["!"+d.ngSwitchWhen].push({transclude:g,element:c})}}),Cd=va({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,c,d,e,g){e.cases["?"]=e.cases["?"]||[];e.cases["?"].push({transclude:g,element:c})}}),Ed=va({link:function(a,c,d,e,g){if(!g)throw t("ngTransclude")("orphan",ha(c));g(function(a){c.empty();c.append(a)})}}),ed=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,
d){"text/ng-template"==d.type&&a.put(d.id,c[0].text)}}}],Te=t("ngOptions"),Dd=aa({terminal:!0}),fd=["$compile","$parse",function(a,c){var d=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,e={$setViewValue:C};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(a,c,d){var l=this,k={},m=e,n;l.databound=
d.ngModel;l.init=function(a,c,d){m=a;n=d};l.addOption=function(c){Aa(c,'"option value"');k[c]=!0;m.$viewValue==c&&(a.val(c),n.parent()&&n.remove())};l.removeOption=function(a){this.hasOption(a)&&(delete k[a],m.$viewValue==a&&this.renderUnknownOption(a))};l.renderUnknownOption=function(c){c="? "+Ia(c)+" ?";n.val(c);a.prepend(n);a.val(c);n.prop("selected",!0)};l.hasOption=function(a){return k.hasOwnProperty(a)};c.$on("$destroy",function(){l.renderUnknownOption=C})}],link:function(e,f,h,l){function k(a,
c,d,e){d.$render=function(){var a=d.$viewValue;e.hasOption(a)?(A.parent()&&A.remove(),c.val(a),""===a&&w.prop("selected",!0)):E(a)&&w?c.val(""):e.renderUnknownOption(a)};c.on("change",function(){a.$apply(function(){A.parent()&&A.remove();d.$setViewValue(c.val())})})}function m(a,c,d){var e;d.$render=function(){var a=new Va(d.$viewValue);q(c.find("option"),function(c){c.selected=B(a.get(c.value))})};a.$watch(function(){xa(e,d.$viewValue)||(e=ba(d.$viewValue),d.$render())});c.on("change",function(){a.$apply(function(){var a=
[];q(c.find("option"),function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function n(e,f,g){function h(){var a={"":[]},c=[""],d,k,s,t,z;t=g.$modelValue;z=y(e)||[];var E=n?Qb(z):z,F,I,A;I={};s=!1;var D,H;if(r)if(w&&M(t))for(s=new Va([]),A=0;A<t.length;A++)I[m]=t[A],s.put(w(e,I),t[A]);else s=new Va(t);for(A=0;F=E.length,A<F;A++){k=A;if(n){k=E[A];if("$"===k.charAt(0))continue;I[n]=k}I[m]=z[k];d=p(e,I)||"";(k=a[d])||(k=a[d]=[],c.push(d));r?d=B(s.remove(w?w(e,I):q(e,I))):(w?(d={},d[m]=t,d=
w(e,d)===w(e,I)):d=t===q(e,I),s=s||d);D=l(e,I);D=B(D)?D:"";k.push({id:w?w(e,I):n?E[A]:A,label:D,selected:d})}r||(u||null===t?a[""].unshift({id:"",label:"",selected:!s}):s||a[""].unshift({id:"?",label:"",selected:!0}));I=0;for(E=c.length;I<E;I++){d=c[I];k=a[d];x.length<=I?(t={element:C.clone().attr("label",d),label:k.label},z=[t],x.push(z),f.append(t.element)):(z=x[I],t=z[0],t.label!=d&&t.element.attr("label",t.label=d));D=null;A=0;for(F=k.length;A<F;A++)s=k[A],(d=z[A+1])?(D=d.element,d.label!==s.label&&
D.text(d.label=s.label),d.id!==s.id&&D.val(d.id=s.id),d.selected!==s.selected&&D.prop("selected",d.selected=s.selected)):(""===s.id&&u?H=u:(H=v.clone()).val(s.id).attr("selected",s.selected).text(s.label),z.push({element:H,label:s.label,id:s.id,selected:s.selected}),D?D.after(H):t.element.append(H),D=H);for(A++;z.length>A;)z.pop().element.remove()}for(;x.length>I;)x.pop()[0].element.remove()}var k;if(!(k=t.match(d)))throw Te("iexp",t,ha(f));var l=c(k[2]||k[1]),m=k[4]||k[6],n=k[5],p=c(k[3]||""),q=
c(k[2]?k[1]:m),y=c(k[7]),w=k[8]?c(k[8]):null,x=[[{element:f,label:""}]];u&&(a(u)(e),u.removeClass("ng-scope"),u.remove());f.empty();f.on("change",function(){e.$apply(function(){var a,c=y(e)||[],d={},h,k,l,p,t,v,u;if(r)for(k=[],p=0,v=x.length;p<v;p++)for(a=x[p],l=1,t=a.length;l<t;l++){if((h=a[l].element)[0].selected){h=h.val();n&&(d[n]=h);if(w)for(u=0;u<c.length&&(d[m]=c[u],w(e,d)!=h);u++);else d[m]=c[h];k.push(q(e,d))}}else{h=f.val();if("?"==h)k=s;else if(""===h)k=null;else if(w)for(u=0;u<c.length;u++){if(d[m]=
c[u],w(e,d)==h){k=q(e,d);break}}else d[m]=c[h],n&&(d[n]=h),k=q(e,d);1<x[0].length&&x[0][1].id!==h&&(x[0][1].selected=!1)}g.$setViewValue(k)})});g.$render=h;e.$watch(h)}if(l[1]){var p=l[0];l=l[1];var r=h.multiple,t=h.ngOptions,u=!1,w,v=y(U.createElement("option")),C=y(U.createElement("optgroup")),A=v.clone();h=0;for(var x=f.children(),D=x.length;h<D;h++)if(""===x[h].value){w=u=x.eq(h);break}p.init(l,u,A);r&&(l.$isEmpty=function(a){return!a||0===a.length});t?n(e,f,l):r?m(e,f,l):k(e,f,l,p)}}}}],hd=["$interpolate",
function(a){var c={addOption:C,removeOption:C};return{restrict:"E",priority:100,compile:function(d,e){if(E(e.value)){var g=a(d.text(),!0);g||e.$set("value",d.text())}return function(a,d,e){var k=d.parent(),m=k.data("$selectController")||k.parent().data("$selectController");m&&m.databound?d.prop("selected",!1):m=c;g?a.$watch(g,function(a,c){e.$set("value",a);a!==c&&m.removeOption(c);m.addOption(a)}):m.addOption(e.value);d.on("$destroy",function(){m.removeOption(e.value)})}}}}],gd=aa({restrict:"E",
terminal:!0});O.angular.bootstrap?console.log("WARNING: Tried to load angular more than once."):((Ga=O.jQuery)?(y=Ga,D(Ga.fn,{scope:Ja.scope,isolateScope:Ja.isolateScope,controller:Ja.controller,injector:Ja.injector,inheritedData:Ja.inheritedData}),Ab("remove",!0,!0,!1),Ab("empty",!1,!1,!1),Ab("html",!1,!1,!0)):y=N,Ea.element=y,Zc(Ea),y(U).ready(function(){Wc(U,$b)}))})(window,document);!angular.$$csp()&&angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-block-transitions{transition:0s all!important;-webkit-transition:0s all!important;}</style>');
//# sourceMappingURL=angular.min.js.map

},{}],10:[function(require,module,exports){
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([],factory);
    } else {
        root.returnExports = factory();
    }
}(this, function () {
/**
 * Wrapper for headtrackr library
 *
 * Usage:
 *	var htracker = new headtrackr.Tracker(); 
 *	htracker.init(videoInput, canvasInput); 
 *	htracker.start(); 
 * 
 * Optional parameters can be passed to Tracker like this:
 *	 new headtrackr.Tracker({ ui : false, altVideo : "somevideo.ogv" });
 *
 * Optional parameters:
 *	ui {boolean} : whether to create messageoverlay with messages like "found face" (default is true)
 *	altVideo {object} : urls to any alternative videos, if camera is not found or not supported
 *		the format is : {'ogv' : 'somevideo.ogv', 'mp4' : 'somevideo.mp4', 'webm' : 'somevideo.webm'}
 *	smoothing {boolean} : whether to use smoothing (default is true)
 *	debug {canvas} : pass along a canvas to paint output of facedetection, for debugging
 *	detectionInterval {number} : time we wait before doing a new facedetection (default is 20 ms)
 *	retryDetection {boolean} : whether to start facedetection again if we lose track of face (default is true)
 *	fov {number} : horizontal field of view of used camera in degrees (default is to estimate this)
 *	fadeVideo {boolean} : whether to fade out video when face is detected (default is false)
 *	cameraOffset {number} : distance from camera to center of screen, used to offset position of head (default is 11.5)
 *	calcAngles {boolean} : whether to calculate angles when doing facetracking (default is false)
 *	headPosition {boolean} : whether to calculate headposition (default is true)
 *
 * @author auduno / github.com/auduno
 */

var headtrackr = {};

/**
 * @constructor
 */
headtrackr.Tracker = function(params) {
	
	if (!params) params = {};
	
	if (params.smoothing === undefined) params.smoothing = true;
	if (params.retryDetection === undefined) params.retryDetection = true;
	if (params.ui === undefined) params.ui = true;
	if (params.debug === undefined) {
		params.debug = false;
	} else {
		if (params.debug.tagName != 'CANVAS') {
			params.debug = false;
		} else {
			var debugContext = params.debug.getContext('2d');
		}
	}
	if (params.detectionInterval === undefined) params.detectionInterval = 20;
	if (params.fadeVideo === undefined) params.fadeVideo = false;
	if (params.cameraOffset === undefined) params.cameraOffset = 11.5;
	if (params.calcAngles === undefined) params.calcAngles = false;
	if (params.headPosition === undefined) params.headPosition = true;
	
	var ui, smoother, facetracker, headposition, canvasContext, videoElement, detector;
	var detectionTimer;
	var fov = 0;
	var initialized = true;
	var run = false;
	var faceFound = false;
	var firstRun = true;
	var videoFaded = false;
	var headDiagonal = [];
	
	this.status = "";
	
	var statusEvent = document.createEvent("Event");
	statusEvent.initEvent("headtrackrStatus", true, true);
	
	var headtrackerStatus = function(message) {
		statusEvent.status = message;
		document.dispatchEvent(statusEvent);
		this.status = message;
	}.bind(this);
	
	var insertAltVideo = function(video) {
		if (params.altVideo !== undefined) {
			if (supports_video()) {
				if (params.altVideo.ogv && supports_ogg_theora_video()) {
					video.src = params.altVideo.ogv;
				} else if (params.altVideo.mp4 && supports_h264_baseline_video()) {
					video.src = params.altVideo.mp4;
				} else if (params.altVideo.webm && supports_webm_video()) {
					video.src = params.altVideo.webm;
				} else {
					return false;
				}
				video.play();
				return true;
			}
		} else {
			return false;
		}
	}
	
	this.init = function(video, canvas) {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
		// check for camerasupport
		if (navigator.getUserMedia) {
			headtrackerStatus("getUserMedia");
			
			// chrome 19 shim
			var videoSelector = {video : true};
			if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
				var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
				if (chromeVersion < 20) {
					videoSelector = "video";
				}
			};
			
			// opera shim
			if (window.opera) {
				window.URL = window.URL || {};
				if (!window.URL.createObjectURL) window.URL.createObjectURL = function(obj) {return obj;};
			}
			
			// set up stream
			navigator.getUserMedia(videoSelector, function( stream ) {
				headtrackerStatus("camera found");
				video.src = window.URL.createObjectURL(stream);
				video.play();
			}, function() {
				headtrackerStatus("no camera");
				insertAltVideo(video);
			});
		} else {
			headtrackerStatus("no getUserMedia");
			if (!insertAltVideo(video)) {
				return false;
			}
		}
		
		videoElement = video;
		canvasElement = canvas;
		canvasContext = canvas.getContext("2d");
		
		// resize video when it is playing
		video.addEventListener('playing', function() {
			if(video.width > video.height) {
				video.width = 320;
			} else {
				video.height = 240;
			}
		}, false);
		
		// create ui if needed
		if (params.ui) {
			ui = new headtrackr.Ui();
		}
		
		// create smoother if enabled
		smoother = new headtrackr.Smoother(0.35, params.detectionInterval+15);
		
		this.initialized = true;
	}
	
	track = function() {
		// Copy video to canvas
		canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
		
		// if facetracking hasn't started, initialize facetrackr
		if (facetracker === undefined) {
			facetracker = new headtrackr.facetrackr.Tracker({debug : params.debug, calcAngles : params.calcAngles});
			facetracker.init(canvasElement);
		}
		
		// track face
		facetracker.track()
		var faceObj = facetracker.getTrackingObject({debug : params.debug});
		
		if (faceObj.detection == "WB") headtrackerStatus("whitebalance");
		if (firstRun && faceObj.detection == "VJ") headtrackerStatus("detecting");
		
		// check if we have a detection first
		if (!(faceObj.confidence == 0)) {
			if (faceObj.detection == "VJ") {
				if (detectionTimer === undefined) {
					// start timing
					detectionTimer = (new Date).getTime();
				}
				if (((new Date).getTime() - detectionTimer) > 5000) {
					headtrackerStatus("hints");
				}
				
				var x = (faceObj.x + faceObj.width/2); //midpoint
				var y = (faceObj.y + faceObj.height/2); //midpoint
				
				if (params.debug) {
					// draw detected face on debuggercanvas
					debugContext.strokeStyle = "#0000CC";
					debugContext.strokeRect(faceObj.x, faceObj.y, faceObj.width, faceObj.height);
				}
			}
			if (faceObj.detection == "CS") {
				var x = faceObj.x; //midpoint
				var y = faceObj.y; //midpoint
				
				if (detectionTimer !== undefined) detectionTimer = undefined;
				
				if (params.debug) {
					// draw tracked face on debuggercanvas
					debugContext.translate(faceObj.x, faceObj.y)
					debugContext.rotate(faceObj.angle-(Math.PI/2));
					debugContext.strokeStyle = "#00CC00";
					debugContext.strokeRect((-(faceObj.width/2)) >> 0, (-(faceObj.height/2)) >> 0, faceObj.width, faceObj.height);
					debugContext.rotate((Math.PI/2)-faceObj.angle);
					debugContext.translate(-faceObj.x, -faceObj.y);
				}
				
				// fade out video if it's showing
				if (!videoFaded && params.fadeVideo) {
					fadeVideo();
					videoFaded = true;
				}
				
				this.status = 'tracking';
				
				//check if we've lost tracking of face
				if (faceObj.width == 0 || faceObj.height == 0) {
					if (params.retryDetection) {
						// retry facedetection
						headtrackerStatus("redetecting");
						
						facetracker = new headtrackr.facetrackr.Tracker({whitebalancing : false, debug: params.debug, calcAngles : params.calcAngles});
						facetracker.init(canvasElement);
						faceFound = false;
						headposition = undefined;
						
						// show video again if it's not already showing
						if (videoFaded) {
							videoElement.style.opacity = 1;
							videoFaded = false;
						}
					} else {
						headtrackerStatus("lost");
						this.stop();
					}
				} else {
					if (!faceFound) {
						headtrackerStatus("found");
						faceFound = true;
					}
					
					if (params.smoothing) {
						// smooth values
						if (!smoother.initialized) {
							smoother.init(faceObj);
						}
						faceObj = smoother.smooth(faceObj);
					}
					
					// get headposition
					if (headposition === undefined && params.headPosition) {
						// wait until headdiagonal is stable before initializing headposition
						var stable = false;
						
						// calculate headdiagonal
						var headdiag = Math.sqrt(faceObj.width*faceObj.width + faceObj.height*faceObj.height);
						
						if (headDiagonal.length < 6) {
							headDiagonal.push(headdiag);
						} else {
							headDiagonal.splice(0,1);
							headDiagonal.push(headdiag);
							if ((Math.max.apply(null, headDiagonal) - Math.min.apply(null, headDiagonal)) < 5) {
								stable = true;
							}
						}
						
						if (stable) {
							if (firstRun) {
								if (params.fov === undefined) {
									headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {distance_from_camera_to_screen : params.cameraOffset});
								} else {
									headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {fov : params.fov, distance_from_camera_to_screen : params.cameraOffset});
								}
								fov = headposition.getFOV();
								firstRun = false;
							} else {
								headposition = new headtrackr.headposition.Tracker(faceObj, canvasElement.width, canvasElement.height, {fov : fov, distance_from_camera_to_screen : params.cameraOffset});
							}
							headposition.track(faceObj);
						}
					} else if (params.headPosition) {
						headposition.track(faceObj);
					}
				}
			}
		}
	 
		if (run) {
			detector = window.setTimeout(track, params.detectionInterval);
		}
	}.bind(this);
	
	var starter = function() {
		// in some cases, the video sends events before starting to draw
		// so check that we have something on video before starting to track
		
		// Copy video to canvas
		canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
		
		var canvasContent = headtrackr.getWhitebalance(canvasElement);
		if (canvasContent > 0) {
			run = true;
			track();
		} else {
			window.setTimeout(starter, 100);
		}
	}
	
	this.start = function() {
		// check if initialized
		if (!this.initialized) return false;
		
		// check if video is playing, if not, return false
		if (!(videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended)) {
			
			run = true;
			//set event
			videoElement.addEventListener('playing', starter, false);
			
			return true;
		} else {			
			starter();
		}
		
		return true;
	}
	
	this.stop = function() {
		window.clearTimeout(detector);
		run = false;
		headtrackerStatus("stopped");
		facetracker = undefined;
		faceFound = false;
		
		return true;
	}
	
	this.getFOV = function() {
		return fov;
	}
	
	// fade out videoElement
	var fadeVideo = function() {
		if (videoElement.style.opacity == "") {
			videoElement.style.opacity = 0.98;
			window.setTimeout(fadeVideo, 50);
		} else if (videoElement.style.opacity > 0.30) {
			videoElement.style.opacity -= 0.02;
			window.setTimeout(fadeVideo, 50);
		} else {
			videoElement.style.opacity = 0.3;
		}
	}
};

// bind shim
// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

if (!Function.prototype.bind) {	 
	Function.prototype.bind = function (oThis) {	
		if (typeof this !== "function") {	 
			// closest thing possible to the ECMAScript 5 internal IsCallable function	
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");	
		}	 
	
		var aArgs = Array.prototype.slice.call(arguments, 1),		
				fToBind = this,		
				fNOP = function () {},	
				fBound = function () {	
					return fToBind.apply(this instanceof fNOP	 
																 ? this	 
																 : oThis || window,	 
															 aArgs.concat(Array.prototype.slice.call(arguments)));	
				};	
	
		fNOP.prototype = this.prototype;	
		fBound.prototype = new fNOP();	
	
		return fBound;	
	};	
}	 

// video support utility functions

function supports_video() {
	return !!document.createElement('video').canPlayType;
}

function supports_h264_baseline_video() {
	if (!supports_video()) { return false; }
	var v = document.createElement("video");
	return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}

function supports_ogg_theora_video() {
	if (!supports_video()) { return false; }
	var v = document.createElement("video");
	return v.canPlayType('video/ogg; codecs="theora, vorbis"');
}

function supports_webm_video() {
	if (!supports_video()) { return false; }
	var v = document.createElement("video");
	return v.canPlayType('video/webm; codecs="vp8, vorbis"');
}
/**
 * Viola-Jones-like face detection algorithm
 * Some explanation here: http://liuliu.me/eyes/javascript-face-detection-explained/
 *
 * @author Liu Liu / github.com/liuliu
 *
 * Copyright (c) 2010, Liu Liu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * * Neither the name of the authors nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

headtrackr.ccv = {};

headtrackr.ccv.grayscale = function (canvas) {
  /* detect_objects requires gray-scale image */
  var ctx = canvas.getContext("2d");
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  var pix1, pix2, pix = canvas.width * canvas.height * 4;
  while (pix > 0)
    data[pix -= 4] = data[pix1 = pix + 1] = data[pix2 = pix + 2] = (data[pix] * 0.3 + data[pix1] * 0.59 + data[pix2] * 0.11);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

headtrackr.ccv.array_group = function (seq, gfunc) {
  var i, j;
  var node = new Array(seq.length);
  for (i = 0; i < seq.length; i++)
    node[i] = {"parent" : -1,
           "element" : seq[i],
           "rank" : 0};
  for (i = 0; i < seq.length; i++)
  {
    if (!node[i].element)
      continue;
    var root = i;
    while (node[root].parent != -1)
      root = node[root].parent;
    for (j = 0; j < seq.length; j++)
    {
      if( i != j && node[j].element && gfunc(node[i].element, node[j].element))
      {
        var root2 = j;

        while (node[root2].parent != -1)
          root2 = node[root2].parent;

        if(root2 != root)
        {
          if(node[root].rank > node[root2].rank)
            node[root2].parent = root;
          else
          {
            node[root].parent = root2;
            if (node[root].rank == node[root2].rank)
            node[root2].rank++;
            root = root2;
          }

          /* compress path from node2 to the root: */
          var temp, node2 = j;
          while (node[node2].parent != -1)
          {
            temp = node2;
            node2 = node[node2].parent;
            node[temp].parent = root;
          }

          /* compress path from node to the root: */
          node2 = i;
          while (node[node2].parent != -1)
          {
            temp = node2;
            node2 = node[node2].parent;
            node[temp].parent = root;
          }
        }
      }
    }
  }
  var idx = new Array(seq.length);
  var class_idx = 0;
  for(i = 0; i < seq.length; i++)
  {
    j = -1;
    var node1 = i;
    if(node[node1].element)
    {
      while (node[node1].parent != -1)
        node1 = node[node1].parent;
      if(node[node1].rank >= 0)
        node[node1].rank = ~class_idx++;
      j = ~node[node1].rank;
    }
    idx[i] = j;
  }
  return {"index" : idx, "cat" : class_idx};
};

headtrackr.ccv.detect_objects = function (canvas, cascade, interval, min_neighbors) {
  var scale = Math.pow(2, 1 / (interval + 1));
  var next = interval + 1;
  var scale_upto = Math.floor(Math.log(Math.min(cascade.width, cascade.height)) / Math.log(scale));
  var pyr = new Array((scale_upto + next * 2) * 4);
  pyr[0] = canvas;
  pyr[0].data = pyr[0].getContext("2d").getImageData(0, 0, pyr[0].width, pyr[0].height).data;
  var i, j, k, x, y, q;
  for (i = 1; i <= interval; i++) {
    pyr[i * 4] = document.createElement("canvas");
    pyr[i * 4].width = Math.floor(pyr[0].width / Math.pow(scale, i));
    pyr[i * 4].height = Math.floor(pyr[0].height / Math.pow(scale, i));
    pyr[i * 4].getContext("2d").drawImage(pyr[0], 0, 0, pyr[0].width, pyr[0].height, 0, 0, pyr[i * 4].width, pyr[i * 4].height);
    pyr[i * 4].data = pyr[i * 4].getContext("2d").getImageData(0, 0, pyr[i * 4].width, pyr[i * 4].height).data;
  }
  for (i = next; i < scale_upto + next * 2; i++) {
    pyr[i * 4] = document.createElement("canvas");
    pyr[i * 4].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
    pyr[i * 4].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
    pyr[i * 4].getContext("2d").drawImage(pyr[i * 4 - next * 4], 0, 0, pyr[i * 4 - next * 4].width, pyr[i * 4 - next * 4].height, 0, 0, pyr[i * 4].width, pyr[i * 4].height);
    pyr[i * 4].data = pyr[i * 4].getContext("2d").getImageData(0, 0, pyr[i * 4].width, pyr[i * 4].height).data;
  }
  for (i = next * 2; i < scale_upto + next * 2; i++) {
    pyr[i * 4 + 1] = document.createElement("canvas");
    pyr[i * 4 + 1].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
    pyr[i * 4 + 1].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
    pyr[i * 4 + 1].getContext("2d").drawImage(pyr[i * 4 - next * 4], 1, 0, pyr[i * 4 - next * 4].width - 1, pyr[i * 4 - next * 4].height, 0, 0, pyr[i * 4 + 1].width - 2, pyr[i * 4 + 1].height);
    pyr[i * 4 + 1].data = pyr[i * 4 + 1].getContext("2d").getImageData(0, 0, pyr[i * 4 + 1].width, pyr[i * 4 + 1].height).data;
    pyr[i * 4 + 2] = document.createElement("canvas");
    pyr[i * 4 + 2].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
    pyr[i * 4 + 2].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
    pyr[i * 4 + 2].getContext("2d").drawImage(pyr[i * 4 - next * 4], 0, 1, pyr[i * 4 - next * 4].width, pyr[i * 4 - next * 4].height - 1, 0, 0, pyr[i * 4 + 2].width, pyr[i * 4 + 2].height - 2);
    pyr[i * 4 + 2].data = pyr[i * 4 + 2].getContext("2d").getImageData(0, 0, pyr[i * 4 + 2].width, pyr[i * 4 + 2].height).data;
    pyr[i * 4 + 3] = document.createElement("canvas");
    pyr[i * 4 + 3].width = Math.floor(pyr[i * 4 - next * 4].width / 2);
    pyr[i * 4 + 3].height = Math.floor(pyr[i * 4 - next * 4].height / 2);
    pyr[i * 4 + 3].getContext("2d").drawImage(pyr[i * 4 - next * 4], 1, 1, pyr[i * 4 - next * 4].width - 1, pyr[i * 4 - next * 4].height - 1, 0, 0, pyr[i * 4 + 3].width - 2, pyr[i * 4 + 3].height - 2);
    pyr[i * 4 + 3].data = pyr[i * 4 + 3].getContext("2d").getImageData(0, 0, pyr[i * 4 + 3].width, pyr[i * 4 + 3].height).data;
  }
  for (j = 0; j < cascade.stage_classifier.length; j++)
    cascade.stage_classifier[j].orig_feature = cascade.stage_classifier[j].feature;
  var scale_x = 1, scale_y = 1;
  var dx = [0, 1, 0, 1];
  var dy = [0, 0, 1, 1];
  var seq = [];
  for (i = 0; i < scale_upto; i++) {
    var qw = pyr[i * 4 + next * 8].width - Math.floor(cascade.width / 4);
    var qh = pyr[i * 4 + next * 8].height - Math.floor(cascade.height / 4);
    var step = [pyr[i * 4].width * 4, pyr[i * 4 + next * 4].width * 4, pyr[i * 4 + next * 8].width * 4];
    var paddings = [pyr[i * 4].width * 16 - qw * 16,
            pyr[i * 4 + next * 4].width * 8 - qw * 8,
            pyr[i * 4 + next * 8].width * 4 - qw * 4];
    for (j = 0; j < cascade.stage_classifier.length; j++) {
      var orig_feature = cascade.stage_classifier[j].orig_feature;
      var feature = cascade.stage_classifier[j].feature = new Array(cascade.stage_classifier[j].count);
      for (k = 0; k < cascade.stage_classifier[j].count; k++) {
        feature[k] = {"size" : orig_feature[k].size,
                "px" : new Array(orig_feature[k].size),
                "pz" : new Array(orig_feature[k].size),
                "nx" : new Array(orig_feature[k].size),
                "nz" : new Array(orig_feature[k].size)};
        for (q = 0; q < orig_feature[k].size; q++) {
          feature[k].px[q] = orig_feature[k].px[q] * 4 + orig_feature[k].py[q] * step[orig_feature[k].pz[q]];
          feature[k].pz[q] = orig_feature[k].pz[q];
          feature[k].nx[q] = orig_feature[k].nx[q] * 4 + orig_feature[k].ny[q] * step[orig_feature[k].nz[q]];
          feature[k].nz[q] = orig_feature[k].nz[q];
        }
      }
    }
    for (q = 0; q < 4; q++) {
      var u8 = [pyr[i * 4].data, pyr[i * 4 + next * 4].data, pyr[i * 4 + next * 8 + q].data];
      var u8o = [dx[q] * 8 + dy[q] * pyr[i * 4].width * 8, dx[q] * 4 + dy[q] * pyr[i * 4 + next * 4].width * 4, 0];
      for (y = 0; y < qh; y++) {
        for (x = 0; x < qw; x++) {
          var sum = 0;
          var flag = true;
          for (j = 0; j < cascade.stage_classifier.length; j++) {
            sum = 0;
            var alpha = cascade.stage_classifier[j].alpha;
            var feature = cascade.stage_classifier[j].feature;
            for (k = 0; k < cascade.stage_classifier[j].count; k++) {
              var feature_k = feature[k];
              var p, pmin = u8[feature_k.pz[0]][u8o[feature_k.pz[0]] + feature_k.px[0]];
              var n, nmax = u8[feature_k.nz[0]][u8o[feature_k.nz[0]] + feature_k.nx[0]];
              if (pmin <= nmax) {
                sum += alpha[k * 2];
              } else {
                var f, shortcut = true;
                for (f = 0; f < feature_k.size; f++) {
                  if (feature_k.pz[f] >= 0) {
                    p = u8[feature_k.pz[f]][u8o[feature_k.pz[f]] + feature_k.px[f]];
                    if (p < pmin) {
                      if (p <= nmax) {
                        shortcut = false;
                        break;
                      }
                      pmin = p;
                    }
                  }
                  if (feature_k.nz[f] >= 0) {
                    n = u8[feature_k.nz[f]][u8o[feature_k.nz[f]] + feature_k.nx[f]];
                    if (n > nmax) {
                      if (pmin <= n) {
                        shortcut = false;
                        break;
                      }
                      nmax = n;
                    }
                  }
                }
                sum += (shortcut) ? alpha[k * 2 + 1] : alpha[k * 2];
              }
            }
            if (sum < cascade.stage_classifier[j].threshold) {
              flag = false;
              break;
            }
          }
          if (flag) {
            seq.push({"x" : (x * 4 + dx[q] * 2) * scale_x,
                  "y" : (y * 4 + dy[q] * 2) * scale_y,
                  "width" : cascade.width * scale_x,
                  "height" : cascade.height * scale_y,
                  "neighbor" : 1,
                  "confidence" : sum});
          }
          u8o[0] += 16;
          u8o[1] += 8;
          u8o[2] += 4;
        }
        u8o[0] += paddings[0];
        u8o[1] += paddings[1];
        u8o[2] += paddings[2];
      }
    }
    scale_x *= scale;
    scale_y *= scale;
  }
  for (j = 0; j < cascade.stage_classifier.length; j++)
    cascade.stage_classifier[j].feature = cascade.stage_classifier[j].orig_feature;
  if (!(min_neighbors > 0))
    return seq;
  else {
    var result = headtrackr.ccv.array_group(seq, function (r1, r2) {
      var distance = Math.floor(r1.width * 0.25 + 0.5);

      return r2.x <= r1.x + distance &&
           r2.x >= r1.x - distance &&
           r2.y <= r1.y + distance &&
           r2.y >= r1.y - distance &&
           r2.width <= Math.floor(r1.width * 1.5 + 0.5) &&
           Math.floor(r2.width * 1.5 + 0.5) >= r1.width;
    });
    var ncomp = result.cat;
    var idx_seq = result.index;
    var comps = new Array(ncomp + 1);
    for (i = 0; i < comps.length; i++)
      comps[i] = {"neighbors" : 0,
            "x" : 0,
            "y" : 0,
            "width" : 0,
            "height" : 0,
            "confidence" : 0};

    // count number of neighbors
    for(i = 0; i < seq.length; i++)
    {
      var r1 = seq[i];
      var idx = idx_seq[i];

      if (comps[idx].neighbors == 0)
        comps[idx].confidence = r1.confidence;

      ++comps[idx].neighbors;

      comps[idx].x += r1.x;
      comps[idx].y += r1.y;
      comps[idx].width += r1.width;
      comps[idx].height += r1.height;
      comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);
    }

    var seq2 = [];
    // calculate average bounding box
    for(i = 0; i < ncomp; i++)
    {
      var n = comps[i].neighbors;
      if (n >= min_neighbors)
        seq2.push({"x" : (comps[i].x * 2 + n) / (2 * n),
               "y" : (comps[i].y * 2 + n) / (2 * n),
               "width" : (comps[i].width * 2 + n) / (2 * n),
               "height" : (comps[i].height * 2 + n) / (2 * n),
               "neighbors" : comps[i].neighbors,
               "confidence" : comps[i].confidence});
    }

    var result_seq = [];
    // filter out small face rectangles inside large face rectangles
    for(i = 0; i < seq2.length; i++)
    {
      var r1 = seq2[i];
      var flag = true;
      for(j = 0; j < seq2.length; j++)
      {
        var r2 = seq2[j];
        var distance = Math.floor(r2.width * 0.25 + 0.5);

        if(i != j &&
           r1.x >= r2.x - distance &&
           r1.y >= r2.y - distance &&
           r1.x + r1.width <= r2.x + r2.width + distance &&
           r1.y + r1.height <= r2.y + r2.height + distance &&
           (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3))
        {
          flag = false;
          break;
        }
      }

      if(flag)
        result_seq.push(r1);
    }
    return result_seq;
  }
};

/**
 * Data for ccv facedetection
 *
 * @author Liu Liu / github.com/liuliu
 *
 * Copyright (c) 2010, Liu Liu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * * Neither the name of the authors nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

headtrackr.cascade = {"count" : 16, "width" : 24, "height" : 24, "stage_classifier" : [{"count":4,"threshold":-4.577530e+00,"feature":[{"size":4,"px":[3,5,8,11],"py":[2,2,6,3],"pz":[2,1,1,0],"nx":[8,4,0,0],"ny":[4,4,0,0],"nz":[1,1,-1,-1]},{"size":3,"px":[3,6,7],"py":[7,13,0],"pz":[1,0,-1],"nx":[2,3,4],"ny":[5,4,4],"nz":[2,1,1]},{"size":5,"px":[5,3,10,13,11],"py":[1,0,3,2,2],"pz":[1,2,0,0,0],"nx":[0,11,0,11,11],"ny":[0,2,3,1,1],"nz":[1,1,0,1,-1]},{"size":5,"px":[6,12,12,9,12],"py":[4,13,12,7,11],"pz":[1,0,0,1,0],"nx":[8,0,8,2,11],"ny":[4,0,8,5,1],"nz":[1,-1,-1,-1,-1]}],"alpha":[-2.879683e+00,2.879683e+00,-1.569341e+00,1.569341e+00,-1.286131e+00,1.286131e+00,-1.157626e+00,1.157626e+00]},{"count":4,"threshold":-4.339908e+00,"feature":[{"size":5,"px":[13,12,3,11,17],"py":[3,3,1,4,13],"pz":[0,0,2,0,0],"nx":[4,3,8,15,15],"ny":[4,5,4,8,8],"nz":[1,2,1,0,-1]},{"size":5,"px":[6,7,6,3,3],"py":[13,13,4,2,7],"pz":[0,0,1,2,1],"nx":[4,8,3,0,15],"ny":[4,4,4,3,8],"nz":[1,1,-1,-1,-1]},{"size":3,"px":[2,2,11],"py":[3,2,5],"pz":[2,2,0],"nx":[3,8,3],"ny":[4,4,4],"nz":[1,-1,-1]},{"size":5,"px":[15,13,9,11,7],"py":[2,1,2,1,0],"pz":[0,0,0,0,1],"nx":[23,11,23,22,23],"ny":[1,0,2,0,0],"nz":[0,1,0,0,0]}],"alpha":[-2.466029e+00,2.466029e+00,-1.839510e+00,1.839510e+00,-1.060559e+00,1.060559e+00,-1.094927e+00,1.094927e+00]},{"count":7,"threshold":-5.052474e+00,"feature":[{"size":5,"px":[17,13,3,11,10],"py":[13,2,1,4,3],"pz":[0,0,2,0,0],"nx":[4,8,8,3,7],"ny":[2,8,4,5,4],"nz":[2,0,1,2,1]},{"size":5,"px":[6,7,3,6,6],"py":[4,12,2,13,14],"pz":[1,0,2,0,0],"nx":[8,3,4,4,3],"ny":[4,4,2,0,2],"nz":[1,1,-1,-1,-1]},{"size":5,"px":[7,4,5,3,3],"py":[2,1,3,1,1],"pz":[0,1,0,1,-1],"nx":[1,0,1,1,0],"ny":[1,3,2,0,4],"nz":[0,0,0,0,0]},{"size":5,"px":[11,11,11,3,2],"py":[11,13,10,7,2],"pz":[0,0,0,1,2],"nx":[4,1,8,2,0],"ny":[4,1,12,0,4],"nz":[1,-1,-1,-1,-1]},{"size":3,"px":[9,13,1],"py":[7,19,4],"pz":[1,-1,-1],"nx":[4,7,4],"ny":[5,8,2],"nz":[2,1,2]},{"size":5,"px":[12,8,16,4,4],"py":[12,1,2,0,0],"pz":[0,1,0,2,-1],"nx":[11,22,11,23,23],"ny":[2,0,1,1,5],"nz":[1,0,1,0,0]},{"size":3,"px":[11,17,17],"py":[6,11,12],"pz":[0,0,0],"nx":[15,1,11],"ny":[9,1,1],"nz":[0,-1,-1]}],"alpha":[-2.156890e+00,2.156890e+00,-1.718246e+00,1.718246e+00,-9.651329e-01,9.651329e-01,-9.948090e-01,9.948090e-01,-8.802466e-01,8.802466e-01,-8.486741e-01,8.486741e-01,-8.141777e-01,8.141777e-01]},{"count":13,"threshold":-5.774400e+00,"feature":[{"size":5,"px":[6,10,3,12,14],"py":[5,3,1,2,2],"pz":[1,0,2,0,0],"nx":[3,4,14,8,4],"ny":[5,4,8,4,2],"nz":[2,1,0,1,2]},{"size":5,"px":[10,6,11,5,12],"py":[4,13,4,2,4],"pz":[0,0,0,1,0],"nx":[1,4,8,1,1],"ny":[2,4,4,4,3],"nz":[0,1,1,0,0]},{"size":3,"px":[18,6,12],"py":[12,4,8],"pz":[0,1,0],"nx":[7,4,8],"ny":[4,2,4],"nz":[1,-1,-1]},{"size":5,"px":[7,5,6,3,17],"py":[13,12,3,8,13],"pz":[0,0,1,1,0],"nx":[3,3,0,1,8],"ny":[4,5,5,10,4],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[16,7,16,7,7],"py":[1,1,2,0,0],"pz":[0,1,0,1,-1],"nx":[23,23,23,11,5],"ny":[2,14,1,2,1],"nz":[0,0,0,1,2]},{"size":3,"px":[9,18,16],"py":[7,14,2],"pz":[1,0,-1],"nx":[8,4,9],"ny":[10,2,4],"nz":[1,2,1]},{"size":4,"px":[3,16,1,22],"py":[7,4,5,11],"pz":[1,-1,-1,-1],"nx":[3,9,4,2],"ny":[4,9,7,5],"nz":[1,0,1,2]},{"size":5,"px":[4,7,8,8,9],"py":[0,2,2,1,1],"pz":[1,0,0,0,0],"nx":[0,0,1,0,0],"ny":[15,16,19,0,14],"nz":[0,0,0,1,0]},{"size":5,"px":[4,4,7,8,12],"py":[2,5,6,7,10],"pz":[2,2,1,1,0],"nx":[8,5,10,0,0],"ny":[4,2,5,3,14],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[11,0],"py":[13,4],"pz":[0,-1],"nx":[3,14],"ny":[4,16],"nz":[1,0]},{"size":5,"px":[17,8,18,4,4],"py":[3,1,3,0,0],"pz":[0,1,0,2,-1],"nx":[21,22,5,11,22],"ny":[0,1,0,1,2],"nz":[0,0,2,1,0]},{"size":4,"px":[7,8,2,11],"py":[13,12,2,7],"pz":[0,0,2,0],"nx":[4,0,23,3],"ny":[4,1,1,11],"nz":[1,-1,-1,-1]},{"size":5,"px":[4,18,8,9,15],"py":[4,16,7,7,23],"pz":[2,0,1,1,0],"nx":[0,1,1,1,1],"ny":[10,21,23,22,22],"nz":[1,0,0,0,-1]}],"alpha":[-1.956565e+00,1.956565e+00,-1.262438e+00,1.262438e+00,-1.056941e+00,1.056941e+00,-9.712509e-01,9.712509e-01,-8.261028e-01,8.261028e-01,-8.456506e-01,8.456506e-01,-6.652113e-01,6.652113e-01,-6.026287e-01,6.026287e-01,-6.915425e-01,6.915425e-01,-5.539286e-01,5.539286e-01,-5.515072e-01,5.515072e-01,-6.685884e-01,6.685884e-01,-4.656070e-01,4.656070e-01]},{"count":20,"threshold":-5.606853e+00,"feature":[{"size":5,"px":[17,11,6,14,9],"py":[13,4,4,3,3],"pz":[0,0,1,0,0],"nx":[14,4,8,7,8],"ny":[8,4,4,4,8],"nz":[0,1,1,1,0]},{"size":5,"px":[3,9,10,11,11],"py":[7,2,2,3,3],"pz":[1,0,0,0,-1],"nx":[3,8,4,2,5],"ny":[4,4,10,2,8],"nz":[1,1,1,2,1]},{"size":5,"px":[12,12,12,5,12],"py":[12,9,10,12,11],"pz":[0,0,0,0,0],"nx":[0,0,0,0,0],"ny":[2,1,3,0,0],"nz":[0,0,0,0,-1]},{"size":5,"px":[9,18,9,9,12],"py":[7,14,19,5,11],"pz":[1,-1,-1,-1,-1],"nx":[23,4,23,23,8],"ny":[13,5,14,16,4],"nz":[0,2,0,0,1]},{"size":5,"px":[12,12,12,6,1],"py":[13,11,12,6,5],"pz":[0,0,0,-1,-1],"nx":[4,6,8,4,9],"ny":[2,8,4,4,4],"nz":[2,1,1,1,1]},{"size":4,"px":[12,11,11,6],"py":[5,5,6,13],"pz":[0,0,0,0],"nx":[8,3,2,8],"ny":[4,4,17,2],"nz":[1,1,-1,-1]},{"size":5,"px":[3,14,12,15,13],"py":[0,2,2,2,2],"pz":[2,0,0,0,0],"nx":[22,23,22,23,7],"ny":[0,3,1,2,4],"nz":[0,0,0,0,1]},{"size":5,"px":[16,15,18,19,9],"py":[12,11,12,12,9],"pz":[0,0,0,0,1],"nx":[8,2,22,23,21],"ny":[4,1,1,2,20],"nz":[1,-1,-1,-1,-1]},{"size":3,"px":[4,7,7],"py":[0,2,2],"pz":[1,0,-1],"nx":[1,2,2],"ny":[2,0,2],"nz":[1,0,0]},{"size":3,"px":[4,11,11],"py":[6,9,8],"pz":[1,0,0],"nx":[9,2,8],"ny":[9,4,5],"nz":[0,-1,-1]},{"size":4,"px":[2,7,6,6],"py":[4,23,21,22],"pz":[2,0,0,0],"nx":[9,3,8,17],"ny":[21,2,5,1],"nz":[0,-1,-1,-1]},{"size":2,"px":[2,8],"py":[4,12],"pz":[2,0],"nx":[3,0],"ny":[4,4],"nz":[1,-1]},{"size":5,"px":[4,5,1,8,4],"py":[15,12,3,23,12],"pz":[0,0,2,0,0],"nx":[0,0,0,0,0],"ny":[23,10,22,21,11],"nz":[0,1,0,0,-1]},{"size":2,"px":[21,5],"py":[13,4],"pz":[0,2],"nx":[23,4],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[15,17],"py":[2,3],"pz":[0,0],"nx":[19,20],"ny":[2,1],"nz":[0,0]},{"size":5,"px":[12,1,8,17,4],"py":[14,2,13,6,12],"pz":[0,-1,-1,-1,-1],"nx":[8,13,15,15,7],"ny":[10,9,15,14,8],"nz":[1,0,0,0,1]},{"size":2,"px":[8,5],"py":[7,4],"pz":[1,-1],"nx":[4,13],"ny":[2,21],"nz":[2,0]},{"size":2,"px":[3,4],"py":[7,0],"pz":[1,-1],"nx":[4,2],"ny":[7,5],"nz":[1,2]},{"size":4,"px":[4,14,3,11],"py":[3,23,2,5],"pz":[2,0,2,0],"nx":[7,8,2,16],"ny":[8,0,1,15],"nz":[0,-1,-1,-1]},{"size":2,"px":[9,8],"py":[0,0],"pz":[0,0],"nx":[2,2],"ny":[3,5],"nz":[2,2]}],"alpha":[-1.957970e+00,1.957970e+00,-1.225984e+00,1.225984e+00,-8.310246e-01,8.310246e-01,-8.315741e-01,8.315741e-01,-7.973616e-01,7.973616e-01,-7.661959e-01,7.661959e-01,-6.042118e-01,6.042118e-01,-6.506833e-01,6.506833e-01,-4.808219e-01,4.808219e-01,-6.079504e-01,6.079504e-01,-5.163994e-01,5.163994e-01,-5.268142e-01,5.268142e-01,-4.935685e-01,4.935685e-01,-4.427544e-01,4.427544e-01,-4.053949e-01,4.053949e-01,-4.701274e-01,4.701274e-01,-4.387648e-01,4.387648e-01,-4.305499e-01,4.305499e-01,-4.042607e-01,4.042607e-01,-4.372088e-01,4.372088e-01]},{"count":22,"threshold":-5.679317e+00,"feature":[{"size":5,"px":[11,3,17,14,13],"py":[4,0,13,2,3],"pz":[0,2,0,0,0],"nx":[7,4,14,23,11],"ny":[8,4,8,4,0],"nz":[1,1,0,0,1]},{"size":5,"px":[7,12,6,12,12],"py":[12,8,3,10,9],"pz":[0,0,1,0,0],"nx":[4,9,8,15,15],"ny":[4,8,4,8,8],"nz":[1,0,1,0,-1]},{"size":3,"px":[4,2,10],"py":[1,4,1],"pz":[1,2,0],"nx":[2,3,8],"ny":[5,4,4],"nz":[2,1,-1]},{"size":5,"px":[3,17,6,6,16],"py":[2,12,4,14,12],"pz":[2,0,1,0,0],"nx":[8,3,7,5,15],"ny":[4,4,4,4,8],"nz":[1,1,-1,-1,-1]},{"size":5,"px":[5,6,7,4,8],"py":[3,3,3,1,3],"pz":[0,0,0,1,0],"nx":[0,0,0,0,1],"ny":[5,4,3,2,0],"nz":[0,0,0,0,0]},{"size":3,"px":[18,9,0],"py":[14,7,0],"pz":[0,1,-1],"nx":[8,14,8],"ny":[10,9,4],"nz":[1,0,1]},{"size":2,"px":[9,5],"py":[18,13],"pz":[0,0],"nx":[10,3],"ny":[16,4],"nz":[0,-1]},{"size":5,"px":[11,11,11,11,6],"py":[10,12,11,13,6],"pz":[0,0,0,0,-1],"nx":[5,21,22,22,22],"ny":[4,22,17,19,18],"nz":[2,0,0,0,0]},{"size":4,"px":[8,9,15,4],"py":[7,7,23,4],"pz":[1,1,0,2],"nx":[8,5,0,3],"ny":[4,18,4,9],"nz":[1,-1,-1,-1]},{"size":5,"px":[11,10,12,11,11],"py":[4,4,4,5,5],"pz":[0,0,0,0,-1],"nx":[4,6,8,2,8],"ny":[4,9,9,2,4],"nz":[1,1,0,2,1]},{"size":5,"px":[2,2,3,3,4],"py":[10,9,14,13,15],"pz":[1,1,0,0,0],"nx":[0,0,0,0,0],"ny":[5,9,10,19,18],"nz":[2,1,1,0,-1]},{"size":2,"px":[11,11],"py":[13,12],"pz":[0,0],"nx":[9,2],"ny":[15,2],"nz":[0,-1]},{"size":5,"px":[2,4,3,3,4],"py":[5,11,6,9,12],"pz":[1,0,1,0,0],"nx":[6,2,11,11,0],"ny":[9,1,5,20,18],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[18,9,17,19,16],"py":[2,0,2,2,1],"pz":[0,1,0,0,0],"nx":[22,23,11,23,23],"ny":[0,2,0,1,1],"nz":[0,0,1,0,-1]},{"size":5,"px":[5,5,6,7,6],"py":[17,16,15,23,22],"pz":[0,0,0,0,0],"nx":[7,6,2,5,23],"ny":[8,1,2,3,1],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[12,12,11,10,6],"py":[14,13,18,4,22],"pz":[0,-1,-1,-1,-1],"nx":[3,2,4,1,2],"ny":[19,4,23,13,16],"nz":[0,0,0,0,0]},{"size":4,"px":[11,16,11,17],"py":[7,11,8,12],"pz":[0,0,0,0],"nx":[7,14,10,4],"ny":[4,7,10,4],"nz":[1,0,-1,-1]},{"size":2,"px":[3,3],"py":[8,7],"pz":[1,1],"nx":[4,2],"ny":[10,2],"nz":[1,-1]},{"size":2,"px":[3,9],"py":[0,1],"pz":[1,0],"nx":[4,5],"ny":[1,0],"nz":[0,0]},{"size":2,"px":[14,16],"py":[3,3],"pz":[0,0],"nx":[9,14],"ny":[4,21],"nz":[1,0]},{"size":2,"px":[9,1],"py":[7,1],"pz":[1,-1],"nx":[8,9],"ny":[7,4],"nz":[1,1]},{"size":2,"px":[1,0],"py":[8,3],"pz":[0,2],"nx":[20,0],"ny":[3,3],"nz":[0,-1]}],"alpha":[-1.581077e+00,1.581077e+00,-1.389689e+00,1.389689e+00,-8.733094e-01,8.733094e-01,-8.525177e-01,8.525177e-01,-7.416304e-01,7.416304e-01,-6.609002e-01,6.609002e-01,-7.119043e-01,7.119043e-01,-6.204438e-01,6.204438e-01,-6.638519e-01,6.638519e-01,-5.518876e-01,5.518876e-01,-4.898991e-01,4.898991e-01,-5.508243e-01,5.508243e-01,-4.635525e-01,4.635525e-01,-5.163159e-01,5.163159e-01,-4.495338e-01,4.495338e-01,-4.515036e-01,4.515036e-01,-5.130473e-01,5.130473e-01,-4.694233e-01,4.694233e-01,-4.022514e-01,4.022514e-01,-4.055690e-01,4.055690e-01,-4.151817e-01,4.151817e-01,-3.352302e-01,3.352302e-01]},{"count":32,"threshold":-5.363782e+00,"feature":[{"size":5,"px":[12,9,6,8,14],"py":[4,2,13,3,3],"pz":[0,0,0,0,0],"nx":[0,15,0,9,5],"ny":[2,7,3,8,8],"nz":[0,0,0,0,1]},{"size":5,"px":[13,16,3,6,11],"py":[3,13,1,4,3],"pz":[0,0,2,1,0],"nx":[7,4,8,14,14],"ny":[4,4,4,8,8],"nz":[1,1,1,0,-1]},{"size":5,"px":[10,19,18,19,19],"py":[6,13,13,12,12],"pz":[1,0,0,0,-1],"nx":[23,5,23,23,11],"ny":[12,2,13,14,8],"nz":[0,2,0,0,1]},{"size":5,"px":[12,12,12,12,6],"py":[11,13,12,10,6],"pz":[0,0,0,0,1],"nx":[6,8,3,9,9],"ny":[8,4,4,4,4],"nz":[1,1,1,1,-1]},{"size":5,"px":[5,3,5,8,11],"py":[12,8,3,11,8],"pz":[0,1,1,0,0],"nx":[4,0,1,1,9],"ny":[4,3,4,3,4],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[13,3,12,14,12],"py":[1,0,1,2,3],"pz":[0,2,0,0,0],"nx":[7,9,8,4,4],"ny":[5,4,10,2,2],"nz":[1,1,1,2,-1]},{"size":5,"px":[18,16,12,15,8],"py":[12,23,7,11,8],"pz":[0,0,0,0,1],"nx":[8,6,10,12,4],"ny":[4,4,10,6,3],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[4,4,5,2,2],"py":[13,14,14,7,7],"pz":[0,0,0,1,-1],"nx":[0,0,0,0,1],"ny":[15,4,14,13,17],"nz":[0,2,0,0,0]},{"size":2,"px":[9,9],"py":[7,7],"pz":[1,-1],"nx":[4,7],"ny":[5,8],"nz":[2,1]},{"size":5,"px":[3,4,6,5,4],"py":[2,2,14,6,9],"pz":[1,1,0,1,1],"nx":[23,23,23,23,11],"ny":[0,3,2,1,0],"nz":[0,0,0,0,-1]},{"size":3,"px":[10,2,3],"py":[23,4,7],"pz":[0,2,1],"nx":[10,21,23],"ny":[21,9,2],"nz":[0,-1,-1]},{"size":5,"px":[20,21,21,10,12],"py":[13,12,8,8,12],"pz":[0,0,0,1,0],"nx":[8,16,3,3,11],"ny":[4,8,4,3,0],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[2,21],"py":[4,12],"pz":[2,-1],"nx":[2,3],"ny":[5,4],"nz":[2,1]},{"size":5,"px":[8,5,6,8,7],"py":[0,2,1,1,1],"pz":[0,0,0,0,0],"nx":[3,2,2,2,2],"ny":[0,0,1,2,2],"nz":[0,0,0,0,-1]},{"size":5,"px":[11,2,2,11,10],"py":[10,12,8,11,12],"pz":[0,0,0,0,0],"nx":[3,5,2,4,2],"ny":[4,1,4,2,2],"nz":[1,-1,-1,-1,-1]},{"size":4,"px":[15,16,8,17],"py":[2,1,0,2],"pz":[0,0,1,0],"nx":[19,20,0,8],"ny":[1,2,11,10],"nz":[0,0,-1,-1]},{"size":2,"px":[17,16],"py":[12,12],"pz":[0,0],"nx":[8,9],"ny":[5,1],"nz":[1,-1]},{"size":4,"px":[11,11,0,0],"py":[12,13,0,0],"pz":[0,0,-1,-1],"nx":[10,10,9,10],"ny":[10,12,13,11],"nz":[0,0,0,0]},{"size":3,"px":[11,10,8],"py":[5,2,6],"pz":[0,-1,-1],"nx":[8,12,4],"ny":[4,17,4],"nz":[1,0,1]},{"size":5,"px":[10,21,10,20,20],"py":[11,13,7,13,14],"pz":[1,0,1,0,0],"nx":[23,23,11,23,17],"ny":[23,22,11,21,21],"nz":[0,0,1,-1,-1]},{"size":2,"px":[4,7],"py":[3,9],"pz":[2,1],"nx":[9,23],"ny":[4,22],"nz":[1,-1]},{"size":4,"px":[3,2,2,5],"py":[11,5,4,20],"pz":[1,2,2,0],"nx":[4,23,11,23],"ny":[10,22,11,21],"nz":[1,-1,-1,-1]},{"size":2,"px":[7,5],"py":[13,4],"pz":[0,-1],"nx":[4,4],"ny":[8,6],"nz":[1,1]},{"size":2,"px":[2,5],"py":[4,9],"pz":[2,1],"nx":[10,10],"ny":[16,16],"nz":[0,-1]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,0],"ny":[4,0],"nz":[1,-1]},{"size":5,"px":[7,3,12,13,6],"py":[11,5,23,23,7],"pz":[1,2,0,0,1],"nx":[1,0,0,0,0],"ny":[23,20,19,21,21],"nz":[0,0,0,0,-1]},{"size":5,"px":[0,0,0,0,0],"py":[10,9,6,13,13],"pz":[0,0,1,0,-1],"nx":[8,8,4,4,9],"ny":[4,11,5,4,5],"nz":[1,1,2,2,1]},{"size":2,"px":[9,18],"py":[8,15],"pz":[1,0],"nx":[15,4],"ny":[15,2],"nz":[0,-1]},{"size":2,"px":[5,13],"py":[6,17],"pz":[1,-1],"nx":[1,2],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[19,10,20,18,18],"py":[2,0,2,2,2],"pz":[0,1,0,0,-1],"nx":[22,23,22,11,23],"ny":[1,3,0,1,2],"nz":[0,0,0,1,0]},{"size":5,"px":[4,2,2,2,6],"py":[7,2,5,4,14],"pz":[1,2,2,2,0],"nx":[16,7,9,15,23],"ny":[8,0,3,11,2],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[10,10,9,9,5],"py":[2,0,0,1,0],"pz":[0,0,0,0,1],"nx":[3,2,3,2,2],"ny":[11,3,9,5,5],"nz":[1,2,1,2,-1]}],"alpha":[-1.490426e+00,1.490426e+00,-1.214280e+00,1.214280e+00,-8.124863e-01,8.124863e-01,-7.307594e-01,7.307594e-01,-7.377259e-01,7.377259e-01,-5.982859e-01,5.982859e-01,-6.451736e-01,6.451736e-01,-6.117417e-01,6.117417e-01,-5.438949e-01,5.438949e-01,-4.563701e-01,4.563701e-01,-4.975362e-01,4.975362e-01,-4.707373e-01,4.707373e-01,-5.013868e-01,5.013868e-01,-5.139018e-01,5.139018e-01,-4.728007e-01,4.728007e-01,-4.839748e-01,4.839748e-01,-4.852528e-01,4.852528e-01,-5.768956e-01,5.768956e-01,-3.635091e-01,3.635091e-01,-4.190090e-01,4.190090e-01,-3.854715e-01,3.854715e-01,-3.409591e-01,3.409591e-01,-3.440222e-01,3.440222e-01,-3.375895e-01,3.375895e-01,-3.367032e-01,3.367032e-01,-3.708106e-01,3.708106e-01,-3.260956e-01,3.260956e-01,-3.657681e-01,3.657681e-01,-3.518800e-01,3.518800e-01,-3.845758e-01,3.845758e-01,-2.832236e-01,2.832236e-01,-2.865156e-01,2.865156e-01]},{"count":45,"threshold":-5.479836e+00,"feature":[{"size":5,"px":[15,6,17,6,9],"py":[2,13,13,4,3],"pz":[0,0,0,1,0],"nx":[3,9,4,8,14],"ny":[5,8,4,4,8],"nz":[2,0,1,1,0]},{"size":5,"px":[9,8,11,6,7],"py":[1,2,3,14,2],"pz":[0,0,0,0,0],"nx":[0,0,4,0,0],"ny":[4,2,4,1,0],"nz":[0,0,1,0,0]},{"size":5,"px":[2,2,11,11,11],"py":[2,4,10,8,6],"pz":[2,2,0,0,0],"nx":[8,4,3,23,23],"ny":[4,4,4,16,18],"nz":[1,1,-1,-1,-1]},{"size":5,"px":[18,16,17,15,9],"py":[2,2,2,2,1],"pz":[0,0,0,0,1],"nx":[22,22,21,23,23],"ny":[1,2,0,5,4],"nz":[0,0,0,0,0]},{"size":5,"px":[15,3,17,18,6],"py":[11,2,11,11,4],"pz":[0,2,0,0,1],"nx":[3,8,1,4,23],"ny":[4,4,3,9,4],"nz":[1,1,-1,-1,-1]},{"size":2,"px":[4,5],"py":[4,0],"pz":[2,-1],"nx":[7,4],"ny":[8,5],"nz":[1,2]},{"size":2,"px":[11,5],"py":[12,5],"pz":[0,-1],"nx":[4,9],"ny":[10,15],"nz":[1,0]},{"size":4,"px":[2,2,7,1],"py":[7,7,3,4],"pz":[1,-1,-1,-1],"nx":[0,2,1,2],"ny":[6,20,14,16],"nz":[1,0,0,0]},{"size":5,"px":[14,12,12,13,9],"py":[23,5,6,5,7],"pz":[0,0,0,0,1],"nx":[8,18,2,8,14],"ny":[4,9,0,12,7],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[3,10,13,11,9],"py":[0,3,2,3,2],"pz":[2,0,0,0,0],"nx":[3,11,22,22,22],"ny":[2,6,15,2,0],"nz":[2,1,0,0,0]},{"size":5,"px":[8,7,5,8,5],"py":[23,12,12,12,13],"pz":[0,0,0,0,0],"nx":[3,18,3,1,22],"ny":[4,4,4,2,0],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[22,22,22,21,22],"py":[9,11,10,14,12],"pz":[0,0,0,0,0],"nx":[23,23,11,1,22],"ny":[23,23,11,2,0],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[9,3],"py":[18,7],"pz":[0,1],"nx":[10,8],"ny":[16,19],"nz":[0,-1]},{"size":5,"px":[10,12,11,6,6],"py":[4,4,4,2,2],"pz":[0,0,0,1,-1],"nx":[3,8,7,8,4],"ny":[5,4,4,10,4],"nz":[2,1,1,0,1]},{"size":4,"px":[12,12,4,15],"py":[13,12,0,11],"pz":[0,0,-1,-1],"nx":[13,14,13,14],"ny":[9,12,10,13],"nz":[0,0,0,0]},{"size":2,"px":[4,4],"py":[3,3],"pz":[2,-1],"nx":[9,4],"ny":[4,2],"nz":[1,2]},{"size":3,"px":[9,7,0],"py":[7,5,5],"pz":[1,-1,-1],"nx":[4,15,9],"ny":[5,14,9],"nz":[2,0,1]},{"size":5,"px":[15,20,7,10,16],"py":[17,12,6,4,23],"pz":[0,0,1,1,0],"nx":[1,2,2,1,1],"ny":[3,0,1,2,2],"nz":[0,0,0,0,-1]},{"size":5,"px":[2,1,1,11,2],"py":[16,4,5,12,14],"pz":[0,1,1,0,0],"nx":[4,6,3,19,1],"ny":[4,2,5,19,2],"nz":[1,-1,-1,-1,-1]},{"size":3,"px":[15,14,14],"py":[1,1,0],"pz":[0,0,0],"nx":[4,8,4],"ny":[3,4,2],"nz":[2,1,2]},{"size":5,"px":[2,3,1,2,7],"py":[8,12,4,9,13],"pz":[1,0,2,1,0],"nx":[1,1,0,0,0],"ny":[21,20,18,17,9],"nz":[0,0,0,0,1]},{"size":5,"px":[17,15,17,16,16],"py":[12,12,22,23,12],"pz":[0,0,0,0,0],"nx":[7,3,16,1,0],"ny":[8,6,8,3,9],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[9,17,18,18,18],"py":[6,12,12,13,13],"pz":[1,0,0,0,-1],"nx":[23,23,20,11,11],"ny":[12,13,23,7,8],"nz":[0,0,0,1,1]},{"size":2,"px":[2,4],"py":[4,7],"pz":[2,1],"nx":[4,4],"ny":[10,5],"nz":[1,-1]},{"size":4,"px":[4,22,19,12],"py":[5,8,14,9],"pz":[2,0,0,0],"nx":[8,4,4,2],"ny":[4,4,1,2],"nz":[1,-1,-1,-1]},{"size":2,"px":[3,21],"py":[7,14],"pz":[1,-1],"nx":[4,2],"ny":[7,2],"nz":[1,2]},{"size":3,"px":[7,4,17],"py":[3,1,6],"pz":[0,1,-1],"nx":[3,4,5],"ny":[0,2,1],"nz":[1,0,0]},{"size":4,"px":[15,7,14,0],"py":[3,1,3,7],"pz":[0,1,0,-1],"nx":[8,18,17,18],"ny":[0,1,1,2],"nz":[1,0,0,0]},{"size":5,"px":[12,12,12,12,6],"py":[10,11,12,13,6],"pz":[0,0,0,0,-1],"nx":[8,15,15,4,8],"ny":[10,10,9,2,4],"nz":[0,0,0,2,1]},{"size":2,"px":[17,12],"py":[13,11],"pz":[0,-1],"nx":[9,8],"ny":[4,10],"nz":[1,1]},{"size":5,"px":[0,0,0,0,0],"py":[10,9,12,11,4],"pz":[0,0,0,0,1],"nx":[8,9,8,9,9],"ny":[10,4,4,5,5],"nz":[1,1,1,1,-1]},{"size":3,"px":[7,0,1],"py":[1,9,8],"pz":[0,-1,-1],"nx":[4,3,3],"ny":[7,15,16],"nz":[0,0,0]},{"size":2,"px":[4,7],"py":[15,23],"pz":[0,0],"nx":[9,18],"ny":[21,3],"nz":[0,-1]},{"size":5,"px":[17,4,19,18,8],"py":[12,3,12,17,6],"pz":[0,2,0,0,1],"nx":[23,23,11,22,16],"ny":[0,1,0,21,-1],"nz":[0,0,-1,-1,-1]},{"size":2,"px":[7,4],"py":[13,5],"pz":[0,-1],"nx":[4,2],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[21,20,10,10,21],"py":[13,14,10,7,11],"pz":[0,0,1,1,0],"nx":[4,4,4,5,5],"ny":[18,17,19,20,20],"nz":[0,0,0,0,-1]},{"size":2,"px":[2,3],"py":[11,13],"pz":[1,0],"nx":[12,4],"ny":[17,17],"nz":[0,-1]},{"size":2,"px":[11,5],"py":[13,1],"pz":[0,-1],"nx":[1,2],"ny":[1,4],"nz":[2,1]},{"size":2,"px":[15,7],"py":[17,7],"pz":[0,1],"nx":[14,4],"ny":[15,3],"nz":[0,-1]},{"size":2,"px":[3,11],"py":[3,8],"pz":[2,0],"nx":[13,13],"ny":[9,8],"nz":[0,0]},{"size":2,"px":[8,3],"py":[11,2],"pz":[0,-1],"nx":[8,4],"ny":[9,5],"nz":[0,1]},{"size":3,"px":[12,6,9],"py":[9,10,11],"pz":[0,-1,-1],"nx":[2,1,5],"ny":[2,1,6],"nz":[2,2,1]},{"size":4,"px":[4,5,5,1],"py":[11,11,11,3],"pz":[1,0,1,2],"nx":[0,0,5,4],"ny":[23,22,0,0],"nz":[0,0,-1,-1]},{"size":5,"px":[15,7,17,15,16],"py":[1,0,2,2,0],"pz":[0,1,0,0,0],"nx":[7,4,7,4,8],"ny":[5,2,4,3,4],"nz":[1,2,1,2,-1]},{"size":2,"px":[6,12],"py":[11,23],"pz":[1,0],"nx":[12,4],"ny":[21,2],"nz":[0,-1]}],"alpha":[-1.535800e+00,1.535800e+00,-8.580514e-01,8.580514e-01,-8.625210e-01,8.625210e-01,-7.177500e-01,7.177500e-01,-6.832222e-01,6.832222e-01,-5.736298e-01,5.736298e-01,-5.028217e-01,5.028217e-01,-5.091788e-01,5.091788e-01,-5.791940e-01,5.791940e-01,-4.924942e-01,4.924942e-01,-5.489055e-01,5.489055e-01,-4.528190e-01,4.528190e-01,-4.748324e-01,4.748324e-01,-4.150403e-01,4.150403e-01,-4.820464e-01,4.820464e-01,-4.840212e-01,4.840212e-01,-3.941872e-01,3.941872e-01,-3.663507e-01,3.663507e-01,-3.814835e-01,3.814835e-01,-3.936426e-01,3.936426e-01,-3.049970e-01,3.049970e-01,-3.604256e-01,3.604256e-01,-3.974041e-01,3.974041e-01,-4.203486e-01,4.203486e-01,-3.174435e-01,3.174435e-01,-3.426336e-01,3.426336e-01,-4.492150e-01,4.492150e-01,-3.538784e-01,3.538784e-01,-3.679703e-01,3.679703e-01,-3.985452e-01,3.985452e-01,-2.884028e-01,2.884028e-01,-2.797264e-01,2.797264e-01,-2.664214e-01,2.664214e-01,-2.484857e-01,2.484857e-01,-2.581492e-01,2.581492e-01,-2.943778e-01,2.943778e-01,-2.315507e-01,2.315507e-01,-2.979337e-01,2.979337e-01,-2.976173e-01,2.976173e-01,-2.847965e-01,2.847965e-01,-2.814763e-01,2.814763e-01,-2.489068e-01,2.489068e-01,-2.632427e-01,2.632427e-01,-3.308292e-01,3.308292e-01,-2.790170e-01,2.790170e-01]},{"count":61,"threshold":-5.239104e+00,"feature":[{"size":5,"px":[8,8,11,15,6],"py":[3,6,5,3,4],"pz":[0,1,0,0,1],"nx":[3,9,14,8,4],"ny":[4,8,8,7,2],"nz":[1,0,0,0,2]},{"size":5,"px":[11,12,10,6,9],"py":[3,3,2,13,2],"pz":[0,0,0,0,0],"nx":[0,0,5,2,2],"ny":[13,1,8,5,2],"nz":[0,1,1,2,2]},{"size":5,"px":[11,5,11,11,4],"py":[9,13,10,11,6],"pz":[0,0,0,0,1],"nx":[4,15,9,3,3],"ny":[5,8,9,4,4],"nz":[1,0,0,1,-1]},{"size":5,"px":[15,16,8,17,17],"py":[1,2,0,2,2],"pz":[0,0,1,0,-1],"nx":[23,23,23,23,23],"ny":[4,0,2,3,1],"nz":[0,0,0,0,0]},{"size":4,"px":[9,18,17,18],"py":[7,13,13,14],"pz":[1,0,0,0],"nx":[9,7,4,8],"ny":[4,10,2,4],"nz":[1,1,2,1]},{"size":5,"px":[12,11,12,12,6],"py":[6,5,14,5,3],"pz":[0,0,0,0,1],"nx":[13,8,14,7,7],"ny":[16,4,7,4,4],"nz":[0,1,0,1,-1]},{"size":5,"px":[12,6,3,7,12],"py":[7,12,7,11,8],"pz":[0,0,1,0,0],"nx":[16,4,4,4,7],"ny":[8,4,4,4,4],"nz":[0,1,-1,-1,-1]},{"size":5,"px":[6,4,5,3,3],"py":[2,3,2,0,0],"pz":[0,0,0,1,-1],"nx":[1,0,1,0,0],"ny":[0,3,1,1,2],"nz":[0,0,0,1,0]},{"size":2,"px":[15,9],"py":[11,6],"pz":[0,1],"nx":[14,5],"ny":[9,11],"nz":[0,-1]},{"size":5,"px":[10,19,19,10,20],"py":[7,20,14,6,12],"pz":[1,0,0,1,0],"nx":[23,22,11,23,23],"ny":[21,23,9,20,20],"nz":[0,0,1,0,-1]},{"size":5,"px":[1,1,5,1,1],"py":[8,6,6,9,4],"pz":[0,1,1,0,2],"nx":[3,3,3,2,5],"ny":[4,4,2,5,4],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[13,12,3,11,11],"py":[2,2,0,1,2],"pz":[0,0,2,0,0],"nx":[3,6,8,4,3],"ny":[2,9,4,4,5],"nz":[2,1,1,1,-1]},{"size":3,"px":[12,12,6],"py":[11,12,9],"pz":[0,0,-1],"nx":[2,1,9],"ny":[6,1,14],"nz":[0,2,0]},{"size":5,"px":[6,3,17,16,16],"py":[4,2,14,23,13],"pz":[1,2,0,0,0],"nx":[8,10,21,5,1],"ny":[4,10,11,0,0],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[5,6,1,3,3],"py":[15,14,4,7,7],"pz":[0,0,2,1,-1],"nx":[1,0,0,1,1],"ny":[5,8,7,18,17],"nz":[2,1,1,0,0]},{"size":4,"px":[6,12,5,3],"py":[6,12,2,7],"pz":[1,-1,-1,-1],"nx":[14,13,13,7],"ny":[12,10,9,8],"nz":[0,0,0,1]},{"size":2,"px":[3,6],"py":[7,15],"pz":[1,0],"nx":[3,3],"ny":[4,2],"nz":[1,-1]},{"size":4,"px":[11,10,12,2],"py":[18,18,18,3],"pz":[0,0,0,2],"nx":[11,17,4,16],"ny":[16,4,4,21],"nz":[0,-1,-1,-1]},{"size":5,"px":[9,8,8,5,2],"py":[4,4,4,2,3],"pz":[0,0,-1,-1,-1],"nx":[2,2,4,4,2],"ny":[1,2,10,5,4],"nz":[2,2,1,1,2]},{"size":4,"px":[8,18,14,18],"py":[7,16,23,15],"pz":[1,0,0,0],"nx":[14,3,1,0],"ny":[21,1,9,3],"nz":[0,-1,-1,-1]},{"size":2,"px":[12,3],"py":[9,5],"pz":[0,2],"nx":[8,1],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[9,9],"py":[1,1],"pz":[1,-1],"nx":[19,20],"ny":[1,2],"nz":[0,0]},{"size":3,"px":[10,10,10],"py":[6,6,8],"pz":[1,-1,-1],"nx":[22,21,22],"ny":[13,18,12],"nz":[0,0,0]},{"size":2,"px":[2,2],"py":[4,1],"pz":[2,-1],"nx":[2,4],"ny":[5,4],"nz":[2,1]},{"size":5,"px":[21,21,21,21,21],"py":[19,17,18,15,16],"pz":[0,0,0,0,0],"nx":[11,21,6,1,21],"ny":[17,1,10,0,2],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[7,3,4,4,4],"py":[23,13,14,16,13],"pz":[0,0,0,0,0],"nx":[21,22,22,22,22],"ny":[23,21,20,19,19],"nz":[0,0,0,0,-1]},{"size":2,"px":[11,8],"py":[6,6],"pz":[0,1],"nx":[8,4],"ny":[4,2],"nz":[1,-1]},{"size":5,"px":[23,23,11,23,23],"py":[8,12,6,11,10],"pz":[0,0,1,0,0],"nx":[4,4,3,8,8],"ny":[3,8,4,4,4],"nz":[1,1,1,1,-1]},{"size":5,"px":[8,9,4,7,10],"py":[2,1,0,2,1],"pz":[0,0,1,0,0],"nx":[5,5,6,4,4],"ny":[1,0,0,2,1],"nz":[0,0,0,0,-1]},{"size":2,"px":[12,2],"py":[13,6],"pz":[0,-1],"nx":[15,9],"ny":[15,4],"nz":[0,1]},{"size":2,"px":[2,4],"py":[4,9],"pz":[2,1],"nx":[3,13],"ny":[4,1],"nz":[1,-1]},{"size":3,"px":[3,6,2],"py":[10,22,4],"pz":[1,0,2],"nx":[4,2,1],"ny":[10,4,3],"nz":[1,-1,-1]},{"size":2,"px":[1,0],"py":[9,7],"pz":[0,1],"nx":[0,0],"ny":[23,22],"nz":[0,0]},{"size":2,"px":[8,7],"py":[0,1],"pz":[0,0],"nx":[4,4],"ny":[8,8],"nz":[1,-1]},{"size":5,"px":[7,4,4,6,3],"py":[8,4,5,5,3],"pz":[1,2,2,1,2],"nx":[1,0,2,0,0],"ny":[1,0,0,2,4],"nz":[0,2,0,1,-1]},{"size":3,"px":[10,4,4],"py":[6,1,5],"pz":[1,-1,-1],"nx":[5,23,22],"ny":[4,13,7],"nz":[2,0,0]},{"size":2,"px":[2,2],"py":[6,5],"pz":[1,1],"nx":[6,0],"ny":[9,2],"nz":[0,-1]},{"size":5,"px":[0,1,1,0,0],"py":[5,18,19,16,6],"pz":[2,0,0,0,1],"nx":[5,9,4,8,8],"ny":[8,7,3,7,7],"nz":[1,0,1,0,-1]},{"size":2,"px":[13,12],"py":[23,23],"pz":[0,0],"nx":[7,6],"ny":[8,10],"nz":[0,-1]},{"size":2,"px":[14,19],"py":[12,8],"pz":[0,0],"nx":[18,5],"ny":[8,11],"nz":[0,-1]},{"size":5,"px":[2,8,6,4,4],"py":[3,23,14,6,9],"pz":[2,0,0,1,1],"nx":[0,0,0,0,1],"ny":[21,20,5,19,23],"nz":[0,0,2,0,0]},{"size":2,"px":[11,22],"py":[4,14],"pz":[0,-1],"nx":[3,8],"ny":[1,4],"nz":[2,1]},{"size":5,"px":[1,1,0,1,1],"py":[6,8,3,12,7],"pz":[1,1,2,0,1],"nx":[21,21,19,10,10],"ny":[14,16,23,9,9],"nz":[0,0,0,1,-1]},{"size":2,"px":[10,3],"py":[23,2],"pz":[0,2],"nx":[10,3],"ny":[21,5],"nz":[0,-1]},{"size":2,"px":[9,9],"py":[7,0],"pz":[1,-1],"nx":[9,9],"ny":[11,10],"nz":[1,1]},{"size":5,"px":[23,11,23,23,23],"py":[18,10,19,20,16],"pz":[0,1,0,0,0],"nx":[3,3,2,3,2],"ny":[15,16,10,17,9],"nz":[0,0,1,0,-1]},{"size":2,"px":[9,14],"py":[7,18],"pz":[1,0],"nx":[7,10],"ny":[8,8],"nz":[1,-1]},{"size":2,"px":[12,5],"py":[6,4],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[4,5],"py":[13,4],"pz":[0,-1],"nx":[4,4],"ny":[17,19],"nz":[0,0]},{"size":3,"px":[2,3,3],"py":[11,17,19],"pz":[1,0,0],"nx":[7,7,4],"ny":[8,8,5],"nz":[1,-1,-1]},{"size":2,"px":[6,6],"py":[6,5],"pz":[1,-1],"nx":[2,9],"ny":[4,12],"nz":[1,0]},{"size":5,"px":[8,8,9,2,2],"py":[18,13,12,3,3],"pz":[0,0,0,2,-1],"nx":[23,11,23,11,11],"ny":[13,6,14,7,8],"nz":[0,1,0,1,1]},{"size":2,"px":[9,11],"py":[6,13],"pz":[1,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[8,10],"py":[0,6],"pz":[1,1],"nx":[9,4],"ny":[6,7],"nz":[1,-1]},{"size":3,"px":[3,10,9],"py":[8,6,0],"pz":[1,-1,-1],"nx":[2,2,2],"ny":[15,16,9],"nz":[0,0,1]},{"size":3,"px":[14,15,0],"py":[2,2,5],"pz":[0,0,-1],"nx":[17,17,18],"ny":[0,1,2],"nz":[0,0,0]},{"size":2,"px":[11,5],"py":[14,1],"pz":[0,-1],"nx":[10,9],"ny":[12,14],"nz":[0,0]},{"size":2,"px":[8,8],"py":[7,8],"pz":[1,1],"nx":[8,4],"ny":[4,4],"nz":[1,-1]},{"size":5,"px":[0,0,0,0,0],"py":[19,18,10,5,20],"pz":[0,0,1,2,0],"nx":[4,8,2,4,4],"ny":[4,15,5,10,10],"nz":[1,0,2,1,-1]},{"size":2,"px":[7,0],"py":[13,18],"pz":[0,-1],"nx":[4,3],"ny":[4,4],"nz":[1,1]},{"size":5,"px":[23,22,22,11,22],"py":[16,13,7,6,14],"pz":[0,0,0,1,0],"nx":[13,7,15,14,14],"ny":[6,3,7,6,6],"nz":[0,1,0,0,-1]}],"alpha":[-1.428861e+00,1.428861e+00,-8.591837e-01,8.591837e-01,-7.734305e-01,7.734305e-01,-6.534460e-01,6.534460e-01,-6.262547e-01,6.262547e-01,-5.231782e-01,5.231782e-01,-4.984303e-01,4.984303e-01,-4.913187e-01,4.913187e-01,-4.852198e-01,4.852198e-01,-4.906681e-01,4.906681e-01,-4.126248e-01,4.126248e-01,-4.590814e-01,4.590814e-01,-4.653825e-01,4.653825e-01,-4.179600e-01,4.179600e-01,-4.357392e-01,4.357392e-01,-4.087982e-01,4.087982e-01,-4.594812e-01,4.594812e-01,-4.858794e-01,4.858794e-01,-3.713580e-01,3.713580e-01,-3.894534e-01,3.894534e-01,-3.127168e-01,3.127168e-01,-4.012654e-01,4.012654e-01,-3.370552e-01,3.370552e-01,-3.534712e-01,3.534712e-01,-3.843450e-01,3.843450e-01,-2.688805e-01,2.688805e-01,-3.500203e-01,3.500203e-01,-2.827120e-01,2.827120e-01,-3.742119e-01,3.742119e-01,-3.219074e-01,3.219074e-01,-2.544953e-01,2.544953e-01,-3.355513e-01,3.355513e-01,-2.672670e-01,2.672670e-01,-2.932047e-01,2.932047e-01,-2.404618e-01,2.404618e-01,-2.354372e-01,2.354372e-01,-2.657955e-01,2.657955e-01,-2.293701e-01,2.293701e-01,-2.708918e-01,2.708918e-01,-2.340181e-01,2.340181e-01,-2.464815e-01,2.464815e-01,-2.944239e-01,2.944239e-01,-2.407960e-01,2.407960e-01,-3.029642e-01,3.029642e-01,-2.684602e-01,2.684602e-01,-2.495078e-01,2.495078e-01,-2.539708e-01,2.539708e-01,-2.989293e-01,2.989293e-01,-2.391309e-01,2.391309e-01,-2.531372e-01,2.531372e-01,-2.500390e-01,2.500390e-01,-2.295077e-01,2.295077e-01,-2.526125e-01,2.526125e-01,-2.337182e-01,2.337182e-01,-1.984756e-01,1.984756e-01,-3.089996e-01,3.089996e-01,-2.589053e-01,2.589053e-01,-2.962490e-01,2.962490e-01,-2.458660e-01,2.458660e-01,-2.515206e-01,2.515206e-01,-2.637299e-01,2.637299e-01]},{"count":80,"threshold":-5.185898e+00,"feature":[{"size":5,"px":[12,17,13,10,15],"py":[9,13,3,3,2],"pz":[0,0,0,0,0],"nx":[8,14,6,9,4],"ny":[10,9,8,8,2],"nz":[1,0,1,0,2]},{"size":5,"px":[3,11,8,10,9],"py":[7,4,3,3,3],"pz":[1,0,0,0,0],"nx":[2,1,5,0,0],"ny":[2,15,8,4,13],"nz":[2,0,1,0,0]},{"size":5,"px":[11,11,11,4,17],"py":[7,9,8,6,11],"pz":[0,0,0,1,0],"nx":[8,8,8,3,0],"ny":[4,8,8,8,13],"nz":[1,0,-1,-1,-1]},{"size":5,"px":[14,15,7,16,16],"py":[3,3,1,3,3],"pz":[0,0,1,0,-1],"nx":[23,22,23,22,22],"ny":[6,2,14,3,4],"nz":[0,0,0,0,0]},{"size":4,"px":[6,4,7,15],"py":[4,2,6,17],"pz":[1,2,1,0],"nx":[3,8,3,14],"ny":[4,4,10,22],"nz":[1,1,-1,-1]},{"size":3,"px":[3,5,22],"py":[7,7,5],"pz":[1,-1,-1],"nx":[2,2,4],"ny":[5,2,7],"nz":[2,2,1]},{"size":5,"px":[7,6,5,6,3],"py":[0,1,2,2,0],"pz":[0,0,0,0,1],"nx":[0,1,1,0,1],"ny":[0,2,1,2,0],"nz":[2,0,0,1,0]},{"size":5,"px":[11,11,11,11,5],"py":[11,10,13,12,6],"pz":[0,0,0,0,-1],"nx":[15,14,5,2,8],"ny":[9,8,10,2,10],"nz":[0,0,1,2,0]},{"size":5,"px":[8,5,6,8,7],"py":[12,12,12,23,12],"pz":[0,0,0,0,0],"nx":[3,17,5,2,8],"ny":[4,0,10,2,10],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[10,10,10,19,20],"py":[8,10,9,15,13],"pz":[1,1,1,0,0],"nx":[23,11,5,23,23],"ny":[20,10,5,19,19],"nz":[0,1,2,0,-1]},{"size":5,"px":[9,13,3,10,12],"py":[2,0,0,1,1],"pz":[0,0,2,0,0],"nx":[3,3,6,7,7],"ny":[5,2,11,4,4],"nz":[2,2,1,1,-1]},{"size":2,"px":[15,7],"py":[17,6],"pz":[0,1],"nx":[14,0],"ny":[16,10],"nz":[0,-1]},{"size":5,"px":[17,15,18,12,19],"py":[22,12,13,7,15],"pz":[0,0,0,0,0],"nx":[8,15,6,1,7],"ny":[4,8,22,5,4],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[10,9,18,19,8],"py":[2,1,3,3,1],"pz":[1,1,0,0,1],"nx":[23,23,23,11,11],"ny":[0,1,2,0,1],"nz":[0,0,0,1,-1]},{"size":5,"px":[12,23,0,1,8],"py":[14,5,0,17,1],"pz":[0,-1,-1,-1,-1],"nx":[8,14,15,18,14],"ny":[10,11,14,19,10],"nz":[1,0,0,0,0]},{"size":2,"px":[4,6],"py":[6,13],"pz":[1,0],"nx":[4,12],"ny":[10,14],"nz":[1,-1]},{"size":5,"px":[5,23,11,23,13],"py":[3,10,4,11,12],"pz":[2,0,1,0,0],"nx":[7,4,9,8,8],"ny":[4,2,4,4,4],"nz":[1,2,1,1,-1]},{"size":3,"px":[9,5,11],"py":[4,2,4],"pz":[0,1,-1],"nx":[5,2,4],"ny":[0,1,2],"nz":[0,2,0]},{"size":5,"px":[5,2,2,5,8],"py":[12,4,4,6,13],"pz":[0,2,1,1,0],"nx":[3,9,4,4,8],"ny":[4,0,2,2,4],"nz":[1,-1,-1,-1,-1]},{"size":3,"px":[9,5,22],"py":[7,4,20],"pz":[1,-1,-1],"nx":[8,19,4],"ny":[4,18,5],"nz":[1,0,2]},{"size":5,"px":[2,3,3,3,3],"py":[10,16,15,14,13],"pz":[1,0,0,0,0],"nx":[0,0,0,1,0],"ny":[10,20,5,23,21],"nz":[1,0,2,0,0]},{"size":2,"px":[12,11],"py":[4,18],"pz":[0,0],"nx":[11,23],"ny":[17,13],"nz":[0,-1]},{"size":2,"px":[17,8],"py":[16,7],"pz":[0,1],"nx":[8,3],"ny":[4,6],"nz":[1,-1]},{"size":5,"px":[13,5,14,12,3],"py":[4,7,4,5,3],"pz":[0,1,0,0,1],"nx":[21,20,21,21,21],"ny":[2,0,4,3,3],"nz":[0,0,0,0,-1]},{"size":4,"px":[20,20,20,10],"py":[21,19,20,8],"pz":[0,0,0,1],"nx":[8,11,0,2],"ny":[10,8,1,3],"nz":[1,-1,-1,-1]},{"size":4,"px":[6,7,12,8],"py":[12,12,8,11],"pz":[0,0,0,0],"nx":[9,5,5,18],"ny":[9,2,0,20],"nz":[0,-1,-1,-1]},{"size":3,"px":[11,5,9],"py":[0,0,0],"pz":[0,1,0],"nx":[2,6,3],"ny":[3,7,4],"nz":[2,0,1]},{"size":5,"px":[18,18,9,17,17],"py":[15,14,7,14,14],"pz":[0,0,1,0,-1],"nx":[21,21,21,22,20],"ny":[15,21,17,14,23],"nz":[0,0,0,0,0]},{"size":5,"px":[9,12,12,7,4],"py":[4,11,12,6,5],"pz":[1,0,0,1,2],"nx":[16,11,9,6,20],"ny":[8,4,11,10,23],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[12,11,10,11,11],"py":[23,4,4,5,23],"pz":[0,0,0,0,0],"nx":[11,11,7,3,20],"ny":[21,21,11,1,23],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[12,1],"py":[12,3],"pz":[0,-1],"nx":[10,10],"ny":[3,2],"nz":[1,1]},{"size":5,"px":[9,4,15,9,9],"py":[8,4,23,7,7],"pz":[1,2,0,1,-1],"nx":[5,3,3,3,2],"ny":[23,19,17,18,15],"nz":[0,0,0,0,0]},{"size":2,"px":[2,0],"py":[16,3],"pz":[0,2],"nx":[9,4],"ny":[15,2],"nz":[0,-1]},{"size":2,"px":[2,3],"py":[3,7],"pz":[2,1],"nx":[3,8],"ny":[4,10],"nz":[1,-1]},{"size":3,"px":[9,4,3],"py":[18,0,14],"pz":[0,-1,-1],"nx":[3,5,2],"ny":[5,8,5],"nz":[2,1,2]},{"size":3,"px":[1,1,10],"py":[2,1,7],"pz":[1,-1,-1],"nx":[0,0,0],"ny":[3,5,1],"nz":[0,0,1]},{"size":4,"px":[11,11,5,2],"py":[12,13,7,3],"pz":[0,0,-1,-1],"nx":[5,10,10,9],"ny":[6,9,10,13],"nz":[1,0,0,0]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[9,1],"ny":[4,3],"nz":[1,-1]},{"size":5,"px":[0,0,1,1,0],"py":[4,10,12,13,5],"pz":[1,0,0,0,1],"nx":[4,4,8,7,7],"ny":[3,2,10,4,4],"nz":[2,2,1,1,-1]},{"size":3,"px":[3,4,3],"py":[1,1,2],"pz":[1,-1,-1],"nx":[4,5,3],"ny":[1,0,2],"nz":[0,0,0]},{"size":2,"px":[9,2],"py":[6,4],"pz":[1,-1],"nx":[8,4],"ny":[6,2],"nz":[1,2]},{"size":5,"px":[12,13,15,16,7],"py":[1,1,2,2,1],"pz":[0,0,0,0,1],"nx":[4,4,4,3,7],"ny":[2,2,4,2,4],"nz":[2,-1,-1,-1,-1]},{"size":5,"px":[9,3,2,11,5],"py":[23,7,4,10,6],"pz":[0,1,2,0,1],"nx":[21,20,11,21,21],"ny":[21,23,8,20,20],"nz":[0,0,1,0,-1]},{"size":4,"px":[12,6,13,12],"py":[7,3,5,6],"pz":[0,1,0,0],"nx":[3,0,5,10],"ny":[4,6,5,1],"nz":[1,-1,-1,-1]},{"size":2,"px":[10,4],"py":[4,0],"pz":[0,-1],"nx":[12,11],"ny":[2,1],"nz":[0,0]},{"size":4,"px":[2,3,22,5],"py":[6,1,18,5],"pz":[1,-1,-1,-1],"nx":[0,0,0,3],"ny":[14,3,12,18],"nz":[0,2,0,0]},{"size":3,"px":[10,20,21],"py":[10,18,15],"pz":[1,0,0],"nx":[15,1,2],"ny":[7,0,8],"nz":[0,-1,-1]},{"size":5,"px":[0,0,0,0,0],"py":[4,7,13,4,6],"pz":[1,1,0,2,1],"nx":[5,9,8,4,4],"ny":[3,7,7,3,3],"nz":[1,0,0,1,-1]},{"size":3,"px":[13,12,14],"py":[2,2,2],"pz":[0,0,0],"nx":[4,4,4],"ny":[2,2,5],"nz":[2,-1,-1]},{"size":5,"px":[5,4,6,2,12],"py":[7,9,7,4,10],"pz":[0,1,0,2,0],"nx":[6,1,2,5,2],"ny":[9,2,4,13,4],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[11,1],"py":[12,5],"pz":[0,-1],"nx":[1,0],"ny":[7,2],"nz":[0,2]},{"size":5,"px":[8,8,1,16,6],"py":[6,6,4,8,11],"pz":[1,-1,-1,-1,-1],"nx":[13,5,4,4,13],"ny":[12,1,2,5,11],"nz":[0,2,2,2,0]},{"size":2,"px":[5,6],"py":[4,14],"pz":[1,0],"nx":[9,5],"ny":[7,1],"nz":[0,-1]},{"size":2,"px":[2,6],"py":[4,14],"pz":[2,0],"nx":[9,2],"ny":[15,1],"nz":[0,-1]},{"size":5,"px":[10,19,20,10,9],"py":[1,2,3,0,0],"pz":[1,0,0,1,-1],"nx":[11,23,23,11,23],"ny":[0,3,1,1,2],"nz":[1,0,0,1,0]},{"size":2,"px":[2,9],"py":[3,12],"pz":[2,0],"nx":[2,6],"ny":[4,6],"nz":[1,-1]},{"size":5,"px":[0,0,0,0,0],"py":[4,10,11,9,9],"pz":[1,0,0,0,-1],"nx":[16,2,17,8,4],"ny":[10,2,9,4,4],"nz":[0,2,0,1,1]},{"size":2,"px":[12,0],"py":[5,4],"pz":[0,-1],"nx":[7,8],"ny":[4,8],"nz":[1,1]},{"size":2,"px":[21,21],"py":[9,10],"pz":[0,0],"nx":[11,8],"ny":[18,8],"nz":[0,-1]},{"size":2,"px":[14,7],"py":[23,9],"pz":[0,1],"nx":[7,13],"ny":[10,4],"nz":[1,-1]},{"size":5,"px":[12,12,12,6,2],"py":[11,13,12,6,4],"pz":[0,0,0,-1,-1],"nx":[0,0,0,0,0],"ny":[14,13,6,12,11],"nz":[0,0,1,0,0]},{"size":2,"px":[8,9],"py":[6,11],"pz":[1,-1],"nx":[15,15],"ny":[11,10],"nz":[0,0]},{"size":4,"px":[4,6,7,2],"py":[8,4,23,7],"pz":[1,-1,-1,-1],"nx":[4,20,19,17],"ny":[0,3,1,1],"nz":[2,0,0,0]},{"size":2,"px":[7,0],"py":[6,0],"pz":[1,-1],"nx":[7,4],"ny":[8,2],"nz":[1,2]},{"size":2,"px":[10,0],"py":[7,0],"pz":[1,-1],"nx":[15,15],"ny":[15,14],"nz":[0,0]},{"size":5,"px":[6,2,5,2,4],"py":[23,7,21,8,16],"pz":[0,1,0,1,0],"nx":[18,2,10,0,11],"ny":[9,3,23,5,3],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[9,9,8,10,4],"py":[0,2,2,1,1],"pz":[0,0,0,0,1],"nx":[4,3,2,2,5],"ny":[7,3,4,2,17],"nz":[0,1,2,2,0]},{"size":2,"px":[10,7],"py":[5,6],"pz":[1,-1],"nx":[11,11],"ny":[6,5],"nz":[1,1]},{"size":5,"px":[11,11,5,6,11],"py":[8,10,5,5,9],"pz":[0,0,1,1,0],"nx":[13,16,11,14,4],"ny":[9,13,11,20,23],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[7,14],"py":[14,22],"pz":[0,-1],"nx":[3,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[4,11],"py":[4,5],"pz":[2,-1],"nx":[2,4],"ny":[5,7],"nz":[2,1]},{"size":2,"px":[1,0],"py":[0,0],"pz":[0,1],"nx":[0,4],"ny":[0,2],"nz":[0,-1]},{"size":5,"px":[11,11,11,4,9],"py":[5,5,2,9,23],"pz":[0,-1,-1,-1,-1],"nx":[11,12,10,9,5],"ny":[2,2,2,2,1],"nz":[0,0,0,0,1]},{"size":3,"px":[16,14,15],"py":[1,1,0],"pz":[0,0,0],"nx":[4,7,4],"ny":[2,4,4],"nz":[2,1,-1]},{"size":2,"px":[5,0],"py":[14,5],"pz":[0,-1],"nx":[2,4],"ny":[5,17],"nz":[2,0]},{"size":5,"px":[18,7,16,19,4],"py":[13,6,23,13,3],"pz":[0,1,0,0,2],"nx":[5,2,3,4,4],"ny":[1,1,4,1,3],"nz":[0,1,0,0,0]},{"size":2,"px":[8,8],"py":[7,6],"pz":[1,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[2,1],"py":[10,4],"pz":[1,2],"nx":[4,4],"ny":[3,3],"nz":[2,-1]},{"size":2,"px":[10,5],"py":[19,1],"pz":[0,-1],"nx":[4,12],"ny":[10,17],"nz":[1,0]},{"size":5,"px":[12,6,2,4,11],"py":[14,4,2,1,5],"pz":[0,-1,-1,-1,-1],"nx":[3,4,3,4,3],"ny":[13,17,14,16,15],"nz":[0,0,0,0,0]}],"alpha":[-1.368326e+00,1.368326e+00,-7.706897e-01,7.706897e-01,-8.378147e-01,8.378147e-01,-6.120624e-01,6.120624e-01,-5.139189e-01,5.139189e-01,-4.759130e-01,4.759130e-01,-5.161374e-01,5.161374e-01,-5.407743e-01,5.407743e-01,-4.216105e-01,4.216105e-01,-4.418693e-01,4.418693e-01,-4.435335e-01,4.435335e-01,-4.052076e-01,4.052076e-01,-4.293050e-01,4.293050e-01,-3.431154e-01,3.431154e-01,-4.231203e-01,4.231203e-01,-3.917100e-01,3.917100e-01,-3.623450e-01,3.623450e-01,-3.202670e-01,3.202670e-01,-3.331602e-01,3.331602e-01,-3.552034e-01,3.552034e-01,-3.784556e-01,3.784556e-01,-3.295428e-01,3.295428e-01,-3.587038e-01,3.587038e-01,-2.861332e-01,2.861332e-01,-3.403258e-01,3.403258e-01,-3.989002e-01,3.989002e-01,-2.631159e-01,2.631159e-01,-3.272156e-01,3.272156e-01,-2.816567e-01,2.816567e-01,-3.125926e-01,3.125926e-01,-3.146982e-01,3.146982e-01,-2.521825e-01,2.521825e-01,-2.434554e-01,2.434554e-01,-3.435378e-01,3.435378e-01,-3.161172e-01,3.161172e-01,-2.805027e-01,2.805027e-01,-3.303579e-01,3.303579e-01,-2.725089e-01,2.725089e-01,-2.575051e-01,2.575051e-01,-3.210646e-01,3.210646e-01,-2.986997e-01,2.986997e-01,-2.408925e-01,2.408925e-01,-2.456291e-01,2.456291e-01,-2.836550e-01,2.836550e-01,-2.469860e-01,2.469860e-01,-2.915900e-01,2.915900e-01,-2.513559e-01,2.513559e-01,-2.433728e-01,2.433728e-01,-2.377905e-01,2.377905e-01,-2.089327e-01,2.089327e-01,-1.978434e-01,1.978434e-01,-3.017699e-01,3.017699e-01,-2.339661e-01,2.339661e-01,-1.932560e-01,1.932560e-01,-2.278285e-01,2.278285e-01,-2.438200e-01,2.438200e-01,-2.216769e-01,2.216769e-01,-1.941995e-01,1.941995e-01,-2.129081e-01,2.129081e-01,-2.270319e-01,2.270319e-01,-2.393942e-01,2.393942e-01,-2.132518e-01,2.132518e-01,-1.867741e-01,1.867741e-01,-2.394237e-01,2.394237e-01,-2.005917e-01,2.005917e-01,-2.445217e-01,2.445217e-01,-2.229078e-01,2.229078e-01,-2.342967e-01,2.342967e-01,-2.481784e-01,2.481784e-01,-2.735603e-01,2.735603e-01,-2.187604e-01,2.187604e-01,-1.677239e-01,1.677239e-01,-2.248867e-01,2.248867e-01,-2.505358e-01,2.505358e-01,-1.867706e-01,1.867706e-01,-1.904305e-01,1.904305e-01,-1.939881e-01,1.939881e-01,-2.249474e-01,2.249474e-01,-1.762483e-01,1.762483e-01,-2.299974e-01,2.299974e-01]},{"count":115,"threshold":-5.151920e+00,"feature":[{"size":5,"px":[7,14,7,10,6],"py":[3,3,12,4,4],"pz":[0,0,0,0,1],"nx":[14,3,14,9,3],"ny":[7,4,8,8,5],"nz":[0,1,0,0,2]},{"size":5,"px":[13,18,16,17,15],"py":[1,13,1,2,0],"pz":[0,0,0,0,0],"nx":[23,23,8,11,22],"ny":[3,4,4,8,0],"nz":[0,0,1,1,0]},{"size":5,"px":[16,6,6,7,12],"py":[12,13,4,12,5],"pz":[0,0,1,0,0],"nx":[0,0,8,4,0],"ny":[0,2,4,4,2],"nz":[0,0,1,1,-1]},{"size":3,"px":[12,13,7],"py":[13,18,6],"pz":[0,0,1],"nx":[13,5,6],"ny":[16,3,8],"nz":[0,-1,-1]},{"size":5,"px":[10,12,9,13,11],"py":[3,3,3,3,3],"pz":[0,0,0,0,0],"nx":[3,4,15,4,4],"ny":[2,5,10,4,4],"nz":[2,1,0,1,-1]},{"size":5,"px":[12,12,12,3,12],"py":[7,9,8,3,10],"pz":[0,0,0,2,0],"nx":[4,8,15,9,9],"ny":[4,4,8,8,8],"nz":[1,1,0,0,-1]},{"size":5,"px":[6,3,4,4,2],"py":[22,12,13,14,7],"pz":[0,0,0,0,1],"nx":[2,0,1,1,1],"ny":[23,5,22,21,21],"nz":[0,2,0,0,-1]},{"size":2,"px":[3,3],"py":[8,8],"pz":[1,-1],"nx":[3,4],"ny":[4,10],"nz":[1,1]},{"size":5,"px":[11,11,11,11,0],"py":[10,12,11,13,2],"pz":[0,0,0,-1,-1],"nx":[8,13,13,13,13],"ny":[10,8,9,11,10],"nz":[1,0,0,0,0]},{"size":5,"px":[16,16,15,17,18],"py":[12,23,11,12,12],"pz":[0,0,0,0,0],"nx":[8,8,9,3,13],"ny":[4,4,12,3,10],"nz":[1,-1,-1,-1,-1]},{"size":4,"px":[17,16,6,5],"py":[14,13,4,5],"pz":[0,0,-1,-1],"nx":[8,15,4,7],"ny":[10,14,4,8],"nz":[1,0,2,1]},{"size":5,"px":[20,10,20,21,19],"py":[14,7,13,12,22],"pz":[0,1,0,0,0],"nx":[22,23,11,23,23],"ny":[23,22,11,21,20],"nz":[0,0,1,0,-1]},{"size":4,"px":[12,13,1,18],"py":[14,23,3,5],"pz":[0,-1,-1,-1],"nx":[2,10,5,9],"ny":[2,9,8,14],"nz":[2,0,1,0]},{"size":5,"px":[10,4,7,9,8],"py":[1,0,2,0,1],"pz":[0,1,0,0,0],"nx":[2,3,5,3,3],"ny":[2,4,8,3,3],"nz":[2,1,1,1,-1]},{"size":4,"px":[11,2,2,11],"py":[6,4,5,7],"pz":[0,2,2,0],"nx":[3,0,5,3],"ny":[4,9,8,3],"nz":[1,-1,-1,-1]},{"size":5,"px":[12,10,9,12,12],"py":[11,2,1,10,10],"pz":[0,1,1,0,-1],"nx":[22,11,5,22,23],"ny":[1,1,0,0,3],"nz":[0,1,2,0,0]},{"size":4,"px":[5,10,7,11],"py":[14,3,0,4],"pz":[0,-1,-1,-1],"nx":[4,4,4,4],"ny":[17,18,15,16],"nz":[0,0,0,0]},{"size":5,"px":[2,2,3,2,2],"py":[16,12,20,15,17],"pz":[0,0,0,0,0],"nx":[12,8,4,15,15],"ny":[17,4,4,8,8],"nz":[0,1,1,0,-1]},{"size":5,"px":[12,12,1,6,12],"py":[11,10,3,6,10],"pz":[0,0,-1,-1,-1],"nx":[0,0,1,0,2],"ny":[4,0,2,1,0],"nz":[0,2,0,1,0]},{"size":5,"px":[21,20,21,21,14],"py":[9,16,11,8,12],"pz":[0,0,0,0,0],"nx":[17,6,15,0,2],"ny":[8,23,13,2,0],"nz":[0,-1,-1,-1,-1]},{"size":4,"px":[6,9,9,5],"py":[14,18,23,14],"pz":[0,0,0,0],"nx":[9,5,5,12],"ny":[21,5,3,1],"nz":[0,-1,-1,-1]},{"size":2,"px":[12,13],"py":[4,4],"pz":[0,0],"nx":[4,3],"ny":[4,1],"nz":[1,2]},{"size":5,"px":[7,8,11,4,10],"py":[3,3,2,1,2],"pz":[0,0,0,1,0],"nx":[19,20,19,20,20],"ny":[0,3,1,2,2],"nz":[0,0,0,0,-1]},{"size":2,"px":[9,1],"py":[7,4],"pz":[1,-1],"nx":[4,7],"ny":[5,9],"nz":[2,1]},{"size":5,"px":[11,10,1,5,1],"py":[10,12,6,6,5],"pz":[0,0,1,1,1],"nx":[16,3,2,4,4],"ny":[10,4,2,4,4],"nz":[0,1,2,1,-1]},{"size":2,"px":[15,0],"py":[17,0],"pz":[0,-1],"nx":[7,4],"ny":[8,5],"nz":[1,2]},{"size":5,"px":[8,10,9,9,9],"py":[2,2,2,1,1],"pz":[0,0,0,0,-1],"nx":[4,2,3,3,2],"ny":[0,3,2,1,4],"nz":[0,0,0,0,0]},{"size":4,"px":[11,15,17,16],"py":[8,10,11,11],"pz":[0,0,0,0],"nx":[14,1,1,2],"ny":[9,5,7,0],"nz":[0,-1,-1,-1]},{"size":3,"px":[3,5,9],"py":[8,6,12],"pz":[0,1,0],"nx":[3,4,18],"ny":[4,2,22],"nz":[1,-1,-1]},{"size":5,"px":[6,1,7,3,3],"py":[13,4,13,7,7],"pz":[0,2,0,1,-1],"nx":[0,0,0,0,0],"ny":[16,15,8,13,14],"nz":[0,0,1,0,0]},{"size":2,"px":[5,16],"py":[13,10],"pz":[0,-1],"nx":[3,4],"ny":[4,5],"nz":[1,1]},{"size":5,"px":[5,23,11,23,23],"py":[5,12,4,16,15],"pz":[2,0,1,0,0],"nx":[3,2,4,5,5],"ny":[4,2,4,11,11],"nz":[1,2,1,1,-1]},{"size":4,"px":[10,10,3,23],"py":[7,7,3,16],"pz":[1,-1,-1,-1],"nx":[5,23,11,22],"ny":[4,13,7,16],"nz":[2,0,1,0]},{"size":5,"px":[15,14,13,15,16],"py":[1,0,0,0,1],"pz":[0,0,0,0,0],"nx":[4,9,8,8,8],"ny":[2,4,9,4,4],"nz":[2,1,1,1,-1]},{"size":2,"px":[10,4],"py":[5,5],"pz":[0,-1],"nx":[3,15],"ny":[1,8],"nz":[2,0]},{"size":2,"px":[6,12],"py":[6,9],"pz":[1,0],"nx":[10,10],"ny":[10,10],"nz":[0,-1]},{"size":5,"px":[1,0,0,0,0],"py":[5,4,11,9,12],"pz":[0,1,0,0,0],"nx":[9,8,2,4,7],"ny":[7,7,2,4,7],"nz":[0,0,2,1,0]},{"size":2,"px":[4,8],"py":[4,7],"pz":[2,1],"nx":[9,8],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[5,6],"py":[4,1],"pz":[2,-1],"nx":[8,6],"ny":[7,3],"nz":[1,1]},{"size":5,"px":[8,5,7,6,11],"py":[12,5,13,13,22],"pz":[0,1,0,0,0],"nx":[23,23,23,22,22],"ny":[20,19,21,23,23],"nz":[0,0,0,0,-1]},{"size":2,"px":[3,17],"py":[6,9],"pz":[1,-1],"nx":[3,3],"ny":[10,9],"nz":[1,1]},{"size":2,"px":[14,11],"py":[23,5],"pz":[0,0],"nx":[7,3],"ny":[10,20],"nz":[1,-1]},{"size":2,"px":[3,4],"py":[8,8],"pz":[1,1],"nx":[9,4],"ny":[15,4],"nz":[0,-1]},{"size":2,"px":[2,4],"py":[4,7],"pz":[2,1],"nx":[2,4],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[23,11],"py":[21,10],"pz":[0,1],"nx":[2,3],"ny":[11,14],"nz":[1,0]},{"size":4,"px":[11,11,11,3],"py":[13,12,11,4],"pz":[0,0,0,-1],"nx":[14,13,13,6],"ny":[13,11,10,5],"nz":[0,0,0,1]},{"size":2,"px":[4,7],"py":[3,6],"pz":[2,1],"nx":[9,19],"ny":[4,14],"nz":[1,-1]},{"size":3,"px":[10,5,7],"py":[5,0,6],"pz":[1,-1,-1],"nx":[10,21,5],"ny":[0,5,3],"nz":[1,0,2]},{"size":2,"px":[16,13],"py":[3,15],"pz":[0,-1],"nx":[17,7],"ny":[23,8],"nz":[0,1]},{"size":3,"px":[4,2,2],"py":[15,7,19],"pz":[0,1,-1],"nx":[2,8,4],"ny":[5,14,9],"nz":[2,0,1]},{"size":3,"px":[8,3,6],"py":[10,2,4],"pz":[0,2,1],"nx":[3,8,4],"ny":[4,14,9],"nz":[1,-1,-1]},{"size":2,"px":[14,3],"py":[18,3],"pz":[0,-1],"nx":[12,14],"ny":[17,9],"nz":[0,0]},{"size":3,"px":[7,1,10],"py":[14,10,10],"pz":[0,-1,-1],"nx":[9,6,2],"ny":[13,18,2],"nz":[0,0,2]},{"size":2,"px":[11,8],"py":[13,11],"pz":[0,-1],"nx":[2,4],"ny":[7,18],"nz":[1,0]},{"size":2,"px":[5,4],"py":[21,17],"pz":[0,0],"nx":[9,3],"ny":[5,1],"nz":[1,-1]},{"size":2,"px":[6,6],"py":[4,0],"pz":[0,-1],"nx":[4,3],"ny":[2,0],"nz":[0,1]},{"size":2,"px":[2,1],"py":[1,5],"pz":[0,-1],"nx":[0,1],"ny":[1,0],"nz":[1,0]},{"size":2,"px":[18,1],"py":[13,5],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[0,0,0,0,1],"py":[4,3,2,12,15],"pz":[1,1,2,0,0],"nx":[5,9,4,8,8],"ny":[3,6,3,6,6],"nz":[1,0,1,0,-1]},{"size":2,"px":[2,5],"py":[0,2],"pz":[1,-1],"nx":[2,1],"ny":[0,1],"nz":[0,1]},{"size":4,"px":[7,15,4,20],"py":[8,23,4,8],"pz":[1,0,2,0],"nx":[6,0,3,4],"ny":[9,2,13,6],"nz":[0,-1,-1,-1]},{"size":4,"px":[11,11,10,20],"py":[10,9,11,8],"pz":[0,0,0,-1],"nx":[21,20,21,21],"ny":[18,23,19,17],"nz":[0,0,0,0]},{"size":2,"px":[3,8],"py":[7,5],"pz":[1,-1],"nx":[3,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[5,11],"py":[3,4],"pz":[2,1],"nx":[8,7],"ny":[5,12],"nz":[1,0]},{"size":2,"px":[4,1],"py":[1,3],"pz":[1,-1],"nx":[3,6],"ny":[0,0],"nz":[1,0]},{"size":2,"px":[19,9],"py":[16,8],"pz":[0,1],"nx":[14,6],"ny":[15,1],"nz":[0,-1]},{"size":2,"px":[12,6],"py":[13,5],"pz":[0,-1],"nx":[5,5],"ny":[1,2],"nz":[2,2]},{"size":5,"px":[16,14,4,15,12],"py":[1,1,1,2,1],"pz":[0,0,2,0,0],"nx":[6,4,3,2,10],"ny":[22,8,2,1,7],"nz":[0,1,1,2,0]},{"size":5,"px":[6,8,6,5,5],"py":[1,0,0,1,0],"pz":[0,0,0,0,0],"nx":[4,4,4,4,8],"ny":[4,3,2,5,10],"nz":[2,2,2,2,1]},{"size":2,"px":[9,8],"py":[17,0],"pz":[0,-1],"nx":[2,5],"ny":[5,8],"nz":[2,1]},{"size":2,"px":[8,0],"py":[7,3],"pz":[1,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[10,21],"py":[11,20],"pz":[1,0],"nx":[11,4],"ny":[17,1],"nz":[0,-1]},{"size":5,"px":[5,10,4,17,10],"py":[3,6,3,11,5],"pz":[1,0,1,0,0],"nx":[21,20,9,19,10],"ny":[4,3,0,2,1],"nz":[0,0,1,0,-1]},{"size":2,"px":[23,23],"py":[10,10],"pz":[0,-1],"nx":[23,23],"ny":[21,22],"nz":[0,0]},{"size":5,"px":[9,20,19,20,20],"py":[0,3,1,2,2],"pz":[1,0,0,0,-1],"nx":[11,23,11,23,5],"ny":[1,2,0,1,0],"nz":[1,0,1,0,2]},{"size":3,"px":[6,8,7],"py":[4,10,11],"pz":[1,0,0],"nx":[8,3,4],"ny":[9,4,4],"nz":[0,-1,-1]},{"size":4,"px":[13,13,10,4],"py":[14,23,1,5],"pz":[0,-1,-1,-1],"nx":[15,14,8,8],"ny":[13,12,8,9],"nz":[0,0,1,1]},{"size":2,"px":[11,9],"py":[5,8],"pz":[0,-1],"nx":[7,8],"ny":[7,4],"nz":[0,1]},{"size":5,"px":[4,8,4,7,7],"py":[2,3,3,11,11],"pz":[2,1,2,1,-1],"nx":[0,0,1,0,0],"ny":[4,6,15,3,2],"nz":[1,1,0,2,2]},{"size":2,"px":[6,1],"py":[12,1],"pz":[0,-1],"nx":[1,10],"ny":[2,11],"nz":[2,0]},{"size":5,"px":[0,0,2,3,7],"py":[0,1,4,3,11],"pz":[0,-1,-1,-1,-1],"nx":[9,11,9,6,12],"ny":[2,1,1,0,2],"nz":[0,0,0,1,0]},{"size":2,"px":[10,11],"py":[4,4],"pz":[0,0],"nx":[8,4],"ny":[4,2],"nz":[1,-1]},{"size":5,"px":[1,1,1,1,1],"py":[15,10,19,16,18],"pz":[0,1,0,0,0],"nx":[4,5,3,5,6],"ny":[4,19,9,18,19],"nz":[1,0,1,0,-1]},{"size":5,"px":[12,12,12,12,20],"py":[11,12,13,13,18],"pz":[0,0,0,-1,-1],"nx":[0,0,0,0,0],"ny":[4,2,7,6,12],"nz":[1,2,1,1,0]},{"size":2,"px":[0,0],"py":[9,11],"pz":[0,0],"nx":[10,4],"ny":[5,3],"nz":[1,-1]},{"size":2,"px":[11,8],"py":[9,6],"pz":[0,1],"nx":[13,13],"ny":[10,10],"nz":[0,-1]},{"size":2,"px":[6,3],"py":[5,3],"pz":[1,2],"nx":[3,3],"ny":[5,5],"nz":[2,-1]},{"size":2,"px":[19,9],"py":[10,6],"pz":[0,1],"nx":[4,1],"ny":[2,2],"nz":[2,-1]},{"size":2,"px":[14,4],"py":[19,12],"pz":[0,-1],"nx":[14,8],"ny":[17,10],"nz":[0,1]},{"size":4,"px":[4,2,13,2],"py":[12,6,9,3],"pz":[0,1,-1,-1],"nx":[1,0,1,0],"ny":[16,14,11,15],"nz":[0,0,1,0]},{"size":2,"px":[3,3],"py":[8,7],"pz":[1,1],"nx":[4,4],"ny":[4,8],"nz":[1,-1]},{"size":5,"px":[9,11,12,6,10],"py":[2,1,2,1,2],"pz":[0,0,0,1,0],"nx":[4,6,4,6,2],"ny":[4,0,9,1,8],"nz":[0,0,1,0,1]},{"size":5,"px":[4,4,7,2,2],"py":[19,20,23,8,9],"pz":[0,0,0,1,1],"nx":[7,0,5,6,2],"ny":[10,5,4,1,8],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[18,18,17,18,18],"py":[15,16,14,20,17],"pz":[0,0,0,0,0],"nx":[15,2,2,5,2],"ny":[8,0,2,9,4],"nz":[0,-1,-1,-1,-1]},{"size":4,"px":[13,13,13,18],"py":[11,12,12,20],"pz":[0,0,-1,-1],"nx":[1,3,10,10],"ny":[1,6,12,11],"nz":[2,0,0,0]},{"size":2,"px":[8,9],"py":[0,1],"pz":[1,1],"nx":[19,4],"ny":[2,2],"nz":[0,-1]},{"size":2,"px":[6,3],"py":[4,2],"pz":[1,2],"nx":[8,4],"ny":[4,0],"nz":[1,-1]},{"size":5,"px":[23,11,22,13,13],"py":[8,3,3,12,12],"pz":[0,1,0,0,-1],"nx":[15,7,14,13,8],"ny":[7,3,6,6,3],"nz":[0,1,0,0,1]},{"size":3,"px":[9,11,19],"py":[7,3,0],"pz":[1,-1,-1],"nx":[23,23,11],"ny":[16,12,7],"nz":[0,0,1]},{"size":2,"px":[15,8],"py":[23,7],"pz":[0,-1],"nx":[4,3],"ny":[5,4],"nz":[2,2]},{"size":2,"px":[4,10],"py":[6,13],"pz":[1,-1],"nx":[2,3],"ny":[4,10],"nz":[2,1]},{"size":2,"px":[4,1],"py":[11,2],"pz":[1,2],"nx":[9,2],"ny":[5,2],"nz":[1,-1]},{"size":2,"px":[22,22],"py":[22,21],"pz":[0,0],"nx":[3,0],"ny":[5,3],"nz":[1,-1]},{"size":2,"px":[20,10],"py":[12,6],"pz":[0,1],"nx":[20,10],"ny":[23,11],"nz":[0,-1]},{"size":4,"px":[10,3,3,4],"py":[5,3,4,9],"pz":[0,-1,-1,-1],"nx":[14,4,3,11],"ny":[2,1,1,3],"nz":[0,2,2,0]},{"size":3,"px":[15,15,3],"py":[1,1,4],"pz":[0,-1,-1],"nx":[7,4,4],"ny":[8,2,3],"nz":[1,2,2]},{"size":3,"px":[0,0,0],"py":[3,4,6],"pz":[2,2,1],"nx":[0,21,4],"ny":[23,14,3],"nz":[0,-1,-1]},{"size":5,"px":[4,4,5,3,4],"py":[9,11,8,4,8],"pz":[1,1,1,2,1],"nx":[21,21,10,19,19],"ny":[3,4,1,0,0],"nz":[0,0,1,0,-1]},{"size":4,"px":[21,20,20,21],"py":[18,21,20,17],"pz":[0,0,0,0],"nx":[8,1,4,2],"ny":[10,0,2,4],"nz":[1,-1,-1,-1]},{"size":2,"px":[3,6],"py":[7,14],"pz":[1,0],"nx":[3,5],"ny":[4,5],"nz":[1,-1]},{"size":3,"px":[12,0,23],"py":[20,2,13],"pz":[0,-1,-1],"nx":[12,2,9],"ny":[19,2,7],"nz":[0,2,0]},{"size":2,"px":[0,6],"py":[22,11],"pz":[0,-1],"nx":[20,18],"ny":[12,23],"nz":[0,0]},{"size":5,"px":[9,15,15,16,8],"py":[2,1,2,2,1],"pz":[1,0,0,0,1],"nx":[1,1,1,1,1],"ny":[16,10,17,18,18],"nz":[0,1,0,0,-1]},{"size":5,"px":[10,5,3,5,8],"py":[14,2,1,4,1],"pz":[0,-1,-1,-1,-1],"nx":[23,23,23,23,23],"ny":[18,15,16,14,17],"nz":[0,0,0,0,0]},{"size":5,"px":[2,2,2,3,2],"py":[16,17,15,20,11],"pz":[0,0,0,0,1],"nx":[8,22,2,1,23],"ny":[20,11,5,0,17],"nz":[0,-1,-1,-1,-1]}],"alpha":[-1.299972e+00,1.299972e+00,-7.630804e-01,7.630804e-01,-5.530378e-01,5.530378e-01,-5.444703e-01,5.444703e-01,-5.207701e-01,5.207701e-01,-5.035143e-01,5.035143e-01,-4.514416e-01,4.514416e-01,-4.897723e-01,4.897723e-01,-5.006264e-01,5.006264e-01,-4.626049e-01,4.626049e-01,-4.375402e-01,4.375402e-01,-3.742565e-01,3.742565e-01,-3.873996e-01,3.873996e-01,-3.715484e-01,3.715484e-01,-3.562480e-01,3.562480e-01,-3.216189e-01,3.216189e-01,-3.983409e-01,3.983409e-01,-3.191891e-01,3.191891e-01,-3.242173e-01,3.242173e-01,-3.528040e-01,3.528040e-01,-3.562318e-01,3.562318e-01,-3.592398e-01,3.592398e-01,-2.557584e-01,2.557584e-01,-2.747951e-01,2.747951e-01,-2.747554e-01,2.747554e-01,-2.980481e-01,2.980481e-01,-2.887670e-01,2.887670e-01,-3.895318e-01,3.895318e-01,-2.786896e-01,2.786896e-01,-2.763841e-01,2.763841e-01,-2.704816e-01,2.704816e-01,-2.075489e-01,2.075489e-01,-3.104773e-01,3.104773e-01,-2.580337e-01,2.580337e-01,-2.448334e-01,2.448334e-01,-3.054279e-01,3.054279e-01,-2.335804e-01,2.335804e-01,-2.972322e-01,2.972322e-01,-2.270521e-01,2.270521e-01,-2.134621e-01,2.134621e-01,-2.261655e-01,2.261655e-01,-2.091024e-01,2.091024e-01,-2.478928e-01,2.478928e-01,-2.468972e-01,2.468972e-01,-1.919746e-01,1.919746e-01,-2.756623e-01,2.756623e-01,-2.629717e-01,2.629717e-01,-2.198653e-01,2.198653e-01,-2.174434e-01,2.174434e-01,-2.193626e-01,2.193626e-01,-1.956262e-01,1.956262e-01,-1.720459e-01,1.720459e-01,-1.781067e-01,1.781067e-01,-1.773484e-01,1.773484e-01,-1.793871e-01,1.793871e-01,-1.973396e-01,1.973396e-01,-2.397262e-01,2.397262e-01,-2.164685e-01,2.164685e-01,-2.214348e-01,2.214348e-01,-2.265941e-01,2.265941e-01,-2.075436e-01,2.075436e-01,-2.244070e-01,2.244070e-01,-2.291992e-01,2.291992e-01,-2.223506e-01,2.223506e-01,-1.639398e-01,1.639398e-01,-1.732374e-01,1.732374e-01,-1.808631e-01,1.808631e-01,-1.860962e-01,1.860962e-01,-1.781604e-01,1.781604e-01,-2.108322e-01,2.108322e-01,-2.386390e-01,2.386390e-01,-1.942083e-01,1.942083e-01,-1.949161e-01,1.949161e-01,-1.953729e-01,1.953729e-01,-2.317591e-01,2.317591e-01,-2.335136e-01,2.335136e-01,-2.282835e-01,2.282835e-01,-2.148716e-01,2.148716e-01,-1.588127e-01,1.588127e-01,-1.566765e-01,1.566765e-01,-1.644839e-01,1.644839e-01,-2.386947e-01,2.386947e-01,-1.704126e-01,1.704126e-01,-2.213945e-01,2.213945e-01,-1.740398e-01,1.740398e-01,-2.451678e-01,2.451678e-01,-2.120524e-01,2.120524e-01,-1.886646e-01,1.886646e-01,-2.824447e-01,2.824447e-01,-1.900364e-01,1.900364e-01,-2.179183e-01,2.179183e-01,-2.257696e-01,2.257696e-01,-2.023404e-01,2.023404e-01,-1.886901e-01,1.886901e-01,-1.850663e-01,1.850663e-01,-2.035414e-01,2.035414e-01,-1.930174e-01,1.930174e-01,-1.898282e-01,1.898282e-01,-1.666640e-01,1.666640e-01,-1.646143e-01,1.646143e-01,-1.543475e-01,1.543475e-01,-1.366289e-01,1.366289e-01,-1.636837e-01,1.636837e-01,-2.547716e-01,2.547716e-01,-1.281869e-01,1.281869e-01,-1.509159e-01,1.509159e-01,-1.447827e-01,1.447827e-01,-1.626126e-01,1.626126e-01,-2.387014e-01,2.387014e-01,-2.571160e-01,2.571160e-01,-1.719175e-01,1.719175e-01,-1.646742e-01,1.646742e-01,-1.717041e-01,1.717041e-01,-2.039217e-01,2.039217e-01,-1.796907e-01,1.796907e-01]},{"count":153,"threshold":-4.971032e+00,"feature":[{"size":5,"px":[14,13,18,10,16],"py":[2,2,13,3,12],"pz":[0,0,0,0,0],"nx":[21,7,14,23,23],"ny":[16,7,8,3,13],"nz":[0,1,0,0,0]},{"size":5,"px":[12,12,12,15,14],"py":[9,10,11,3,3],"pz":[0,0,0,0,0],"nx":[9,9,8,14,3],"ny":[9,8,5,9,5],"nz":[0,0,1,0,2]},{"size":5,"px":[5,11,7,6,8],"py":[12,8,12,12,11],"pz":[0,0,0,0,0],"nx":[8,4,3,9,9],"ny":[4,4,4,9,9],"nz":[1,1,1,0,-1]},{"size":5,"px":[9,8,4,10,6],"py":[2,2,1,3,13],"pz":[0,0,1,0,0],"nx":[1,1,5,1,1],"ny":[2,3,8,4,16],"nz":[0,0,1,0,0]},{"size":5,"px":[3,16,6,17,15],"py":[2,17,4,12,12],"pz":[2,0,1,0,0],"nx":[4,8,15,1,1],"ny":[4,4,8,16,16],"nz":[1,1,-1,-1,-1]},{"size":4,"px":[18,15,8,17],"py":[12,23,6,12],"pz":[0,0,1,0],"nx":[15,4,10,5],"ny":[21,8,14,3],"nz":[0,-1,-1,-1]},{"size":5,"px":[18,17,9,19,19],"py":[3,1,0,3,3],"pz":[0,0,1,0,-1],"nx":[22,11,23,23,23],"ny":[0,1,2,3,4],"nz":[0,1,0,0,0]},{"size":4,"px":[9,5,5,10],"py":[18,15,14,18],"pz":[0,0,0,0],"nx":[10,11,2,0],"ny":[16,7,12,7],"nz":[0,-1,-1,-1]},{"size":2,"px":[2,12],"py":[4,6],"pz":[2,0],"nx":[3,12],"ny":[4,19],"nz":[1,-1]},{"size":5,"px":[3,4,5,2,2],"py":[3,3,3,1,1],"pz":[0,0,0,1,-1],"nx":[0,0,1,0,0],"ny":[3,4,0,1,2],"nz":[0,0,0,1,0]},{"size":5,"px":[12,12,12,8,10],"py":[13,12,12,1,18],"pz":[0,0,-1,-1,-1],"nx":[13,8,7,14,9],"ny":[10,10,7,13,4],"nz":[0,1,1,0,1]},{"size":5,"px":[15,4,12,14,12],"py":[12,3,9,10,8],"pz":[0,2,0,0,0],"nx":[14,7,11,2,9],"ny":[8,4,7,5,4],"nz":[0,1,-1,-1,-1]},{"size":3,"px":[3,9,7],"py":[7,23,15],"pz":[1,-1,-1],"nx":[4,4,2],"ny":[9,7,5],"nz":[1,1,2]},{"size":3,"px":[5,17,5],"py":[3,23,4],"pz":[2,0,2],"nx":[23,2,4],"ny":[23,16,4],"nz":[0,-1,-1]},{"size":5,"px":[4,9,9,10,8],"py":[1,0,1,0,2],"pz":[1,0,0,0,0],"nx":[2,5,4,2,2],"ny":[2,19,11,4,1],"nz":[2,0,1,2,2]},{"size":5,"px":[8,3,8,4,7],"py":[23,9,13,8,16],"pz":[0,1,0,1,0],"nx":[8,2,5,3,2],"ny":[8,15,1,1,1],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[11,5],"py":[14,5],"pz":[0,-1],"nx":[1,9],"ny":[3,13],"nz":[2,0]},{"size":5,"px":[5,8,1,8,6],"py":[12,12,3,23,12],"pz":[0,0,2,0,0],"nx":[1,1,2,1,1],"ny":[22,21,23,20,20],"nz":[0,0,0,0,-1]},{"size":5,"px":[14,21,19,21,20],"py":[13,8,20,10,7],"pz":[0,0,0,0,0],"nx":[16,0,14,23,1],"ny":[8,1,23,10,20],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[15,16,13,14,14],"py":[3,3,3,3,3],"pz":[0,0,0,0,-1],"nx":[18,19,18,9,17],"ny":[2,2,1,1,0],"nz":[0,0,0,1,0]},{"size":2,"px":[17,9],"py":[14,4],"pz":[0,-1],"nx":[9,18],"ny":[4,18],"nz":[1,0]},{"size":2,"px":[21,20],"py":[17,21],"pz":[0,0],"nx":[12,3],"ny":[17,10],"nz":[0,-1]},{"size":2,"px":[2,1],"py":[10,4],"pz":[1,2],"nx":[4,1],"ny":[10,5],"nz":[1,-1]},{"size":5,"px":[7,8,4,9,9],"py":[2,2,0,2,2],"pz":[0,0,1,0,-1],"nx":[5,5,4,6,3],"ny":[0,1,2,0,0],"nz":[0,0,0,0,1]},{"size":2,"px":[2,5],"py":[3,5],"pz":[2,-1],"nx":[3,2],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[0,0,0,0,0],"py":[0,1,3,4,4],"pz":[2,2,1,1,-1],"nx":[20,20,19,20,19],"ny":[21,20,23,19,22],"nz":[0,0,0,0,0]},{"size":2,"px":[9,18],"py":[8,16],"pz":[1,0],"nx":[14,6],"ny":[15,16],"nz":[0,-1]},{"size":3,"px":[3,4,7],"py":[3,3,9],"pz":[2,2,1],"nx":[8,9,7],"ny":[4,11,4],"nz":[1,-1,-1]},{"size":5,"px":[6,14,4,7,7],"py":[4,23,3,6,6],"pz":[1,0,2,1,-1],"nx":[2,0,2,1,3],"ny":[20,4,21,10,23],"nz":[0,2,0,1,0]},{"size":5,"px":[2,4,8,9,10],"py":[3,8,13,23,23],"pz":[2,1,0,0,0],"nx":[10,4,0,3,3],"ny":[21,3,0,3,23],"nz":[0,-1,-1,-1,-1]},{"size":3,"px":[11,10,11],"py":[6,5,5],"pz":[0,0,0],"nx":[14,6,1],"ny":[7,9,5],"nz":[0,1,-1]},{"size":5,"px":[11,11,11,11,6],"py":[11,12,10,13,6],"pz":[0,0,0,0,1],"nx":[9,13,13,13,4],"ny":[4,9,10,11,2],"nz":[1,0,0,0,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,11],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[1,2],"py":[4,11],"pz":[2,0],"nx":[8,8],"ny":[15,15],"nz":[0,-1]},{"size":5,"px":[12,12,13,12,12],"py":[10,11,13,12,12],"pz":[0,0,0,0,-1],"nx":[0,0,0,1,0],"ny":[13,2,12,5,14],"nz":[0,2,0,0,0]},{"size":5,"px":[0,0,0,1,1],"py":[4,3,11,15,13],"pz":[1,2,0,0,0],"nx":[2,3,3,1,0],"ny":[2,4,4,5,14],"nz":[2,1,-1,-1,-1]},{"size":2,"px":[4,11],"py":[12,10],"pz":[0,-1],"nx":[1,2],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[18,8,9,9,9],"py":[15,7,8,10,7],"pz":[0,1,1,1,1],"nx":[22,23,21,22,11],"ny":[20,16,23,19,9],"nz":[0,0,0,0,1]},{"size":5,"px":[14,12,13,14,15],"py":[1,0,0,0,1],"pz":[0,0,0,0,0],"nx":[4,9,4,7,7],"ny":[2,3,1,8,8],"nz":[2,1,2,1,-1]},{"size":2,"px":[13,9],"py":[14,19],"pz":[0,-1],"nx":[6,10],"ny":[0,2],"nz":[1,0]},{"size":2,"px":[13,12],"py":[4,4],"pz":[0,0],"nx":[3,3],"ny":[1,1],"nz":[2,-1]},{"size":3,"px":[14,5,5],"py":[18,3,4],"pz":[0,-1,-1],"nx":[8,7,8],"ny":[4,8,10],"nz":[1,1,1]},{"size":2,"px":[8,18],"py":[6,11],"pz":[1,0],"nx":[9,1],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[16,11],"py":[9,7],"pz":[0,0],"nx":[7,7],"ny":[4,4],"nz":[1,-1]},{"size":5,"px":[23,11,23,11,23],"py":[13,4,12,7,10],"pz":[0,1,0,1,0],"nx":[7,4,8,15,15],"ny":[9,2,4,8,8],"nz":[0,2,1,0,-1]},{"size":2,"px":[6,3],"py":[1,0],"pz":[0,1],"nx":[4,1],"ny":[1,2],"nz":[0,-1]},{"size":2,"px":[5,5],"py":[7,6],"pz":[0,1],"nx":[6,4],"ny":[9,11],"nz":[0,-1]},{"size":4,"px":[5,6,5,5],"py":[8,6,11,6],"pz":[1,1,1,0],"nx":[23,0,4,5],"ny":[0,2,2,1],"nz":[0,-1,-1,-1]},{"size":2,"px":[18,4],"py":[13,3],"pz":[0,-1],"nx":[15,4],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[4,0],"py":[8,0],"pz":[1,-1],"nx":[9,2],"ny":[15,5],"nz":[0,2]},{"size":5,"px":[15,15,16,14,14],"py":[0,1,1,0,0],"pz":[0,0,0,0,-1],"nx":[4,4,8,8,15],"ny":[4,5,4,11,23],"nz":[2,2,1,1,0]},{"size":4,"px":[12,11,3,14],"py":[14,22,1,0],"pz":[0,-1,-1,-1],"nx":[8,15,7,16],"ny":[2,3,1,3],"nz":[1,0,1,0]},{"size":2,"px":[5,12],"py":[6,17],"pz":[1,-1],"nx":[2,1],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[13,12,12,7,7],"py":[5,6,5,14,14],"pz":[0,0,0,0,-1],"nx":[10,3,10,1,10],"ny":[13,8,11,3,10],"nz":[0,0,0,1,0]},{"size":2,"px":[4,4],"py":[15,0],"pz":[0,-1],"nx":[4,4],"ny":[16,17],"nz":[0,0]},{"size":5,"px":[1,4,2,1,2],"py":[4,0,1,1,0],"pz":[1,1,1,2,1],"nx":[4,9,1,5,1],"ny":[3,4,4,5,5],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[10,3],"py":[3,1],"pz":[0,2],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[16,0],"py":[21,0],"pz":[0,-1],"nx":[6,8],"ny":[8,4],"nz":[1,1]},{"size":2,"px":[7,11],"py":[4,18],"pz":[0,-1],"nx":[5,7],"ny":[0,2],"nz":[2,0]},{"size":2,"px":[9,7],"py":[0,3],"pz":[1,-1],"nx":[20,10],"ny":[0,1],"nz":[0,1]},{"size":4,"px":[10,4,1,5],"py":[0,6,8,4],"pz":[1,-1,-1,-1],"nx":[6,15,4,14],"ny":[3,5,1,5],"nz":[1,0,2,0]},{"size":2,"px":[4,4],"py":[3,4],"pz":[2,2],"nx":[9,2],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[8,4],"py":[3,4],"pz":[0,-1],"nx":[8,6],"ny":[2,1],"nz":[0,0]},{"size":2,"px":[2,0],"py":[6,3],"pz":[1,2],"nx":[0,7],"ny":[7,8],"nz":[1,-1]},{"size":2,"px":[10,0],"py":[7,3],"pz":[1,-1],"nx":[15,4],"ny":[14,4],"nz":[0,2]},{"size":4,"px":[3,1,2,2],"py":[20,7,18,17],"pz":[0,1,0,0],"nx":[9,5,5,4],"ny":[5,4,18,4],"nz":[1,-1,-1,-1]},{"size":2,"px":[5,4],"py":[3,1],"pz":[2,-1],"nx":[23,23],"ny":[14,13],"nz":[0,0]},{"size":2,"px":[12,4],"py":[6,1],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":5,"px":[22,22,11,11,11],"py":[12,13,4,6,6],"pz":[0,0,1,1,-1],"nx":[4,4,4,4,3],"ny":[16,15,18,14,11],"nz":[0,0,0,0,1]},{"size":2,"px":[4,10],"py":[0,1],"pz":[1,0],"nx":[2,2],"ny":[2,2],"nz":[2,-1]},{"size":2,"px":[15,6],"py":[4,4],"pz":[0,-1],"nx":[15,4],"ny":[2,1],"nz":[0,2]},{"size":2,"px":[11,2],"py":[10,20],"pz":[0,-1],"nx":[4,9],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[4,19],"py":[3,8],"pz":[2,0],"nx":[8,21],"ny":[4,20],"nz":[1,-1]},{"size":5,"px":[4,6,7,6,2],"py":[6,15,13,14,3],"pz":[1,0,0,0,-1],"nx":[21,22,19,21,10],"ny":[6,12,0,3,2],"nz":[0,0,0,0,1]},{"size":5,"px":[8,12,15,14,13],"py":[0,0,0,0,0],"pz":[1,0,0,0,0],"nx":[4,3,1,3,4],"ny":[19,16,3,15,4],"nz":[0,0,2,0,1]},{"size":2,"px":[3,3],"py":[2,3],"pz":[2,2],"nx":[8,4],"ny":[4,1],"nz":[1,-1]},{"size":4,"px":[0,0,0,5],"py":[10,9,11,21],"pz":[1,1,-1,-1],"nx":[12,4,3,11],"ny":[3,1,1,3],"nz":[0,2,2,0]},{"size":2,"px":[3,1],"py":[0,0],"pz":[1,2],"nx":[1,4],"ny":[2,1],"nz":[1,-1]},{"size":5,"px":[2,5,1,0,1],"py":[14,23,7,5,9],"pz":[0,0,1,1,1],"nx":[0,0,7,9,11],"ny":[23,22,4,9,3],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[8,9],"py":[7,1],"pz":[1,-1],"nx":[8,8],"ny":[8,9],"nz":[1,1]},{"size":2,"px":[11,9],"py":[11,3],"pz":[1,-1],"nx":[3,2],"ny":[14,10],"nz":[0,1]},{"size":4,"px":[2,4,5,4],"py":[8,20,22,16],"pz":[1,0,0,0],"nx":[8,2,11,3],"ny":[7,4,15,4],"nz":[0,-1,-1,-1]},{"size":3,"px":[1,2,3],"py":[2,1,0],"pz":[0,0,0],"nx":[0,0,15],"ny":[1,0,11],"nz":[0,0,-1]},{"size":2,"px":[12,22],"py":[6,7],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":3,"px":[13,0,5],"py":[19,10,2],"pz":[0,-1,-1],"nx":[3,4,6],"ny":[5,5,9],"nz":[2,2,1]},{"size":2,"px":[8,15],"py":[8,22],"pz":[1,0],"nx":[7,4],"ny":[10,7],"nz":[1,-1]},{"size":2,"px":[10,10],"py":[7,6],"pz":[1,1],"nx":[10,1],"ny":[9,0],"nz":[1,-1]},{"size":2,"px":[9,11],"py":[4,3],"pz":[0,-1],"nx":[5,9],"ny":[0,1],"nz":[1,0]},{"size":5,"px":[14,13,14,12,15],"py":[1,2,2,2,2],"pz":[0,0,0,0,0],"nx":[4,8,4,7,4],"ny":[2,4,3,4,4],"nz":[2,1,2,1,-1]},{"size":3,"px":[13,8,2],"py":[14,5,8],"pz":[0,-1,-1],"nx":[6,8,9],"ny":[3,2,2],"nz":[0,0,0]},{"size":3,"px":[3,6,8],"py":[7,4,12],"pz":[1,1,0],"nx":[3,8,9],"ny":[5,2,2],"nz":[1,-1,-1]},{"size":2,"px":[13,4],"py":[16,3],"pz":[0,2],"nx":[13,7],"ny":[15,5],"nz":[0,-1]},{"size":2,"px":[3,0],"py":[7,9],"pz":[1,-1],"nx":[2,8],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[3,6,8,7,7],"py":[0,1,0,0,0],"pz":[1,0,0,0,-1],"nx":[7,9,4,3,4],"ny":[9,7,4,2,2],"nz":[1,1,1,2,2]},{"size":3,"px":[3,4,16],"py":[4,4,6],"pz":[1,2,0],"nx":[2,2,2],"ny":[0,0,1],"nz":[0,-1,-1]},{"size":2,"px":[0,0],"py":[1,0],"pz":[2,2],"nx":[5,5],"ny":[2,2],"nz":[1,-1]},{"size":2,"px":[9,3],"py":[7,20],"pz":[1,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[8,21],"py":[10,18],"pz":[0,-1],"nx":[9,4],"ny":[10,4],"nz":[0,1]},{"size":2,"px":[6,13],"py":[6,23],"pz":[1,-1],"nx":[10,10],"ny":[11,12],"nz":[0,0]},{"size":5,"px":[10,9,5,10,10],"py":[9,13,6,10,10],"pz":[0,0,1,0,-1],"nx":[21,21,21,10,21],"ny":[18,20,19,11,17],"nz":[0,0,0,1,0]},{"size":2,"px":[8,8],"py":[7,6],"pz":[1,1],"nx":[8,1],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[11,4],"py":[14,7],"pz":[0,-1],"nx":[13,13],"ny":[13,11],"nz":[0,0]},{"size":2,"px":[4,4],"py":[4,5],"pz":[2,2],"nx":[12,5],"ny":[16,2],"nz":[0,-1]},{"size":3,"px":[1,3,20],"py":[3,9,2],"pz":[2,-1,-1],"nx":[0,0,0],"ny":[7,4,13],"nz":[1,2,0]},{"size":2,"px":[0,0],"py":[4,2],"pz":[1,2],"nx":[1,0],"ny":[4,4],"nz":[1,-1]},{"size":3,"px":[8,9,11],"py":[2,1,2],"pz":[0,0,0],"nx":[2,2,0],"ny":[2,2,13],"nz":[2,-1,-1]},{"size":2,"px":[1,10],"py":[23,5],"pz":[0,-1],"nx":[3,6],"ny":[1,1],"nz":[2,1]},{"size":4,"px":[13,6,3,4],"py":[8,6,4,2],"pz":[0,-1,-1,-1],"nx":[1,1,1,4],"ny":[9,7,8,20],"nz":[1,1,1,0]},{"size":5,"px":[11,4,4,10,3],"py":[9,16,13,12,7],"pz":[0,0,0,0,0],"nx":[7,11,3,17,4],"ny":[8,11,9,0,4],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[6,6],"py":[6,8],"pz":[1,-1],"nx":[0,0],"ny":[1,2],"nz":[2,2]},{"size":2,"px":[10,5],"py":[7,2],"pz":[0,-1],"nx":[4,13],"ny":[5,9],"nz":[2,0]},{"size":2,"px":[10,5],"py":[8,2],"pz":[1,-1],"nx":[16,4],"ny":[14,5],"nz":[0,2]},{"size":2,"px":[1,1],"py":[16,15],"pz":[0,0],"nx":[1,20],"ny":[23,1],"nz":[0,-1]},{"size":2,"px":[2,3],"py":[4,7],"pz":[2,1],"nx":[2,3],"ny":[5,4],"nz":[2,-1]},{"size":2,"px":[19,8],"py":[5,4],"pz":[0,-1],"nx":[10,10],"ny":[1,3],"nz":[1,1]},{"size":2,"px":[21,21],"py":[18,16],"pz":[0,0],"nx":[10,3],"ny":[17,5],"nz":[0,-1]},{"size":2,"px":[9,2],"py":[23,4],"pz":[0,2],"nx":[5,11],"ny":[3,7],"nz":[2,1]},{"size":2,"px":[7,0],"py":[3,2],"pz":[0,-1],"nx":[3,6],"ny":[1,1],"nz":[1,0]},{"size":4,"px":[5,9,8,9],"py":[8,12,13,18],"pz":[0,0,0,0],"nx":[6,5,2,5],"ny":[8,4,7,11],"nz":[0,-1,-1,-1]},{"size":2,"px":[7,2],"py":[0,0],"pz":[0,2],"nx":[5,5],"ny":[3,4],"nz":[1,-1]},{"size":2,"px":[11,11],"py":[12,13],"pz":[0,0],"nx":[9,1],"ny":[14,3],"nz":[0,-1]},{"size":5,"px":[8,16,9,4,15],"py":[11,13,8,4,12],"pz":[1,0,1,2,0],"nx":[3,3,3,3,4],"ny":[4,2,1,3,0],"nz":[0,0,0,0,0]},{"size":2,"px":[9,5],"py":[7,6],"pz":[1,-1],"nx":[19,8],"ny":[17,11],"nz":[0,1]},{"size":5,"px":[14,15,12,13,13],"py":[2,2,2,2,2],"pz":[0,0,0,0,-1],"nx":[20,9,19,20,4],"ny":[14,2,5,15,1],"nz":[0,1,0,0,2]},{"size":2,"px":[18,8],"py":[20,7],"pz":[0,1],"nx":[4,9],"ny":[2,2],"nz":[2,-1]},{"size":2,"px":[6,3],"py":[11,5],"pz":[1,2],"nx":[13,19],"ny":[20,20],"nz":[0,-1]},{"size":3,"px":[12,11,3],"py":[20,20,5],"pz":[0,0,-1],"nx":[11,12,6],"ny":[21,21,10],"nz":[0,0,1]},{"size":2,"px":[3,6],"py":[7,14],"pz":[1,0],"nx":[3,13],"ny":[4,8],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[5,9],"pz":[2,1],"nx":[2,11],"ny":[8,6],"nz":[1,-1]},{"size":2,"px":[2,2],"py":[5,5],"pz":[1,-1],"nx":[0,0],"ny":[6,3],"nz":[1,2]},{"size":2,"px":[11,23],"py":[5,9],"pz":[1,0],"nx":[8,2],"ny":[11,0],"nz":[0,-1]},{"size":2,"px":[11,23],"py":[12,9],"pz":[0,-1],"nx":[11,22],"ny":[10,21],"nz":[1,0]},{"size":2,"px":[12,12],"py":[7,7],"pz":[0,-1],"nx":[5,4],"ny":[7,10],"nz":[1,1]},{"size":2,"px":[9,8],"py":[18,1],"pz":[0,-1],"nx":[5,4],"ny":[8,10],"nz":[1,1]},{"size":2,"px":[16,17],"py":[11,11],"pz":[0,0],"nx":[15,2],"ny":[9,4],"nz":[0,-1]},{"size":2,"px":[0,1],"py":[3,0],"pz":[2,-1],"nx":[9,10],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[13,13],"py":[20,21],"pz":[0,-1],"nx":[2,2],"ny":[6,5],"nz":[1,1]},{"size":5,"px":[20,20,4,18,19],"py":[17,16,5,22,20],"pz":[0,0,2,0,0],"nx":[8,11,5,6,2],"ny":[10,15,11,10,1],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[11,11],"py":[4,4],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":3,"px":[6,5,6],"py":[8,10,10],"pz":[1,1,1],"nx":[11,8,22],"ny":[19,2,15],"nz":[0,-1,-1]},{"size":3,"px":[5,2,13],"py":[7,10,10],"pz":[1,-1,-1],"nx":[11,11,23],"ny":[8,9,14],"nz":[1,1,0]},{"size":5,"px":[3,6,1,5,10],"py":[7,14,1,9,2],"pz":[1,-1,-1,-1,-1],"nx":[11,0,1,5,1],"ny":[14,12,18,5,19],"nz":[0,0,0,1,0]},{"size":3,"px":[21,21,10],"py":[16,17,10],"pz":[0,0,1],"nx":[5,5,1],"ny":[9,9,18],"nz":[1,-1,-1]},{"size":2,"px":[6,21],"py":[6,17],"pz":[1,-1],"nx":[20,10],"ny":[7,4],"nz":[0,1]},{"size":2,"px":[10,11],"py":[0,0],"pz":[1,-1],"nx":[6,13],"ny":[2,4],"nz":[1,0]},{"size":4,"px":[4,4,7,9],"py":[3,4,10,3],"pz":[2,2,1,1],"nx":[21,2,15,5],"ny":[0,0,0,2],"nz":[0,-1,-1,-1]},{"size":3,"px":[11,11,11],"py":[7,6,9],"pz":[1,1,1],"nx":[23,4,9],"ny":[23,5,6],"nz":[0,-1,-1]},{"size":2,"px":[14,15],"py":[1,1],"pz":[0,0],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[11,23,11,23,23],"py":[11,22,10,21,20],"pz":[1,0,1,0,0],"nx":[10,9,19,10,10],"ny":[10,11,20,9,9],"nz":[1,1,0,1,-1]},{"size":2,"px":[7,23],"py":[13,22],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[12,1],"py":[19,0],"pz":[0,-1],"nx":[11,12],"ny":[22,17],"nz":[0,0]},{"size":2,"px":[10,8],"py":[4,3],"pz":[1,-1],"nx":[5,23],"ny":[2,7],"nz":[2,0]},{"size":2,"px":[9,10],"py":[6,20],"pz":[1,-1],"nx":[8,8],"ny":[4,6],"nz":[1,1]}],"alpha":[-1.135386e+00,1.135386e+00,-9.090800e-01,9.090800e-01,-5.913780e-01,5.913780e-01,-5.556534e-01,5.556534e-01,-5.084150e-01,5.084150e-01,-4.464489e-01,4.464489e-01,-4.463241e-01,4.463241e-01,-4.985226e-01,4.985226e-01,-4.424638e-01,4.424638e-01,-4.300093e-01,4.300093e-01,-4.231341e-01,4.231341e-01,-4.087428e-01,4.087428e-01,-3.374480e-01,3.374480e-01,-3.230151e-01,3.230151e-01,-3.084427e-01,3.084427e-01,-3.235494e-01,3.235494e-01,-2.589281e-01,2.589281e-01,-2.970292e-01,2.970292e-01,-2.957065e-01,2.957065e-01,-3.997619e-01,3.997619e-01,-3.535901e-01,3.535901e-01,-2.725396e-01,2.725396e-01,-2.649725e-01,2.649725e-01,-3.103888e-01,3.103888e-01,-3.117775e-01,3.117775e-01,-2.589620e-01,2.589620e-01,-2.689202e-01,2.689202e-01,-2.127024e-01,2.127024e-01,-2.436322e-01,2.436322e-01,-3.120574e-01,3.120574e-01,-2.786010e-01,2.786010e-01,-2.649072e-01,2.649072e-01,-2.766509e-01,2.766509e-01,-2.367237e-01,2.367237e-01,-2.658049e-01,2.658049e-01,-2.103463e-01,2.103463e-01,-1.911522e-01,1.911522e-01,-2.535425e-01,2.535425e-01,-2.434696e-01,2.434696e-01,-2.180788e-01,2.180788e-01,-2.496873e-01,2.496873e-01,-2.700969e-01,2.700969e-01,-2.565479e-01,2.565479e-01,-2.737741e-01,2.737741e-01,-1.675507e-01,1.675507e-01,-2.551417e-01,2.551417e-01,-2.067648e-01,2.067648e-01,-1.636834e-01,1.636834e-01,-2.129306e-01,2.129306e-01,-1.656758e-01,1.656758e-01,-1.919369e-01,1.919369e-01,-2.031763e-01,2.031763e-01,-2.062327e-01,2.062327e-01,-2.577950e-01,2.577950e-01,-2.951823e-01,2.951823e-01,-2.023160e-01,2.023160e-01,-2.022234e-01,2.022234e-01,-2.132906e-01,2.132906e-01,-1.653278e-01,1.653278e-01,-1.648474e-01,1.648474e-01,-1.593352e-01,1.593352e-01,-1.735650e-01,1.735650e-01,-1.688778e-01,1.688778e-01,-1.519705e-01,1.519705e-01,-1.812202e-01,1.812202e-01,-1.967481e-01,1.967481e-01,-1.852954e-01,1.852954e-01,-2.317780e-01,2.317780e-01,-2.036251e-01,2.036251e-01,-1.609324e-01,1.609324e-01,-2.160205e-01,2.160205e-01,-2.026190e-01,2.026190e-01,-1.854761e-01,1.854761e-01,-1.832038e-01,1.832038e-01,-2.001141e-01,2.001141e-01,-1.418333e-01,1.418333e-01,-1.704773e-01,1.704773e-01,-1.586261e-01,1.586261e-01,-1.587582e-01,1.587582e-01,-1.899489e-01,1.899489e-01,-1.477160e-01,1.477160e-01,-2.260467e-01,2.260467e-01,-2.393598e-01,2.393598e-01,-1.582373e-01,1.582373e-01,-1.702498e-01,1.702498e-01,-1.737398e-01,1.737398e-01,-1.462529e-01,1.462529e-01,-1.396517e-01,1.396517e-01,-1.629625e-01,1.629625e-01,-1.446933e-01,1.446933e-01,-1.811657e-01,1.811657e-01,-1.336427e-01,1.336427e-01,-1.924813e-01,1.924813e-01,-1.457520e-01,1.457520e-01,-1.600259e-01,1.600259e-01,-1.297000e-01,1.297000e-01,-2.076199e-01,2.076199e-01,-1.510060e-01,1.510060e-01,-1.914568e-01,1.914568e-01,-2.138162e-01,2.138162e-01,-1.856916e-01,1.856916e-01,-1.843047e-01,1.843047e-01,-1.526846e-01,1.526846e-01,-1.328320e-01,1.328320e-01,-1.751311e-01,1.751311e-01,-1.643908e-01,1.643908e-01,-1.482706e-01,1.482706e-01,-1.622298e-01,1.622298e-01,-1.884979e-01,1.884979e-01,-1.633604e-01,1.633604e-01,-1.554166e-01,1.554166e-01,-1.405332e-01,1.405332e-01,-1.772398e-01,1.772398e-01,-1.410008e-01,1.410008e-01,-1.362301e-01,1.362301e-01,-1.709087e-01,1.709087e-01,-1.584613e-01,1.584613e-01,-1.188814e-01,1.188814e-01,-1.423888e-01,1.423888e-01,-1.345565e-01,1.345565e-01,-1.835986e-01,1.835986e-01,-1.445329e-01,1.445329e-01,-1.385826e-01,1.385826e-01,-1.558917e-01,1.558917e-01,-1.476053e-01,1.476053e-01,-1.370722e-01,1.370722e-01,-2.362666e-01,2.362666e-01,-2.907774e-01,2.907774e-01,-1.656360e-01,1.656360e-01,-1.644407e-01,1.644407e-01,-1.443394e-01,1.443394e-01,-1.438823e-01,1.438823e-01,-1.476964e-01,1.476964e-01,-1.956593e-01,1.956593e-01,-2.417519e-01,2.417519e-01,-1.659315e-01,1.659315e-01,-1.466254e-01,1.466254e-01,-2.034909e-01,2.034909e-01,-2.128771e-01,2.128771e-01,-1.665429e-01,1.665429e-01,-1.387131e-01,1.387131e-01,-1.298823e-01,1.298823e-01,-1.329495e-01,1.329495e-01,-1.769587e-01,1.769587e-01,-1.366530e-01,1.366530e-01,-1.254359e-01,1.254359e-01,-1.673022e-01,1.673022e-01,-1.602519e-01,1.602519e-01,-1.897245e-01,1.897245e-01,-1.893579e-01,1.893579e-01,-1.579350e-01,1.579350e-01,-1.472589e-01,1.472589e-01,-1.614193e-01,1.614193e-01]},{"count":203,"threshold":-4.769677e+00,"feature":[{"size":5,"px":[12,5,14,9,7],"py":[9,13,3,1,3],"pz":[0,0,0,0,0],"nx":[1,0,5,14,9],"ny":[5,3,8,8,9],"nz":[2,0,1,0,0]},{"size":5,"px":[14,13,11,17,12],"py":[2,2,4,13,3],"pz":[0,0,0,0,0],"nx":[7,22,8,23,22],"ny":[8,15,11,12,3],"nz":[1,0,1,0,0]},{"size":5,"px":[9,11,11,11,16],"py":[4,8,7,9,12],"pz":[0,0,0,0,0],"nx":[4,8,14,9,9],"ny":[4,4,8,8,8],"nz":[1,1,0,0,-1]},{"size":5,"px":[6,12,12,8,3],"py":[11,7,8,10,2],"pz":[0,0,0,0,2],"nx":[8,4,4,4,0],"ny":[4,4,4,11,0],"nz":[1,1,-1,-1,-1]},{"size":5,"px":[19,17,18,9,9],"py":[3,2,3,1,1],"pz":[0,0,0,1,-1],"nx":[21,21,10,22,22],"ny":[1,2,0,4,3],"nz":[0,0,1,0,0]},{"size":2,"px":[4,7],"py":[4,6],"pz":[2,1],"nx":[8,7],"ny":[4,10],"nz":[1,1]},{"size":5,"px":[14,17,17,13,12],"py":[18,15,16,18,18],"pz":[0,0,0,0,0],"nx":[13,19,5,20,6],"ny":[16,4,1,19,0],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[6,7,4,5,5],"py":[15,23,6,12,16],"pz":[0,0,1,0,0],"nx":[3,14,14,6,6],"ny":[4,11,11,9,0],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[16,9,6,3,11],"py":[2,2,5,3,2],"pz":[0,0,1,2,0],"nx":[3,4,2,5,5],"ny":[4,11,2,8,8],"nz":[1,1,2,1,-1]},{"size":5,"px":[6,1,5,3,3],"py":[14,4,15,7,7],"pz":[0,2,0,1,-1],"nx":[0,0,1,1,1],"ny":[7,8,18,17,5],"nz":[1,1,0,0,2]},{"size":5,"px":[12,12,9,5,3],"py":[14,14,0,3,7],"pz":[0,-1,-1,-1,-1],"nx":[7,7,14,8,13],"ny":[7,8,13,10,10],"nz":[1,1,0,1,0]},{"size":2,"px":[3,4],"py":[7,9],"pz":[1,-1],"nx":[2,4],"ny":[5,4],"nz":[2,1]},{"size":3,"px":[10,21,17],"py":[7,11,23],"pz":[1,0,0],"nx":[21,9,3],"ny":[23,5,5],"nz":[0,-1,-1]},{"size":5,"px":[8,11,9,10,11],"py":[2,0,1,1,2],"pz":[0,0,0,0,0],"nx":[4,5,6,4,3],"ny":[8,4,18,7,4],"nz":[1,1,0,1,-1]},{"size":5,"px":[20,22,3,19,10],"py":[20,9,4,22,3],"pz":[0,0,2,0,1],"nx":[8,20,8,3,2],"ny":[4,3,6,4,3],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[4,4],"py":[8,7],"pz":[1,1],"nx":[9,2],"ny":[15,5],"nz":[0,-1]},{"size":2,"px":[11,13],"py":[13,4],"pz":[0,-1],"nx":[20,21],"ny":[1,4],"nz":[0,0]},{"size":5,"px":[1,2,7,6,8],"py":[0,2,3,3,3],"pz":[2,1,0,0,0],"nx":[1,2,1,1,1],"ny":[0,0,4,3,3],"nz":[1,0,0,0,-1]},{"size":2,"px":[3,10],"py":[9,11],"pz":[0,0],"nx":[6,3],"ny":[9,2],"nz":[0,-1]},{"size":5,"px":[12,12,12,12,6],"py":[10,11,13,12,6],"pz":[0,0,0,0,-1],"nx":[10,2,1,10,10],"ny":[10,4,2,11,9],"nz":[0,1,2,0,0]},{"size":5,"px":[16,18,11,17,15],"py":[11,12,8,12,11],"pz":[0,0,0,0,0],"nx":[14,0,19,0,10],"ny":[9,3,14,8,9],"nz":[0,-1,-1,-1,-1]},{"size":4,"px":[5,9,5,8],"py":[21,18,20,23],"pz":[0,0,0,0],"nx":[8,4,3,1],"ny":[20,3,4,3],"nz":[0,-1,-1,-1]},{"size":2,"px":[2,3],"py":[3,2],"pz":[2,2],"nx":[3,12],"ny":[4,23],"nz":[1,-1]},{"size":5,"px":[0,1,1,1,1],"py":[2,16,14,13,12],"pz":[2,0,0,0,0],"nx":[8,4,9,4,7],"ny":[9,3,4,2,9],"nz":[1,2,1,2,1]},{"size":2,"px":[4,9],"py":[3,7],"pz":[2,-1],"nx":[4,9],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[15,16,17,15,8],"py":[3,3,3,18,1],"pz":[0,0,0,0,1],"nx":[1,2,2,1,3],"ny":[5,3,2,6,0],"nz":[0,0,0,0,0]},{"size":2,"px":[4,17],"py":[4,14],"pz":[2,0],"nx":[15,7],"ny":[15,10],"nz":[0,-1]},{"size":3,"px":[14,12,3],"py":[3,13,3],"pz":[0,-1,-1],"nx":[4,17,4],"ny":[3,19,4],"nz":[2,0,2]},{"size":4,"px":[4,5,12,2],"py":[9,6,19,4],"pz":[1,1,0,2],"nx":[12,17,4,4],"ny":[18,19,4,4],"nz":[0,-1,-1,-1]},{"size":5,"px":[10,19,20,20,19],"py":[7,14,13,14,13],"pz":[1,0,0,0,-1],"nx":[11,23,23,23,23],"ny":[9,15,13,16,14],"nz":[1,0,0,0,0]},{"size":4,"px":[0,0,0,2],"py":[5,6,5,14],"pz":[1,1,2,0],"nx":[0,3,3,17],"ny":[23,5,5,9],"nz":[0,-1,-1,-1]},{"size":2,"px":[15,4],"py":[23,5],"pz":[0,2],"nx":[9,3],"ny":[4,4],"nz":[1,-1]},{"size":4,"px":[6,5,10,12],"py":[3,3,23,23],"pz":[1,1,0,0],"nx":[11,1,1,4],"ny":[21,3,5,5],"nz":[0,-1,-1,-1]},{"size":2,"px":[5,2],"py":[9,4],"pz":[1,2],"nx":[4,9],"ny":[4,2],"nz":[1,-1]},{"size":5,"px":[23,23,23,23,23],"py":[14,9,13,11,12],"pz":[0,0,0,0,0],"nx":[6,13,7,8,8],"ny":[9,6,3,3,3],"nz":[1,0,1,1,-1]},{"size":2,"px":[10,3],"py":[4,5],"pz":[0,-1],"nx":[3,8],"ny":[1,3],"nz":[2,1]},{"size":2,"px":[3,12],"py":[4,18],"pz":[2,0],"nx":[12,0],"ny":[16,3],"nz":[0,-1]},{"size":2,"px":[16,2],"py":[4,4],"pz":[0,-1],"nx":[16,4],"ny":[1,0],"nz":[0,2]},{"size":2,"px":[3,4],"py":[7,1],"pz":[1,-1],"nx":[5,3],"ny":[19,9],"nz":[0,1]},{"size":4,"px":[20,19,20,21],"py":[2,0,1,3],"pz":[0,0,0,0],"nx":[11,5,23,11],"ny":[0,0,1,1],"nz":[1,2,0,1]},{"size":2,"px":[12,13],"py":[7,5],"pz":[0,0],"nx":[8,5],"ny":[3,5],"nz":[1,-1]},{"size":5,"px":[22,21,22,22,22],"py":[20,22,18,19,16],"pz":[0,0,0,0,0],"nx":[2,3,3,15,15],"ny":[4,5,4,7,7],"nz":[1,2,1,0,-1]},{"size":3,"px":[15,14,14],"py":[1,1,1],"pz":[0,0,-1],"nx":[17,18,16],"ny":[1,2,1],"nz":[0,0,0]},{"size":4,"px":[17,16,16,15],"py":[2,1,0,0],"pz":[0,0,0,0],"nx":[7,4,2,11],"ny":[11,2,1,4],"nz":[1,2,-1,-1]},{"size":4,"px":[18,0,0,0],"py":[14,6,5,4],"pz":[0,-1,-1,-1],"nx":[19,19,19,19],"ny":[16,19,17,18],"nz":[0,0,0,0]},{"size":4,"px":[11,5,5,0],"py":[14,1,4,4],"pz":[0,-1,-1,-1],"nx":[11,8,2,15],"ny":[17,14,1,9],"nz":[0,0,2,0]},{"size":2,"px":[4,5],"py":[19,21],"pz":[0,0],"nx":[10,2],"ny":[15,4],"nz":[0,-1]},{"size":2,"px":[6,4],"py":[4,6],"pz":[1,1],"nx":[3,3],"ny":[4,5],"nz":[1,-1]},{"size":2,"px":[2,7],"py":[1,13],"pz":[2,0],"nx":[7,2],"ny":[1,4],"nz":[1,-1]},{"size":4,"px":[15,10,4,7],"py":[23,3,1,7],"pz":[0,1,2,1],"nx":[0,4,1,1],"ny":[0,2,0,-1900147915],"nz":[0,-1,-1,-1]},{"size":2,"px":[7,2],"py":[12,11],"pz":[0,-1],"nx":[2,4],"ny":[2,5],"nz":[2,1]},{"size":5,"px":[0,0,0,1,0],"py":[9,4,3,2,6],"pz":[0,1,2,1,1],"nx":[9,4,2,16,16],"ny":[7,4,2,8,8],"nz":[0,1,2,0,-1]},{"size":5,"px":[18,4,9,4,4],"py":[12,5,6,3,4],"pz":[0,2,1,2,-1],"nx":[4,3,3,2,3],"ny":[23,19,21,16,18],"nz":[0,0,0,0,0]},{"size":2,"px":[6,6],"py":[14,13],"pz":[0,0],"nx":[3,10],"ny":[4,7],"nz":[1,-1]},{"size":5,"px":[3,4,4,2,2],"py":[8,11,7,4,4],"pz":[1,1,1,2,-1],"nx":[20,18,19,20,19],"ny":[4,0,2,3,1],"nz":[0,0,0,0,0]},{"size":5,"px":[17,12,14,8,16],"py":[2,0,0,0,0],"pz":[0,0,0,1,0],"nx":[3,15,3,2,2],"ny":[2,9,7,2,2],"nz":[2,0,1,2,-1]},{"size":5,"px":[11,10,11,11,11],"py":[10,12,11,12,12],"pz":[0,0,0,0,-1],"nx":[13,13,20,10,13],"ny":[9,11,8,4,10],"nz":[0,0,0,1,0]},{"size":2,"px":[8,16],"py":[7,13],"pz":[1,0],"nx":[8,13],"ny":[4,11],"nz":[1,-1]},{"size":2,"px":[6,7],"py":[20,3],"pz":[0,-1],"nx":[3,4],"ny":[10,10],"nz":[1,1]},{"size":3,"px":[13,10,17],"py":[9,3,5],"pz":[0,-1,-1],"nx":[1,3,1],"ny":[5,16,6],"nz":[2,0,1]},{"size":2,"px":[0,0],"py":[5,5],"pz":[2,-1],"nx":[8,3],"ny":[14,10],"nz":[0,1]},{"size":4,"px":[11,9,12,10],"py":[2,2,2,2],"pz":[0,0,0,0],"nx":[4,4,4,10],"ny":[5,5,0,16],"nz":[1,-1,-1,-1]},{"size":3,"px":[7,9,12],"py":[2,2,2],"pz":[1,-1,-1],"nx":[4,7,2],"ny":[3,1,0],"nz":[0,0,2]},{"size":2,"px":[2,4],"py":[3,12],"pz":[2,0],"nx":[7,4],"ny":[6,5],"nz":[1,2]},{"size":4,"px":[12,12,6,3],"py":[12,11,21,7],"pz":[0,0,-1,-1],"nx":[1,0,0,0],"ny":[13,3,6,5],"nz":[0,2,1,1]},{"size":3,"px":[3,1,3],"py":[21,8,18],"pz":[0,1,0],"nx":[11,20,0],"ny":[17,17,6],"nz":[0,-1,-1]},{"size":2,"px":[2,8],"py":[3,12],"pz":[2,0],"nx":[2,20],"ny":[4,17],"nz":[1,-1]},{"size":5,"px":[2,3,4,3,2],"py":[10,14,14,15,13],"pz":[1,0,0,0,0],"nx":[0,0,1,0,0],"ny":[21,20,23,19,19],"nz":[0,0,0,0,-1]},{"size":2,"px":[2,15],"py":[7,4],"pz":[1,-1],"nx":[3,8],"ny":[4,14],"nz":[1,0]},{"size":5,"px":[19,14,12,15,4],"py":[8,12,10,16,2],"pz":[0,0,0,0,2],"nx":[8,0,12,4,0],"ny":[4,1,12,2,19],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[18,9],"py":[15,3],"pz":[0,-1],"nx":[8,15],"ny":[9,14],"nz":[1,0]},{"size":5,"px":[4,2,3,4,9],"py":[9,4,3,8,23],"pz":[1,2,1,1,0],"nx":[11,23,23,11,11],"ny":[0,2,3,1,1],"nz":[1,0,0,1,-1]},{"size":2,"px":[6,7],"py":[1,1],"pz":[0,0],"nx":[3,4],"ny":[10,5],"nz":[1,-1]},{"size":4,"px":[11,9,8,5],"py":[12,15,13,3],"pz":[0,-1,-1,-1],"nx":[3,12,14,13],"ny":[0,3,3,3],"nz":[2,0,0,0]},{"size":2,"px":[11,11],"py":[6,5],"pz":[0,0],"nx":[8,11],"ny":[4,20],"nz":[1,-1]},{"size":5,"px":[21,20,21,21,21],"py":[18,21,17,19,19],"pz":[0,0,0,0,-1],"nx":[2,5,4,4,5],"ny":[5,12,11,10,10],"nz":[1,0,0,0,0]},{"size":5,"px":[1,1,1,1,1],"py":[10,11,7,9,8],"pz":[0,0,0,0,0],"nx":[11,23,23,23,23],"ny":[10,20,21,19,19],"nz":[1,0,0,0,-1]},{"size":5,"px":[7,8,7,3,1],"py":[14,13,13,2,2],"pz":[0,0,-1,-1,-1],"nx":[1,10,2,2,10],"ny":[2,13,4,16,12],"nz":[2,0,1,0,0]},{"size":2,"px":[17,18],"py":[12,12],"pz":[0,0],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[17,0],"py":[5,20],"pz":[0,-1],"nx":[4,9],"ny":[0,2],"nz":[2,1]},{"size":5,"px":[22,22,22,11,23],"py":[16,15,14,6,13],"pz":[0,0,0,1,0],"nx":[16,15,7,9,9],"ny":[15,8,4,10,10],"nz":[0,0,1,1,-1]},{"size":2,"px":[13,3],"py":[3,1],"pz":[0,2],"nx":[8,3],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[5,6],"py":[4,1],"pz":[1,-1],"nx":[6,3],"ny":[4,2],"nz":[1,2]},{"size":3,"px":[4,2,6],"py":[6,3,4],"pz":[1,2,1],"nx":[10,0,4],"ny":[9,4,3],"nz":[0,-1,-1]},{"size":4,"px":[2,8,4,10],"py":[4,23,7,23],"pz":[2,0,1,0],"nx":[9,4,11,9],"ny":[21,5,16,0],"nz":[0,-1,-1,-1]},{"size":2,"px":[6,3],"py":[13,0],"pz":[0,-1],"nx":[8,2],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[3,3],"py":[1,4],"pz":[1,-1],"nx":[3,5],"ny":[0,1],"nz":[1,0]},{"size":2,"px":[7,2],"py":[0,0],"pz":[0,2],"nx":[2,10],"ny":[1,6],"nz":[2,0]},{"size":2,"px":[10,2],"py":[7,0],"pz":[1,-1],"nx":[21,5],"ny":[15,4],"nz":[0,2]},{"size":2,"px":[1,1],"py":[10,9],"pz":[0,0],"nx":[0,3],"ny":[13,11],"nz":[0,-1]},{"size":2,"px":[11,9],"py":[13,0],"pz":[0,-1],"nx":[3,3],"ny":[4,3],"nz":[1,1]},{"size":5,"px":[14,13,13,14,14],"py":[12,10,11,13,13],"pz":[0,0,0,0,-1],"nx":[9,8,4,5,7],"ny":[4,4,2,2,4],"nz":[0,0,1,1,0]},{"size":3,"px":[2,4,1],"py":[2,0,0],"pz":[0,0,1],"nx":[0,7,4],"ny":[0,3,2],"nz":[1,-1,-1]},{"size":2,"px":[11,4],"py":[5,0],"pz":[0,-1],"nx":[8,6],"ny":[4,9],"nz":[1,1]},{"size":3,"px":[0,0,0],"py":[20,2,4],"pz":[0,-1,-1],"nx":[12,3,10],"ny":[3,1,3],"nz":[0,2,0]},{"size":5,"px":[5,11,10,13,13],"py":[0,0,0,2,2],"pz":[1,0,0,0,-1],"nx":[4,5,5,4,5],"ny":[14,0,2,6,1],"nz":[0,0,0,0,0]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,11],"ny":[4,1],"nz":[1,-1]},{"size":2,"px":[14,-1715597992],"py":[19,9],"pz":[0,-1],"nx":[7,14],"ny":[10,17],"nz":[1,0]},{"size":2,"px":[11,1],"py":[9,0],"pz":[0,-1],"nx":[1,12],"ny":[2,10],"nz":[2,0]},{"size":2,"px":[17,9],"py":[13,17],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[0,7],"py":[1,9],"pz":[1,-1],"nx":[18,4],"ny":[14,2],"nz":[0,2]},{"size":2,"px":[14,7],"py":[23,9],"pz":[0,-1],"nx":[4,8],"ny":[5,10],"nz":[2,1]},{"size":2,"px":[8,7],"py":[17,9],"pz":[0,-1],"nx":[3,2],"ny":[0,3],"nz":[0,0]},{"size":2,"px":[13,4],"py":[20,1],"pz":[0,-1],"nx":[5,3],"ny":[21,17],"nz":[0,0]},{"size":3,"px":[0,0,1],"py":[3,6,15],"pz":[2,1,0],"nx":[10,8,3],"ny":[6,4,2],"nz":[0,-1,-1]},{"size":2,"px":[8,8],"py":[18,8],"pz":[0,-1],"nx":[5,4],"ny":[8,10],"nz":[1,1]},{"size":2,"px":[6,5],"py":[2,2],"pz":[1,1],"nx":[8,9],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[6,3],"py":[11,5],"pz":[1,2],"nx":[13,3],"ny":[19,2],"nz":[0,-1]},{"size":2,"px":[4,6],"py":[1,11],"pz":[2,-1],"nx":[3,2],"ny":[1,0],"nz":[1,2]},{"size":2,"px":[9,4],"py":[10,5],"pz":[1,2],"nx":[8,4],"ny":[10,4],"nz":[1,-1]},{"size":2,"px":[12,12],"py":[11,20],"pz":[0,-1],"nx":[0,0],"ny":[6,10],"nz":[1,0]},{"size":2,"px":[7,12],"py":[2,20],"pz":[0,-1],"nx":[2,2],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[0,15],"py":[5,21],"pz":[1,-1],"nx":[10,9],"ny":[3,3],"nz":[0,1]},{"size":2,"px":[15,9],"py":[1,0],"pz":[0,1],"nx":[19,3],"ny":[0,3],"nz":[0,-1]},{"size":2,"px":[21,5],"py":[13,5],"pz":[0,2],"nx":[23,6],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[5,8],"py":[3,1],"pz":[2,-1],"nx":[9,9],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[2,2],"py":[7,7],"pz":[1,-1],"nx":[5,3],"ny":[23,17],"nz":[0,0]},{"size":2,"px":[11,3],"py":[6,4],"pz":[0,-1],"nx":[2,4],"ny":[2,4],"nz":[2,1]},{"size":3,"px":[14,0,17],"py":[20,3,21],"pz":[0,-1,-1],"nx":[11,11,11],"ny":[7,9,10],"nz":[1,1,1]},{"size":5,"px":[11,11,23,23,12],"py":[10,11,21,20,12],"pz":[1,1,0,0,0],"nx":[8,3,6,7,7],"ny":[4,5,11,11,11],"nz":[1,2,1,1,-1]},{"size":2,"px":[11,11],"py":[11,10],"pz":[0,0],"nx":[9,3],"ny":[2,5],"nz":[1,-1]},{"size":2,"px":[12,14],"py":[19,19],"pz":[0,0],"nx":[12,13],"ny":[18,17],"nz":[0,-1]},{"size":5,"px":[13,14,12,15,14],"py":[0,0,1,1,1],"pz":[0,0,0,0,0],"nx":[4,8,4,7,7],"ny":[3,4,2,5,5],"nz":[2,1,2,1,-1]},{"size":2,"px":[17,5],"py":[10,2],"pz":[0,-1],"nx":[4,9],"ny":[2,3],"nz":[2,1]},{"size":2,"px":[18,10],"py":[6,10],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[8,18,8,4,16],"py":[6,12,9,4,13],"pz":[1,0,1,2,0],"nx":[3,4,3,5,5],"ny":[0,2,3,1,1],"nz":[1,0,0,0,-1]},{"size":2,"px":[3,6],"py":[2,4],"pz":[2,1],"nx":[8,0],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[4,5],"pz":[2,-1],"nx":[4,2],"ny":[14,7],"nz":[0,1]},{"size":4,"px":[3,4,4,3],"py":[11,12,12,2],"pz":[0,0,-1,-1],"nx":[1,2,1,2],"ny":[11,14,12,16],"nz":[0,0,0,0]},{"size":2,"px":[6,0],"py":[11,0],"pz":[0,-1],"nx":[3,4],"ny":[4,5],"nz":[1,1]},{"size":2,"px":[3,2],"py":[21,11],"pz":[0,1],"nx":[3,2],"ny":[10,0],"nz":[1,-1]},{"size":3,"px":[10,3,13],"py":[2,0,2],"pz":[0,2,0],"nx":[7,16,1],"ny":[10,4,1],"nz":[0,-1,-1]},{"size":2,"px":[6,12],"py":[2,5],"pz":[1,0],"nx":[6,18],"ny":[1,19],"nz":[1,-1]},{"size":2,"px":[3,16],"py":[0,16],"pz":[1,-1],"nx":[11,2],"ny":[5,1],"nz":[0,2]},{"size":2,"px":[11,10],"py":[13,1],"pz":[0,-1],"nx":[1,1],"ny":[22,21],"nz":[0,0]},{"size":2,"px":[11,10],"py":[18,18],"pz":[0,0],"nx":[5,8],"ny":[9,0],"nz":[1,-1]},{"size":2,"px":[3,2],"py":[20,18],"pz":[0,0],"nx":[8,3],"ny":[5,1],"nz":[1,-1]},{"size":2,"px":[14,2],"py":[17,1],"pz":[0,-1],"nx":[14,13],"ny":[15,15],"nz":[0,0]},{"size":2,"px":[3,4],"py":[2,3],"pz":[2,2],"nx":[8,3],"ny":[4,0],"nz":[1,-1]},{"size":5,"px":[8,18,18,8,7],"py":[6,11,11,7,9],"pz":[1,0,-1,-1,-1],"nx":[5,13,5,11,5],"ny":[3,11,0,8,2],"nz":[2,0,2,1,2]},{"size":5,"px":[12,0,5,4,7],"py":[15,0,4,0,9],"pz":[0,-1,-1,-1,-1],"nx":[8,7,4,16,6],"ny":[17,12,9,10,12],"nz":[0,0,1,0,0]},{"size":2,"px":[6,7],"py":[14,1],"pz":[0,-1],"nx":[5,4],"ny":[9,4],"nz":[1,1]},{"size":4,"px":[8,0,22,4],"py":[4,4,23,0],"pz":[0,-1,-1,-1],"nx":[2,4,2,5],"ny":[0,1,2,9],"nz":[2,1,2,1]},{"size":5,"px":[9,9,10,10,8],"py":[0,1,1,2,0],"pz":[1,1,1,1,1],"nx":[4,16,16,16,6],"ny":[2,11,11,11,12],"nz":[2,0,-1,-1,-1]},{"size":2,"px":[6,6],"py":[6,5],"pz":[1,1],"nx":[0,4],"ny":[3,2],"nz":[1,-1]},{"size":3,"px":[10,3,4],"py":[5,9,8],"pz":[1,-1,-1],"nx":[11,23,23],"ny":[7,12,11],"nz":[1,0,0]},{"size":3,"px":[13,12,7],"py":[19,19,10],"pz":[0,0,1],"nx":[13,5,19],"ny":[20,15,22],"nz":[0,-1,-1]},{"size":2,"px":[12,12],"py":[12,13],"pz":[0,0],"nx":[9,10],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[0,12],"py":[1,13],"pz":[2,-1],"nx":[2,7],"ny":[2,13],"nz":[2,0]},{"size":2,"px":[10,10],"py":[8,9],"pz":[1,1],"nx":[19,7],"ny":[23,13],"nz":[0,-1]},{"size":4,"px":[8,7,23,15],"py":[11,12,4,21],"pz":[0,0,-1,-1],"nx":[2,5,1,10],"ny":[6,6,2,13],"nz":[0,1,1,0]},{"size":2,"px":[10,9],"py":[3,3],"pz":[0,0],"nx":[2,3],"ny":[2,4],"nz":[2,-1]},{"size":2,"px":[5,2],"py":[3,4],"pz":[2,-1],"nx":[3,6],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[7,11],"py":[20,16],"pz":[0,-1],"nx":[2,4],"ny":[5,20],"nz":[2,0]},{"size":2,"px":[9,7],"py":[7,5],"pz":[1,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[4,2],"py":[11,3],"pz":[1,2],"nx":[5,5],"ny":[3,5],"nz":[2,-1]},{"size":2,"px":[11,3],"py":[11,5],"pz":[1,-1],"nx":[4,1],"ny":[12,3],"nz":[0,2]},{"size":2,"px":[9,11],"py":[6,4],"pz":[1,-1],"nx":[10,20],"ny":[9,18],"nz":[1,0]},{"size":5,"px":[2,2,2,2,1],"py":[15,13,16,14,7],"pz":[0,0,0,0,1],"nx":[15,8,9,8,4],"ny":[11,6,5,5,4],"nz":[0,1,1,1,-1]},{"size":2,"px":[12,2],"py":[5,5],"pz":[0,-1],"nx":[3,2],"ny":[7,2],"nz":[1,2]},{"size":2,"px":[5,11],"py":[1,3],"pz":[2,1],"nx":[10,10],"ny":[3,3],"nz":[1,-1]},{"size":2,"px":[17,11],"py":[13,18],"pz":[0,-1],"nx":[6,9],"ny":[9,4],"nz":[1,1]},{"size":5,"px":[5,1,2,5,6],"py":[14,4,9,15,23],"pz":[0,2,1,0,0],"nx":[4,9,18,16,17],"ny":[0,1,1,0,0],"nz":[2,1,0,0,0]},{"size":2,"px":[16,17],"py":[0,0],"pz":[0,0],"nx":[23,23],"ny":[5,4],"nz":[0,-1]},{"size":2,"px":[13,8],"py":[20,6],"pz":[0,-1],"nx":[5,6],"ny":[12,10],"nz":[0,1]},{"size":2,"px":[6,15],"py":[15,0],"pz":[0,-1],"nx":[6,3],"ny":[16,4],"nz":[0,1]},{"size":2,"px":[18,20],"py":[7,8],"pz":[0,0],"nx":[18,11],"ny":[9,14],"nz":[0,-1]},{"size":2,"px":[9,4],"py":[12,6],"pz":[0,1],"nx":[3,15],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[5,2],"pz":[1,2],"nx":[5,5],"ny":[2,2],"nz":[1,-1]},{"size":2,"px":[5,20],"py":[1,20],"pz":[1,-1],"nx":[15,17],"ny":[1,2],"nz":[0,0]},{"size":2,"px":[7,2],"py":[16,4],"pz":[0,2],"nx":[4,0],"ny":[10,6],"nz":[1,-1]},{"size":2,"px":[3,8],"py":[5,0],"pz":[1,-1],"nx":[1,1],"ny":[10,18],"nz":[1,0]},{"size":2,"px":[22,0],"py":[3,0],"pz":[0,-1],"nx":[23,11],"ny":[4,1],"nz":[0,1]},{"size":3,"px":[19,10,20],"py":[21,8,18],"pz":[0,1,0],"nx":[3,6,20],"ny":[5,11,14],"nz":[2,-1,-1]},{"size":4,"px":[2,1,6,5],"py":[7,4,23,22],"pz":[1,2,0,0],"nx":[9,19,20,4],"ny":[8,11,9,2],"nz":[0,-1,-1,-1]},{"size":2,"px":[3,6],"py":[2,11],"pz":[2,1],"nx":[12,10],"ny":[21,9],"nz":[0,-1]},{"size":4,"px":[6,0,2,2],"py":[6,1,4,1],"pz":[1,-1,-1,-1],"nx":[0,0,0,0],"ny":[5,8,9,4],"nz":[1,0,0,1]},{"size":5,"px":[3,13,6,11,9],"py":[0,3,1,1,2],"pz":[2,0,1,0,0],"nx":[7,20,16,4,7],"ny":[7,2,19,2,6],"nz":[1,0,0,2,1]},{"size":4,"px":[7,5,2,6],"py":[7,7,4,11],"pz":[0,0,2,1],"nx":[7,1,21,0],"ny":[8,4,11,3],"nz":[0,-1,-1,-1]},{"size":2,"px":[2,2],"py":[3,2],"pz":[2,2],"nx":[8,9],"ny":[3,11],"nz":[1,-1]},{"size":2,"px":[7,13],"py":[3,5],"pz":[1,0],"nx":[4,3],"ny":[2,2],"nz":[1,-1]},{"size":4,"px":[3,12,13,11],"py":[0,1,1,1],"pz":[2,0,0,0],"nx":[8,9,13,0],"ny":[4,1,16,3],"nz":[1,-1,-1,-1]},{"size":2,"px":[10,1],"py":[4,14],"pz":[0,-1],"nx":[5,10],"ny":[1,2],"nz":[1,0]},{"size":2,"px":[11,12],"py":[21,21],"pz":[0,0],"nx":[10,11],"ny":[19,19],"nz":[0,0]},{"size":2,"px":[8,12],"py":[6,21],"pz":[1,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[11,7],"py":[19,0],"pz":[0,-1],"nx":[6,5],"ny":[9,11],"nz":[1,1]},{"size":5,"px":[11,11,11,10,10],"py":[10,12,11,13,13],"pz":[0,0,0,0,-1],"nx":[7,13,6,12,7],"ny":[10,6,3,6,11],"nz":[0,0,1,0,0]},{"size":2,"px":[12,11],"py":[6,12],"pz":[0,-1],"nx":[4,8],"ny":[4,4],"nz":[1,1]},{"size":5,"px":[16,15,16,15,17],"py":[1,0,0,1,1],"pz":[0,0,0,0,0],"nx":[13,7,6,12,12],"ny":[5,4,3,6,6],"nz":[0,1,1,0,-1]},{"size":2,"px":[2,3],"py":[1,3],"pz":[2,1],"nx":[1,5],"ny":[1,3],"nz":[2,-1]},{"size":2,"px":[6,3],"py":[13,6],"pz":[0,1],"nx":[4,9],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[0,3],"py":[4,3],"pz":[1,-1],"nx":[4,8],"ny":[3,6],"nz":[2,1]},{"size":2,"px":[6,3],"py":[2,1],"pz":[0,1],"nx":[5,5],"ny":[7,21],"nz":[1,-1]},{"size":2,"px":[8,4],"py":[0,0],"pz":[1,-1],"nx":[19,17],"ny":[1,0],"nz":[0,0]},{"size":4,"px":[8,11,5,0],"py":[6,1,1,22],"pz":[1,-1,-1,-1],"nx":[0,10,10,1],"ny":[6,12,13,4],"nz":[1,0,0,1]},{"size":2,"px":[8,17],"py":[6,13],"pz":[1,0],"nx":[14,17],"ny":[9,3],"nz":[0,-1]},{"size":2,"px":[5,8],"py":[0,4],"pz":[2,-1],"nx":[9,8],"ny":[1,1],"nz":[0,0]},{"size":2,"px":[11,14],"py":[13,9],"pz":[0,-1],"nx":[23,23],"ny":[21,19],"nz":[0,0]},{"size":2,"px":[10,9],"py":[9,3],"pz":[0,-1],"nx":[6,3],"ny":[2,1],"nz":[1,2]},{"size":2,"px":[11,1],"py":[4,4],"pz":[0,-1],"nx":[2,4],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[5,9],"py":[3,3],"pz":[2,-1],"nx":[17,9],"ny":[12,5],"nz":[0,1]},{"size":2,"px":[9,7],"py":[18,16],"pz":[0,-1],"nx":[5,2],"ny":[9,5],"nz":[1,2]},{"size":2,"px":[3,6],"py":[0,1],"pz":[1,-1],"nx":[4,5],"ny":[1,0],"nz":[0,0]}],"alpha":[-1.149973e+00,1.149973e+00,-6.844773e-01,6.844773e-01,-6.635048e-01,6.635048e-01,-4.888349e-01,4.888349e-01,-4.267976e-01,4.267976e-01,-4.258100e-01,4.258100e-01,-4.815853e-01,4.815853e-01,-4.091859e-01,4.091859e-01,-3.137414e-01,3.137414e-01,-3.339860e-01,3.339860e-01,-3.891196e-01,3.891196e-01,-4.167691e-01,4.167691e-01,-3.186609e-01,3.186609e-01,-2.957171e-01,2.957171e-01,-3.210062e-01,3.210062e-01,-2.725684e-01,2.725684e-01,-2.452176e-01,2.452176e-01,-2.812662e-01,2.812662e-01,-3.029622e-01,3.029622e-01,-3.293745e-01,3.293745e-01,-3.441536e-01,3.441536e-01,-2.946918e-01,2.946918e-01,-2.890545e-01,2.890545e-01,-1.949205e-01,1.949205e-01,-2.176102e-01,2.176102e-01,-2.595190e-01,2.595190e-01,-2.690931e-01,2.690931e-01,-2.130294e-01,2.130294e-01,-2.316308e-01,2.316308e-01,-2.798562e-01,2.798562e-01,-2.146988e-01,2.146988e-01,-2.332089e-01,2.332089e-01,-2.470614e-01,2.470614e-01,-2.204300e-01,2.204300e-01,-2.272045e-01,2.272045e-01,-2.583686e-01,2.583686e-01,-2.072299e-01,2.072299e-01,-1.834971e-01,1.834971e-01,-2.332656e-01,2.332656e-01,-3.271297e-01,3.271297e-01,-2.401937e-01,2.401937e-01,-2.006316e-01,2.006316e-01,-2.401947e-01,2.401947e-01,-2.475346e-01,2.475346e-01,-2.579532e-01,2.579532e-01,-2.466235e-01,2.466235e-01,-1.787582e-01,1.787582e-01,-2.036892e-01,2.036892e-01,-1.665028e-01,1.665028e-01,-1.576510e-01,1.576510e-01,-2.036997e-01,2.036997e-01,-2.040734e-01,2.040734e-01,-1.792532e-01,1.792532e-01,-2.174767e-01,2.174767e-01,-1.876948e-01,1.876948e-01,-1.883137e-01,1.883137e-01,-1.923872e-01,1.923872e-01,-2.620218e-01,2.620218e-01,-1.659873e-01,1.659873e-01,-1.475948e-01,1.475948e-01,-1.731607e-01,1.731607e-01,-2.059256e-01,2.059256e-01,-1.586309e-01,1.586309e-01,-1.607668e-01,1.607668e-01,-1.975101e-01,1.975101e-01,-2.130745e-01,2.130745e-01,-1.898872e-01,1.898872e-01,-2.052598e-01,2.052598e-01,-1.599397e-01,1.599397e-01,-1.770134e-01,1.770134e-01,-1.888249e-01,1.888249e-01,-1.515406e-01,1.515406e-01,-1.907771e-01,1.907771e-01,-1.698406e-01,1.698406e-01,-2.079535e-01,2.079535e-01,-1.966967e-01,1.966967e-01,-1.631391e-01,1.631391e-01,-2.158666e-01,2.158666e-01,-2.891774e-01,2.891774e-01,-1.581556e-01,1.581556e-01,-1.475359e-01,1.475359e-01,-1.806169e-01,1.806169e-01,-1.782238e-01,1.782238e-01,-1.660440e-01,1.660440e-01,-1.576919e-01,1.576919e-01,-1.741775e-01,1.741775e-01,-1.427265e-01,1.427265e-01,-1.695880e-01,1.695880e-01,-1.486712e-01,1.486712e-01,-1.533565e-01,1.533565e-01,-1.601464e-01,1.601464e-01,-1.978414e-01,1.978414e-01,-1.746566e-01,1.746566e-01,-1.794736e-01,1.794736e-01,-1.896567e-01,1.896567e-01,-1.666197e-01,1.666197e-01,-1.969351e-01,1.969351e-01,-2.321735e-01,2.321735e-01,-1.592485e-01,1.592485e-01,-1.671464e-01,1.671464e-01,-1.688885e-01,1.688885e-01,-1.868042e-01,1.868042e-01,-1.301138e-01,1.301138e-01,-1.330094e-01,1.330094e-01,-1.268423e-01,1.268423e-01,-1.820868e-01,1.820868e-01,-1.881020e-01,1.881020e-01,-1.580814e-01,1.580814e-01,-1.302653e-01,1.302653e-01,-1.787262e-01,1.787262e-01,-1.658453e-01,1.658453e-01,-1.240772e-01,1.240772e-01,-1.315621e-01,1.315621e-01,-1.756341e-01,1.756341e-01,-1.429438e-01,1.429438e-01,-1.351775e-01,1.351775e-01,-2.035692e-01,2.035692e-01,-1.267670e-01,1.267670e-01,-1.288470e-01,1.288470e-01,-1.393648e-01,1.393648e-01,-1.755962e-01,1.755962e-01,-1.308445e-01,1.308445e-01,-1.703894e-01,1.703894e-01,-1.461334e-01,1.461334e-01,-1.368683e-01,1.368683e-01,-1.244085e-01,1.244085e-01,-1.718163e-01,1.718163e-01,-1.415624e-01,1.415624e-01,-1.752024e-01,1.752024e-01,-1.666463e-01,1.666463e-01,-1.407325e-01,1.407325e-01,-1.258317e-01,1.258317e-01,-1.416511e-01,1.416511e-01,-1.420816e-01,1.420816e-01,-1.562547e-01,1.562547e-01,-1.542952e-01,1.542952e-01,-1.158829e-01,1.158829e-01,-1.392875e-01,1.392875e-01,-1.610095e-01,1.610095e-01,-1.546440e-01,1.546440e-01,-1.416235e-01,1.416235e-01,-2.028817e-01,2.028817e-01,-1.106779e-01,1.106779e-01,-9.231660e-02,9.231660e-02,-1.164460e-01,1.164460e-01,-1.701578e-01,1.701578e-01,-1.277995e-01,1.277995e-01,-1.946177e-01,1.946177e-01,-1.394509e-01,1.394509e-01,-1.370145e-01,1.370145e-01,-1.446031e-01,1.446031e-01,-1.665215e-01,1.665215e-01,-1.435822e-01,1.435822e-01,-1.559354e-01,1.559354e-01,-1.591860e-01,1.591860e-01,-1.193338e-01,1.193338e-01,-1.236954e-01,1.236954e-01,-1.209139e-01,1.209139e-01,-1.267385e-01,1.267385e-01,-1.232397e-01,1.232397e-01,-1.299632e-01,1.299632e-01,-1.302020e-01,1.302020e-01,-1.202975e-01,1.202975e-01,-1.525378e-01,1.525378e-01,-1.123073e-01,1.123073e-01,-1.605678e-01,1.605678e-01,-1.406867e-01,1.406867e-01,-1.354273e-01,1.354273e-01,-1.393192e-01,1.393192e-01,-1.278263e-01,1.278263e-01,-1.172073e-01,1.172073e-01,-1.153493e-01,1.153493e-01,-1.356318e-01,1.356318e-01,-1.316614e-01,1.316614e-01,-1.374489e-01,1.374489e-01,-1.018254e-01,1.018254e-01,-1.473336e-01,1.473336e-01,-1.289687e-01,1.289687e-01,-1.299183e-01,1.299183e-01,-1.178391e-01,1.178391e-01,-1.619059e-01,1.619059e-01,-1.842569e-01,1.842569e-01,-1.829095e-01,1.829095e-01,-1.939918e-01,1.939918e-01,-1.395362e-01,1.395362e-01,-1.774673e-01,1.774673e-01,-1.688216e-01,1.688216e-01,-1.671747e-01,1.671747e-01,-1.850178e-01,1.850178e-01,-1.106695e-01,1.106695e-01,-1.258323e-01,1.258323e-01,-1.246819e-01,1.246819e-01,-9.892193e-02,9.892193e-02,-1.399638e-01,1.399638e-01,-1.228375e-01,1.228375e-01,-1.756236e-01,1.756236e-01,-1.360307e-01,1.360307e-01,-1.266574e-01,1.266574e-01,-1.372135e-01,1.372135e-01,-1.175947e-01,1.175947e-01,-1.330075e-01,1.330075e-01,-1.396152e-01,1.396152e-01,-2.088443e-01,2.088443e-01]},{"count":301,"threshold":-4.887516e+00,"feature":[{"size":5,"px":[8,11,8,14,10],"py":[6,9,3,3,4],"pz":[1,0,0,0,0],"nx":[8,7,19,7,13],"ny":[11,8,8,5,8],"nz":[1,1,0,1,0]},{"size":5,"px":[14,3,13,12,12],"py":[4,6,4,4,8],"pz":[0,1,0,0,0],"nx":[2,5,2,10,10],"ny":[2,8,5,8,8],"nz":[2,1,2,0,-1]},{"size":5,"px":[6,5,3,7,7],"py":[2,3,1,2,2],"pz":[0,0,1,0,-1],"nx":[2,2,1,2,1],"ny":[3,1,2,2,2],"nz":[0,0,2,0,1]},{"size":5,"px":[3,3,6,12,8],"py":[4,2,4,10,17],"pz":[2,2,1,0,0],"nx":[4,8,8,2,1],"ny":[4,4,4,2,2],"nz":[1,1,-1,-1,-1]},{"size":5,"px":[18,19,17,9,16],"py":[1,2,2,0,2],"pz":[0,0,0,1,0],"nx":[23,23,22,22,22],"ny":[4,3,1,0,2],"nz":[0,0,0,0,0]},{"size":3,"px":[15,4,14],"py":[23,4,18],"pz":[0,2,0],"nx":[7,0,5],"ny":[10,4,9],"nz":[1,-1,-1]},{"size":5,"px":[11,11,16,11,17],"py":[8,6,11,7,11],"pz":[0,0,0,0,0],"nx":[8,4,14,14,1],"ny":[4,4,8,8,5],"nz":[1,1,0,-1,-1]},{"size":5,"px":[12,12,12,12,12],"py":[13,10,11,12,12],"pz":[0,0,0,0,-1],"nx":[4,4,1,2,9],"ny":[8,10,2,4,15],"nz":[0,1,2,1,0]},{"size":2,"px":[19,0],"py":[14,17],"pz":[0,-1],"nx":[20,19],"ny":[15,22],"nz":[0,0]},{"size":5,"px":[3,3,1,3,5],"py":[13,15,6,14,22],"pz":[0,0,1,0,0],"nx":[0,0,1,0,0],"ny":[11,21,23,5,5],"nz":[1,0,0,2,-1]},{"size":5,"px":[4,2,10,4,3],"py":[19,4,13,16,13],"pz":[0,1,0,0,0],"nx":[3,20,7,4,0],"ny":[4,19,5,1,5],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[11,5],"py":[4,4],"pz":[0,-1],"nx":[15,3],"ny":[15,1],"nz":[0,2]},{"size":4,"px":[17,17,12,11],"py":[14,15,18,18],"pz":[0,0,0,0],"nx":[11,4,1,0],"ny":[17,20,8,5],"nz":[0,-1,-1,-1]},{"size":5,"px":[6,2,1,2,11],"py":[14,4,1,1,18],"pz":[0,-1,-1,-1,-1],"nx":[5,5,3,5,2],"ny":[18,17,7,9,2],"nz":[0,0,1,1,2]},{"size":5,"px":[20,19,20,15,20],"py":[17,20,12,12,8],"pz":[0,0,0,0,0],"nx":[17,0,5,2,2],"ny":[8,4,9,2,2],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[6,8],"py":[7,11],"pz":[1,-1],"nx":[7,8],"ny":[7,10],"nz":[1,1]},{"size":5,"px":[15,16,14,8,8],"py":[2,2,2,0,0],"pz":[0,0,0,1,-1],"nx":[20,11,21,18,19],"ny":[3,6,5,1,2],"nz":[0,1,0,0,0]},{"size":4,"px":[17,18,9,8],"py":[23,21,7,8],"pz":[0,0,1,1],"nx":[8,17,10,18],"ny":[4,12,2,1],"nz":[1,-1,-1,-1]},{"size":5,"px":[2,2,9,4,8],"py":[7,3,12,12,23],"pz":[1,1,0,0,0],"nx":[0,0,0,0,0],"ny":[3,1,2,4,4],"nz":[0,0,0,0,-1]},{"size":3,"px":[7,8,5],"py":[22,23,9],"pz":[0,0,1],"nx":[9,4,2],"ny":[21,4,0],"nz":[0,-1,-1]},{"size":2,"px":[3,3],"py":[7,7],"pz":[1,-1],"nx":[3,2],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[15,11,10,3,17],"py":[0,1,2,3,1],"pz":[0,0,0,2,0],"nx":[5,8,4,3,3],"ny":[9,4,7,10,10],"nz":[1,1,1,1,-1]},{"size":3,"px":[22,11,22],"py":[12,5,14],"pz":[0,1,0],"nx":[23,23,3],"ny":[22,23,8],"nz":[0,0,-1]},{"size":2,"px":[3,11],"py":[7,5],"pz":[1,-1],"nx":[8,2],"ny":[14,5],"nz":[0,2]},{"size":4,"px":[17,16,2,4],"py":[14,13,5,0],"pz":[0,0,-1,-1],"nx":[8,9,15,8],"ny":[8,9,14,7],"nz":[1,1,0,1]},{"size":2,"px":[5,16],"py":[6,13],"pz":[1,-1],"nx":[2,1],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[1,0,1,2,1],"py":[15,2,16,19,12],"pz":[0,2,0,0,0],"nx":[8,7,4,9,9],"ny":[5,11,4,5,5],"nz":[1,1,1,1,-1]},{"size":2,"px":[8,7],"py":[11,12],"pz":[0,0],"nx":[9,1],"ny":[10,16],"nz":[0,-1]},{"size":2,"px":[15,13],"py":[17,10],"pz":[0,-1],"nx":[7,4],"ny":[8,4],"nz":[1,2]},{"size":5,"px":[11,10,7,8,9],"py":[0,0,1,1,1],"pz":[0,0,0,0,0],"nx":[4,5,4,5,6],"ny":[1,0,2,1,0],"nz":[0,0,0,0,-1]},{"size":2,"px":[2,2],"py":[4,3],"pz":[2,2],"nx":[3,21],"ny":[4,20],"nz":[1,-1]},{"size":5,"px":[10,11,5,2,11],"py":[12,10,6,11,11],"pz":[0,0,1,0,0],"nx":[4,15,16,7,7],"ny":[5,10,11,10,10],"nz":[1,0,0,0,-1]},{"size":5,"px":[13,14,1,11,11],"py":[2,2,3,2,2],"pz":[0,0,2,0,-1],"nx":[3,0,0,1,0],"ny":[23,15,14,9,8],"nz":[0,0,0,1,1]},{"size":2,"px":[17,2],"py":[13,5],"pz":[0,-1],"nx":[4,9],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[10,5],"py":[4,1],"pz":[0,-1],"nx":[11,3],"ny":[3,0],"nz":[0,2]},{"size":2,"px":[5,3],"py":[3,3],"pz":[2,-1],"nx":[11,23],"ny":[8,14],"nz":[1,0]},{"size":3,"px":[22,22,22],"py":[16,18,9],"pz":[0,0,0],"nx":[13,2,0],"ny":[17,3,5],"nz":[0,-1,-1]},{"size":5,"px":[13,10,13,14,11],"py":[2,2,1,2,1],"pz":[0,0,0,0,0],"nx":[3,3,8,6,6],"ny":[2,5,4,11,11],"nz":[2,2,1,1,-1]},{"size":3,"px":[12,1,1],"py":[14,0,1],"pz":[0,-1,-1],"nx":[8,15,7],"ny":[1,2,0],"nz":[1,0,1]},{"size":2,"px":[4,5],"py":[20,23],"pz":[0,0],"nx":[3,3],"ny":[10,2],"nz":[1,-1]},{"size":2,"px":[2,4],"py":[7,2],"pz":[1,-1],"nx":[4,3],"ny":[23,16],"nz":[0,0]},{"size":3,"px":[3,3,6],"py":[5,2,4],"pz":[2,2,1],"nx":[3,1,2],"ny":[5,17,0],"nz":[1,-1,-1]},{"size":2,"px":[14,8],"py":[17,6],"pz":[0,1],"nx":[13,10],"ny":[16,9],"nz":[0,-1]},{"size":5,"px":[15,7,14,13,14],"py":[1,0,0,0,1],"pz":[0,1,0,0,0],"nx":[4,4,4,8,8],"ny":[5,3,2,10,10],"nz":[2,2,2,1,-1]},{"size":5,"px":[8,9,4,5,4],"py":[13,12,9,5,7],"pz":[0,0,1,1,1],"nx":[22,21,22,22,22],"ny":[4,0,3,2,2],"nz":[0,0,0,0,-1]},{"size":2,"px":[17,17],"py":[16,13],"pz":[0,0],"nx":[14,21],"ny":[8,0],"nz":[0,-1]},{"size":2,"px":[16,10],"py":[4,9],"pz":[0,-1],"nx":[16,10],"ny":[3,3],"nz":[0,1]},{"size":5,"px":[1,1,0,1,0],"py":[17,16,7,15,8],"pz":[0,0,1,0,0],"nx":[4,3,8,9,7],"ny":[3,3,6,6,6],"nz":[1,1,0,0,-1]},{"size":2,"px":[3,3],"py":[2,3],"pz":[2,2],"nx":[8,3],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[10,2],"py":[17,4],"pz":[0,2],"nx":[10,12],"ny":[15,14],"nz":[0,-1]},{"size":2,"px":[11,11],"py":[14,12],"pz":[0,0],"nx":[9,10],"ny":[13,11],"nz":[0,0]},{"size":2,"px":[12,13],"py":[5,5],"pz":[0,0],"nx":[3,4],"ny":[4,1],"nz":[1,-1]},{"size":5,"px":[7,10,8,11,11],"py":[13,2,12,2,2],"pz":[0,0,0,0,-1],"nx":[10,1,1,10,1],"ny":[12,5,3,13,1],"nz":[0,1,1,0,2]},{"size":2,"px":[6,10],"py":[4,2],"pz":[1,-1],"nx":[4,6],"ny":[4,9],"nz":[1,1]},{"size":2,"px":[20,20],"py":[21,22],"pz":[0,0],"nx":[15,8],"ny":[5,5],"nz":[0,-1]},{"size":2,"px":[4,3],"py":[3,3],"pz":[2,2],"nx":[9,17],"ny":[4,15],"nz":[1,-1]},{"size":3,"px":[2,2,4],"py":[3,3,7],"pz":[2,-1,-1],"nx":[7,4,4],"ny":[6,5,4],"nz":[1,2,2]},{"size":5,"px":[8,9,16,17,17],"py":[1,2,1,1,1],"pz":[1,1,0,0,-1],"nx":[2,2,4,2,4],"ny":[16,14,22,15,21],"nz":[0,0,0,0,0]},{"size":2,"px":[9,9],"py":[18,0],"pz":[0,-1],"nx":[2,5],"ny":[5,8],"nz":[2,1]},{"size":2,"px":[7,8],"py":[11,11],"pz":[0,0],"nx":[15,5],"ny":[8,8],"nz":[0,-1]},{"size":2,"px":[0,3],"py":[4,3],"pz":[2,-1],"nx":[1,6],"ny":[4,14],"nz":[2,0]},{"size":2,"px":[6,12],"py":[7,11],"pz":[1,-1],"nx":[0,0],"ny":[7,12],"nz":[1,0]},{"size":2,"px":[3,7],"py":[10,22],"pz":[1,0],"nx":[4,3],"ny":[10,0],"nz":[1,-1]},{"size":2,"px":[5,19],"py":[4,21],"pz":[2,-1],"nx":[11,11],"ny":[8,9],"nz":[1,1]},{"size":2,"px":[3,3],"py":[8,7],"pz":[1,1],"nx":[4,20],"ny":[4,5],"nz":[1,-1]},{"size":5,"px":[11,23,23,23,23],"py":[7,13,19,20,21],"pz":[1,0,0,0,0],"nx":[4,3,2,8,8],"ny":[11,5,5,23,23],"nz":[1,1,2,0,-1]},{"size":2,"px":[4,1],"py":[0,2],"pz":[0,0],"nx":[0,6],"ny":[0,11],"nz":[0,-1]},{"size":2,"px":[11,8],"py":[12,1],"pz":[0,-1],"nx":[23,23],"ny":[13,12],"nz":[0,0]},{"size":5,"px":[23,11,23,11,11],"py":[13,7,12,5,6],"pz":[0,1,0,1,1],"nx":[6,3,8,7,7],"ny":[12,4,4,11,11],"nz":[0,1,1,0,-1]},{"size":2,"px":[20,5],"py":[15,5],"pz":[0,-1],"nx":[10,10],"ny":[11,10],"nz":[1,1]},{"size":2,"px":[11,4],"py":[19,8],"pz":[0,1],"nx":[11,19],"ny":[18,2],"nz":[0,-1]},{"size":2,"px":[14,6],"py":[3,4],"pz":[0,-1],"nx":[8,15],"ny":[1,0],"nz":[1,0]},{"size":4,"px":[14,5,13,12],"py":[23,3,23,23],"pz":[0,1,0,0],"nx":[12,0,1,4],"ny":[21,3,2,4],"nz":[0,-1,-1,-1]},{"size":2,"px":[19,5],"py":[12,2],"pz":[0,-1],"nx":[4,7],"ny":[3,5],"nz":[2,1]},{"size":2,"px":[0,8],"py":[5,3],"pz":[2,-1],"nx":[5,22],"ny":[3,11],"nz":[2,0]},{"size":2,"px":[2,6],"py":[3,12],"pz":[2,0],"nx":[3,5],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[5,5],"py":[0,6],"pz":[2,-1],"nx":[14,6],"ny":[4,2],"nz":[0,1]},{"size":2,"px":[16,11],"py":[1,0],"pz":[0,-1],"nx":[4,8],"ny":[4,10],"nz":[2,1]},{"size":2,"px":[9,4],"py":[4,3],"pz":[1,1],"nx":[5,8],"ny":[0,10],"nz":[2,-1]},{"size":2,"px":[16,1],"py":[22,1],"pz":[0,-1],"nx":[2,2],"ny":[4,2],"nz":[2,2]},{"size":2,"px":[12,2],"py":[11,2],"pz":[0,-1],"nx":[5,5],"ny":[1,0],"nz":[2,2]},{"size":2,"px":[11,11],"py":[4,3],"pz":[1,1],"nx":[7,5],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[9,2],"py":[22,3],"pz":[0,2],"nx":[4,9],"ny":[10,11],"nz":[1,-1]},{"size":2,"px":[2,4],"py":[8,10],"pz":[1,-1],"nx":[5,3],"ny":[23,18],"nz":[0,0]},{"size":2,"px":[12,6],"py":[21,9],"pz":[0,-1],"nx":[11,23],"ny":[6,10],"nz":[1,0]},{"size":2,"px":[9,9],"py":[8,7],"pz":[1,1],"nx":[18,8],"ny":[18,6],"nz":[0,-1]},{"size":2,"px":[13,3],"py":[19,0],"pz":[0,-1],"nx":[6,5],"ny":[9,11],"nz":[1,1]},{"size":5,"px":[2,10,9,7,8],"py":[0,1,0,1,0],"pz":[2,0,0,0,0],"nx":[3,4,6,8,8],"ny":[2,4,9,4,4],"nz":[2,1,1,1,-1]},{"size":2,"px":[8,4],"py":[6,3],"pz":[1,2],"nx":[9,4],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[0,4],"py":[23,3],"pz":[0,-1],"nx":[12,9],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[4,2],"py":[10,3],"pz":[1,2],"nx":[0,2],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[12,14],"py":[18,0],"pz":[0,-1],"nx":[12,8],"ny":[16,10],"nz":[0,1]},{"size":4,"px":[10,18,7,5],"py":[14,8,0,3],"pz":[0,-1,-1,-1],"nx":[8,6,8,5],"ny":[11,12,5,5],"nz":[0,0,1,1]},{"size":2,"px":[6,5],"py":[2,2],"pz":[1,1],"nx":[8,8],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[12,10],"py":[20,20],"pz":[0,0],"nx":[11,10],"ny":[19,19],"nz":[0,0]},{"size":2,"px":[17,10],"py":[16,20],"pz":[0,-1],"nx":[8,7],"ny":[4,8],"nz":[1,1]},{"size":3,"px":[2,1,3],"py":[20,4,21],"pz":[0,2,0],"nx":[3,4,0],"ny":[10,1,0],"nz":[1,-1,-1]},{"size":5,"px":[6,7,3,6,6],"py":[15,14,7,16,19],"pz":[0,0,1,0,0],"nx":[0,0,0,0,0],"ny":[18,19,16,17,17],"nz":[0,0,0,0,-1]},{"size":2,"px":[8,16],"py":[6,12],"pz":[1,0],"nx":[8,15],"ny":[4,10],"nz":[1,-1]},{"size":5,"px":[0,0,0,0,0],"py":[1,3,2,0,4],"pz":[2,2,2,2,1],"nx":[13,8,14,4,7],"ny":[23,6,23,3,9],"nz":[0,1,0,2,-1]},{"size":2,"px":[3,6],"py":[3,5],"pz":[2,1],"nx":[10,8],"ny":[11,6],"nz":[0,-1]},{"size":2,"px":[11,10],"py":[4,4],"pz":[0,0],"nx":[8,5],"ny":[4,9],"nz":[1,-1]},{"size":5,"px":[15,18,9,16,4],"py":[12,13,6,23,3],"pz":[0,0,1,0,2],"nx":[6,3,6,2,7],"ny":[2,3,0,1,0],"nz":[0,0,0,1,0]},{"size":2,"px":[4,18],"py":[12,13],"pz":[0,-1],"nx":[2,8],"ny":[3,4],"nz":[2,1]},{"size":2,"px":[4,2],"py":[10,4],"pz":[1,2],"nx":[3,3],"ny":[5,0],"nz":[2,-1]},{"size":2,"px":[9,19],"py":[7,8],"pz":[1,0],"nx":[8,3],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[6,0],"py":[6,0],"pz":[0,-1],"nx":[0,0],"ny":[7,2],"nz":[1,2]},{"size":2,"px":[8,8],"py":[0,0],"pz":[1,-1],"nx":[17,18],"ny":[0,2],"nz":[0,0]},{"size":4,"px":[13,4,4,1],"py":[14,7,3,5],"pz":[0,-1,-1,-1],"nx":[3,16,3,7],"ny":[1,15,5,13],"nz":[2,0,2,0]},{"size":2,"px":[4,9],"py":[6,11],"pz":[1,0],"nx":[3,23],"ny":[4,8],"nz":[1,-1]},{"size":5,"px":[9,17,4,16,16],"py":[2,3,1,3,3],"pz":[1,0,2,0,-1],"nx":[2,3,3,2,3],"ny":[1,7,2,3,3],"nz":[2,1,1,1,1]},{"size":2,"px":[10,5],"py":[22,9],"pz":[0,1],"nx":[10,3],"ny":[21,2],"nz":[0,-1]},{"size":2,"px":[11,11],"py":[6,3],"pz":[0,-1],"nx":[8,5],"ny":[4,3],"nz":[1,1]},{"size":2,"px":[10,5],"py":[8,3],"pz":[0,-1],"nx":[14,5],"ny":[14,2],"nz":[0,2]},{"size":2,"px":[7,8],"py":[3,2],"pz":[0,-1],"nx":[8,2],"ny":[18,2],"nz":[0,2]},{"size":2,"px":[1,1],"py":[19,11],"pz":[0,1],"nx":[9,4],"ny":[5,1],"nz":[0,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,3],"ny":[4,4],"nz":[1,-1]},{"size":5,"px":[7,15,13,14,4],"py":[6,12,9,11,4],"pz":[1,0,0,0,2],"nx":[7,3,8,4,5],"ny":[0,3,0,2,1],"nz":[0,0,0,0,0]},{"size":5,"px":[10,13,7,8,9],"py":[0,1,1,0,1],"pz":[0,0,0,0,0],"nx":[7,4,4,4,8],"ny":[8,3,4,2,4],"nz":[1,2,2,2,1]},{"size":2,"px":[6,1],"py":[6,0],"pz":[1,-1],"nx":[11,7],"ny":[3,2],"nz":[0,1]},{"size":2,"px":[13,0],"py":[13,2],"pz":[0,-1],"nx":[0,1],"ny":[13,16],"nz":[0,0]},{"size":2,"px":[8,17],"py":[6,13],"pz":[1,0],"nx":[8,1],"ny":[4,16],"nz":[1,-1]},{"size":5,"px":[12,11,3,6,17],"py":[4,4,1,2,14],"pz":[0,0,2,1,0],"nx":[6,23,23,6,23],"ny":[5,7,6,6,14],"nz":[1,0,0,1,0]},{"size":2,"px":[5,22],"py":[4,17],"pz":[2,-1],"nx":[4,8],"ny":[5,7],"nz":[2,1]},{"size":2,"px":[15,14],"py":[1,1],"pz":[0,0],"nx":[4,7],"ny":[2,4],"nz":[2,-1]},{"size":2,"px":[15,17],"py":[12,7],"pz":[0,-1],"nx":[14,10],"ny":[11,4],"nz":[0,1]},{"size":4,"px":[10,2,9,15],"py":[5,11,1,13],"pz":[0,-1,-1,-1],"nx":[11,3,3,13],"ny":[1,1,0,1],"nz":[0,2,2,0]},{"size":2,"px":[7,21],"py":[15,22],"pz":[0,-1],"nx":[4,9],"ny":[8,14],"nz":[1,0]},{"size":2,"px":[6,5],"py":[21,2],"pz":[0,-1],"nx":[3,5],"ny":[11,21],"nz":[1,0]},{"size":2,"px":[17,7],"py":[2,0],"pz":[0,-1],"nx":[4,8],"ny":[5,11],"nz":[2,1]},{"size":2,"px":[11,8],"py":[10,4],"pz":[0,-1],"nx":[13,12],"ny":[3,3],"nz":[0,0]},{"size":2,"px":[6,5],"py":[2,2],"pz":[1,1],"nx":[7,1],"ny":[8,2],"nz":[0,-1]},{"size":5,"px":[0,0,1,0,0],"py":[12,4,14,0,2],"pz":[0,1,0,2,2],"nx":[9,5,8,4,4],"ny":[6,3,6,3,3],"nz":[0,1,0,1,-1]},{"size":5,"px":[8,0,0,3,2],"py":[6,5,0,8,2],"pz":[1,-1,-1,-1,-1],"nx":[23,7,22,11,4],"ny":[12,6,14,4,3],"nz":[0,1,0,1,2]},{"size":4,"px":[12,12,4,8],"py":[12,11,3,10],"pz":[0,0,-1,-1],"nx":[0,0,0,0],"ny":[2,1,0,3],"nz":[1,2,2,1]},{"size":2,"px":[10,6],"py":[7,6],"pz":[1,-1],"nx":[16,4],"ny":[12,2],"nz":[0,2]},{"size":5,"px":[2,1,3,3,3],"py":[14,8,20,21,21],"pz":[0,1,0,0,-1],"nx":[20,10,21,21,21],"ny":[23,11,21,23,20],"nz":[0,1,0,0,0]},{"size":2,"px":[6,13],"py":[2,4],"pz":[1,0],"nx":[7,21],"ny":[8,0],"nz":[0,-1]},{"size":2,"px":[12,3],"py":[17,4],"pz":[0,2],"nx":[11,10],"ny":[15,7],"nz":[0,-1]},{"size":4,"px":[11,0,19,2],"py":[15,2,23,10],"pz":[0,-1,-1,-1],"nx":[6,8,16,2],"ny":[13,11,10,2],"nz":[0,0,0,2]},{"size":2,"px":[6,3],"py":[14,7],"pz":[0,1],"nx":[3,1],"ny":[4,1],"nz":[1,-1]},{"size":4,"px":[12,17,5,10],"py":[19,15,14,3],"pz":[0,-1,-1,-1],"nx":[4,12,6,12],"ny":[4,18,9,22],"nz":[1,0,1,0]},{"size":2,"px":[8,3],"py":[13,5],"pz":[0,-1],"nx":[3,4],"ny":[4,9],"nz":[1,1]},{"size":5,"px":[6,5,4,5,3],"py":[2,1,2,2,0],"pz":[0,0,0,0,1],"nx":[7,4,9,18,18],"ny":[4,4,7,14,14],"nz":[1,1,1,0,-1]},{"size":4,"px":[8,3,20,1],"py":[6,3,18,0],"pz":[1,-1,-1,-1],"nx":[13,11,5,22],"ny":[12,6,2,17],"nz":[0,1,2,0]},{"size":2,"px":[6,3],"py":[6,3],"pz":[1,2],"nx":[8,5],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[21,7],"py":[14,7],"pz":[0,1],"nx":[16,11],"ny":[14,6],"nz":[0,-1]},{"size":2,"px":[10,4],"py":[3,1],"pz":[0,-1],"nx":[9,5],"ny":[0,0],"nz":[0,1]},{"size":2,"px":[4,10],"py":[5,8],"pz":[2,1],"nx":[5,14],"ny":[9,7],"nz":[1,-1]},{"size":2,"px":[9,2],"py":[23,4],"pz":[0,2],"nx":[2,2],"ny":[5,5],"nz":[2,-1]},{"size":5,"px":[10,9,11,10,10],"py":[2,2,1,1,1],"pz":[0,0,0,0,-1],"nx":[2,3,2,4,5],"ny":[4,10,2,4,3],"nz":[2,1,1,0,0]},{"size":2,"px":[11,4],"py":[13,4],"pz":[0,-1],"nx":[8,4],"ny":[4,1],"nz":[1,2]},{"size":2,"px":[17,5],"py":[15,1],"pz":[0,-1],"nx":[20,19],"ny":[14,14],"nz":[0,0]},{"size":2,"px":[2,2],"py":[20,18],"pz":[0,0],"nx":[2,1],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[10,1],"py":[18,3],"pz":[0,2],"nx":[11,3],"ny":[16,5],"nz":[0,-1]},{"size":2,"px":[3,8],"py":[6,10],"pz":[1,0],"nx":[9,0],"ny":[9,3],"nz":[0,-1]},{"size":2,"px":[20,10],"py":[21,7],"pz":[0,1],"nx":[7,2],"ny":[3,5],"nz":[1,-1]},{"size":2,"px":[10,6],"py":[4,7],"pz":[1,-1],"nx":[23,5],"ny":[9,2],"nz":[0,2]},{"size":5,"px":[2,4,5,3,4],"py":[0,1,1,2,2],"pz":[1,0,0,0,0],"nx":[1,0,1,1,1],"ny":[2,1,0,1,1],"nz":[0,1,0,0,-1]},{"size":2,"px":[8,16],"py":[7,13],"pz":[1,0],"nx":[8,3],"ny":[4,16],"nz":[1,-1]},{"size":2,"px":[17,15],"py":[7,19],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[4,3],"py":[11,5],"pz":[1,2],"nx":[7,8],"ny":[9,4],"nz":[1,-1]},{"size":2,"px":[23,11],"py":[9,6],"pz":[0,1],"nx":[22,22],"ny":[23,23],"nz":[0,-1]},{"size":2,"px":[23,23],"py":[21,20],"pz":[0,0],"nx":[2,2],"ny":[5,4],"nz":[1,-1]},{"size":2,"px":[17,4],"py":[12,2],"pz":[0,-1],"nx":[9,8],"ny":[4,5],"nz":[1,1]},{"size":2,"px":[6,14],"py":[2,4],"pz":[1,0],"nx":[7,18],"ny":[1,1],"nz":[1,-1]},{"size":2,"px":[20,22],"py":[1,2],"pz":[0,0],"nx":[23,23],"ny":[1,1],"nz":[0,-1]},{"size":2,"px":[0,1],"py":[9,10],"pz":[1,1],"nx":[8,0],"ny":[15,0],"nz":[0,-1]},{"size":3,"px":[11,11,6],"py":[10,11,11],"pz":[0,0,-1],"nx":[23,23,23],"ny":[19,21,20],"nz":[0,0,0]},{"size":5,"px":[23,23,23,6,6],"py":[21,22,22,3,6],"pz":[0,0,-1,-1,-1],"nx":[8,8,8,17,4],"ny":[7,10,8,16,5],"nz":[1,1,1,0,2]},{"size":2,"px":[10,23],"py":[1,22],"pz":[0,-1],"nx":[7,2],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[7,14],"py":[3,10],"pz":[1,-1],"nx":[5,3],"ny":[2,1],"nz":[0,1]},{"size":2,"px":[5,3],"py":[13,7],"pz":[0,1],"nx":[4,10],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[10,0],"py":[15,6],"pz":[0,-1],"nx":[3,6],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[13,4],"py":[18,17],"pz":[0,-1],"nx":[7,6],"ny":[10,7],"nz":[1,1]},{"size":2,"px":[12,11],"py":[3,8],"pz":[0,-1],"nx":[7,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[17,4],"py":[5,7],"pz":[0,1],"nx":[17,10],"ny":[4,0],"nz":[0,-1]},{"size":5,"px":[16,8,16,15,15],"py":[0,0,1,0,1],"pz":[0,1,0,0,0],"nx":[7,4,7,4,4],"ny":[7,5,8,1,1],"nz":[1,2,1,2,-1]},{"size":2,"px":[13,11],"py":[5,6],"pz":[0,-1],"nx":[4,5],"ny":[2,2],"nz":[1,1]},{"size":2,"px":[3,6],"py":[3,6],"pz":[2,1],"nx":[8,4],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[10,16],"py":[8,10],"pz":[0,0],"nx":[7,2],"ny":[3,3],"nz":[1,-1]},{"size":2,"px":[6,8],"py":[4,11],"pz":[1,0],"nx":[10,1],"ny":[9,20],"nz":[0,-1]},{"size":2,"px":[5,1],"py":[4,2],"pz":[2,-1],"nx":[23,23],"ny":[15,16],"nz":[0,0]},{"size":5,"px":[9,8,2,4,9],"py":[1,1,0,1,2],"pz":[0,0,2,1,0],"nx":[8,3,8,4,4],"ny":[6,2,4,2,2],"nz":[1,2,1,2,-1]},{"size":2,"px":[13,6],"py":[10,5],"pz":[0,-1],"nx":[13,7],"ny":[6,3],"nz":[0,1]},{"size":2,"px":[11,5],"py":[10,5],"pz":[1,2],"nx":[10,8],"ny":[10,9],"nz":[1,-1]},{"size":2,"px":[7,4],"py":[6,3],"pz":[1,2],"nx":[9,14],"ny":[4,9],"nz":[1,-1]},{"size":3,"px":[5,2,15],"py":[3,1,22],"pz":[1,-1,-1],"nx":[15,9,4],"ny":[0,1,0],"nz":[0,1,2]},{"size":2,"px":[10,19],"py":[9,21],"pz":[1,0],"nx":[2,17],"ny":[5,14],"nz":[2,-1]},{"size":3,"px":[16,2,1],"py":[2,10,4],"pz":[0,-1,-1],"nx":[4,4,9],"ny":[3,2,6],"nz":[2,2,1]},{"size":2,"px":[10,2],"py":[6,10],"pz":[1,-1],"nx":[21,22],"ny":[16,12],"nz":[0,0]},{"size":2,"px":[7,16],"py":[4,23],"pz":[0,-1],"nx":[7,3],"ny":[3,3],"nz":[0,1]},{"size":2,"px":[1,1],"py":[13,14],"pz":[0,0],"nx":[1,2],"ny":[18,3],"nz":[0,-1]},{"size":2,"px":[18,5],"py":[13,4],"pz":[0,-1],"nx":[4,13],"ny":[2,11],"nz":[2,0]},{"size":2,"px":[18,17],"py":[3,3],"pz":[0,0],"nx":[19,19],"ny":[1,1],"nz":[0,-1]},{"size":2,"px":[9,5],"py":[0,5],"pz":[1,-1],"nx":[12,3],"ny":[5,1],"nz":[0,2]},{"size":2,"px":[5,3],"py":[2,1],"pz":[1,2],"nx":[18,4],"ny":[4,1],"nz":[0,-1]},{"size":5,"px":[13,13,2,10,15],"py":[11,12,13,17,23],"pz":[0,-1,-1,-1,-1],"nx":[12,13,4,3,8],"ny":[4,4,1,0,3],"nz":[0,0,2,2,1]},{"size":2,"px":[9,3],"py":[2,2],"pz":[0,-1],"nx":[4,2],"ny":[7,2],"nz":[1,2]},{"size":2,"px":[13,4],"py":[5,1],"pz":[0,-1],"nx":[18,4],"ny":[12,2],"nz":[0,2]},{"size":2,"px":[19,4],"py":[11,1],"pz":[0,-1],"nx":[4,7],"ny":[2,2],"nz":[2,1]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,2],"ny":[4,5],"nz":[1,-1]},{"size":2,"px":[4,0],"py":[7,7],"pz":[0,-1],"nx":[4,9],"ny":[0,2],"nz":[2,1]},{"size":2,"px":[4,9],"py":[0,2],"pz":[2,1],"nx":[6,4],"ny":[3,4],"nz":[0,-1]},{"size":2,"px":[4,2],"py":[9,4],"pz":[1,2],"nx":[13,5],"ny":[18,2],"nz":[0,-1]},{"size":3,"px":[5,23,23],"py":[2,8,7],"pz":[2,0,0],"nx":[10,12,1],"ny":[4,1,0],"nz":[1,-1,-1]},{"size":2,"px":[13,0],"py":[3,3],"pz":[0,-1],"nx":[4,4],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[6,5],"py":[10,5],"pz":[0,-1],"nx":[0,0],"ny":[4,11],"nz":[1,0]},{"size":2,"px":[11,2],"py":[14,11],"pz":[0,-1],"nx":[10,11],"ny":[4,13],"nz":[1,0]},{"size":2,"px":[5,6],"py":[21,23],"pz":[0,0],"nx":[7,0],"ny":[21,3],"nz":[0,-1]},{"size":2,"px":[8,4],"py":[6,3],"pz":[1,2],"nx":[8,5],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[7,6],"py":[8,8],"pz":[0,0],"nx":[6,14],"ny":[9,15],"nz":[0,-1]},{"size":2,"px":[16,6],"py":[4,8],"pz":[0,-1],"nx":[16,8],"ny":[0,1],"nz":[0,1]},{"size":4,"px":[3,6,0,9],"py":[0,8,5,23],"pz":[1,-1,-1,-1],"nx":[12,2,6,10],"ny":[5,0,3,5],"nz":[0,2,1,0]},{"size":2,"px":[3,6],"py":[7,13],"pz":[1,0],"nx":[3,9],"ny":[4,9],"nz":[1,-1]},{"size":2,"px":[2,5],"py":[8,23],"pz":[1,0],"nx":[8,9],"ny":[15,0],"nz":[0,-1]},{"size":2,"px":[13,18],"py":[8,0],"pz":[0,-1],"nx":[1,1],"ny":[9,8],"nz":[1,1]},{"size":2,"px":[2,7],"py":[4,21],"pz":[2,0],"nx":[13,11],"ny":[8,9],"nz":[0,-1]},{"size":2,"px":[5,4],"py":[8,8],"pz":[0,0],"nx":[6,1],"ny":[8,5],"nz":[0,-1]},{"size":2,"px":[7,3],"py":[20,7],"pz":[0,-1],"nx":[4,3],"ny":[10,4],"nz":[1,1]},{"size":2,"px":[9,9],"py":[8,7],"pz":[1,-1],"nx":[1,2],"ny":[4,9],"nz":[2,1]},{"size":2,"px":[5,10],"py":[5,13],"pz":[1,-1],"nx":[3,6],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[12,5],"py":[6,3],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[10,10],"py":[4,4],"pz":[1,-1],"nx":[5,11],"ny":[2,5],"nz":[2,1]},{"size":5,"px":[11,23,11,23,11],"py":[4,9,5,10,6],"pz":[1,0,1,0,1],"nx":[7,14,13,7,3],"ny":[9,5,6,4,4],"nz":[0,0,0,1,-1]},{"size":2,"px":[8,5],"py":[0,0],"pz":[1,-1],"nx":[9,20],"ny":[1,4],"nz":[1,0]},{"size":2,"px":[19,20],"py":[0,3],"pz":[0,0],"nx":[4,6],"ny":[11,3],"nz":[1,-1]},{"size":4,"px":[13,5,20,5],"py":[14,3,23,4],"pz":[0,-1,-1,-1],"nx":[8,15,7,16],"ny":[8,14,6,15],"nz":[1,0,1,0]},{"size":2,"px":[10,20],"py":[5,17],"pz":[0,-1],"nx":[7,3],"ny":[10,1],"nz":[0,2]},{"size":3,"px":[1,12,7],"py":[3,7,10],"pz":[2,0,0],"nx":[2,2,3],"ny":[3,2,2],"nz":[1,-1,-1]},{"size":3,"px":[10,5,7],"py":[7,10,10],"pz":[1,-1,-1],"nx":[10,10,18],"ny":[10,9,23],"nz":[1,1,0]},{"size":3,"px":[14,14,4],"py":[3,3,4],"pz":[0,-1,-1],"nx":[4,4,8],"ny":[3,2,6],"nz":[2,2,1]},{"size":2,"px":[4,12],"py":[4,17],"pz":[2,0],"nx":[13,1],"ny":[15,4],"nz":[0,-1]},{"size":2,"px":[10,20],"py":[9,22],"pz":[0,-1],"nx":[9,4],"ny":[2,0],"nz":[1,2]},{"size":2,"px":[11,2],"py":[3,6],"pz":[0,-1],"nx":[2,4],"ny":[2,4],"nz":[2,1]},{"size":3,"px":[15,10,1],"py":[12,2,3],"pz":[0,-1,-1],"nx":[7,5,10],"ny":[2,1,1],"nz":[0,1,0]},{"size":5,"px":[9,11,10,12,12],"py":[0,0,0,0,0],"pz":[0,0,0,0,-1],"nx":[8,4,16,5,10],"ny":[4,4,10,3,6],"nz":[1,1,0,1,0]},{"size":2,"px":[0,10],"py":[3,5],"pz":[2,-1],"nx":[3,6],"ny":[0,1],"nz":[2,1]},{"size":5,"px":[7,8,7,2,12],"py":[14,13,13,16,0],"pz":[0,0,-1,-1,-1],"nx":[10,1,10,1,1],"ny":[13,2,12,4,9],"nz":[0,2,0,1,0]},{"size":3,"px":[6,14,13],"py":[1,2,1],"pz":[1,0,0],"nx":[8,21,10],"ny":[4,23,12],"nz":[1,-1,-1]},{"size":2,"px":[19,19],"py":[22,21],"pz":[0,0],"nx":[20,1],"ny":[22,5],"nz":[0,-1]},{"size":2,"px":[13,12],"py":[19,22],"pz":[0,-1],"nx":[2,3],"ny":[0,1],"nz":[2,1]},{"size":4,"px":[11,9,21,4],"py":[13,3,19,5],"pz":[0,-1,-1,-1],"nx":[9,9,9,5],"ny":[13,14,12,6],"nz":[0,0,0,1]},{"size":4,"px":[11,12,13,14],"py":[22,22,22,22],"pz":[0,0,0,0],"nx":[13,2,4,5],"ny":[20,0,0,6],"nz":[0,-1,-1,-1]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,1],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[0,1],"pz":[2,2],"nx":[9,4],"ny":[6,5],"nz":[1,-1]},{"size":2,"px":[17,0],"py":[10,1],"pz":[0,-1],"nx":[9,4],"ny":[3,2],"nz":[1,2]},{"size":2,"px":[10,4],"py":[3,1],"pz":[1,2],"nx":[12,18],"ny":[17,4],"nz":[0,-1]},{"size":3,"px":[2,3,4],"py":[4,3,9],"pz":[2,2,1],"nx":[0,3,17],"ny":[0,1,18],"nz":[0,-1,-1]},{"size":2,"px":[7,3],"py":[12,6],"pz":[0,1],"nx":[5,1],"ny":[11,1],"nz":[1,-1]},{"size":2,"px":[10,17],"py":[20,6],"pz":[0,-1],"nx":[5,2],"ny":[9,5],"nz":[1,2]},{"size":2,"px":[8,11],"py":[18,2],"pz":[0,-1],"nx":[5,4],"ny":[9,9],"nz":[1,1]},{"size":2,"px":[16,15],"py":[2,2],"pz":[0,0],"nx":[17,12],"ny":[2,2],"nz":[0,-1]},{"size":2,"px":[18,4],"py":[5,5],"pz":[0,-1],"nx":[7,5],"ny":[23,19],"nz":[0,0]},{"size":2,"px":[12,13],"py":[23,23],"pz":[0,0],"nx":[7,11],"ny":[10,20],"nz":[1,-1]},{"size":2,"px":[5,10],"py":[3,18],"pz":[2,-1],"nx":[9,9],"ny":[5,6],"nz":[1,1]},{"size":2,"px":[5,10],"py":[2,4],"pz":[1,0],"nx":[4,23],"ny":[4,20],"nz":[1,-1]},{"size":2,"px":[2,3],"py":[8,1],"pz":[1,-1],"nx":[15,12],"ny":[2,1],"nz":[0,0]},{"size":2,"px":[4,7],"py":[3,10],"pz":[2,1],"nx":[10,1],"ny":[20,4],"nz":[0,-1]},{"size":2,"px":[11,11],"py":[10,11],"pz":[0,0],"nx":[22,3],"ny":[5,4],"nz":[0,-1]},{"size":5,"px":[8,17,17,9,18],"py":[0,1,0,1,0],"pz":[1,0,0,1,0],"nx":[11,8,9,4,4],"ny":[23,4,6,2,2],"nz":[0,1,0,2,-1]},{"size":2,"px":[5,5],"py":[4,4],"pz":[1,-1],"nx":[13,4],"ny":[9,2],"nz":[0,2]},{"size":5,"px":[9,4,8,7,7],"py":[3,1,3,3,3],"pz":[0,1,0,0,-1],"nx":[4,2,5,3,2],"ny":[1,15,1,4,13],"nz":[0,0,0,0,0]},{"size":2,"px":[17,7],"py":[13,7],"pz":[0,-1],"nx":[4,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[1,2],"py":[1,12],"pz":[2,0],"nx":[9,21],"ny":[5,4],"nz":[0,-1]},{"size":2,"px":[12,0],"py":[14,1],"pz":[0,-1],"nx":[1,1],"ny":[19,10],"nz":[0,1]},{"size":2,"px":[16,1],"py":[5,9],"pz":[0,-1],"nx":[16,15],"ny":[3,3],"nz":[0,0]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[8,4],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[11,6],"py":[17,15],"pz":[0,0],"nx":[11,0],"ny":[16,4],"nz":[0,-1]},{"size":4,"px":[12,11,0,3],"py":[16,8,7,1],"pz":[0,-1,-1,-1],"nx":[10,5,10,5],"ny":[11,9,10,8],"nz":[0,1,0,1]},{"size":2,"px":[3,6],"py":[7,13],"pz":[1,0],"nx":[4,14],"ny":[4,16],"nz":[1,-1]},{"size":2,"px":[7,17],"py":[6,13],"pz":[0,-1],"nx":[4,8],"ny":[4,9],"nz":[2,1]},{"size":2,"px":[15,11],"py":[3,2],"pz":[0,-1],"nx":[4,15],"ny":[1,2],"nz":[2,0]},{"size":2,"px":[10,11],"py":[18,4],"pz":[0,-1],"nx":[5,5],"ny":[8,9],"nz":[1,1]},{"size":2,"px":[8,4],"py":[7,4],"pz":[1,2],"nx":[4,3],"ny":[5,7],"nz":[2,-1]},{"size":2,"px":[12,4],"py":[15,4],"pz":[0,-1],"nx":[11,8],"ny":[14,19],"nz":[0,0]},{"size":2,"px":[18,13],"py":[13,20],"pz":[0,0],"nx":[13,4],"ny":[18,2],"nz":[0,-1]},{"size":2,"px":[12,4],"py":[6,3],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[21,5,11,5,10],"py":[1,1,3,0,0],"pz":[0,2,1,2,1],"nx":[7,14,15,4,8],"ny":[3,6,11,3,4],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[10,6],"py":[15,10],"pz":[0,-1],"nx":[21,22],"ny":[14,12],"nz":[0,0]},{"size":2,"px":[18,0],"py":[20,0],"pz":[0,-1],"nx":[2,3],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[12,6,13,11,7],"py":[1,1,1,2,1],"pz":[0,1,0,0,1],"nx":[7,6,8,5,5],"ny":[4,15,4,16,16],"nz":[1,0,1,0,-1]},{"size":3,"px":[22,21,21],"py":[14,15,17],"pz":[0,0,0],"nx":[5,9,4],"ny":[0,5,0],"nz":[2,-1,-1]},{"size":2,"px":[10,2],"py":[14,1],"pz":[0,-1],"nx":[23,11],"ny":[16,8],"nz":[0,1]},{"size":4,"px":[21,21,0,18],"py":[14,15,5,4],"pz":[0,0,-1,-1],"nx":[8,8,9,4],"ny":[7,8,10,5],"nz":[1,1,1,2]},{"size":2,"px":[15,5],"py":[18,1],"pz":[0,-1],"nx":[23,23],"ny":[16,18],"nz":[0,0]},{"size":2,"px":[15,14],"py":[1,1],"pz":[0,0],"nx":[4,4],"ny":[2,3],"nz":[2,-1]},{"size":2,"px":[2,6],"py":[6,5],"pz":[1,-1],"nx":[14,11],"ny":[1,1],"nz":[0,0]},{"size":2,"px":[3,17],"py":[2,8],"pz":[2,0],"nx":[8,3],"ny":[4,9],"nz":[1,-1]},{"size":2,"px":[17,8],"py":[13,10],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[0,0],"py":[8,3],"pz":[0,1],"nx":[1,11],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[6,8],"py":[5,0],"pz":[1,-1],"nx":[0,0],"ny":[3,1],"nz":[1,2]},{"size":2,"px":[0,0],"py":[5,3],"pz":[1,2],"nx":[1,18],"ny":[5,7],"nz":[1,-1]},{"size":2,"px":[7,3],"py":[6,6],"pz":[0,1],"nx":[7,12],"ny":[5,20],"nz":[0,-1]},{"size":2,"px":[8,1],"py":[0,5],"pz":[0,-1],"nx":[4,2],"ny":[9,3],"nz":[1,2]},{"size":2,"px":[0,0],"py":[10,11],"pz":[0,0],"nx":[0,5],"ny":[5,9],"nz":[0,-1]},{"size":2,"px":[8,1],"py":[23,4],"pz":[0,2],"nx":[0,0],"ny":[13,2],"nz":[0,-1]},{"size":2,"px":[4,1],"py":[6,4],"pz":[0,-1],"nx":[4,4],"ny":[4,5],"nz":[2,2]},{"size":2,"px":[7,6],"py":[6,5],"pz":[1,1],"nx":[3,9],"ny":[4,16],"nz":[1,-1]},{"size":2,"px":[5,3],"py":[9,13],"pz":[0,-1],"nx":[4,10],"ny":[3,7],"nz":[1,0]},{"size":5,"px":[13,9,6,10,10],"py":[2,2,1,2,2],"pz":[0,0,1,0,-1],"nx":[7,5,6,5,6],"ny":[0,2,2,1,1],"nz":[0,0,0,0,0]}],"alpha":[-1.119615e+00,1.119615e+00,-8.169953e-01,8.169953e-01,-5.291213e-01,5.291213e-01,-4.904488e-01,4.904488e-01,-4.930982e-01,4.930982e-01,-4.106179e-01,4.106179e-01,-4.246842e-01,4.246842e-01,-3.802383e-01,3.802383e-01,-3.364358e-01,3.364358e-01,-3.214186e-01,3.214186e-01,-3.210798e-01,3.210798e-01,-2.993167e-01,2.993167e-01,-3.426336e-01,3.426336e-01,-3.199184e-01,3.199184e-01,-3.061071e-01,3.061071e-01,-2.758972e-01,2.758972e-01,-3.075590e-01,3.075590e-01,-3.009565e-01,3.009565e-01,-2.015739e-01,2.015739e-01,-2.603266e-01,2.603266e-01,-2.772993e-01,2.772993e-01,-2.184913e-01,2.184913e-01,-2.306681e-01,2.306681e-01,-1.983223e-01,1.983223e-01,-2.194760e-01,2.194760e-01,-2.528421e-01,2.528421e-01,-2.436416e-01,2.436416e-01,-3.032886e-01,3.032886e-01,-2.556071e-01,2.556071e-01,-2.562170e-01,2.562170e-01,-1.930298e-01,1.930298e-01,-2.735898e-01,2.735898e-01,-1.814703e-01,1.814703e-01,-2.054824e-01,2.054824e-01,-1.986146e-01,1.986146e-01,-1.769226e-01,1.769226e-01,-1.775257e-01,1.775257e-01,-2.167927e-01,2.167927e-01,-1.823633e-01,1.823633e-01,-1.584280e-01,1.584280e-01,-1.778321e-01,1.778321e-01,-1.826777e-01,1.826777e-01,-1.979903e-01,1.979903e-01,-1.898326e-01,1.898326e-01,-1.835506e-01,1.835506e-01,-1.967860e-01,1.967860e-01,-1.871528e-01,1.871528e-01,-1.772414e-01,1.772414e-01,-1.985514e-01,1.985514e-01,-2.144078e-01,2.144078e-01,-2.742303e-01,2.742303e-01,-2.240550e-01,2.240550e-01,-2.132534e-01,2.132534e-01,-1.552127e-01,1.552127e-01,-1.568276e-01,1.568276e-01,-1.630086e-01,1.630086e-01,-1.458232e-01,1.458232e-01,-1.559541e-01,1.559541e-01,-1.720131e-01,1.720131e-01,-1.708434e-01,1.708434e-01,-1.624431e-01,1.624431e-01,-1.814161e-01,1.814161e-01,-1.552639e-01,1.552639e-01,-1.242354e-01,1.242354e-01,-1.552139e-01,1.552139e-01,-1.694359e-01,1.694359e-01,-1.801481e-01,1.801481e-01,-1.387182e-01,1.387182e-01,-1.409679e-01,1.409679e-01,-1.486724e-01,1.486724e-01,-1.779553e-01,1.779553e-01,-1.524595e-01,1.524595e-01,-1.788086e-01,1.788086e-01,-1.671479e-01,1.671479e-01,-1.376197e-01,1.376197e-01,-1.511808e-01,1.511808e-01,-1.524632e-01,1.524632e-01,-1.198986e-01,1.198986e-01,-1.382641e-01,1.382641e-01,-1.148901e-01,1.148901e-01,-1.131803e-01,1.131803e-01,-1.273508e-01,1.273508e-01,-1.405125e-01,1.405125e-01,-1.322132e-01,1.322132e-01,-1.386966e-01,1.386966e-01,-1.275621e-01,1.275621e-01,-1.180573e-01,1.180573e-01,-1.238803e-01,1.238803e-01,-1.428389e-01,1.428389e-01,-1.694437e-01,1.694437e-01,-1.290855e-01,1.290855e-01,-1.520260e-01,1.520260e-01,-1.398282e-01,1.398282e-01,-1.890736e-01,1.890736e-01,-2.280428e-01,2.280428e-01,-1.325099e-01,1.325099e-01,-1.342873e-01,1.342873e-01,-1.463841e-01,1.463841e-01,-1.983567e-01,1.983567e-01,-1.585711e-01,1.585711e-01,-1.260154e-01,1.260154e-01,-1.426774e-01,1.426774e-01,-1.554278e-01,1.554278e-01,-1.361201e-01,1.361201e-01,-1.181856e-01,1.181856e-01,-1.255941e-01,1.255941e-01,-1.113275e-01,1.113275e-01,-1.506576e-01,1.506576e-01,-1.202859e-01,1.202859e-01,-2.159751e-01,2.159751e-01,-1.443150e-01,1.443150e-01,-1.379194e-01,1.379194e-01,-1.805758e-01,1.805758e-01,-1.465612e-01,1.465612e-01,-1.328856e-01,1.328856e-01,-1.532173e-01,1.532173e-01,-1.590635e-01,1.590635e-01,-1.462229e-01,1.462229e-01,-1.350012e-01,1.350012e-01,-1.195634e-01,1.195634e-01,-1.173221e-01,1.173221e-01,-1.192867e-01,1.192867e-01,-1.595013e-01,1.595013e-01,-1.209751e-01,1.209751e-01,-1.571290e-01,1.571290e-01,-1.527274e-01,1.527274e-01,-1.373708e-01,1.373708e-01,-1.318313e-01,1.318313e-01,-1.273391e-01,1.273391e-01,-1.271365e-01,1.271365e-01,-1.528693e-01,1.528693e-01,-1.590476e-01,1.590476e-01,-1.581911e-01,1.581911e-01,-1.183023e-01,1.183023e-01,-1.559822e-01,1.559822e-01,-1.214999e-01,1.214999e-01,-1.283378e-01,1.283378e-01,-1.542583e-01,1.542583e-01,-1.336377e-01,1.336377e-01,-1.800416e-01,1.800416e-01,-1.710931e-01,1.710931e-01,-1.621737e-01,1.621737e-01,-1.239002e-01,1.239002e-01,-1.432928e-01,1.432928e-01,-1.392447e-01,1.392447e-01,-1.383938e-01,1.383938e-01,-1.357633e-01,1.357633e-01,-1.175842e-01,1.175842e-01,-1.085318e-01,1.085318e-01,-1.148885e-01,1.148885e-01,-1.320396e-01,1.320396e-01,-1.351204e-01,1.351204e-01,-1.581518e-01,1.581518e-01,-1.459574e-01,1.459574e-01,-1.180068e-01,1.180068e-01,-1.464196e-01,1.464196e-01,-1.179543e-01,1.179543e-01,-1.004204e-01,1.004204e-01,-1.294660e-01,1.294660e-01,-1.534244e-01,1.534244e-01,-1.378970e-01,1.378970e-01,-1.226545e-01,1.226545e-01,-1.281182e-01,1.281182e-01,-1.201471e-01,1.201471e-01,-1.448701e-01,1.448701e-01,-1.290980e-01,1.290980e-01,-1.388764e-01,1.388764e-01,-9.605773e-02,9.605773e-02,-1.411021e-01,1.411021e-01,-1.295693e-01,1.295693e-01,-1.371739e-01,1.371739e-01,-1.167579e-01,1.167579e-01,-1.400486e-01,1.400486e-01,-1.214224e-01,1.214224e-01,-1.287835e-01,1.287835e-01,-1.197646e-01,1.197646e-01,-1.192358e-01,1.192358e-01,-1.218651e-01,1.218651e-01,-1.564816e-01,1.564816e-01,-1.172391e-01,1.172391e-01,-1.342268e-01,1.342268e-01,-1.492471e-01,1.492471e-01,-1.157299e-01,1.157299e-01,-1.046703e-01,1.046703e-01,-1.255571e-01,1.255571e-01,-1.100135e-01,1.100135e-01,-1.501592e-01,1.501592e-01,-1.155712e-01,1.155712e-01,-1.145563e-01,1.145563e-01,-1.013425e-01,1.013425e-01,-1.145783e-01,1.145783e-01,-1.328031e-01,1.328031e-01,-1.077413e-01,1.077413e-01,-1.064996e-01,1.064996e-01,-1.191170e-01,1.191170e-01,-1.213217e-01,1.213217e-01,-1.260969e-01,1.260969e-01,-1.156494e-01,1.156494e-01,-1.268126e-01,1.268126e-01,-1.070999e-01,1.070999e-01,-1.112365e-01,1.112365e-01,-1.243916e-01,1.243916e-01,-1.283152e-01,1.283152e-01,-1.166925e-01,1.166925e-01,-8.997633e-02,8.997633e-02,-1.583840e-01,1.583840e-01,-1.211178e-01,1.211178e-01,-1.090830e-01,1.090830e-01,-1.030818e-01,1.030818e-01,-1.440600e-01,1.440600e-01,-1.458713e-01,1.458713e-01,-1.559082e-01,1.559082e-01,-1.058868e-01,1.058868e-01,-1.010130e-01,1.010130e-01,-1.642301e-01,1.642301e-01,-1.236850e-01,1.236850e-01,-1.467589e-01,1.467589e-01,-1.109359e-01,1.109359e-01,-1.673655e-01,1.673655e-01,-1.239984e-01,1.239984e-01,-1.039509e-01,1.039509e-01,-1.089378e-01,1.089378e-01,-1.545085e-01,1.545085e-01,-1.200862e-01,1.200862e-01,-1.105608e-01,1.105608e-01,-1.235262e-01,1.235262e-01,-8.496153e-02,8.496153e-02,-1.181372e-01,1.181372e-01,-1.139467e-01,1.139467e-01,-1.189317e-01,1.189317e-01,-1.266519e-01,1.266519e-01,-9.470736e-02,9.470736e-02,-1.336735e-01,1.336735e-01,-8.726601e-02,8.726601e-02,-1.304782e-01,1.304782e-01,-1.186529e-01,1.186529e-01,-1.355944e-01,1.355944e-01,-9.568801e-02,9.568801e-02,-1.282618e-01,1.282618e-01,-1.625632e-01,1.625632e-01,-1.167652e-01,1.167652e-01,-1.001301e-01,1.001301e-01,-1.292419e-01,1.292419e-01,-1.904213e-01,1.904213e-01,-1.511542e-01,1.511542e-01,-9.814394e-02,9.814394e-02,-1.171564e-01,1.171564e-01,-9.806486e-02,9.806486e-02,-9.217615e-02,9.217615e-02,-8.505645e-02,8.505645e-02,-1.573637e-01,1.573637e-01,-1.419174e-01,1.419174e-01,-1.298601e-01,1.298601e-01,-1.120613e-01,1.120613e-01,-1.158363e-01,1.158363e-01,-1.090957e-01,1.090957e-01,-1.204516e-01,1.204516e-01,-1.139852e-01,1.139852e-01,-9.642479e-02,9.642479e-02,-1.410872e-01,1.410872e-01,-1.142779e-01,1.142779e-01,-1.043991e-01,1.043991e-01,-9.736463e-02,9.736463e-02,-1.451046e-01,1.451046e-01,-1.205668e-01,1.205668e-01,-9.881445e-02,9.881445e-02,-1.612822e-01,1.612822e-01,-1.175681e-01,1.175681e-01,-1.522528e-01,1.522528e-01,-1.617520e-01,1.617520e-01,-1.582938e-01,1.582938e-01,-1.208202e-01,1.208202e-01,-1.016003e-01,1.016003e-01,-1.232059e-01,1.232059e-01,-9.583025e-02,9.583025e-02,-1.013990e-01,1.013990e-01,-1.178752e-01,1.178752e-01,-1.215972e-01,1.215972e-01,-1.294932e-01,1.294932e-01,-1.158270e-01,1.158270e-01,-1.008645e-01,1.008645e-01,-9.699190e-02,9.699190e-02,-1.022144e-01,1.022144e-01,-9.878768e-02,9.878768e-02,-1.339052e-01,1.339052e-01,-9.279961e-02,9.279961e-02,-1.047606e-01,1.047606e-01,-1.141163e-01,1.141163e-01,-1.267600e-01,1.267600e-01,-1.252763e-01,1.252763e-01,-9.775003e-02,9.775003e-02,-9.169116e-02,9.169116e-02,-1.006496e-01,1.006496e-01,-9.493293e-02,9.493293e-02,-1.213694e-01,1.213694e-01,-1.109243e-01,1.109243e-01,-1.115973e-01,1.115973e-01,-7.979327e-02,7.979327e-02,-9.220953e-02,9.220953e-02,-1.028913e-01,1.028913e-01,-1.253510e-01,1.253510e-01]},{"count":391,"threshold":-4.665692e+00,"feature":[{"size":5,"px":[14,9,11,17,12],"py":[2,3,9,13,3],"pz":[0,0,0,0,0],"nx":[21,8,7,20,13],"ny":[16,10,7,7,9],"nz":[0,1,1,0,0]},{"size":5,"px":[12,10,6,11,13],"py":[9,3,13,3,4],"pz":[0,0,0,0,0],"nx":[10,4,5,10,2],"ny":[9,10,8,8,2],"nz":[0,1,1,0,2]},{"size":5,"px":[6,9,7,8,8],"py":[3,3,3,3,3],"pz":[0,0,0,0,-1],"nx":[0,0,0,4,9],"ny":[4,2,3,10,8],"nz":[0,0,0,1,0]},{"size":5,"px":[6,2,16,6,8],"py":[16,2,11,4,11],"pz":[0,2,0,1,0],"nx":[3,8,4,1,1],"ny":[4,4,4,5,13],"nz":[1,1,-1,-1,-1]},{"size":3,"px":[16,13,9],"py":[23,18,10],"pz":[0,0,1],"nx":[14,15,8],"ny":[21,22,3],"nz":[0,-1,-1]},{"size":5,"px":[9,16,19,17,17],"py":[1,2,3,2,2],"pz":[1,0,0,0,-1],"nx":[23,23,23,23,23],"ny":[6,2,1,3,5],"nz":[0,0,0,0,0]},{"size":5,"px":[12,12,12,12,12],"py":[10,11,12,13,13],"pz":[0,0,0,0,-1],"nx":[4,8,14,4,6],"ny":[2,4,7,4,8],"nz":[2,1,0,1,1]},{"size":5,"px":[1,2,3,6,4],"py":[6,10,12,23,13],"pz":[1,1,0,0,0],"nx":[2,0,0,1,1],"ny":[23,5,10,21,21],"nz":[0,2,1,0,-1]},{"size":5,"px":[12,16,12,4,12],"py":[6,17,7,2,8],"pz":[0,0,0,2,0],"nx":[8,8,12,0,6],"ny":[4,4,16,0,8],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[9,2],"py":[18,4],"pz":[0,-1],"nx":[4,9],"ny":[10,16],"nz":[1,0]},{"size":5,"px":[9,9,2,0,12],"py":[6,6,21,4,8],"pz":[1,-1,-1,-1,-1],"nx":[8,4,9,7,7],"ny":[10,2,4,5,8],"nz":[1,2,1,1,1]},{"size":5,"px":[10,10,10,18,19],"py":[10,8,7,14,14],"pz":[1,1,1,0,0],"nx":[21,23,22,22,11],"ny":[23,19,21,22,10],"nz":[0,0,0,0,-1]},{"size":5,"px":[12,3,15,4,19],"py":[14,0,5,5,14],"pz":[0,-1,-1,-1,-1],"nx":[12,17,15,3,8],"ny":[18,18,14,2,10],"nz":[0,0,0,2,0]},{"size":5,"px":[8,11,3,11,4],"py":[23,7,9,8,8],"pz":[0,0,1,0,1],"nx":[8,0,10,0,8],"ny":[8,2,8,4,10],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[10,11,12,8,4],"py":[3,0,0,1,1],"pz":[0,0,0,0,1],"nx":[2,3,4,3,3],"ny":[14,5,0,1,2],"nz":[0,0,0,0,0]},{"size":2,"px":[3,11],"py":[7,0],"pz":[1,-1],"nx":[5,2],"ny":[9,5],"nz":[1,2]},{"size":5,"px":[7,1,0,10,1],"py":[0,0,2,12,6],"pz":[0,2,2,0,1],"nx":[4,6,2,8,8],"ny":[4,11,2,4,4],"nz":[1,1,2,1,-1]},{"size":2,"px":[4,15],"py":[4,12],"pz":[2,0],"nx":[4,6],"ny":[5,11],"nz":[2,-1]},{"size":5,"px":[9,4,16,14,14],"py":[8,4,23,18,18],"pz":[1,2,0,0,-1],"nx":[0,2,1,1,0],"ny":[2,0,3,2,3],"nz":[1,0,0,0,1]},{"size":5,"px":[17,7,7,18,19],"py":[7,11,8,7,7],"pz":[0,1,1,0,0],"nx":[17,5,8,2,0],"ny":[8,0,7,5,3],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[5,14],"py":[12,3],"pz":[0,-1],"nx":[4,3],"ny":[5,4],"nz":[1,1]},{"size":5,"px":[10,8,16,11,11],"py":[5,6,12,4,4],"pz":[0,1,0,0,-1],"nx":[14,13,5,9,5],"ny":[13,10,1,4,2],"nz":[0,0,2,1,2]},{"size":5,"px":[15,14,16,8,8],"py":[2,2,2,0,0],"pz":[0,0,0,1,-1],"nx":[9,18,19,18,17],"ny":[0,0,2,1,0],"nz":[1,0,0,0,0]},{"size":2,"px":[17,15],"py":[12,11],"pz":[0,0],"nx":[14,4],"ny":[9,15],"nz":[0,-1]},{"size":3,"px":[5,11,11],"py":[3,4,5],"pz":[2,1,1],"nx":[14,3,18],"ny":[6,5,0],"nz":[0,1,-1]},{"size":5,"px":[16,14,17,15,9],"py":[2,2,2,2,1],"pz":[0,0,0,0,1],"nx":[21,20,11,21,21],"ny":[2,0,7,3,3],"nz":[0,0,1,0,-1]},{"size":5,"px":[2,1,1,1,5],"py":[12,9,7,3,6],"pz":[0,0,1,1,1],"nx":[4,8,3,4,17],"ny":[4,4,0,8,0],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[8,4],"py":[6,3],"pz":[1,2],"nx":[9,2],"ny":[4,17],"nz":[1,-1]},{"size":2,"px":[8,5],"py":[16,9],"pz":[0,1],"nx":[10,17],"ny":[16,8],"nz":[0,-1]},{"size":4,"px":[11,5,9,15],"py":[14,9,11,5],"pz":[0,-1,-1,-1],"nx":[10,1,9,4],"ny":[9,2,13,7],"nz":[0,2,0,1]},{"size":5,"px":[2,5,10,7,10],"py":[7,12,2,13,3],"pz":[1,-1,-1,-1,-1],"nx":[5,2,3,3,2],"ny":[23,15,17,16,14],"nz":[0,0,0,0,0]},{"size":2,"px":[11,7],"py":[8,10],"pz":[0,-1],"nx":[7,14],"ny":[5,8],"nz":[1,0]},{"size":2,"px":[9,16],"py":[7,23],"pz":[1,0],"nx":[4,4],"ny":[2,1],"nz":[2,-1]},{"size":5,"px":[16,14,18,4,17],"py":[0,0,4,0,1],"pz":[0,0,0,2,0],"nx":[8,8,16,9,9],"ny":[5,4,11,7,7],"nz":[1,1,0,0,-1]},{"size":5,"px":[12,13,7,8,4],"py":[9,12,6,11,5],"pz":[0,0,1,1,2],"nx":[23,23,16,9,9],"ny":[0,1,11,7,7],"nz":[0,-1,-1,-1,-1]},{"size":3,"px":[6,7,2],"py":[21,23,4],"pz":[0,0,2],"nx":[4,1,16],"ny":[10,5,11],"nz":[1,-1,-1]},{"size":2,"px":[2,2],"py":[3,4],"pz":[2,2],"nx":[3,1],"ny":[4,5],"nz":[1,-1]},{"size":5,"px":[1,2,1,0,1],"py":[7,13,12,4,13],"pz":[0,0,0,2,0],"nx":[18,9,9,19,19],"ny":[23,5,11,19,19],"nz":[0,1,1,0,-1]},{"size":3,"px":[4,10,12],"py":[6,2,5],"pz":[1,-1,-1],"nx":[10,0,0],"ny":[12,1,3],"nz":[0,2,2]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,0],"ny":[4,3],"nz":[1,-1]},{"size":5,"px":[19,17,10,14,18],"py":[2,1,7,0,1],"pz":[0,0,1,0,0],"nx":[3,3,3,7,5],"ny":[9,10,7,23,18],"nz":[1,1,1,0,0]},{"size":2,"px":[10,10],"py":[8,7],"pz":[1,1],"nx":[14,4],"ny":[15,6],"nz":[0,-1]},{"size":2,"px":[7,15],"py":[1,3],"pz":[1,0],"nx":[16,19],"ny":[1,3],"nz":[0,-1]},{"size":5,"px":[11,11,1,2,11],"py":[11,12,1,13,12],"pz":[0,0,-1,-1,-1],"nx":[12,17,8,16,8],"ny":[7,12,11,16,6],"nz":[0,0,0,0,1]},{"size":5,"px":[13,11,10,12,5],"py":[0,0,0,0,0],"pz":[0,0,0,0,1],"nx":[8,4,3,4,4],"ny":[4,5,2,4,4],"nz":[1,1,2,1,-1]},{"size":5,"px":[6,1,3,2,3],"py":[13,3,3,4,10],"pz":[0,2,1,1,1],"nx":[0,1,0,0,0],"ny":[2,0,5,4,4],"nz":[0,0,0,0,-1]},{"size":2,"px":[15,1],"py":[4,3],"pz":[0,-1],"nx":[16,15],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[3,7],"py":[7,13],"pz":[1,0],"nx":[3,0],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[14,15],"py":[18,14],"pz":[0,-1],"nx":[4,14],"ny":[4,16],"nz":[1,0]},{"size":2,"px":[4,6],"py":[3,4],"pz":[2,1],"nx":[9,5],"ny":[14,2],"nz":[0,-1]},{"size":2,"px":[16,6],"py":[1,5],"pz":[0,-1],"nx":[4,9],"ny":[0,4],"nz":[2,1]},{"size":2,"px":[9,0],"py":[4,2],"pz":[0,-1],"nx":[5,3],"ny":[1,0],"nz":[1,2]},{"size":5,"px":[1,1,1,0,0],"py":[16,15,17,6,9],"pz":[0,0,0,1,0],"nx":[9,5,4,9,8],"ny":[7,3,3,6,7],"nz":[0,1,1,0,-1]},{"size":2,"px":[9,1],"py":[8,15],"pz":[1,-1],"nx":[9,8],"ny":[9,4],"nz":[1,1]},{"size":2,"px":[20,19],"py":[19,22],"pz":[0,0],"nx":[7,0],"ny":[3,0],"nz":[1,-1]},{"size":5,"px":[8,4,2,5,5],"py":[12,6,3,5,5],"pz":[0,1,2,1,-1],"nx":[22,21,20,21,22],"ny":[17,20,22,19,16],"nz":[0,0,0,0,0]},{"size":2,"px":[6,12],"py":[2,6],"pz":[1,0],"nx":[8,3],"ny":[3,2],"nz":[1,-1]},{"size":2,"px":[11,11],"py":[9,4],"pz":[1,1],"nx":[12,4],"ny":[17,5],"nz":[0,-1]},{"size":3,"px":[0,1,0],"py":[5,13,3],"pz":[2,0,2],"nx":[0,4,11],"ny":[23,5,1],"nz":[0,-1,-1]},{"size":2,"px":[10,5],"py":[6,3],"pz":[0,1],"nx":[4,4],"ny":[3,0],"nz":[1,-1]},{"size":2,"px":[6,5],"py":[7,3],"pz":[0,-1],"nx":[0,1],"ny":[4,10],"nz":[2,1]},{"size":5,"px":[12,13,12,12,12],"py":[12,13,11,10,10],"pz":[0,0,0,0,-1],"nx":[10,8,8,16,15],"ny":[7,4,10,11,10],"nz":[0,1,0,0,0]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[4,2],"ny":[5,5],"nz":[2,-1]},{"size":2,"px":[9,17],"py":[17,7],"pz":[0,-1],"nx":[5,2],"ny":[9,4],"nz":[1,2]},{"size":2,"px":[4,4],"py":[3,5],"pz":[2,2],"nx":[12,8],"ny":[16,2],"nz":[0,-1]},{"size":2,"px":[1,1],"py":[2,0],"pz":[1,1],"nx":[0,4],"ny":[0,1],"nz":[2,-1]},{"size":2,"px":[11,1],"py":[5,0],"pz":[0,-1],"nx":[2,3],"ny":[2,4],"nz":[2,1]},{"size":4,"px":[0,6,4,22],"py":[23,2,4,12],"pz":[0,-1,-1,-1],"nx":[7,6,8,5],"ny":[1,1,2,1],"nz":[1,1,1,1]},{"size":2,"px":[4,10],"py":[0,9],"pz":[1,-1],"nx":[2,4],"ny":[3,10],"nz":[2,1]},{"size":2,"px":[11,8],"py":[15,13],"pz":[0,-1],"nx":[23,11],"ny":[13,5],"nz":[0,1]},{"size":2,"px":[18,4],"py":[5,4],"pz":[0,-1],"nx":[18,20],"ny":[4,7],"nz":[0,0]},{"size":5,"px":[21,20,20,10,20],"py":[17,22,19,10,21],"pz":[0,0,0,1,0],"nx":[5,5,3,14,7],"ny":[9,9,0,8,4],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[3,7,13,7,3],"py":[6,12,3,0,3],"pz":[1,-1,-1,-1,-1],"nx":[1,5,0,0,2],"ny":[16,6,13,5,4],"nz":[0,1,0,1,0]},{"size":2,"px":[7,4],"py":[6,3],"pz":[1,2],"nx":[9,5],"ny":[4,6],"nz":[1,-1]},{"size":3,"px":[14,9,13],"py":[19,22,8],"pz":[0,-1,-1],"nx":[13,4,4],"ny":[17,2,5],"nz":[0,2,2]},{"size":2,"px":[16,4],"py":[9,3],"pz":[0,2],"nx":[7,4],"ny":[4,5],"nz":[1,-1]},{"size":4,"px":[10,2,4,2],"py":[23,4,8,3],"pz":[0,2,1,2],"nx":[14,0,4,11],"ny":[19,3,5,3],"nz":[0,-1,-1,-1]},{"size":5,"px":[9,10,8,7,11],"py":[2,2,2,2,2],"pz":[0,0,0,0,0],"nx":[6,5,3,4,4],"ny":[0,1,0,2,2],"nz":[0,0,1,0,-1]},{"size":2,"px":[6,4],"py":[13,6],"pz":[0,-1],"nx":[15,4],"ny":[8,4],"nz":[0,1]},{"size":2,"px":[0,8],"py":[1,2],"pz":[2,-1],"nx":[5,4],"ny":[2,2],"nz":[1,1]},{"size":5,"px":[16,13,14,15,15],"py":[1,0,0,0,0],"pz":[0,0,0,0,-1],"nx":[4,9,4,18,8],"ny":[5,9,4,18,11],"nz":[2,1,2,0,1]},{"size":2,"px":[5,6],"py":[2,6],"pz":[2,1],"nx":[22,9],"ny":[23,9],"nz":[0,-1]},{"size":2,"px":[19,19],"py":[5,5],"pz":[0,-1],"nx":[21,22],"ny":[2,4],"nz":[0,0]},{"size":2,"px":[2,5],"py":[8,6],"pz":[0,1],"nx":[3,4],"ny":[4,9],"nz":[1,-1]},{"size":2,"px":[18,14],"py":[13,17],"pz":[0,0],"nx":[14,4],"ny":[16,3],"nz":[0,-1]},{"size":2,"px":[6,6],"py":[6,3],"pz":[1,-1],"nx":[1,0],"ny":[2,2],"nz":[1,2]},{"size":2,"px":[23,21],"py":[21,14],"pz":[0,-1],"nx":[7,5],"ny":[0,0],"nz":[0,1]},{"size":2,"px":[15,10],"py":[23,7],"pz":[0,-1],"nx":[9,4],"ny":[4,5],"nz":[1,2]},{"size":2,"px":[4,18],"py":[3,8],"pz":[2,0],"nx":[8,4],"ny":[4,5],"nz":[1,-1]},{"size":2,"px":[13,7],"py":[2,11],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":5,"px":[2,3,5,6,1],"py":[7,14,2,2,4],"pz":[1,0,0,0,2],"nx":[8,4,4,7,7],"ny":[7,5,4,9,9],"nz":[1,2,2,1,-1]},{"size":2,"px":[5,3],"py":[6,3],"pz":[1,-1],"nx":[1,2],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[7,20,4,10,10],"py":[9,16,4,10,8],"pz":[1,0,2,1,1],"nx":[4,2,3,5,3],"ny":[11,5,6,12,5],"nz":[0,1,1,0,-1]},{"size":2,"px":[6,11],"py":[4,18],"pz":[1,-1],"nx":[8,6],"ny":[4,9],"nz":[1,1]},{"size":2,"px":[2,8],"py":[5,23],"pz":[2,0],"nx":[9,4],"ny":[0,2],"nz":[1,-1]},{"size":5,"px":[3,1,2,2,2],"py":[12,6,12,11,11],"pz":[0,1,0,0,-1],"nx":[0,0,0,0,0],"ny":[13,12,11,14,7],"nz":[0,0,0,0,1]},{"size":2,"px":[3,6],"py":[1,2],"pz":[2,1],"nx":[8,4],"ny":[4,14],"nz":[1,-1]},{"size":5,"px":[11,23,23,22,22],"py":[8,12,6,13,14],"pz":[1,0,0,0,0],"nx":[13,8,7,6,6],"ny":[6,3,3,9,9],"nz":[0,1,1,0,-1]},{"size":4,"px":[9,23,23,22],"py":[7,12,6,13],"pz":[1,-1,-1,-1],"nx":[11,23,23,23],"ny":[6,13,17,10],"nz":[1,0,0,0]},{"size":5,"px":[0,0,0,0,0],"py":[19,5,9,16,10],"pz":[0,2,1,0,1],"nx":[5,2,1,2,2],"ny":[18,10,5,9,9],"nz":[0,1,2,1,-1]},{"size":2,"px":[11,5],"py":[10,4],"pz":[1,2],"nx":[23,14],"ny":[23,3],"nz":[0,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,1],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[8,10],"py":[4,8],"pz":[0,-1],"nx":[8,8],"ny":[2,3],"nz":[0,0]},{"size":3,"px":[7,10,11],"py":[1,6,13],"pz":[0,-1,-1],"nx":[4,4,2],"ny":[3,8,2],"nz":[1,1,2]},{"size":2,"px":[8,4],"py":[8,2],"pz":[1,2],"nx":[10,5],"ny":[10,0],"nz":[0,-1]},{"size":2,"px":[7,16],"py":[20,21],"pz":[0,-1],"nx":[2,4],"ny":[5,10],"nz":[2,1]},{"size":2,"px":[3,10],"py":[7,8],"pz":[1,-1],"nx":[7,4],"ny":[20,7],"nz":[0,1]},{"size":5,"px":[11,11,11,11,11],"py":[10,12,13,11,11],"pz":[0,0,0,0,-1],"nx":[11,12,16,3,8],"ny":[6,6,10,1,8],"nz":[0,0,0,2,0]},{"size":2,"px":[12,6],"py":[4,2],"pz":[0,1],"nx":[7,7],"ny":[8,1],"nz":[0,-1]},{"size":5,"px":[23,23,23,23,23],"py":[22,20,21,19,19],"pz":[0,0,0,0,-1],"nx":[4,6,3,4,3],"ny":[19,23,15,20,16],"nz":[0,0,0,0,0]},{"size":3,"px":[8,4,14],"py":[12,3,8],"pz":[0,-1,-1],"nx":[4,2,10],"ny":[10,3,13],"nz":[1,2,0]},{"size":2,"px":[11,18],"py":[13,23],"pz":[0,-1],"nx":[5,5],"ny":[1,2],"nz":[2,2]},{"size":3,"px":[11,2,10],"py":[17,4,17],"pz":[0,2,0],"nx":[11,0,22],"ny":[15,2,4],"nz":[0,-1,-1]},{"size":3,"px":[11,3,0],"py":[15,4,8],"pz":[0,-1,-1],"nx":[14,11,4],"ny":[9,17,7],"nz":[0,0,1]},{"size":2,"px":[17,16],"py":[2,1],"pz":[0,0],"nx":[9,11],"ny":[4,6],"nz":[1,-1]},{"size":2,"px":[3,4],"py":[21,23],"pz":[0,0],"nx":[4,0],"ny":[3,3],"nz":[1,-1]},{"size":2,"px":[18,2],"py":[20,0],"pz":[0,-1],"nx":[4,9],"ny":[5,10],"nz":[2,1]},{"size":2,"px":[9,1],"py":[19,3],"pz":[0,-1],"nx":[0,0],"ny":[9,21],"nz":[1,0]},{"size":2,"px":[19,19],"py":[21,22],"pz":[0,0],"nx":[19,0],"ny":[23,0],"nz":[0,-1]},{"size":4,"px":[11,2,3,2],"py":[6,6,9,4],"pz":[0,-1,-1,-1],"nx":[4,9,19,19],"ny":[5,10,17,18],"nz":[2,1,0,0]},{"size":2,"px":[2,4],"py":[4,8],"pz":[2,1],"nx":[4,9],"ny":[10,10],"nz":[1,-1]},{"size":2,"px":[23,22],"py":[8,12],"pz":[0,-1],"nx":[7,4],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[12,1],"py":[5,2],"pz":[0,-1],"nx":[9,11],"ny":[2,1],"nz":[0,0]},{"size":2,"px":[4,4],"py":[2,2],"pz":[0,-1],"nx":[3,2],"ny":[1,2],"nz":[0,0]},{"size":2,"px":[17,9],"py":[13,7],"pz":[0,1],"nx":[9,5],"ny":[4,0],"nz":[1,-1]},{"size":4,"px":[0,0,9,13],"py":[3,3,7,3],"pz":[2,-1,-1,-1],"nx":[2,4,4,11],"ny":[1,2,8,5],"nz":[2,1,1,0]},{"size":5,"px":[3,6,5,6,6],"py":[0,0,2,1,1],"pz":[1,0,0,0,-1],"nx":[2,2,2,1,1],"ny":[21,19,20,16,17],"nz":[0,0,0,0,0]},{"size":2,"px":[13,3],"py":[22,10],"pz":[0,-1],"nx":[7,4],"ny":[10,5],"nz":[1,2]},{"size":2,"px":[3,2],"py":[7,3],"pz":[1,2],"nx":[8,4],"ny":[4,5],"nz":[1,-1]},{"size":5,"px":[17,8,15,7,15],"py":[13,6,16,5,12],"pz":[0,1,0,1,0],"nx":[5,4,6,3,4],"ny":[1,2,1,0,3],"nz":[0,0,0,1,-1]},{"size":5,"px":[12,9,11,12,10],"py":[0,1,2,2,0],"pz":[0,0,0,0,0],"nx":[8,16,7,4,4],"ny":[9,23,9,3,2],"nz":[1,0,1,2,-1]},{"size":2,"px":[4,11],"py":[1,4],"pz":[2,-1],"nx":[8,7],"ny":[4,4],"nz":[0,0]},{"size":4,"px":[7,4,5,8],"py":[13,2,1,3],"pz":[0,-1,-1,-1],"nx":[9,4,9,9],"ny":[9,5,10,11],"nz":[0,1,0,0]},{"size":2,"px":[10,11],"py":[10,11],"pz":[0,-1],"nx":[2,6],"ny":[2,2],"nz":[2,1]},{"size":2,"px":[21,3],"py":[11,2],"pz":[0,-1],"nx":[22,22],"ny":[20,18],"nz":[0,0]},{"size":2,"px":[7,6],"py":[1,2],"pz":[0,0],"nx":[5,10],"ny":[1,0],"nz":[0,-1]},{"size":2,"px":[21,3],"py":[18,1],"pz":[0,-1],"nx":[16,15],"ny":[4,4],"nz":[0,0]},{"size":2,"px":[12,7],"py":[4,1],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[13,11],"py":[23,17],"pz":[0,0],"nx":[11,21],"ny":[16,0],"nz":[0,-1]},{"size":2,"px":[1,2],"py":[0,6],"pz":[1,-1],"nx":[16,16],"ny":[9,11],"nz":[0,0]},{"size":2,"px":[12,13],"py":[20,20],"pz":[0,0],"nx":[11,3],"ny":[21,7],"nz":[0,-1]},{"size":3,"px":[19,20,9],"py":[21,18,11],"pz":[0,0,1],"nx":[17,4,11],"ny":[19,2,0],"nz":[0,-1,-1]},{"size":2,"px":[12,5],"py":[5,2],"pz":[0,1],"nx":[7,9],"ny":[7,8],"nz":[0,-1]},{"size":5,"px":[8,4,4,8,4],"py":[4,4,5,10,3],"pz":[1,1,2,0,2],"nx":[11,22,11,23,23],"ny":[0,0,1,3,3],"nz":[1,0,1,0,-1]},{"size":2,"px":[8,14],"py":[10,23],"pz":[1,0],"nx":[7,2],"ny":[10,9],"nz":[1,-1]},{"size":2,"px":[5,14],"py":[6,23],"pz":[1,-1],"nx":[1,2],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[11,2],"py":[19,3],"pz":[0,-1],"nx":[10,12],"ny":[18,18],"nz":[0,0]},{"size":2,"px":[12,3],"py":[4,1],"pz":[0,2],"nx":[6,6],"ny":[11,11],"nz":[1,-1]},{"size":5,"px":[0,0,0,0,0],"py":[18,10,20,19,19],"pz":[0,1,0,0,-1],"nx":[11,10,14,12,13],"ny":[2,2,2,2,2],"nz":[0,0,0,0,0]},{"size":3,"px":[12,2,9],"py":[14,5,10],"pz":[0,-1,-1],"nx":[11,10,5],"ny":[10,13,5],"nz":[0,0,1]},{"size":2,"px":[2,3],"py":[3,7],"pz":[2,1],"nx":[3,10],"ny":[4,13],"nz":[1,-1]},{"size":2,"px":[9,3],"py":[21,7],"pz":[0,-1],"nx":[10,21],"ny":[7,15],"nz":[1,0]},{"size":2,"px":[21,10],"py":[16,8],"pz":[0,1],"nx":[8,2],"ny":[10,8],"nz":[1,-1]},{"size":2,"px":[8,8],"py":[6,7],"pz":[1,-1],"nx":[12,11],"ny":[11,7],"nz":[0,1]},{"size":2,"px":[3,11],"py":[4,20],"pz":[2,0],"nx":[11,10],"ny":[19,1],"nz":[0,-1]},{"size":2,"px":[17,5],"py":[13,3],"pz":[0,-1],"nx":[7,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[7,1],"py":[23,3],"pz":[0,2],"nx":[14,6],"ny":[12,9],"nz":[0,-1]},{"size":2,"px":[12,5],"py":[11,2],"pz":[0,-1],"nx":[11,7],"ny":[3,1],"nz":[0,1]},{"size":2,"px":[9,6],"py":[2,17],"pz":[0,-1],"nx":[4,6],"ny":[4,12],"nz":[1,0]},{"size":2,"px":[14,19],"py":[5,6],"pz":[0,-1],"nx":[9,3],"ny":[9,1],"nz":[0,2]},{"size":5,"px":[12,13,13,13,12],"py":[9,11,12,13,10],"pz":[0,0,0,0,0],"nx":[2,4,4,4,4],"ny":[7,18,17,14,14],"nz":[1,0,0,0,-1]},{"size":2,"px":[10,10],"py":[6,6],"pz":[1,-1],"nx":[20,18],"ny":[18,23],"nz":[0,0]},{"size":2,"px":[5,6],"py":[4,14],"pz":[1,-1],"nx":[9,4],"ny":[2,1],"nz":[1,2]},{"size":2,"px":[11,9],"py":[4,18],"pz":[0,-1],"nx":[4,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[15,0],"py":[18,4],"pz":[0,-1],"nx":[3,4],"ny":[5,4],"nz":[2,2]},{"size":4,"px":[7,3,6,6],"py":[8,4,6,5],"pz":[1,2,1,1],"nx":[10,4,13,0],"ny":[10,4,9,22],"nz":[0,-1,-1,-1]},{"size":2,"px":[10,8],"py":[18,11],"pz":[0,-1],"nx":[5,4],"ny":[8,10],"nz":[1,1]},{"size":4,"px":[17,2,10,2],"py":[14,1,10,3],"pz":[0,-1,-1,-1],"nx":[8,8,17,8],"ny":[4,5,12,6],"nz":[1,1,0,1]},{"size":5,"px":[9,11,9,4,10],"py":[1,1,0,0,1],"pz":[0,0,0,1,0],"nx":[8,4,7,15,15],"ny":[7,2,4,17,17],"nz":[1,2,1,0,-1]},{"size":2,"px":[4,3],"py":[11,8],"pz":[0,-1],"nx":[2,2],"ny":[1,2],"nz":[2,2]},{"size":2,"px":[11,3],"py":[13,8],"pz":[0,-1],"nx":[1,1],"ny":[5,2],"nz":[1,2]},{"size":2,"px":[6,2],"py":[8,3],"pz":[0,2],"nx":[3,1],"ny":[5,2],"nz":[1,-1]},{"size":5,"px":[10,5,7,8,6],"py":[9,7,7,7,7],"pz":[0,0,0,0,0],"nx":[7,3,0,2,15],"ny":[8,0,1,18,17],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[17,8],"py":[12,6],"pz":[0,1],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":5,"px":[3,11,8,10,12],"py":[0,2,10,2,3],"pz":[2,0,0,0,0],"nx":[3,2,10,2,2],"ny":[6,4,11,3,3],"nz":[0,1,0,1,-1]},{"size":2,"px":[3,6],"py":[2,4],"pz":[2,1],"nx":[8,19],"ny":[4,16],"nz":[1,-1]},{"size":2,"px":[2,2],"py":[1,1],"pz":[2,-1],"nx":[7,17],"ny":[1,2],"nz":[1,0]},{"size":5,"px":[16,15,14,13,7],"py":[0,0,0,0,0],"pz":[0,0,0,0,-1],"nx":[6,4,8,3,11],"ny":[3,4,4,1,6],"nz":[1,1,1,2,0]},{"size":2,"px":[11,1],"py":[8,5],"pz":[0,-1],"nx":[13,4],"ny":[10,2],"nz":[0,2]},{"size":2,"px":[4,9],"py":[0,2],"pz":[2,1],"nx":[4,11],"ny":[0,2],"nz":[0,-1]},{"size":2,"px":[15,15],"py":[2,2],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[8,17],"py":[9,22],"pz":[1,0],"nx":[8,20],"ny":[10,2],"nz":[1,-1]},{"size":2,"px":[10,10],"py":[14,22],"pz":[0,-1],"nx":[3,11],"ny":[3,3],"nz":[1,0]},{"size":2,"px":[4,2],"py":[1,0],"pz":[1,2],"nx":[5,8],"ny":[3,9],"nz":[0,-1]},{"size":2,"px":[2,3],"py":[4,8],"pz":[2,1],"nx":[9,5],"ny":[15,19],"nz":[0,-1]},{"size":2,"px":[5,2],"py":[1,1],"pz":[0,1],"nx":[10,10],"ny":[6,6],"nz":[0,-1]},{"size":2,"px":[17,6],"py":[10,2],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":3,"px":[13,7,3],"py":[5,2,6],"pz":[0,1,-1],"nx":[17,16,17],"ny":[1,1,2],"nz":[0,0,0]},{"size":2,"px":[11,10],"py":[3,3],"pz":[0,0],"nx":[8,4],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[4,8],"py":[0,8],"pz":[2,-1],"nx":[3,4],"ny":[0,0],"nz":[1,1]},{"size":5,"px":[9,2,4,1,2],"py":[13,3,9,2,5],"pz":[0,2,1,2,2],"nx":[9,5,10,4,10],"ny":[5,1,3,0,0],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[6,12],"py":[5,9],"pz":[1,0],"nx":[0,2],"ny":[23,9],"nz":[0,-1]},{"size":2,"px":[22,11],"py":[21,8],"pz":[0,1],"nx":[10,0],"ny":[17,2],"nz":[0,-1]},{"size":2,"px":[3,1],"py":[22,9],"pz":[0,1],"nx":[22,5],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[5,6],"ny":[10,9],"nz":[1,-1]},{"size":4,"px":[7,3,17,7],"py":[8,2,10,11],"pz":[0,2,0,1],"nx":[6,10,5,23],"ny":[9,21,1,23],"nz":[0,-1,-1,-1]},{"size":2,"px":[8,3],"py":[7,2],"pz":[1,2],"nx":[8,9],"ny":[4,9],"nz":[1,-1]},{"size":2,"px":[9,5],"py":[14,6],"pz":[0,1],"nx":[8,8],"ny":[13,13],"nz":[0,-1]},{"size":3,"px":[11,6,8],"py":[20,3,20],"pz":[0,-1,-1],"nx":[5,3,12],"ny":[9,5,18],"nz":[1,2,0]},{"size":2,"px":[3,9],"py":[1,3],"pz":[1,0],"nx":[2,8],"ny":[5,8],"nz":[0,-1]},{"size":2,"px":[15,9],"py":[21,3],"pz":[0,-1],"nx":[3,4],"ny":[5,5],"nz":[2,2]},{"size":2,"px":[2,9],"py":[7,11],"pz":[1,-1],"nx":[2,2],"ny":[8,9],"nz":[1,1]},{"size":4,"px":[3,4,3,1],"py":[14,21,19,6],"pz":[0,0,0,1],"nx":[10,16,4,5],"ny":[8,1,7,6],"nz":[0,-1,-1,-1]},{"size":4,"px":[10,4,3,1],"py":[5,21,19,6],"pz":[1,-1,-1,-1],"nx":[21,10,5,11],"ny":[4,2,3,4],"nz":[0,1,2,1]},{"size":2,"px":[4,17],"py":[3,8],"pz":[2,0],"nx":[17,2],"ny":[9,22],"nz":[0,-1]},{"size":2,"px":[17,12],"py":[14,20],"pz":[0,-1],"nx":[7,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[10,12],"py":[9,20],"pz":[0,-1],"nx":[11,23],"ny":[8,18],"nz":[1,0]},{"size":2,"px":[5,11],"py":[4,7],"pz":[2,1],"nx":[8,15],"ny":[7,5],"nz":[1,-1]},{"size":2,"px":[11,15],"py":[13,8],"pz":[0,-1],"nx":[11,11],"ny":[6,7],"nz":[1,1]},{"size":2,"px":[6,15],"py":[14,8],"pz":[0,-1],"nx":[4,4],"ny":[12,13],"nz":[0,0]},{"size":2,"px":[5,5],"py":[0,1],"pz":[2,2],"nx":[15,4],"ny":[5,5],"nz":[0,-1]},{"size":2,"px":[16,17],"py":[2,2],"pz":[0,0],"nx":[20,8],"ny":[3,7],"nz":[0,-1]},{"size":3,"px":[6,3,2],"py":[10,6,1],"pz":[0,-1,-1],"nx":[4,3,2],"ny":[3,4,2],"nz":[1,1,2]},{"size":2,"px":[10,6],"py":[4,6],"pz":[0,-1],"nx":[6,13],"ny":[0,1],"nz":[1,0]},{"size":2,"px":[10,10],"py":[8,7],"pz":[1,1],"nx":[8,2],"ny":[7,2],"nz":[1,-1]},{"size":2,"px":[7,1],"py":[12,4],"pz":[0,-1],"nx":[3,4],"ny":[5,5],"nz":[1,1]},{"size":2,"px":[11,15],"py":[15,14],"pz":[0,-1],"nx":[3,11],"ny":[4,13],"nz":[1,0]},{"size":5,"px":[13,9,11,14,12],"py":[0,2,0,0,2],"pz":[0,0,0,0,0],"nx":[5,4,4,3,4],"ny":[4,4,18,7,17],"nz":[1,1,0,1,0]},{"size":3,"px":[13,12,11],"py":[22,22,22],"pz":[0,0,0],"nx":[11,12,13],"ny":[20,20,20],"nz":[0,0,0]},{"size":2,"px":[6,13],"py":[2,4],"pz":[1,0],"nx":[7,6],"ny":[8,9],"nz":[0,-1]},{"size":2,"px":[0,0],"py":[23,4],"pz":[0,-1],"nx":[5,9],"ny":[1,1],"nz":[1,0]},{"size":2,"px":[14,14],"py":[19,19],"pz":[0,-1],"nx":[11,11],"ny":[10,9],"nz":[1,1]},{"size":2,"px":[23,23],"py":[11,9],"pz":[0,0],"nx":[23,23],"ny":[0,11],"nz":[0,-1]},{"size":2,"px":[23,3],"py":[23,5],"pz":[0,-1],"nx":[4,1],"ny":[23,10],"nz":[0,1]},{"size":2,"px":[9,1],"py":[7,4],"pz":[1,-1],"nx":[19,10],"ny":[20,9],"nz":[0,1]},{"size":2,"px":[16,1],"py":[9,4],"pz":[0,-1],"nx":[7,8],"ny":[3,3],"nz":[1,1]},{"size":2,"px":[7,6],"py":[13,13],"pz":[0,0],"nx":[4,5],"ny":[4,11],"nz":[1,-1]},{"size":5,"px":[19,20,20,10,10],"py":[0,0,2,0,1],"pz":[0,0,0,1,1],"nx":[7,7,15,4,4],"ny":[4,13,7,4,4],"nz":[1,0,0,1,-1]},{"size":2,"px":[12,23],"py":[6,5],"pz":[0,-1],"nx":[18,18],"ny":[17,16],"nz":[0,0]},{"size":2,"px":[6,3],"py":[9,2],"pz":[1,2],"nx":[14,18],"ny":[9,1],"nz":[0,-1]},{"size":2,"px":[9,13],"py":[16,5],"pz":[0,-1],"nx":[5,4],"ny":[7,9],"nz":[1,1]},{"size":2,"px":[10,10],"py":[8,10],"pz":[1,1],"nx":[4,1],"ny":[5,3],"nz":[2,-1]},{"size":2,"px":[12,11],"py":[13,4],"pz":[0,-1],"nx":[0,0],"ny":[14,15],"nz":[0,0]},{"size":2,"px":[2,1],"py":[20,17],"pz":[0,0],"nx":[12,12],"ny":[22,2],"nz":[0,-1]},{"size":2,"px":[2,3],"py":[6,7],"pz":[1,-1],"nx":[21,21],"ny":[13,12],"nz":[0,0]},{"size":2,"px":[3,10],"py":[4,23],"pz":[2,0],"nx":[10,2],"ny":[21,5],"nz":[0,-1]},{"size":2,"px":[6,12],"py":[3,6],"pz":[1,0],"nx":[11,0],"ny":[17,1],"nz":[0,-1]},{"size":2,"px":[11,4],"py":[21,9],"pz":[0,-1],"nx":[2,3],"ny":[18,22],"nz":[0,0]},{"size":2,"px":[13,5],"py":[18,9],"pz":[0,-1],"nx":[6,7],"ny":[8,9],"nz":[1,1]},{"size":2,"px":[21,4],"py":[16,3],"pz":[0,-1],"nx":[23,23],"ny":[16,15],"nz":[0,0]},{"size":2,"px":[2,0],"py":[7,4],"pz":[1,-1],"nx":[3,8],"ny":[7,4],"nz":[1,1]},{"size":2,"px":[15,16],"py":[11,12],"pz":[0,0],"nx":[8,5],"ny":[4,5],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[7,5],"pz":[0,0],"nx":[17,17],"ny":[11,10],"nz":[0,-1]},{"size":5,"px":[8,13,12,3,3],"py":[6,23,23,3,3],"pz":[1,0,0,2,-1],"nx":[0,1,0,0,0],"ny":[2,13,4,5,6],"nz":[2,0,1,1,1]},{"size":2,"px":[0,1],"py":[7,8],"pz":[1,-1],"nx":[0,0],"ny":[1,0],"nz":[2,2]},{"size":2,"px":[2,12],"py":[1,7],"pz":[1,-1],"nx":[0,0],"ny":[12,14],"nz":[0,0]},{"size":2,"px":[5,1],"py":[7,4],"pz":[1,2],"nx":[8,0],"ny":[15,14],"nz":[0,-1]},{"size":2,"px":[7,4],"py":[14,8],"pz":[0,-1],"nx":[2,4],"ny":[1,4],"nz":[2,1]},{"size":2,"px":[5,3],"py":[3,1],"pz":[2,-1],"nx":[9,9],"ny":[5,6],"nz":[1,1]},{"size":2,"px":[4,5],"py":[2,3],"pz":[1,-1],"nx":[11,12],"ny":[23,23],"nz":[0,0]},{"size":2,"px":[10,5],"py":[7,0],"pz":[1,-1],"nx":[22,22],"ny":[19,18],"nz":[0,0]},{"size":3,"px":[10,2,9],"py":[20,9,4],"pz":[0,-1,-1],"nx":[1,10,11],"ny":[2,11,9],"nz":[2,0,0]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[9,3],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[17,6],"py":[7,16],"pz":[0,-1],"nx":[17,17],"ny":[9,6],"nz":[0,0]},{"size":3,"px":[8,1,9],"py":[6,3,4],"pz":[1,-1,-1],"nx":[2,9,2],"ny":[5,13,3],"nz":[2,0,2]},{"size":4,"px":[10,10,9,2],"py":[12,11,2,10],"pz":[0,0,-1,-1],"nx":[6,11,3,13],"ny":[2,4,1,4],"nz":[1,0,2,0]},{"size":2,"px":[3,3],"py":[7,1],"pz":[1,-1],"nx":[4,3],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[0,0],"py":[4,8],"pz":[2,1],"nx":[4,4],"ny":[15,5],"nz":[0,-1]},{"size":2,"px":[5,0],"py":[4,8],"pz":[1,-1],"nx":[13,13],"ny":[9,10],"nz":[0,0]},{"size":2,"px":[6,3],"py":[2,1],"pz":[1,2],"nx":[8,17],"ny":[4,12],"nz":[1,-1]},{"size":2,"px":[15,16],"py":[11,6],"pz":[0,0],"nx":[16,17],"ny":[5,12],"nz":[0,-1]},{"size":2,"px":[13,11],"py":[9,7],"pz":[0,-1],"nx":[0,1],"ny":[9,20],"nz":[1,0]},{"size":3,"px":[16,11,20],"py":[4,7,23],"pz":[0,-1,-1],"nx":[8,9,4],"ny":[4,6,4],"nz":[1,1,2]},{"size":2,"px":[1,1],"py":[18,17],"pz":[0,0],"nx":[9,6],"ny":[7,11],"nz":[0,-1]},{"size":3,"px":[4,4,19],"py":[3,2,9],"pz":[2,2,0],"nx":[2,14,11],"ny":[5,3,9],"nz":[1,-1,-1]},{"size":2,"px":[11,19],"py":[13,9],"pz":[0,-1],"nx":[11,11],"ny":[4,5],"nz":[1,1]},{"size":2,"px":[13,7],"py":[19,2],"pz":[0,-1],"nx":[3,5],"ny":[6,12],"nz":[1,0]},{"size":4,"px":[9,4,4,2],"py":[13,9,8,4],"pz":[0,1,1,2],"nx":[13,0,0,14],"ny":[18,11,6,1],"nz":[0,-1,-1,-1]},{"size":2,"px":[11,15],"py":[8,10],"pz":[0,0],"nx":[14,11],"ny":[9,2],"nz":[0,-1]},{"size":2,"px":[3,2],"py":[8,5],"pz":[1,2],"nx":[4,4],"ny":[10,10],"nz":[1,-1]},{"size":4,"px":[4,6,16,14],"py":[1,1,1,7],"pz":[2,1,0,0],"nx":[10,1,1,2],"ny":[8,5,10,3],"nz":[0,-1,-1,-1]},{"size":4,"px":[2,3,1,2],"py":[3,1,0,2],"pz":[0,0,1,0],"nx":[0,0,0,0],"ny":[1,1,2,0],"nz":[0,1,0,1]},{"size":2,"px":[8,8],"py":[6,7],"pz":[1,1],"nx":[8,0],"ny":[4,1],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[3,0],"pz":[0,1],"nx":[2,2],"ny":[1,16],"nz":[1,-1]},{"size":2,"px":[6,6],"py":[19,18],"pz":[0,0],"nx":[2,10],"ny":[5,8],"nz":[2,-1]},{"size":2,"px":[8,5],"py":[21,11],"pz":[0,-1],"nx":[3,2],"ny":[11,5],"nz":[1,2]},{"size":2,"px":[4,9],"py":[4,7],"pz":[2,1],"nx":[8,7],"ny":[10,4],"nz":[1,-1]},{"size":5,"px":[4,18,19,16,19],"py":[3,12,12,23,13],"pz":[2,0,0,0,0],"nx":[2,8,3,2,2],"ny":[4,23,10,5,5],"nz":[2,0,1,2,-1]},{"size":2,"px":[4,8],"py":[6,11],"pz":[1,0],"nx":[8,3],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[3,12],"py":[4,13],"pz":[2,0],"nx":[10,5],"ny":[15,21],"nz":[0,-1]},{"size":2,"px":[2,9],"py":[4,23],"pz":[2,0],"nx":[19,4],"ny":[9,3],"nz":[0,2]},{"size":2,"px":[3,6],"py":[8,15],"pz":[1,0],"nx":[6,1],"ny":[18,5],"nz":[0,-1]},{"size":2,"px":[9,0],"py":[20,3],"pz":[0,-1],"nx":[2,10],"ny":[5,17],"nz":[2,0]},{"size":3,"px":[10,6,3],"py":[2,7,3],"pz":[0,-1,-1],"nx":[5,4,2],"ny":[9,7,2],"nz":[1,1,2]},{"size":2,"px":[14,6],"py":[12,7],"pz":[0,-1],"nx":[2,10],"ny":[0,1],"nz":[2,0]},{"size":3,"px":[10,5,1],"py":[15,5,4],"pz":[0,-1,-1],"nx":[9,4,18],"ny":[2,0,4],"nz":[1,2,0]},{"size":2,"px":[17,2],"py":[12,6],"pz":[0,-1],"nx":[8,16],"ny":[4,11],"nz":[1,0]},{"size":3,"px":[7,13,4],"py":[0,0,1],"pz":[1,0,-1],"nx":[18,4,4],"ny":[13,2,3],"nz":[0,2,2]},{"size":2,"px":[1,11],"py":[10,6],"pz":[0,-1],"nx":[0,1],"ny":[15,17],"nz":[0,0]},{"size":3,"px":[9,12,8],"py":[8,17,11],"pz":[1,0,1],"nx":[12,0,20],"ny":[16,9,13],"nz":[0,-1,-1]},{"size":2,"px":[11,4],"py":[5,8],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[16,3],"py":[9,8],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[6,3],"py":[11,5],"pz":[1,2],"nx":[11,5],"ny":[21,5],"nz":[0,-1]},{"size":2,"px":[11,13],"py":[1,1],"pz":[0,0],"nx":[4,4],"ny":[5,5],"nz":[1,-1]},{"size":2,"px":[14,4],"py":[4,3],"pz":[0,-1],"nx":[12,10],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[3,6],"py":[2,4],"pz":[2,1],"nx":[9,7],"ny":[9,7],"nz":[0,-1]},{"size":3,"px":[5,6,6],"py":[4,4,4],"pz":[1,-1,-1],"nx":[13,8,7],"ny":[8,3,4],"nz":[0,1,1]},{"size":2,"px":[5,5],"py":[2,11],"pz":[1,1],"nx":[10,11],"ny":[22,22],"nz":[0,0]},{"size":2,"px":[16,9],"py":[13,7],"pz":[0,1],"nx":[8,14],"ny":[4,12],"nz":[1,-1]},{"size":2,"px":[13,5],"py":[13,3],"pz":[0,2],"nx":[16,22],"ny":[13,6],"nz":[0,-1]},{"size":4,"px":[4,4,3,4],"py":[4,3,4,5],"pz":[2,2,2,2],"nx":[21,5,17,7],"ny":[0,2,5,23],"nz":[0,-1,-1,-1]},{"size":2,"px":[4,16],"py":[0,1],"pz":[2,0],"nx":[15,1],"ny":[23,10],"nz":[0,-1]},{"size":2,"px":[4,6],"py":[11,2],"pz":[0,-1],"nx":[15,6],"ny":[2,1],"nz":[0,1]},{"size":2,"px":[6,3],"py":[2,1],"pz":[1,2],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":3,"px":[13,14,5],"py":[9,15,2],"pz":[0,-1,-1],"nx":[11,1,11],"ny":[10,3,11],"nz":[0,1,0]},{"size":2,"px":[5,1],"py":[6,2],"pz":[1,-1],"nx":[1,1],"ny":[2,5],"nz":[2,1]},{"size":2,"px":[11,5],"py":[1,0],"pz":[1,2],"nx":[10,4],"ny":[2,3],"nz":[1,-1]},{"size":2,"px":[11,11],"py":[8,9],"pz":[1,1],"nx":[23,4],"ny":[23,2],"nz":[0,-1]},{"size":2,"px":[5,2],"py":[10,2],"pz":[0,-1],"nx":[18,10],"ny":[0,1],"nz":[0,1]},{"size":2,"px":[20,4],"py":[7,3],"pz":[0,2],"nx":[8,4],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[10,4],"py":[5,4],"pz":[1,-1],"nx":[11,11],"ny":[5,6],"nz":[1,1]},{"size":3,"px":[14,15,16],"py":[0,0,1],"pz":[0,0,0],"nx":[8,5,15],"ny":[7,2,10],"nz":[1,-1,-1]},{"size":2,"px":[2,2],"py":[1,1],"pz":[2,-1],"nx":[17,18],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[13,8],"py":[15,7],"pz":[0,-1],"nx":[9,4],"ny":[5,2],"nz":[0,1]},{"size":2,"px":[4,0],"py":[6,17],"pz":[1,-1],"nx":[3,2],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[14,8],"py":[17,9],"pz":[0,-1],"nx":[7,6],"ny":[8,8],"nz":[1,1]},{"size":2,"px":[10,4],"py":[7,1],"pz":[1,-1],"nx":[15,6],"ny":[14,4],"nz":[0,1]},{"size":2,"px":[3,12],"py":[8,19],"pz":[1,0],"nx":[13,10],"ny":[17,9],"nz":[0,-1]},{"size":2,"px":[7,12],"py":[2,4],"pz":[1,0],"nx":[6,11],"ny":[3,2],"nz":[0,-1]},{"size":4,"px":[2,1,6,1],"py":[10,3,23,8],"pz":[1,2,0,1],"nx":[17,10,23,0],"ny":[9,2,20,3],"nz":[0,-1,-1,-1]},{"size":2,"px":[9,9],"py":[2,8],"pz":[0,-1],"nx":[2,2],"ny":[4,2],"nz":[2,2]},{"size":2,"px":[3,16],"py":[1,6],"pz":[2,0],"nx":[8,4],"ny":[2,5],"nz":[1,-1]},{"size":2,"px":[3,6],"py":[1,2],"pz":[2,1],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[5,6],"py":[3,0],"pz":[2,-1],"nx":[9,5],"ny":[2,1],"nz":[0,1]},{"size":2,"px":[3,16],"py":[5,23],"pz":[1,-1],"nx":[0,0],"ny":[6,3],"nz":[1,2]},{"size":4,"px":[0,0,0,0],"py":[3,2,12,5],"pz":[2,2,0,1],"nx":[2,3,2,13],"ny":[5,5,2,19],"nz":[1,-1,-1,-1]},{"size":2,"px":[11,11],"py":[10,11],"pz":[0,0],"nx":[5,5],"ny":[1,1],"nz":[2,-1]},{"size":2,"px":[5,2],"py":[0,4],"pz":[2,-1],"nx":[2,2],"ny":[10,8],"nz":[1,1]},{"size":4,"px":[16,2,8,4],"py":[14,0,11,5],"pz":[0,-1,-1,-1],"nx":[18,14,7,7],"ny":[13,14,8,6],"nz":[0,0,1,1]},{"size":2,"px":[8,9],"py":[2,2],"pz":[0,0],"nx":[5,14],"ny":[4,14],"nz":[1,-1]},{"size":2,"px":[3,5],"py":[11,20],"pz":[1,0],"nx":[11,4],"ny":[0,2],"nz":[0,-1]},{"size":2,"px":[2,2],"py":[3,4],"pz":[2,2],"nx":[3,4],"ny":[4,2],"nz":[1,-1]},{"size":3,"px":[10,4,3],"py":[5,5,3],"pz":[0,-1,-1],"nx":[11,3,10],"ny":[2,0,2],"nz":[0,2,0]},{"size":2,"px":[15,15],"py":[1,1],"pz":[0,-1],"nx":[7,4],"ny":[5,2],"nz":[1,2]},{"size":4,"px":[9,5,2,6],"py":[22,8,4,19],"pz":[0,1,2,0],"nx":[9,5,0,3],"ny":[20,5,22,4],"nz":[0,-1,-1,-1]},{"size":3,"px":[1,4,10],"py":[3,9,12],"pz":[2,1,0],"nx":[0,10,0],"ny":[0,5,0],"nz":[0,-1,-1]},{"size":2,"px":[1,6],"py":[0,7],"pz":[0,-1],"nx":[20,19],"ny":[14,14],"nz":[0,0]},{"size":2,"px":[13,4],"py":[14,15],"pz":[0,-1],"nx":[2,1],"ny":[5,7],"nz":[0,0]},{"size":2,"px":[17,7],"py":[9,11],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[17,9],"py":[12,6],"pz":[0,1],"nx":[15,10],"ny":[9,8],"nz":[0,-1]},{"size":2,"px":[0,0],"py":[0,1],"pz":[2,2],"nx":[9,7],"ny":[6,17],"nz":[1,-1]},{"size":3,"px":[3,3,15],"py":[3,4,6],"pz":[2,1,0],"nx":[0,2,22],"ny":[5,8,9],"nz":[0,-1,-1]},{"size":4,"px":[15,15,15,1],"py":[12,6,6,1],"pz":[0,-1,-1,-1],"nx":[4,7,13,4],"ny":[4,7,12,2],"nz":[2,1,0,2]},{"size":2,"px":[3,15],"py":[12,6],"pz":[0,-1],"nx":[9,1],"ny":[14,2],"nz":[0,2]},{"size":2,"px":[12,12],"py":[11,12],"pz":[0,0],"nx":[9,5],"ny":[4,4],"nz":[1,-1]},{"size":3,"px":[23,6,7],"py":[23,3,4],"pz":[0,-1,-1],"nx":[19,16,17],"ny":[17,14,15],"nz":[0,0,0]},{"size":2,"px":[9,5],"py":[2,7],"pz":[1,-1],"nx":[11,23],"ny":[10,18],"nz":[1,0]},{"size":3,"px":[0,0,0],"py":[4,9,2],"pz":[1,0,2],"nx":[2,0,0],"ny":[9,2,1],"nz":[0,-1,-1]},{"size":2,"px":[12,0],"py":[11,9],"pz":[0,-1],"nx":[1,0],"ny":[18,5],"nz":[0,2]},{"size":2,"px":[5,4],"py":[10,6],"pz":[0,1],"nx":[10,6],"ny":[10,18],"nz":[0,-1]},{"size":2,"px":[13,12],"py":[13,13],"pz":[0,-1],"nx":[5,11],"ny":[1,3],"nz":[2,1]},{"size":2,"px":[10,19],"py":[5,22],"pz":[1,-1],"nx":[4,12],"ny":[1,5],"nz":[2,0]},{"size":2,"px":[8,6],"py":[0,0],"pz":[0,0],"nx":[3,12],"ny":[0,3],"nz":[0,-1]},{"size":2,"px":[9,6],"py":[7,0],"pz":[1,-1],"nx":[12,12],"ny":[10,11],"nz":[0,0]},{"size":4,"px":[3,1,3,2],"py":[20,9,21,19],"pz":[0,1,0,0],"nx":[20,20,5,12],"ny":[10,15,2,10],"nz":[0,-1,-1,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,1],"ny":[4,6],"nz":[1,-1]},{"size":3,"px":[5,11,11],"py":[1,3,4],"pz":[2,1,1],"nx":[3,3,7],"ny":[5,5,0],"nz":[1,-1,-1]},{"size":3,"px":[8,6,7],"py":[10,5,6],"pz":[1,1,1],"nx":[23,3,7],"ny":[0,5,0],"nz":[0,-1,-1]},{"size":2,"px":[2,7],"py":[2,14],"pz":[1,-1],"nx":[7,3],"ny":[12,4],"nz":[0,1]},{"size":2,"px":[5,3],"py":[6,3],"pz":[1,2],"nx":[13,3],"ny":[12,4],"nz":[0,-1]},{"size":2,"px":[11,18],"py":[11,4],"pz":[0,-1],"nx":[23,11],"ny":[19,10],"nz":[0,1]},{"size":2,"px":[7,2],"py":[12,3],"pz":[0,-1],"nx":[8,4],"ny":[11,5],"nz":[0,1]},{"size":2,"px":[11,11],"py":[0,11],"pz":[1,-1],"nx":[3,3],"ny":[19,18],"nz":[0,0]},{"size":2,"px":[11,1],"py":[11,11],"pz":[1,-1],"nx":[13,15],"ny":[6,5],"nz":[0,0]},{"size":2,"px":[8,8],"py":[9,9],"pz":[0,-1],"nx":[5,11],"ny":[1,3],"nz":[2,1]},{"size":4,"px":[6,4,8,3],"py":[6,2,4,3],"pz":[0,2,1,2],"nx":[7,0,15,8],"ny":[8,8,16,7],"nz":[0,-1,-1,-1]},{"size":2,"px":[4,3],"py":[22,20],"pz":[0,0],"nx":[2,8],"ny":[5,4],"nz":[2,-1]},{"size":2,"px":[12,6],"py":[11,0],"pz":[0,-1],"nx":[0,0],"ny":[3,1],"nz":[1,2]},{"size":2,"px":[0,0],"py":[12,7],"pz":[0,1],"nx":[3,1],"ny":[23,9],"nz":[0,-1]},{"size":2,"px":[7,0],"py":[11,5],"pz":[1,-1],"nx":[0,0],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[8,8],"py":[10,10],"pz":[0,-1],"nx":[4,3],"ny":[5,4],"nz":[2,2]},{"size":2,"px":[13,3],"py":[2,4],"pz":[0,-1],"nx":[4,3],"ny":[3,5],"nz":[2,2]},{"size":2,"px":[1,1],"py":[23,22],"pz":[0,0],"nx":[9,0],"ny":[7,3],"nz":[0,-1]},{"size":2,"px":[1,0],"py":[16,15],"pz":[0,0],"nx":[0,14],"ny":[23,12],"nz":[0,-1]},{"size":2,"px":[13,8],"py":[22,0],"pz":[0,-1],"nx":[5,3],"ny":[0,1],"nz":[1,1]},{"size":2,"px":[13,13],"py":[7,7],"pz":[0,-1],"nx":[3,2],"ny":[17,10],"nz":[0,1]},{"size":2,"px":[20,20],"py":[15,16],"pz":[0,0],"nx":[7,3],"ny":[9,17],"nz":[1,-1]},{"size":5,"px":[10,12,11,13,11],"py":[2,2,1,2,2],"pz":[0,0,0,0,0],"nx":[10,18,21,21,19],"ny":[3,1,13,11,2],"nz":[1,0,0,0,0]},{"size":2,"px":[16,3],"py":[6,1],"pz":[0,2],"nx":[15,18],"ny":[8,1],"nz":[0,-1]},{"size":2,"px":[19,3],"py":[8,1],"pz":[0,-1],"nx":[9,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[10,3],"py":[15,18],"pz":[0,-1],"nx":[3,3],"ny":[0,1],"nz":[2,2]},{"size":2,"px":[3,3],"py":[2,3],"pz":[2,2],"nx":[7,3],"ny":[11,1],"nz":[1,-1]},{"size":2,"px":[11,10],"py":[17,9],"pz":[0,-1],"nx":[11,10],"ny":[15,15],"nz":[0,0]},{"size":2,"px":[5,10],"py":[2,4],"pz":[1,0],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[9,10],"py":[3,4],"pz":[0,-1],"nx":[9,10],"ny":[2,1],"nz":[0,0]},{"size":2,"px":[23,11],"py":[13,10],"pz":[0,1],"nx":[14,7],"ny":[5,14],"nz":[0,-1]},{"size":2,"px":[4,4],"py":[5,4],"pz":[2,2],"nx":[9,8],"ny":[3,3],"nz":[1,-1]},{"size":3,"px":[12,4,15],"py":[5,4,7],"pz":[0,-1,-1],"nx":[3,4,2],"ny":[7,11,5],"nz":[1,1,2]},{"size":2,"px":[11,4],"py":[15,4],"pz":[0,-1],"nx":[5,9],"ny":[7,15],"nz":[1,0]},{"size":2,"px":[9,7],"py":[0,1],"pz":[1,-1],"nx":[11,11],"ny":[8,7],"nz":[1,1]},{"size":5,"px":[1,1,1,1,1],"py":[11,12,10,9,9],"pz":[0,0,0,0,-1],"nx":[4,5,8,16,11],"ny":[4,3,8,8,6],"nz":[1,1,0,0,0]}],"alpha":[-1.059083e+00,1.059083e+00,-7.846122e-01,7.846122e-01,-4.451160e-01,4.451160e-01,-4.483277e-01,4.483277e-01,-3.905999e-01,3.905999e-01,-3.789250e-01,3.789250e-01,-3.874610e-01,3.874610e-01,-3.110541e-01,3.110541e-01,-3.565056e-01,3.565056e-01,-3.812617e-01,3.812617e-01,-3.325142e-01,3.325142e-01,-2.787282e-01,2.787282e-01,-3.238869e-01,3.238869e-01,-2.993499e-01,2.993499e-01,-2.807737e-01,2.807737e-01,-2.855285e-01,2.855285e-01,-2.277550e-01,2.277550e-01,-2.031261e-01,2.031261e-01,-2.071574e-01,2.071574e-01,-2.534142e-01,2.534142e-01,-2.266871e-01,2.266871e-01,-2.229078e-01,2.229078e-01,-2.716325e-01,2.716325e-01,-3.046938e-01,3.046938e-01,-2.271601e-01,2.271601e-01,-1.987651e-01,1.987651e-01,-1.953664e-01,1.953664e-01,-2.178737e-01,2.178737e-01,-2.285148e-01,2.285148e-01,-1.891073e-01,1.891073e-01,-2.926469e-01,2.926469e-01,-2.094783e-01,2.094783e-01,-1.478037e-01,1.478037e-01,-1.707579e-01,1.707579e-01,-1.464390e-01,1.464390e-01,-2.462321e-01,2.462321e-01,-2.319978e-01,2.319978e-01,-1.781651e-01,1.781651e-01,-1.471349e-01,1.471349e-01,-1.953006e-01,1.953006e-01,-2.145108e-01,2.145108e-01,-1.567881e-01,1.567881e-01,-2.024617e-01,2.024617e-01,-1.883198e-01,1.883198e-01,-1.996976e-01,1.996976e-01,-1.292330e-01,1.292330e-01,-2.142242e-01,2.142242e-01,-2.473748e-01,2.473748e-01,-1.880902e-01,1.880902e-01,-1.874572e-01,1.874572e-01,-1.495984e-01,1.495984e-01,-1.608525e-01,1.608525e-01,-1.698402e-01,1.698402e-01,-1.898871e-01,1.898871e-01,-1.350238e-01,1.350238e-01,-1.727032e-01,1.727032e-01,-1.593352e-01,1.593352e-01,-1.476968e-01,1.476968e-01,-1.428431e-01,1.428431e-01,-1.766261e-01,1.766261e-01,-1.453226e-01,1.453226e-01,-1.929885e-01,1.929885e-01,-1.337582e-01,1.337582e-01,-1.629078e-01,1.629078e-01,-9.973085e-02,9.973085e-02,-1.172760e-01,1.172760e-01,-1.399242e-01,1.399242e-01,-1.613189e-01,1.613189e-01,-1.145695e-01,1.145695e-01,-1.191093e-01,1.191093e-01,-1.225900e-01,1.225900e-01,-1.641114e-01,1.641114e-01,-1.419878e-01,1.419878e-01,-2.183465e-01,2.183465e-01,-1.566968e-01,1.566968e-01,-1.288216e-01,1.288216e-01,-1.422831e-01,1.422831e-01,-2.000107e-01,2.000107e-01,-1.817265e-01,1.817265e-01,-1.793796e-01,1.793796e-01,-1.428926e-01,1.428926e-01,-1.182032e-01,1.182032e-01,-1.150421e-01,1.150421e-01,-1.336584e-01,1.336584e-01,-1.656178e-01,1.656178e-01,-1.386549e-01,1.386549e-01,-1.387461e-01,1.387461e-01,-1.313023e-01,1.313023e-01,-1.360391e-01,1.360391e-01,-1.305505e-01,1.305505e-01,-1.323399e-01,1.323399e-01,-1.502891e-01,1.502891e-01,-1.488859e-01,1.488859e-01,-1.126628e-01,1.126628e-01,-1.233623e-01,1.233623e-01,-1.702106e-01,1.702106e-01,-1.629639e-01,1.629639e-01,-1.337706e-01,1.337706e-01,-1.290384e-01,1.290384e-01,-1.165519e-01,1.165519e-01,-1.412778e-01,1.412778e-01,-1.470204e-01,1.470204e-01,-2.213780e-01,2.213780e-01,-1.472619e-01,1.472619e-01,-1.357071e-01,1.357071e-01,-1.416513e-01,1.416513e-01,-1.050208e-01,1.050208e-01,-1.480033e-01,1.480033e-01,-1.899871e-01,1.899871e-01,-1.466249e-01,1.466249e-01,-1.076952e-01,1.076952e-01,-1.035096e-01,1.035096e-01,-1.566970e-01,1.566970e-01,-1.364115e-01,1.364115e-01,-1.512889e-01,1.512889e-01,-1.252851e-01,1.252851e-01,-1.206300e-01,1.206300e-01,-1.059134e-01,1.059134e-01,-1.140398e-01,1.140398e-01,-1.359912e-01,1.359912e-01,-1.231201e-01,1.231201e-01,-1.231867e-01,1.231867e-01,-9.789923e-02,9.789923e-02,-1.590213e-01,1.590213e-01,-1.002206e-01,1.002206e-01,-1.518339e-01,1.518339e-01,-1.055203e-01,1.055203e-01,-1.012579e-01,1.012579e-01,-1.094956e-01,1.094956e-01,-1.429592e-01,1.429592e-01,-1.108838e-01,1.108838e-01,-1.116475e-01,1.116475e-01,-1.735371e-01,1.735371e-01,-1.067758e-01,1.067758e-01,-1.290406e-01,1.290406e-01,-1.156822e-01,1.156822e-01,-9.668217e-02,9.668217e-02,-1.170053e-01,1.170053e-01,-1.252092e-01,1.252092e-01,-1.135158e-01,1.135158e-01,-1.105896e-01,1.105896e-01,-1.038175e-01,1.038175e-01,-1.210459e-01,1.210459e-01,-1.078878e-01,1.078878e-01,-1.050808e-01,1.050808e-01,-1.428227e-01,1.428227e-01,-1.664600e-01,1.664600e-01,-1.013508e-01,1.013508e-01,-1.206930e-01,1.206930e-01,-1.088972e-01,1.088972e-01,-1.381026e-01,1.381026e-01,-1.109115e-01,1.109115e-01,-7.921549e-02,7.921549e-02,-1.057832e-01,1.057832e-01,-9.385827e-02,9.385827e-02,-1.486035e-01,1.486035e-01,-1.247401e-01,1.247401e-01,-9.451327e-02,9.451327e-02,-1.272805e-01,1.272805e-01,-9.616206e-02,9.616206e-02,-9.051084e-02,9.051084e-02,-1.138458e-01,1.138458e-01,-1.047581e-01,1.047581e-01,-1.382394e-01,1.382394e-01,-1.122203e-01,1.122203e-01,-1.052936e-01,1.052936e-01,-1.239318e-01,1.239318e-01,-1.241439e-01,1.241439e-01,-1.259012e-01,1.259012e-01,-1.211701e-01,1.211701e-01,-1.344131e-01,1.344131e-01,-1.127778e-01,1.127778e-01,-1.609745e-01,1.609745e-01,-1.901382e-01,1.901382e-01,-1.618962e-01,1.618962e-01,-1.230398e-01,1.230398e-01,-1.319311e-01,1.319311e-01,-1.431410e-01,1.431410e-01,-1.143306e-01,1.143306e-01,-9.390938e-02,9.390938e-02,-1.154161e-01,1.154161e-01,-1.141205e-01,1.141205e-01,-1.098048e-01,1.098048e-01,-8.870072e-02,8.870072e-02,-1.122444e-01,1.122444e-01,-1.114147e-01,1.114147e-01,-1.185710e-01,1.185710e-01,-1.107775e-01,1.107775e-01,-1.259167e-01,1.259167e-01,-1.105176e-01,1.105176e-01,-1.020691e-01,1.020691e-01,-9.607863e-02,9.607863e-02,-9.573700e-02,9.573700e-02,-1.054349e-01,1.054349e-01,-1.137856e-01,1.137856e-01,-1.192043e-01,1.192043e-01,-1.113264e-01,1.113264e-01,-1.093137e-01,1.093137e-01,-1.010919e-01,1.010919e-01,-9.625901e-02,9.625901e-02,-9.338459e-02,9.338459e-02,-1.142944e-01,1.142944e-01,-1.038877e-01,1.038877e-01,-9.772862e-02,9.772862e-02,-1.375298e-01,1.375298e-01,-1.394776e-01,1.394776e-01,-9.454765e-02,9.454765e-02,-1.203246e-01,1.203246e-01,-8.684943e-02,8.684943e-02,-1.135622e-01,1.135622e-01,-1.058181e-01,1.058181e-01,-1.082152e-01,1.082152e-01,-1.411355e-01,1.411355e-01,-9.978846e-02,9.978846e-02,-1.057874e-01,1.057874e-01,-1.415366e-01,1.415366e-01,-9.981014e-02,9.981014e-02,-9.261151e-02,9.261151e-02,-1.737173e-01,1.737173e-01,-1.580335e-01,1.580335e-01,-9.594668e-02,9.594668e-02,-9.336013e-02,9.336013e-02,-1.102373e-01,1.102373e-01,-8.546557e-02,8.546557e-02,-9.945057e-02,9.945057e-02,-1.146358e-01,1.146358e-01,-1.324734e-01,1.324734e-01,-1.422296e-01,1.422296e-01,-9.937990e-02,9.937990e-02,-8.381049e-02,8.381049e-02,-1.270714e-01,1.270714e-01,-1.091738e-01,1.091738e-01,-1.314881e-01,1.314881e-01,-1.085159e-01,1.085159e-01,-9.247554e-02,9.247554e-02,-8.121645e-02,8.121645e-02,-1.059589e-01,1.059589e-01,-8.307793e-02,8.307793e-02,-1.033103e-01,1.033103e-01,-1.056706e-01,1.056706e-01,-1.032803e-01,1.032803e-01,-1.266840e-01,1.266840e-01,-9.341601e-02,9.341601e-02,-7.683570e-02,7.683570e-02,-1.030530e-01,1.030530e-01,-1.051872e-01,1.051872e-01,-9.114946e-02,9.114946e-02,-1.329341e-01,1.329341e-01,-9.270830e-02,9.270830e-02,-1.141750e-01,1.141750e-01,-9.889318e-02,9.889318e-02,-8.856485e-02,8.856485e-02,-1.054210e-01,1.054210e-01,-1.092704e-01,1.092704e-01,-8.729085e-02,8.729085e-02,-1.141057e-01,1.141057e-01,-1.530774e-01,1.530774e-01,-8.129720e-02,8.129720e-02,-1.143335e-01,1.143335e-01,-1.175777e-01,1.175777e-01,-1.371729e-01,1.371729e-01,-1.394356e-01,1.394356e-01,-1.016308e-01,1.016308e-01,-1.125547e-01,1.125547e-01,-9.672600e-02,9.672600e-02,-1.036631e-01,1.036631e-01,-8.702514e-02,8.702514e-02,-1.264807e-01,1.264807e-01,-1.465688e-01,1.465688e-01,-8.781464e-02,8.781464e-02,-8.552605e-02,8.552605e-02,-1.145072e-01,1.145072e-01,-1.378489e-01,1.378489e-01,-1.013312e-01,1.013312e-01,-1.020083e-01,1.020083e-01,-1.015816e-01,1.015816e-01,-8.407101e-02,8.407101e-02,-8.296485e-02,8.296485e-02,-8.033655e-02,8.033655e-02,-9.003615e-02,9.003615e-02,-7.504954e-02,7.504954e-02,-1.224941e-01,1.224941e-01,-9.347814e-02,9.347814e-02,-9.555575e-02,9.555575e-02,-9.810025e-02,9.810025e-02,-1.237068e-01,1.237068e-01,-1.283586e-01,1.283586e-01,-1.082763e-01,1.082763e-01,-1.018145e-01,1.018145e-01,-1.175161e-01,1.175161e-01,-1.252279e-01,1.252279e-01,-1.370559e-01,1.370559e-01,-9.941339e-02,9.941339e-02,-8.506938e-02,8.506938e-02,-1.260902e-01,1.260902e-01,-1.014152e-01,1.014152e-01,-9.728694e-02,9.728694e-02,-9.374910e-02,9.374910e-02,-9.587429e-02,9.587429e-02,-9.516036e-02,9.516036e-02,-7.375173e-02,7.375173e-02,-9.332487e-02,9.332487e-02,-9.020733e-02,9.020733e-02,-1.133381e-01,1.133381e-01,-1.542180e-01,1.542180e-01,-9.692168e-02,9.692168e-02,-7.960904e-02,7.960904e-02,-8.947089e-02,8.947089e-02,-7.830286e-02,7.830286e-02,-9.900050e-02,9.900050e-02,-1.041293e-01,1.041293e-01,-9.572501e-02,9.572501e-02,-8.230575e-02,8.230575e-02,-9.194901e-02,9.194901e-02,-1.076971e-01,1.076971e-01,-1.027782e-01,1.027782e-01,-1.028538e-01,1.028538e-01,-1.013992e-01,1.013992e-01,-9.087585e-02,9.087585e-02,-1.100706e-01,1.100706e-01,-1.094934e-01,1.094934e-01,-1.107879e-01,1.107879e-01,-1.026915e-01,1.026915e-01,-1.017572e-01,1.017572e-01,-7.984776e-02,7.984776e-02,-9.015413e-02,9.015413e-02,-1.299870e-01,1.299870e-01,-9.164982e-02,9.164982e-02,-1.062788e-01,1.062788e-01,-1.160203e-01,1.160203e-01,-8.858603e-02,8.858603e-02,-9.762964e-02,9.762964e-02,-1.070694e-01,1.070694e-01,-9.549046e-02,9.549046e-02,-1.533034e-01,1.533034e-01,-8.663316e-02,8.663316e-02,-9.303018e-02,9.303018e-02,-9.853582e-02,9.853582e-02,-9.733371e-02,9.733371e-02,-1.048555e-01,1.048555e-01,-9.056041e-02,9.056041e-02,-7.552283e-02,7.552283e-02,-8.780631e-02,8.780631e-02,-1.123953e-01,1.123953e-01,-1.452948e-01,1.452948e-01,-1.156423e-01,1.156423e-01,-8.701142e-02,8.701142e-02,-9.713334e-02,9.713334e-02,-9.970888e-02,9.970888e-02,-8.614129e-02,8.614129e-02,-7.459861e-02,7.459861e-02,-9.253517e-02,9.253517e-02,-9.570092e-02,9.570092e-02,-9.485535e-02,9.485535e-02,-1.148365e-01,1.148365e-01,-1.063193e-01,1.063193e-01,-9.986686e-02,9.986686e-02,-7.523412e-02,7.523412e-02,-1.005881e-01,1.005881e-01,-8.249716e-02,8.249716e-02,-1.055866e-01,1.055866e-01,-1.343050e-01,1.343050e-01,-1.371056e-01,1.371056e-01,-9.604689e-02,9.604689e-02,-1.224268e-01,1.224268e-01,-9.211478e-02,9.211478e-02,-1.108371e-01,1.108371e-01,-1.100547e-01,1.100547e-01,-8.938970e-02,8.938970e-02,-8.655951e-02,8.655951e-02,-7.085816e-02,7.085816e-02,-8.101028e-02,8.101028e-02,-8.338046e-02,8.338046e-02,-8.309588e-02,8.309588e-02,-9.090584e-02,9.090584e-02,-8.124564e-02,8.124564e-02,-9.367843e-02,9.367843e-02,-1.011747e-01,1.011747e-01,-9.885045e-02,9.885045e-02,-8.944266e-02,8.944266e-02,-8.453859e-02,8.453859e-02,-8.308847e-02,8.308847e-02,-1.367280e-01,1.367280e-01,-1.295144e-01,1.295144e-01,-1.063965e-01,1.063965e-01,-7.752328e-02,7.752328e-02,-9.681524e-02,9.681524e-02,-7.862345e-02,7.862345e-02,-8.767746e-02,8.767746e-02,-9.198041e-02,9.198041e-02,-9.686489e-02,9.686489e-02]},{"count":564,"threshold":-4.517456e+00,"feature":[{"size":5,"px":[15,9,8,12,11],"py":[3,6,3,0,8],"pz":[0,1,0,0,0],"nx":[6,14,9,22,23],"ny":[8,7,8,17,3],"nz":[1,0,0,0,0]},{"size":5,"px":[12,13,11,14,12],"py":[9,4,4,4,5],"pz":[0,0,0,0,0],"nx":[4,6,10,4,15],"ny":[3,8,7,10,9],"nz":[1,1,0,1,0]},{"size":5,"px":[7,5,6,8,8],"py":[2,13,2,1,1],"pz":[0,0,0,0,-1],"nx":[3,0,4,1,0],"ny":[4,3,10,3,13],"nz":[1,1,1,0,0]},{"size":5,"px":[11,2,2,11,16],"py":[9,4,2,7,11],"pz":[0,2,2,0,0],"nx":[8,4,1,14,0],"ny":[4,4,16,5,13],"nz":[1,1,-1,-1,-1]},{"size":2,"px":[14,14],"py":[18,18],"pz":[0,-1],"nx":[8,13],"ny":[10,16],"nz":[1,0]},{"size":5,"px":[15,17,16,8,18],"py":[1,2,1,0,2],"pz":[0,0,0,1,0],"nx":[21,22,22,22,22],"ny":[1,5,3,4,2],"nz":[0,0,0,0,-1]},{"size":2,"px":[15,4],"py":[23,3],"pz":[0,2],"nx":[7,3],"ny":[10,6],"nz":[1,-1]},{"size":5,"px":[3,6,4,3,11],"py":[10,11,8,3,8],"pz":[1,0,1,1,0],"nx":[3,5,6,3,0],"ny":[4,9,9,9,0],"nz":[1,-1,-1,-1,-1]},{"size":3,"px":[11,11,2],"py":[11,13,16],"pz":[0,0,-1],"nx":[10,10,9],"ny":[10,11,14],"nz":[0,0,0]},{"size":2,"px":[8,4],"py":[12,6],"pz":[0,1],"nx":[4,5],"ny":[11,11],"nz":[1,-1]},{"size":5,"px":[10,11,13,3,12],"py":[3,4,3,0,1],"pz":[0,0,0,2,0],"nx":[14,18,20,19,15],"ny":[13,1,15,2,18],"nz":[0,0,0,0,0]},{"size":5,"px":[20,14,10,12,12],"py":[12,12,4,10,11],"pz":[0,0,1,0,0],"nx":[9,2,9,9,9],"ny":[4,12,5,9,14],"nz":[1,-1,-1,-1,-1]},{"size":5,"px":[3,3,3,4,2],"py":[15,16,14,21,12],"pz":[0,0,0,0,0],"nx":[0,0,0,0,0],"ny":[20,10,5,21,21],"nz":[0,1,2,0,-1]},{"size":2,"px":[18,8],"py":[16,7],"pz":[0,1],"nx":[14,0],"ny":[8,10],"nz":[0,-1]},{"size":4,"px":[12,4,16,1],"py":[14,3,8,3],"pz":[0,-1,-1,-1],"nx":[14,10,20,13],"ny":[13,5,16,9],"nz":[0,1,0,0]},{"size":5,"px":[3,8,2,3,3],"py":[7,2,1,2,4],"pz":[1,-1,-1,-1,-1],"nx":[1,9,2,1,1],"ny":[3,14,9,7,2],"nz":[1,0,1,1,1]},{"size":5,"px":[4,1,3,2,3],"py":[2,1,2,4,3],"pz":[0,1,0,0,0],"nx":[0,0,0,0,0],"ny":[3,1,2,0,0],"nz":[0,1,0,2,-1]},{"size":4,"px":[4,8,7,9],"py":[6,11,11,10],"pz":[1,0,0,0],"nx":[3,10,2,20],"ny":[4,4,4,8],"nz":[1,-1,-1,-1]},{"size":2,"px":[1,8],"py":[3,11],"pz":[2,-1],"nx":[8,2],"ny":[15,5],"nz":[0,2]},{"size":2,"px":[17,0],"py":[13,10],"pz":[0,-1],"nx":[14,14],"ny":[11,10],"nz":[0,0]},{"size":5,"px":[22,22,22,5,22],"py":[16,18,17,2,15],"pz":[0,0,0,2,0],"nx":[8,4,15,6,6],"ny":[4,2,7,11,11],"nz":[1,2,0,1,-1]},{"size":5,"px":[16,9,8,17,15],"py":[12,6,6,22,12],"pz":[0,1,1,0,0],"nx":[11,23,23,23,22],"ny":[11,23,22,21,23],"nz":[1,0,0,0,-1]},{"size":5,"px":[5,2,4,4,9],"py":[22,3,15,20,18],"pz":[0,2,0,0,0],"nx":[9,4,23,7,22],"ny":[8,4,22,19,23],"nz":[0,-1,-1,-1,-1]},{"size":5,"px":[8,6,9,7,3],"py":[3,3,3,3,1],"pz":[0,0,0,0,1],"nx":[5,5,4,4,4],"ny":[0,1,1,2,0],"nz":[0,0,0,0,-1]},{"size":2,"px":[2,3],"py":[3,3],"pz":[2,2],"nx":[3,6],"ny":[4,6],"nz":[1,-1]},{"size":5,"px":[1,1,0,1,0],"py":[17,15,6,16,10],"pz":[0,0,1,0,0],"nx":[4,4,7,4,8],"ny":[2,5,9,4,4],"nz":[2,2,1,2,-1]},{"size":5,"px":[12,12,12,13,13],"py":[10,9,11,13,13],"pz":[0,0,0,0,-1],"nx":[4,3,3,5,3],"ny":[21,18,17,23,16],"nz":[0,0,0,0,0]},{"size":4,"px":[5,6,5,9],"py":[13,7,9,23],"pz":[0,0,1,0],"nx":[6,15,7,5],"ny":[9,20,7,23],"nz":[0,-1,-1,-1]},{"size":2,"px":[6,3],"py":[4,2],"pz":[1,2],"nx":[8,23],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[9,7],"py":[18,0],"pz":[0,0],"nx":[5,7],"ny":[8,10],"nz":[1,1]},{"size":2,"px":[4,6],"py":[11,16],"pz":[1,0],"nx":[10,9],"ny":[16,7],"nz":[0,-1]},{"size":4,"px":[11,11,11,11],"py":[11,10,12,13],"pz":[0,0,0,0],"nx":[13,13,13,9],"ny":[11,9,10,4],"nz":[0,0,0,1]},{"size":4,"px":[12,6,7,6],"py":[7,11,8,4],"pz":[0,1,1,1],"nx":[10,0,19,7],"ny":[21,3,12,11],"nz":[0,-1,-1,-1]},{"size":2,"px":[4,4],"py":[3,4],"pz":[2,2],"nx":[9,1],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[19,19],"py":[21,20],"pz":[0,0],"nx":[7,7],"ny":[3,13],"nz":[1,-1]},{"size":5,"px":[12,9,13,11,5],"py":[0,2,2,0,0],"pz":[0,0,0,0,1],"nx":[6,4,5,5,5],"ny":[1,3,5,2,6],"nz":[0,0,1,0,1]},{"size":5,"px":[4,3,2,5,7],"py":[11,3,3,7,17],"pz":[1,2,2,0,0],"nx":[23,5,11,5,5],"ny":[0,4,10,2,6],"nz":[0,-1,-1,-1,-1]},{"size":2,"px":[20,17],"py":[12,3],"pz":[0,-1],"nx":[20,19],"ny":[21,23],"nz":[0,0]},{"size":2,"px":[2,1],"py":[12,8],"pz":[0,0],"nx":[2,8],"ny":[2,16],"nz":[2,-1]},{"size":2,"px":[16,5],"py":[4,5],"pz":[0,-1],"nx":[7,8],"ny":[9,1],"nz":[1,1]},{"size":2,"px":[2,2],"py":[0,1],"pz":[1,1],"nx":[1,8],"ny":[5,1],"nz":[0,-1]},{"size":2,"px":[1,1],"py":[12,10],"pz":[0,1],"nx":[2,20],"ny":[23,9],"nz":[0,-1]},{"size":4,"px":[11,0,0,2],"py":[14,3,9,22],"pz":[0,-1,-1,-1],"nx":[13,14,7,3],"ny":[6,7,11,1],"nz":[0,0,0,2]},{"size":2,"px":[14,0],"py":[2,3],"pz":[0,-1],"nx":[4,4],"ny":[4,3],"nz":[2,2]},{"size":2,"px":[23,11],"py":[18,11],"pz":[0,1],"nx":[3,2],"ny":[1,21],"nz":[1,-1]},{"size":2,"px":[9,9],"py":[17,14],"pz":[0,-1],"nx":[4,5],"ny":[10,8],"nz":[1,1]},{"size":2,"px":[9,18],"py":[7,14],"pz":[1,0],"nx":[18,9],"ny":[17,8],"nz":[0,-1]},{"size":2,"px":[2,8],"py":[4,22],"pz":[2,0],"nx":[4,3],"ny":[10,1],"nz":[1,-1]},{"size":2,"px":[5,22],"py":[4,9],"pz":[2,-1],"nx":[11,23],"ny":[8,14],"nz":[1,0]},{"size":3,"px":[23,5,5],"py":[8,2,1],"pz":[0,2,2],"nx":[10,10,2],"ny":[4,4,2],"nz":[1,-1,-1]},{"size":2,"px":[11,11],"py":[14,23],"pz":[0,-1],"nx":[3,11],"ny":[4,13],"nz":[1,0]},{"size":2,"px":[3,2],"py":[7,0],"pz":[1,-1],"nx":[4,3],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[12,1],"py":[19,13],"pz":[0,-1],"nx":[9,12],"ny":[10,18],"nz":[1,0]},{"size":2,"px":[10,10],"py":[11,10],"pz":[1,1],"nx":[4,1],"ny":[5,11],"nz":[2,-1]},{"size":5,"px":[9,12,4,8,8],"py":[3,5,2,9,8],"pz":[1,0,2,1,1],"nx":[23,23,23,23,23],"ny":[3,4,6,5,5],"nz":[0,0,0,0,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,9],"ny":[4,6],"nz":[1,-1]},{"size":5,"px":[13,13,13,7,7],"py":[11,10,9,6,6],"pz":[0,0,0,1,-1],"nx":[5,5,15,5,2],"ny":[5,15,9,9,1],"nz":[0,0,0,1,2]},{"size":2,"px":[19,7],"py":[21,7],"pz":[0,1],"nx":[14,10],"ny":[15,4],"nz":[0,-1]},{"size":2,"px":[5,5],"py":[3,4],"pz":[2,2],"nx":[21,0],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[2,0],"py":[0,0],"pz":[1,-1],"nx":[3,2],"ny":[1,2],"nz":[0,0]},{"size":2,"px":[9,0],"py":[4,0],"pz":[0,-1],"nx":[5,12],"ny":[0,1],"nz":[1,0]},{"size":5,"px":[14,16,12,15,13],"py":[0,1,0,0,0],"pz":[0,0,0,0,0],"nx":[4,8,8,4,9],"ny":[2,3,4,1,3],"nz":[2,1,1,2,-1]},{"size":3,"px":[4,17,2],"py":[11,14,1],"pz":[1,-1,-1],"nx":[9,8,17],"ny":[1,4,0],"nz":[1,1,0]},{"size":2,"px":[18,9],"py":[17,7],"pz":[0,1],"nx":[8,4],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[3,0],"pz":[1,2],"nx":[10,11],"ny":[6,5],"nz":[1,-1]},{"size":5,"px":[21,21,21,21,20],"py":[17,16,19,18,21],"pz":[0,0,0,0,0],"nx":[0,0,0,0,0],"ny":[4,9,11,6,6],"nz":[1,0,0,1,-1]},{"size":2,"px":[12,0],"py":[7,1],"pz":[0,-1],"nx":[8,11],"ny":[4,17],"nz":[1,0]},{"size":4,"px":[13,0,0,0],"py":[15,0,0,0],"pz":[0,-1,-1,-1],"nx":[3,7,4,6],"ny":[2,7,5,9],"nz":[2,1,2,1]},{"size":2,"px":[2,9],"py":[3,12],"pz":[2,0],"nx":[2,0],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[10,3],"py":[6,1],"pz":[1,-1],"nx":[20,21],"ny":[19,14],"nz":[0,0]},{"size":5,"px":[5,22,22,11,22],"py":[1,4,3,3,2],"pz":[2,0,0,1,-1],"nx":[7,13,14,8,15],"ny":[3,6,6,3,7],"nz":[1,0,0,1,0]},{"size":2,"px":[12,19],"py":[5,15],"pz":[0,-1],"nx":[16,4],"ny":[8,2],"nz":[0,2]},{"size":2,"px":[1,0],"py":[11,9],"pz":[1,1],"nx":[5,0],"ny":[3,3],"nz":[1,-1]},{"size":4,"px":[8,3,4,2],"py":[6,7,5,3],"pz":[1,-1,-1,-1],"nx":[13,14,11,11],"ny":[11,13,3,5],"nz":[0,0,1,1]},{"size":2,"px":[11,11],"py":[5,6],"pz":[0,0],"nx":[8,4],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[5,9],"py":[6,17],"pz":[1,0],"nx":[9,4],"ny":[15,11],"nz":[0,-1]},{"size":3,"px":[6,3,6],"py":[6,3,5],"pz":[1,2,1],"nx":[11,10,4],"ny":[8,11,5],"nz":[0,0,-1]},{"size":2,"px":[8,16],"py":[0,1],"pz":[1,-1],"nx":[19,17],"ny":[1,0],"nz":[0,0]},{"size":2,"px":[21,20],"py":[4,1],"pz":[0,0],"nx":[11,5],"ny":[0,0],"nz":[1,2]},{"size":2,"px":[8,4],"py":[6,3],"pz":[1,2],"nx":[8,9],"ny":[4,10],"nz":[1,-1]},{"size":2,"px":[10,1],"py":[0,0],"pz":[1,-1],"nx":[13,12],"ny":[6,5],"nz":[0,0]},{"size":2,"px":[5,4],"py":[3,11],"pz":[1,-1],"nx":[3,17],"ny":[1,3],"nz":[2,0]},{"size":2,"px":[12,13],"py":[4,4],"pz":[0,0],"nx":[3,3],"ny":[1,1],"nz":[2,-1]},{"size":2,"px":[3,18],"py":[2,7],"pz":[2,0],"nx":[8,1],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[16,6],"py":[8,2],"pz":[0,1],"nx":[8,9],"ny":[4,19],"nz":[1,-1]},{"size":3,"px":[12,3,14],"py":[13,3,15],"pz":[0,-1,-1],"nx":[0,1,0],"ny":[16,18,15],"nz":[0,0,0]},{"size":2,"px":[3,1],"py":[3,4],"pz":[2,-1],"nx":[7,14],"ny":[10,14],"nz":[1,0]},{"size":2,"px":[9,16],"py":[6,10],"pz":[1,0],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[7,11],"py":[4,4],"pz":[0,0],"nx":[7,23],"ny":[3,11],"nz":[0,-1]},{"size":5,"px":[2,4,3,4,4],"py":[1,2,0,1,1],"pz":[1,0,1,0,-1],"nx":[11,9,4,9,5],"ny":[6,5,3,6,3],"nz":[0,0,1,0,1]},{"size":2,"px":[6,0],"py":[14,1],"pz":[0,-1],"nx":[2,5],"ny":[2,9],"nz":[2,1]},{"size":2,"px":[6,7],"py":[7,12],"pz":[0,0],"nx":[3,22],"ny":[3,16],"nz":[1,-1]},{"size":2,"px":[10,4],"py":[1,1],"pz":[0,1],"nx":[2,6],"ny":[2,21],"nz":[2,-1]},{"size":2,"px":[13,1],"py":[11,6],"pz":[0,-1],"nx":[12,6],"ny":[5,2],"nz":[0,1]},{"size":5,"px":[10,5,11,10,10],"py":[4,3,4,6,5],"pz":[0,1,0,0,0],"nx":[4,7,13,8,4],"ny":[2,8,9,4,4],"nz":[2,1,0,1,-1]},{"size":4,"px":[7,8,7,8],"py":[11,3,4,7],"pz":[1,1,1,1],"nx":[0,7,3,8],"ny":[0,12,2,4],"nz":[0,-1,-1,-1]},{"size":2,"px":[0,0],"py":[4,7],"pz":[2,1],"nx":[10,1],"ny":[7,0],"nz":[0,-1]},{"size":2,"px":[11,5],"py":[19,5],"pz":[0,-1],"nx":[11,5],"ny":[17,10],"nz":[0,1]},{"size":2,"px":[11,12],"py":[4,4],"pz":[0,0],"nx":[7,5],"ny":[8,3],"nz":[0,-1]},{"size":3,"px":[4,8,4],"py":[2,9,4],"pz":[2,1,2],"nx":[3,19,3],"ny":[1,16,5],"nz":[1,-1,-1]},{"size":2,"px":[3,7],"py":[0,1],"pz":[1,0],"nx":[2,3],"ny":[15,2],"nz":[0,-1]},{"size":2,"px":[0,4],"py":[2,0],"pz":[2,-1],"nx":[9,16],"ny":[5,11],"nz":[1,0]},{"size":2,"px":[14,15],"py":[23,16],"pz":[0,0],"nx":[13,3],"ny":[15,1],"nz":[0,-1]},{"size":2,"px":[4,3],"py":[0,1],"pz":[1,-1],"nx":[3,7],"ny":[0,0],"nz":[1,0]},{"size":2,"px":[7,6],"py":[12,12],"pz":[0,0],"nx":[4,8],"ny":[5,4],"nz":[1,-1]},{"size":5,"px":[4,1,2,4,5],"py":[1,0,0,0,6],"pz":[0,2,1,0,1],"nx":[4,8,7,8,6],"ny":[4,10,11,4,4],"nz":[1,0,0,1,1]},{"size":2,"px":[12,12],"py":[15,8],"pz":[0,-1],"nx":[7,15],"ny":[16,14],"nz":[0,0]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[4,6],"ny":[2,8],"nz":[2,-1]},{"size":2,"px":[14,4],"py":[19,23],"pz":[0,-1],"nx":[7,14],"ny":[11,18],"nz":[1,0]},{"size":2,"px":[4,2],"py":[7,4],"pz":[1,2],"nx":[2,22],"ny":[5,19],"nz":[2,-1]},{"size":2,"px":[8,15],"py":[7,17],"pz":[1,0],"nx":[14,4],"ny":[15,5],"nz":[0,2]},{"size":2,"px":[10,11],"py":[9,8],"pz":[1,-1],"nx":[23,5],"ny":[19,4],"nz":[0,2]},{"size":2,"px":[11,1],"py":[7,9],"pz":[0,-1],"nx":[4,4],"ny":[4,5],"nz":[1,1]},{"size":2,"px":[14,7],"py":[6,9],"pz":[0,0],"nx":[4,11],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[5,4],"py":[0,5],"pz":[0,-1],"nx":[2,2],"ny":[0,4],"nz":[1,0]},{"size":2,"px":[10,22],"py":[5,20],"pz":[0,-1],"nx":[3,4],"ny":[1,2],"nz":[2,2]},{"size":3,"px":[23,11,11],"py":[17,9,8],"pz":[0,1,1],"nx":[13,8,8],"ny":[5,3,3],"nz":[0,1,-1]},{"size":2,"px":[18,9],"py":[0,21],"pz":[0,-1],"nx":[10,10],"ny":[2,1],"nz":[1,1]},{"size":5,"px":[11,10,11,11,11],"py":[11,13,10,12,12],"pz":[0,0,0,0,-1],"nx":[11,13,12,3,8],"ny":[5,5,5,1,10],"nz":[0,0,0,2,0]},{"size":2,"px":[7,8],"py":[11,11],"pz":[0,0],"nx":[9,16],"ny":[9,19],"nz":[0,-1]},{"size":2,"px":[9,18],"py":[23,7],"pz":[0,-1],"nx":[21,21],"ny":[7,13],"nz":[0,0]},{"size":2,"px":[8,8],"py":[7,8],"pz":[1,1],"nx":[5,21],"ny":[9,13],"nz":[1,-1]},{"size":2,"px":[17,8],"py":[22,8],"pz":[0,-1],"nx":[4,8],"ny":[5,10],"nz":[2,1]},{"size":5,"px":[2,5,8,8,4],"py":[3,9,13,23,7],"pz":[2,1,0,0,1],"nx":[9,17,18,19,20],"ny":[0,0,0,2,3],"nz":[1,0,0,0,0]},{"size":3,"px":[16,15,2],"py":[3,3,13],"pz":[0,0,-1],"nx":[4,8,4],"ny":[3,6,2],"nz":[2,1,2]},{"size":2,"px":[4,7],"py":[3,7],"pz":[2,1],"nx":[15,1],"ny":[15,0],"nz":[0,-1]},{"size":2,"px":[3,6],"py":[2,3],"pz":[2,1],"nx":[3,18],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[2,4],"py":[2,4],"pz":[2,1],"nx":[3,0],"ny":[5,0],"nz":[1,-1]},{"size":2,"px":[10,0],"py":[10,0],"pz":[0,-1],"nx":[9,4],"ny":[2,0],"nz":[1,2]},{"size":2,"px":[2,0],"py":[8,3],"pz":[1,-1],"nx":[4,8],"ny":[4,14],"nz":[1,0]},{"size":2,"px":[13,18],"py":[14,14],"pz":[0,-1],"nx":[1,1],"ny":[15,13],"nz":[0,0]},{"size":3,"px":[3,2,2],"py":[17,10,15],"pz":[0,1,0],"nx":[13,2,7],"ny":[19,11,0],"nz":[0,-1,-1]},{"size":2,"px":[4,17],"py":[0,2],"pz":[2,0],"nx":[8,5],"ny":[11,3],"nz":[1,-1]},{"size":2,"px":[15,21],"py":[5,4],"pz":[0,-1],"nx":[15,10],"ny":[3,0],"nz":[0,1]},{"size":2,"px":[7,3],"py":[13,8],"pz":[0,-1],"nx":[8,4],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[7,22],"py":[3,4],"pz":[1,-1],"nx":[4,2],"ny":[2,3],"nz":[1,1]},{"size":4,"px":[6,2,6,5],"py":[21,10,22,20],"pz":[0,1,0,0],"nx":[2,3,4,4],"ny":[11,21,23,23],"nz":[1,0,0,-1]},{"size":2,"px":[7,2],"py":[6,8],"pz":[1,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":4,"px":[11,11,5,11],"py":[6,5,2,4],"pz":[1,1,2,1],"nx":[13,7,8,3],"ny":[7,3,5,2],"nz":[0,1,-1,-1]},{"size":2,"px":[3,3],"py":[7,8],"pz":[1,0],"nx":[3,11],"ny":[4,2],"nz":[1,-1]},{"size":3,"px":[16,1,5],"py":[3,3,11],"pz":[0,-1,-1],"nx":[16,4,8],"ny":[2,0,1],"nz":[0,2,1]},{"size":2,"px":[10,0],"py":[8,1],"pz":[0,-1],"nx":[19,18],"ny":[20,23],"nz":[0,0]},{"size":2,"px":[17,4],"py":[10,4],"pz":[0,-1],"nx":[4,14],"ny":[2,9],"nz":[2,0]},{"size":5,"px":[11,12,9,10,11],"py":[2,3,2,2,3],"pz":[0,0,0,0,0],"nx":[6,4,2,2,2],"ny":[18,9,3,2,2],"nz":[0,1,2,2,-1]},{"size":2,"px":[0,1],"py":[6,16],"pz":[1,0],"nx":[8,16],"ny":[5,16],"nz":[0,-1]},{"size":2,"px":[3,3],"py":[2,3],"pz":[2,2],"nx":[8,17],"ny":[4,9],"nz":[1,-1]},{"size":3,"px":[2,5,2],"py":[5,6,4],"pz":[1,-1,-1],"nx":[0,0,0],"ny":[3,5,6],"nz":[2,1,1]},{"size":5,"px":[0,0,0,0,0],"py":[6,15,16,13,14],"pz":[1,0,0,0,0],"nx":[4,5,8,6,8],"ny":[4,16,8,15,4],"nz":[1,0,0,0,-1]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,5],"ny":[4,16],"nz":[1,-1]},{"size":5,"px":[21,19,21,21,21],"py":[17,23,18,19,20],"pz":[0,0,0,0,0],"nx":[5,2,3,6,6],"ny":[12,5,5,12,12],"nz":[0,1,1,0,-1]},{"size":2,"px":[5,2],"py":[11,1],"pz":[1,-1],"nx":[5,11],"ny":[3,5],"nz":[2,1]},{"size":2,"px":[10,5],"py":[5,3],"pz":[0,1],"nx":[6,15],"ny":[11,5],"nz":[1,-1]},{"size":2,"px":[6,2],"py":[4,2],"pz":[1,-1],"nx":[4,3],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[10,6],"py":[20,6],"pz":[0,-1],"nx":[5,10],"ny":[11,17],"nz":[1,0]},{"size":4,"px":[8,4,7,11],"py":[7,4,5,8],"pz":[1,2,1,0],"nx":[13,10,5,21],"ny":[9,3,5,4],"nz":[0,-1,-1,-1]},{"size":2,"px":[7,13],"py":[10,7],"pz":[0,0],"nx":[10,8],"ny":[9,18],"nz":[0,-1]},{"size":2,"px":[3,3],"py":[1,0],"pz":[2,2],"nx":[8,5],"ny":[4,2],"nz":[1,-1]},{"size":5,"px":[5,2,5,8,4],"py":[8,4,14,23,7],"pz":[1,2,0,0,1],"nx":[18,4,16,17,17],"ny":[1,0,0,1,1],"nz":[0,2,0,0,-1]},{"size":2,"px":[6,2],"py":[2,4],"pz":[1,-1],"nx":[8,8],"ny":[4,3],"nz":[1,1]},{"size":2,"px":[6,1],"py":[8,15],"pz":[0,-1],"nx":[8,3],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[10,1],"py":[7,2],"pz":[1,-1],"nx":[6,6],"ny":[9,4],"nz":[1,1]},{"size":2,"px":[4,1],"py":[6,2],"pz":[1,-1],"nx":[1,10],"ny":[16,12],"nz":[0,0]},{"size":2,"px":[8,4],"py":[7,2],"pz":[1,-1],"nx":[8,9],"ny":[8,10],"nz":[1,1]},{"size":5,"px":[4,8,7,6,6],"py":[0,0,0,1,1],"pz":[1,0,0,0,-1],"nx":[11,5,8,4,10],"ny":[5,3,4,4,5],"nz":[0,1,1,1,0]},{"size":2,"px":[5,6],"py":[8,5],"pz":[0,0],"nx":[6,6],"ny":[8,3],"nz":[0,-1]},{"size":2,"px":[18,5],"py":[19,5],"pz":[0,-1],"nx":[4,21],"ny":[5,19],"nz":[2,0]},{"size":2,"px":[9,5],"py":[13,6],"pz":[0,1],"nx":[2,2],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[10,4],"py":[17,6],"pz":[0,1],"nx":[10,2],"ny":[15,4],"nz":[0,-1]},{"size":3,"px":[13,13,19],"py":[11,12,8],"pz":[0,0,-1],"nx":[12,3,8],"ny":[4,1,4],"nz":[0,2,1]},{"size":3,"px":[11,7,4],"py":[5,2,1],"pz":[0,-1,-1],"nx":[9,2,4],"ny":[11,3,6],"nz":[0,2,1]},{"size":2,"px":[10,7],"py":[15,2],"pz":[0,-1],"nx":[4,4],"ny":[0,1],"nz":[2,2]},{"size":5,"px":[8,9,16,18,18],"py":[0,1,1,1,1],"pz":[1,1,0,0,-1],"nx":[5,5,6,4,4],"ny":[21,20,23,17,18],"nz":[0,0,0,0,0]},{"size":2,"px":[6,7],"py":[1,1],"pz":[1,1],"nx":[20,19],"ny":[2,1],"nz":[0,0]},{"size":2,"px":[2,2],"py":[10,11],"pz":[1,1],"nx":[3,3],"ny":[10,10],"nz":[1,-1]},{"size":2,"px":[9,5],"py":[23,1],"pz":[0,-1],"nx":[4,3],"ny":[10,4],"nz":[1,1]},{"size":2,"px":[1,10],"py":[4,7],"pz":[2,-1],"nx":[4,3],"ny":[23,21],"nz":[0,0]},{"size":2,"px":[10,21],"py":[11,18],"pz":[1,0],"nx":[10,4],"ny":[18,1],"nz":[0,-1]},{"size":2,"px":[11,23],"py":[11,15],"pz":[0,-1],"nx":[11,11],"ny":[7,9],"nz":[1,1]},{"size":2,"px":[10,1],"py":[7,7],"pz":[1,-1],"nx":[15,4],"ny":[14,4],"nz":[0,2]},{"size":2,"px":[1,2],"py":[9,20],"pz":[1,0],"nx":[21,3],"ny":[12,20],"nz":[0,-1]},{"size":2,"px":[7,4],"py":[0,0],"pz":[1,2],"nx":[4,2],"ny":[0,19],"nz":[0,-1]},{"size":2,"px":[2,4],"py":[3,6],"pz":[2,1],"nx":[3,0],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[5,1],"py":[5,0],"pz":[1,-1],"nx":[12,10],"ny":[11,4],"nz":[0,1]},{"size":2,"px":[11,12],"py":[11,14],"pz":[1,-1],"nx":[18,16],"ny":[21,15],"nz":[0,0]},{"size":2,"px":[3,18],"py":[1,5],"pz":[2,-1],"nx":[4,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[9,10],"py":[18,7],"pz":[0,-1],"nx":[3,6],"ny":[0,0],"nz":[2,1]},{"size":2,"px":[19,2],"py":[1,4],"pz":[0,-1],"nx":[22,22],"ny":[13,15],"nz":[0,0]},{"size":3,"px":[13,15,20],"py":[14,21,10],"pz":[0,-1,-1],"nx":[15,7,7],"ny":[13,6,8],"nz":[0,1,1]},{"size":2,"px":[9,9],"py":[6,7],"pz":[1,1],"nx":[8,7],"ny":[4,8],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[5,3],"pz":[1,2],"nx":[5,10],"ny":[2,9],"nz":[1,-1]},{"size":2,"px":[14,11],"py":[7,16],"pz":[0,-1],"nx":[1,0],"ny":[17,4],"nz":[0,2]},{"size":2,"px":[14,18],"py":[17,18],"pz":[0,-1],"nx":[8,14],"ny":[10,16],"nz":[1,0]},{"size":2,"px":[6,11],"py":[13,11],"pz":[0,-1],"nx":[8,9],"ny":[12,9],"nz":[0,0]},{"size":2,"px":[8,9],"py":[2,2],"pz":[0,0],"nx":[3,3],"ny":[2,2],"nz":[2,-1]},{"size":3,"px":[21,21,21],"py":[14,16,15],"pz":[0,0,0],"nx":[14,12,0],"ny":[5,12,6],"nz":[0,-1,-1]},{"size":2,"px":[4,21],"py":[6,15],"pz":[1,-1],"nx":[5,1],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[6,3],"py":[2,1],"pz":[1,2],"nx":[8,0],"ny":[4,20],"nz":[1,-1]},{"size":2,"px":[13,2],"py":[9,1],"pz":[0,-1],"nx":[3,5],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[16,1],"py":[5,4],"pz":[0,-1],"nx":[17,8],"ny":[3,2],"nz":[0,1]},{"size":2,"px":[9,2],"py":[7,1],"pz":[1,-1],"nx":[20,20],"ny":[17,16],"nz":[0,0]},{"size":2,"px":[5,7],"py":[3,6],"pz":[2,-1],"nx":[9,9],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[11,17],"py":[4,1],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[15,2],"py":[11,0],"pz":[0,-1],"nx":[5,14],"ny":[1,12],"nz":[2,0]},{"size":2,"px":[22,19],"py":[3,0],"pz":[0,-1],"nx":[9,4],"ny":[6,4],"nz":[1,1]},{"size":2,"px":[1,22],"py":[3,21],"pz":[0,-1],"nx":[0,0],"ny":[1,0],"nz":[2,2]},{"size":2,"px":[11,11],"py":[11,12],"pz":[0,0],"nx":[1,2],"ny":[1,4],"nz":[2,-1]},{"size":2,"px":[18,3],"py":[8,1],"pz":[0,2],"nx":[13,1],"ny":[8,5],"nz":[0,-1]},{"size":2,"px":[13,6],"py":[21,3],"pz":[0,-1],"nx":[11,11],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[15,14],"py":[4,4],"pz":[0,0],"nx":[17,1],"ny":[12,5],"nz":[0,-1]},{"size":2,"px":[11,3],"py":[12,1],"pz":[0,-1],"nx":[1,2],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[3,2],"py":[7,3],"pz":[0,1],"nx":[16,2],"ny":[3,5],"nz":[0,-1]},{"size":2,"px":[10,5],"py":[7,20],"pz":[1,-1],"nx":[9,8],"ny":[4,6],"nz":[1,1]},{"size":2,"px":[19,2],"py":[10,2],"pz":[0,-1],"nx":[9,4],"ny":[3,1],"nz":[1,2]},{"size":2,"px":[14,9],"py":[0,23],"pz":[0,-1],"nx":[4,4],"ny":[3,2],"nz":[2,2]},{"size":2,"px":[6,9],"py":[4,10],"pz":[1,0],"nx":[10,9],"ny":[9,0],"nz":[0,-1]},{"size":4,"px":[6,9,10,8],"py":[20,23,18,23],"pz":[0,0,0,0],"nx":[9,22,1,2],"ny":[21,14,2,5],"nz":[0,-1,-1,-1]},{"size":2,"px":[17,18],"py":[13,6],"pz":[0,-1],"nx":[6,7],"ny":[9,11],"nz":[1,1]},{"size":5,"px":[18,19,20,19,20],"py":[15,19,16,20,17],"pz":[0,0,0,0,0],"nx":[11,22,23,23,23],"ny":[10,22,20,19,19],"nz":[1,0,0,0,-1]},{"size":2,"px":[10,10],"py":[1,0],"pz":[1,1],"nx":[21,11],"ny":[0,4],"nz":[0,-1]},{"size":2,"px":[11,0],"py":[9,3],"pz":[0,-1],"nx":[9,4],"ny":[2,1],"nz":[1,2]},{"size":2,"px":[14,23],"py":[2,18],"pz":[0,-1],"nx":[15,18],"ny":[1,2],"nz":[0,0]},{"size":2,"px":[9,3],"py":[0,0],"pz":[1,-1],"nx":[3,12],"ny":[1,5],"nz":[2,0]},{"size":2,"px":[8,8],"py":[7,8],"pz":[1,1],"nx":[8,8],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[1,0],"py":[1,3],"pz":[2,-1],"nx":[7,19],"ny":[9,15],"nz":[1,0]},{"size":3,"px":[16,6,4],"py":[21,5,4],"pz":[0,-1,-1],"nx":[4,19,8],"ny":[5,21,11],"nz":[2,0,1]},{"size":2,"px":[5,5],"py":[6,6],"pz":[1,-1],"nx":[10,10],"ny":[10,12],"nz":[0,0]},{"size":2,"px":[6,11],"py":[2,5],"pz":[1,0],"nx":[3,4],"ny":[4,7],"nz":[1,-1]},{"size":3,"px":[8,6,2],"py":[4,10,2],"pz":[1,1,2],"nx":[2,18,5],"ny":[0,11,5],"nz":[0,-1,-1]},{"size":2,"px":[11,7],"py":[9,7],"pz":[0,-1],"nx":[12,3],"ny":[9,5],"nz":[0,1]},{"size":2,"px":[14,13],"py":[20,20],"pz":[0,0],"nx":[13,3],"ny":[21,5],"nz":[0,-1]},{"size":2,"px":[13,7],"py":[5,3],"pz":[0,-1],"nx":[3,4],"ny":[1,4],"nz":[2,1]},{"size":2,"px":[6,2],"py":[21,5],"pz":[0,-1],"nx":[2,3],"ny":[5,10],"nz":[2,1]},{"size":2,"px":[23,5],"py":[6,0],"pz":[0,2],"nx":[21,4],"ny":[6,1],"nz":[0,-1]},{"size":2,"px":[9,9],"py":[7,6],"pz":[1,1],"nx":[8,2],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[22,11],"py":[20,9],"pz":[0,1],"nx":[8,8],"ny":[10,10],"nz":[1,-1]},{"size":2,"px":[8,16],"py":[21,12],"pz":[0,-1],"nx":[2,7],"ny":[5,23],"nz":[2,0]},{"size":5,"px":[0,1,1,1,1],"py":[3,1,9,4,7],"pz":[2,2,1,1,1],"nx":[11,22,22,23,23],"ny":[10,21,22,19,20],"nz":[1,0,0,0,-1]},{"size":2,"px":[17,5],"py":[12,4],"pz":[0,-1],"nx":[8,8],"ny":[4,5],"nz":[1,1]},{"size":2,"px":[16,4],"py":[7,10],"pz":[0,-1],"nx":[9,15],"ny":[4,6],"nz":[1,0]},{"size":2,"px":[3,6],"py":[3,5],"pz":[2,1],"nx":[11,12],"ny":[11,23],"nz":[0,-1]},{"size":2,"px":[5,2],"py":[14,7],"pz":[0,1],"nx":[4,17],"ny":[18,16],"nz":[0,-1]},{"size":3,"px":[10,1,1],"py":[12,5,4],"pz":[0,-1,-1],"nx":[7,11,5],"ny":[1,2,1],"nz":[1,0,1]},{"size":2,"px":[7,6],"py":[3,9],"pz":[0,-1],"nx":[2,2],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[13,6],"py":[22,9],"pz":[0,-1],"nx":[8,4],"ny":[4,3],"nz":[1,2]},{"size":5,"px":[12,9,10,11,11],"py":[0,0,0,0,0],"pz":[0,0,0,0,-1],"nx":[16,5,10,4,8],"ny":[10,3,6,4,4],"nz":[0,1,0,1,1]},{"size":2,"px":[18,19],"py":[23,20],"pz":[0,0],"nx":[8,5],"ny":[11,3],"nz":[1,-1]},{"size":2,"px":[8,3],"py":[7,2],"pz":[1,2],"nx":[8,4],"ny":[4,3],"nz":[1,-1]},{"size":5,"px":[8,14,8,7,4],"py":[6,12,8,6,3],"pz":[1,0,1,1,2],"nx":[2,6,6,7,7],"ny":[0,1,2,0,0],"nz":[2,0,0,0,-1]},{"size":3,"px":[1,2,3],"py":[15,18,21],"pz":[0,0,0],"nx":[19,5,18],"ny":[23,5,8],"nz":[0,-1,-1]},{"size":2,"px":[6,2],"py":[6,1],"pz":[1,-1],"nx":[0,0],"ny":[12,4],"nz":[0,1]},{"size":2,"px":[3,5],"py":[5,11],"pz":[2,1],"nx":[14,5],"ny":[19,5],"nz":[0,-1]},{"size":2,"px":[10,4],"py":[4,4],"pz":[1,-1],"nx":[11,5],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[18,4],"py":[6,4],"pz":[0,-1],"nx":[4,8],"ny":[5,4],"nz":[1,1]},{"size":2,"px":[6,12],"py":[2,4],"pz":[1,0],"nx":[8,8],"ny":[3,4],"nz":[1,-1]},{"size":2,"px":[1,0],"py":[1,1],"pz":[1,2],"nx":[7,2],"ny":[4,7],"nz":[0,-1]},{"size":2,"px":[8,0],"py":[20,0],"pz":[0,-1],"nx":[4,5],"ny":[10,11],"nz":[1,1]},{"size":2,"px":[6,14],"py":[5,2],"pz":[1,-1],"nx":[0,0],"ny":[0,2],"nz":[1,0]},{"size":2,"px":[5,15],"py":[4,7],"pz":[1,-1],"nx":[4,7],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[7,5],"py":[2,1],"pz":[0,1],"nx":[3,1],"ny":[4,1],"nz":[1,-1]},{"size":2,"px":[8,9],"py":[4,2],"pz":[0,-1],"nx":[11,9],"ny":[1,3],"nz":[0,0]},{"size":2,"px":[6,3],"py":[2,4],"pz":[1,-1],"nx":[4,8],"ny":[4,4],"nz":[1,1]},{"size":2,"px":[3,7],"py":[3,7],"pz":[2,1],"nx":[6,8],"ny":[14,4],"nz":[0,-1]},{"size":2,"px":[3,0],"py":[21,3],"pz":[0,2],"nx":[20,8],"ny":[10,4],"nz":[0,-1]},{"size":2,"px":[6,3],"py":[5,8],"pz":[0,-1],"nx":[4,3],"ny":[4,2],"nz":[0,1]},{"size":2,"px":[3,6],"py":[7,13],"pz":[1,0],"nx":[3,2],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[16,10],"py":[9,7],"pz":[0,1],"nx":[7,9],"ny":[3,10],"nz":[1,-1]},{"size":2,"px":[13,10],"py":[6,7],"pz":[0,-1],"nx":[8,17],"ny":[4,12],"nz":[1,0]},{"size":2,"px":[5,10],"py":[4,10],"pz":[2,1],"nx":[5,4],"ny":[9,2],"nz":[1,-1]},{"size":4,"px":[15,3,5,0],"py":[12,4,2,3],"pz":[0,-1,-1,-1],"nx":[13,7,5,7],"ny":[12,6,0,7],"nz":[0,1,2,1]},{"size":4,"px":[2,3,16,17],"py":[3,4,6,6],"pz":[2,1,0,0],"nx":[16,16,8,16],"ny":[8,3,10,13],"nz":[0,-1,-1,-1]},{"size":2,"px":[16,8],"py":[1,4],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[9,14],"py":[6,2],"pz":[1,-1],"nx":[8,8],"ny":[6,4],"nz":[1,1]},{"size":2,"px":[8,4],"py":[10,4],"pz":[1,2],"nx":[10,0],"ny":[5,7],"nz":[1,-1]},{"size":2,"px":[9,10],"py":[4,4],"pz":[0,0],"nx":[9,7],"ny":[3,5],"nz":[0,-1]},{"size":5,"px":[11,10,13,6,12],"py":[2,2,2,1,2],"pz":[0,0,0,1,0],"nx":[4,18,18,13,13],"ny":[2,18,19,7,7],"nz":[2,0,0,0,-1]},{"size":4,"px":[13,13,13,2],"py":[13,12,11,3],"pz":[0,0,0,-1],"nx":[4,6,8,11],"ny":[2,2,4,4],"nz":[2,1,1,0]},{"size":2,"px":[4,7],"py":[6,13],"pz":[1,0],"nx":[8,10],"ny":[4,22],"nz":[1,-1]},{"size":2,"px":[0,7],"py":[4,17],"pz":[1,-1],"nx":[0,1],"ny":[5,21],"nz":[2,0]},{"size":2,"px":[12,13],"py":[22,22],"pz":[0,0],"nx":[2,2],"ny":[13,13],"nz":[0,-1]},{"size":3,"px":[4,4,3],"py":[22,23,19],"pz":[0,0,0],"nx":[8,12,3],"ny":[22,15,2],"nz":[0,-1,-1]},{"size":2,"px":[10,12],"py":[3,13],"pz":[0,-1],"nx":[15,2],"ny":[10,2],"nz":[0,2]},{"size":2,"px":[1,1],"py":[3,3],"pz":[2,-1],"nx":[8,4],"ny":[0,0],"nz":[1,2]},{"size":2,"px":[6,12],"py":[6,18],"pz":[1,0],"nx":[12,19],"ny":[17,16],"nz":[0,-1]},{"size":2,"px":[10,5],"py":[2,1],"pz":[0,1],"nx":[5,4],"ny":[4,17],"nz":[0,-1]},{"size":3,"px":[3,12,11],"py":[5,23,23],"pz":[2,0,0],"nx":[12,4,4],"ny":[21,17,1],"nz":[0,-1,-1]},{"size":2,"px":[12,0],"py":[21,5],"pz":[0,-1],"nx":[0,0],"ny":[7,9],"nz":[1,1]},{"size":2,"px":[17,17],"py":[12,11],"pz":[0,0],"nx":[8,11],"ny":[4,11],"nz":[1,-1]},{"size":2,"px":[11,0],"py":[22,1],"pz":[0,-1],"nx":[4,6],"ny":[1,0],"nz":[1,1]},{"size":2,"px":[11,11],"py":[9,5],"pz":[1,1],"nx":[23,11],"ny":[23,20],"nz":[0,-1]},{"size":5,"px":[4,12,11,9,8],"py":[0,1,1,0,1],"pz":[1,0,0,0,0],"nx":[4,17,8,7,7],"ny":[2,13,4,4,4],"nz":[2,0,1,1,-1]},{"size":2,"px":[11,13],"py":[12,12],"pz":[0,-1],"nx":[1,1],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[23,4],"py":[23,2],"pz":[0,-1],"nx":[5,2],"ny":[23,6],"nz":[0,1]},{"size":3,"px":[8,16,0],"py":[5,15,6],"pz":[1,-1,-1],"nx":[23,23,11],"ny":[18,17,8],"nz":[0,0,1]},{"size":2,"px":[1,16],"py":[4,15],"pz":[2,-1],"nx":[2,2],"ny":[3,2],"nz":[2,2]},{"size":2,"px":[3,8],"py":[7,9],"pz":[1,-1],"nx":[4,2],"ny":[10,5],"nz":[1,2]},{"size":3,"px":[22,1,9],"py":[23,2,3],"pz":[0,-1,-1],"nx":[2,2,5],"ny":[5,4,19],"nz":[2,2,0]},{"size":2,"px":[2,20],"py":[5,15],"pz":[1,-1],"nx":[2,1],"ny":[1,2],"nz":[2,2]},{"size":2,"px":[4,8],"py":[1,19],"pz":[1,-1],"nx":[2,2],"ny":[5,4],"nz":[2,2]},{"size":2,"px":[9,10],"py":[21,0],"pz":[0,-1],"nx":[6,5],"ny":[1,1],"nz":[1,1]},{"size":2,"px":[4,8],"py":[3,6],"pz":[2,1],"nx":[9,2],"ny":[4,1],"nz":[1,-1]},{"size":3,"px":[17,3,10],"py":[8,0,2],"pz":[0,2,0],"nx":[13,2,6],"ny":[15,5,1],"nz":[0,-1,-1]},{"size":2,"px":[9,6],"py":[20,21],"pz":[0,-1],"nx":[4,2],"ny":[10,5],"nz":[1,2]},{"size":2,"px":[3,7],"py":[0,1],"pz":[2,1],"nx":[7,20],"ny":[1,19],"nz":[0,-1]},{"size":2,"px":[4,5],"py":[0,1],"pz":[1,0],"nx":[3,2],"ny":[4,2],"nz":[0,-1]},{"size":2,"px":[2,7],"py":[4,19],"pz":[2,0],"nx":[5,2],"ny":[10,2],"nz":[1,-1]},{"size":5,"px":[3,3,4,7,7],"py":[1,0,0,0,1],"pz":[1,1,1,0,0],"nx":[5,4,10,8,8],"ny":[3,3,5,4,4],"nz":[1,1,0,1,-1]},{"size":2,"px":[1,5],"py":[0,3],"pz":[1,-1],"nx":[1,0],"ny":[0,1],"nz":[0,1]},{"size":2,"px":[10,0],"py":[5,5],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[0,9],"py":[0,4],"pz":[2,-1],"nx":[13,10],"ny":[0,0],"nz":[0,0]},{"size":2,"px":[13,4],"py":[14,5],"pz":[0,-1],"nx":[4,2],"ny":[0,0],"nz":[0,1]},{"size":2,"px":[17,4],"py":[13,3],"pz":[0,-1],"nx":[4,2],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[1,0],"py":[6,2],"pz":[1,-1],"nx":[1,6],"ny":[2,12],"nz":[2,0]},{"size":2,"px":[12,4],"py":[6,0],"pz":[0,-1],"nx":[3,3],"ny":[8,9],"nz":[1,1]},{"size":2,"px":[1,5],"py":[1,5],"pz":[1,-1],"nx":[17,17],"ny":[13,7],"nz":[0,0]},{"size":2,"px":[7,3],"py":[12,6],"pz":[0,1],"nx":[3,4],"ny":[4,11],"nz":[1,-1]},{"size":2,"px":[6,17],"py":[2,8],"pz":[1,0],"nx":[3,3],"ny":[1,2],"nz":[1,-1]},{"size":3,"px":[13,6,6],"py":[22,11,10],"pz":[0,1,1],"nx":[13,12,11],"ny":[20,20,20],"nz":[0,0,0]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,12],"ny":[4,20],"nz":[1,-1]},{"size":2,"px":[5,2],"py":[1,1],"pz":[1,-1],"nx":[13,6],"ny":[0,0],"nz":[0,1]},{"size":2,"px":[2,8],"py":[3,9],"pz":[2,0],"nx":[8,16],"ny":[5,17],"nz":[0,-1]},{"size":2,"px":[16,15],"py":[1,1],"pz":[0,0],"nx":[7,11],"ny":[8,0],"nz":[1,-1]},{"size":2,"px":[11,18],"py":[21,23],"pz":[0,-1],"nx":[1,1],"ny":[4,3],"nz":[1,2]},{"size":2,"px":[1,5],"py":[0,2],"pz":[1,-1],"nx":[15,11],"ny":[8,7],"nz":[0,0]},{"size":2,"px":[5,4],"py":[7,8],"pz":[1,-1],"nx":[9,10],"ny":[13,11],"nz":[0,0]},{"size":2,"px":[7,4],"py":[10,4],"pz":[1,2],"nx":[22,4],"ny":[0,2],"nz":[0,-1]},{"size":2,"px":[11,3],"py":[3,1],"pz":[0,2],"nx":[8,0],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[5,21],"py":[11,22],"pz":[0,-1],"nx":[10,11],"ny":[11,9],"nz":[0,0]},{"size":2,"px":[5,5],"py":[0,1],"pz":[2,2],"nx":[2,21],"ny":[6,14],"nz":[0,-1]},{"size":3,"px":[10,10,1],"py":[11,0,5],"pz":[0,-1,-1],"nx":[6,12,5],"ny":[2,5,2],"nz":[1,0,1]},{"size":2,"px":[9,10],"py":[5,6],"pz":[0,0],"nx":[12,19],"ny":[23,5],"nz":[0,-1]},{"size":2,"px":[11,5],"py":[9,6],"pz":[0,1],"nx":[21,0],"ny":[23,0],"nz":[0,-1]},{"size":2,"px":[13,12],"py":[19,15],"pz":[0,0],"nx":[13,0],"ny":[17,0],"nz":[0,-1]},{"size":2,"px":[14,0],"py":[17,3],"pz":[0,-1],"nx":[7,16],"ny":[8,19],"nz":[1,0]},{"size":2,"px":[3,6],"py":[2,4],"pz":[2,1],"nx":[8,1],"ny":[4,4],"nz":[1,-1]},{"size":2,"px":[13,10],"py":[23,20],"pz":[0,-1],"nx":[4,7],"ny":[5,10],"nz":[2,1]},{"size":2,"px":[16,9],"py":[22,5],"pz":[0,-1],"nx":[4,2],"ny":[10,3],"nz":[1,2]},{"size":4,"px":[3,1,1,5],"py":[4,2,1,2],"pz":[0,2,2,1],"nx":[13,5,8,0],"ny":[22,2,9,2],"nz":[0,-1,-1,-1]},{"size":2,"px":[9,9],"py":[0,0],"pz":[1,-1],"nx":[19,20],"ny":[1,2],"nz":[0,0]},{"size":2,"px":[7,22],"py":[6,8],"pz":[1,0],"nx":[4,4],"ny":[2,4],"nz":[2,-1]},{"size":2,"px":[3,6],"py":[4,4],"pz":[2,1],"nx":[10,20],"ny":[10,6],"nz":[0,-1]},{"size":2,"px":[6,12],"py":[6,15],"pz":[1,-1],"nx":[0,0],"ny":[2,5],"nz":[2,1]},{"size":2,"px":[2,7],"py":[4,10],"pz":[2,-1],"nx":[3,6],"ny":[4,8],"nz":[2,1]},{"size":3,"px":[11,11,4],"py":[0,5,7],"pz":[1,-1,-1],"nx":[6,12,12],"ny":[1,1,2],"nz":[1,0,0]},{"size":2,"px":[11,17],"py":[4,18],"pz":[0,-1],"nx":[8,2],"ny":[10,2],"nz":[0,2]},{"size":2,"px":[17,17],"py":[10,18],"pz":[0,-1],"nx":[8,8],"ny":[2,3],"nz":[1,1]},{"size":2,"px":[9,9],"py":[7,7],"pz":[1,-1],"nx":[7,4],"ny":[6,3],"nz":[1,2]},{"size":2,"px":[18,21],"py":[0,0],"pz":[0,-1],"nx":[11,6],"ny":[5,3],"nz":[0,1]},{"size":2,"px":[5,2],"py":[8,4],"pz":[0,2],"nx":[5,8],"ny":[9,16],"nz":[0,-1]},{"size":2,"px":[12,2],"py":[5,4],"pz":[0,-1],"nx":[4,15],"ny":[4,8],"nz":[1,0]},{"size":2,"px":[1,1],"py":[4,6],"pz":[1,1],"nx":[11,3],"ny":[7,9],"nz":[0,-1]},{"size":2,"px":[2,1],"py":[3,3],"pz":[2,2],"nx":[2,2],"ny":[15,16],"nz":[0,0]},{"size":2,"px":[17,18],"py":[5,5],"pz":[0,0],"nx":[9,21],"ny":[2,10],"nz":[1,-1]},{"size":2,"px":[6,3],"py":[14,7],"pz":[0,1],"nx":[3,4],"ny":[4,5],"nz":[1,-1]},{"size":2,"px":[0,3],"py":[3,1],"pz":[1,-1],"nx":[19,10],"ny":[12,4],"nz":[0,1]},{"size":2,"px":[6,16],"py":[3,8],"pz":[1,0],"nx":[8,10],"ny":[20,4],"nz":[0,-1]},{"size":3,"px":[5,5,2],"py":[21,8,4],"pz":[0,1,2],"nx":[10,6,3],"ny":[15,2,1],"nz":[0,-1,-1]},{"size":2,"px":[11,10],"py":[10,12],"pz":[0,0],"nx":[11,11],"ny":[2,1],"nz":[1,-1]},{"size":2,"px":[10,10],"py":[3,2],"pz":[1,1],"nx":[8,11],"ny":[3,5],"nz":[1,-1]},{"size":2,"px":[13,3],"py":[5,8],"pz":[0,-1],"nx":[12,3],"ny":[3,1],"nz":[0,2]},{"size":2,"px":[13,7],"py":[2,1],"pz":[0,1],"nx":[5,5],"ny":[1,1],"nz":[0,-1]},{"size":2,"px":[11,10],"py":[10,8],"pz":[0,-1],"nx":[14,16],"ny":[10,15],"nz":[0,0]},{"size":2,"px":[2,10],"py":[7,8],"pz":[1,-1],"nx":[2,6],"ny":[5,6],"nz":[2,1]},{"size":2,"px":[10,10],"py":[1,8],"pz":[0,-1],"nx":[2,2],"ny":[3,2],"nz":[2,2]},{"size":2,"px":[4,0],"py":[5,2],"pz":[1,-1],"nx":[1,2],"ny":[2,3],"nz":[2,1]},{"size":2,"px":[1,12],"py":[1,9],"pz":[2,-1],"nx":[16,17],"ny":[3,3],"nz":[0,0]},{"size":2,"px":[12,6],"py":[5,8],"pz":[0,-1],"nx":[3,4],"ny":[7,4],"nz":[1,1]},{"size":2,"px":[14,3],"py":[11,5],"pz":[0,-1],"nx":[11,4],"ny":[0,0],"nz":[0,1]},{"size":2,"px":[6,10],"py":[6,6],"pz":[1,-1],"nx":[0,0],"ny":[1,0],"nz":[2,2]},{"size":2,"px":[3,7],"py":[0,7],"pz":[1,-1],"nx":[15,13],"ny":[8,4],"nz":[0,0]},{"size":2,"px":[18,1],"py":[15,0],"pz":[0,-1],"nx":[18,18],"ny":[18,17],"nz":[0,0]},{"size":2,"px":[5,2],"py":[4,4],"pz":[0,-1],"nx":[4,18],"ny":[4,15],"nz":[1,0]},{"size":3,"px":[3,14,13],"py":[2,7,8],"pz":[2,0,0],"nx":[10,0,2],"ny":[8,3,2],"nz":[0,-1,-1]},{"size":2,"px":[16,0],"py":[14,3],"pz":[0,-1],"nx":[18,3],"ny":[12,5],"nz":[0,2]},{"size":2,"px":[5,3],"py":[8,3],"pz":[1,2],"nx":[13,4],"ny":[10,4],"nz":[0,-1]},{"size":2,"px":[3,6],"py":[1,2],"pz":[2,1],"nx":[8,1],"ny":[4,20],"nz":[1,-1]},{"size":2,"px":[10,10],"py":[8,3],"pz":[1,-1],"nx":[12,7],"ny":[2,1],"nz":[0,1]},{"size":2,"px":[17,3],"py":[9,2],"pz":[0,2],"nx":[7,6],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[12,1],"py":[2,1],"pz":[0,-1],"nx":[4,4],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[22,5],"py":[15,3],"pz":[0,2],"nx":[16,17],"ny":[14,2],"nz":[0,-1]},{"size":2,"px":[8,11],"py":[19,13],"pz":[0,-1],"nx":[0,0],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[8,11],"py":[8,1],"pz":[1,-1],"nx":[3,3],"ny":[2,5],"nz":[1,2]},{"size":3,"px":[3,8,0],"py":[7,7,5],"pz":[1,-1,-1],"nx":[11,5,1],"ny":[11,7,5],"nz":[0,1,1]},{"size":2,"px":[12,6],"py":[12,6],"pz":[0,1],"nx":[9,0],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[16,12],"py":[7,1],"pz":[0,-1],"nx":[16,7],"ny":[6,4],"nz":[0,1]},{"size":2,"px":[13,5],"py":[14,0],"pz":[0,-1],"nx":[13,10],"ny":[0,0],"nz":[0,0]},{"size":5,"px":[11,12,13,12,7],"py":[0,1,0,0,0],"pz":[0,0,0,0,1],"nx":[13,16,14,4,4],"ny":[18,23,18,5,5],"nz":[0,0,0,2,-1]},{"size":2,"px":[14,5],"py":[12,4],"pz":[0,-1],"nx":[7,7],"ny":[8,2],"nz":[1,1]},{"size":2,"px":[19,3],"py":[2,5],"pz":[0,-1],"nx":[11,23],"ny":[7,13],"nz":[1,0]},{"size":2,"px":[0,0],"py":[19,20],"pz":[0,0],"nx":[9,4],"ny":[5,2],"nz":[0,-1]},{"size":2,"px":[15,4],"py":[12,3],"pz":[0,2],"nx":[9,5],"ny":[4,5],"nz":[1,-1]},{"size":4,"px":[8,0,1,21],"py":[6,0,7,16],"pz":[1,-1,-1,-1],"nx":[11,6,11,5],"ny":[8,6,4,3],"nz":[1,1,1,2]},{"size":2,"px":[11,11],"py":[7,5],"pz":[0,-1],"nx":[9,10],"ny":[6,7],"nz":[0,0]},{"size":2,"px":[2,4],"py":[1,2],"pz":[2,1],"nx":[16,6],"ny":[0,1],"nz":[0,-1]},{"size":2,"px":[0,0],"py":[5,3],"pz":[1,2],"nx":[1,21],"ny":[23,8],"nz":[0,-1]},{"size":2,"px":[10,0],"py":[7,0],"pz":[0,-1],"nx":[4,13],"ny":[4,10],"nz":[1,0]},{"size":2,"px":[11,4],"py":[0,4],"pz":[1,-1],"nx":[4,2],"ny":[16,8],"nz":[0,1]},{"size":2,"px":[5,3],"py":[12,6],"pz":[0,1],"nx":[3,3],"ny":[4,2],"nz":[1,-1]},{"size":2,"px":[10,0],"py":[19,11],"pz":[0,-1],"nx":[9,5],"ny":[21,9],"nz":[0,1]},{"size":2,"px":[0,0],"py":[17,9],"pz":[0,1],"nx":[0,5],"ny":[0,9],"nz":[2,-1]},{"size":2,"px":[4,5],"py":[2,4],"pz":[0,-1],"nx":[4,4],"ny":[5,6],"nz":[1,1]},{"size":2,"px":[8,4],"py":[1,0],"pz":[1,2],"nx":[4,3],"ny":[3,6],"nz":[0,-1]},{"size":2,"px":[11,0],"py":[7,2],"pz":[1,-1],"nx":[5,5],"ny":[1,0],"nz":[2,2]},{"size":2,"px":[13,0],"py":[17,2],"pz":[0,-1],"nx":[3,6],"ny":[5,8],"nz":[2,1]},{"size":2,"px":[2,1],"py":[0,5],"pz":[2,-1],"nx":[4,9],"ny":[2,7],"nz":[2,1]},{"size":2,"px":[12,5],"py":[13,8],"pz":[0,-1],"nx":[23,11],"ny":[13,7],"nz":[0,1]},{"size":2,"px":[0,0],"py":[0,2],"pz":[1,0],"nx":[3,6],"ny":[11,18],"nz":[0,-1]},{"size":2,"px":[4,3],"py":[6,5],"pz":[0,-1],"nx":[1,1],"ny":[1,3],"nz":[2,1]},{"size":4,"px":[3,6,3,6],"py":[3,6,2,5],"pz":[2,1,2,1],"nx":[0,4,1,1],"ny":[0,22,17,0],"nz":[0,-1,-1,-1]},{"size":2,"px":[8,4],"py":[6,3],"pz":[1,2],"nx":[9,15],"ny":[4,8],"nz":[1,-1]},{"size":2,"px":[8,18],"py":[7,8],"pz":[1,0],"nx":[8,5],"ny":[4,0],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[4,5],"pz":[1,-1],"nx":[5,6],"ny":[0,0],"nz":[1,1]},{"size":2,"px":[13,18],"py":[23,19],"pz":[0,0],"nx":[7,13],"ny":[10,20],"nz":[1,-1]},{"size":2,"px":[10,6],"py":[2,0],"pz":[0,1],"nx":[4,1],"ny":[5,1],"nz":[1,-1]},{"size":2,"px":[1,1],"py":[5,4],"pz":[2,2],"nx":[0,20],"ny":[4,4],"nz":[2,-1]},{"size":2,"px":[5,5],"py":[1,0],"pz":[2,2],"nx":[12,6],"ny":[18,11],"nz":[0,-1]},{"size":5,"px":[2,1,3,1,5],"py":[3,3,7,4,9],"pz":[2,2,1,2,1],"nx":[9,3,8,16,10],"ny":[5,3,10,6,7],"nz":[1,-1,-1,-1,-1]},{"size":2,"px":[4,1],"py":[12,3],"pz":[0,-1],"nx":[10,1],"ny":[11,2],"nz":[0,2]},{"size":2,"px":[19,0],"py":[10,7],"pz":[0,-1],"nx":[14,7],"ny":[6,3],"nz":[0,1]},{"size":2,"px":[7,4],"py":[2,1],"pz":[1,2],"nx":[6,0],"ny":[2,18],"nz":[0,-1]},{"size":2,"px":[14,8],"py":[3,0],"pz":[0,1],"nx":[17,1],"ny":[1,4],"nz":[0,-1]},{"size":2,"px":[18,19],"py":[1,17],"pz":[0,-1],"nx":[5,11],"ny":[2,5],"nz":[2,1]},{"size":5,"px":[12,12,12,6,12],"py":[10,11,12,6,9],"pz":[0,0,0,1,0],"nx":[13,3,12,6,6],"ny":[4,1,4,2,2],"nz":[0,2,0,1,-1]},{"size":2,"px":[11,10],"py":[3,3],"pz":[0,0],"nx":[4,9],"ny":[4,17],"nz":[1,-1]},{"size":2,"px":[11,0],"py":[13,5],"pz":[0,2],"nx":[8,18],"ny":[15,15],"nz":[0,-1]},{"size":2,"px":[3,4],"py":[6,5],"pz":[1,1],"nx":[0,0],"ny":[9,4],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[1,0],"pz":[2,2],"nx":[2,15],"ny":[2,1],"nz":[2,-1]},{"size":3,"px":[2,4,2],"py":[4,9,5],"pz":[2,1,2],"nx":[2,5,14],"ny":[0,1,4],"nz":[0,-1,-1]},{"size":2,"px":[11,12],"py":[20,20],"pz":[0,0],"nx":[6,10],"ny":[9,19],"nz":[1,-1]},{"size":2,"px":[7,0],"py":[16,8],"pz":[0,-1],"nx":[2,3],"ny":[2,4],"nz":[2,1]},{"size":5,"px":[16,17,15,16,15],"py":[1,1,1,0,0],"pz":[0,0,0,0,0],"nx":[8,8,4,12,12],"ny":[8,7,2,23,23],"nz":[1,1,2,0,-1]},{"size":2,"px":[2,4],"py":[6,12],"pz":[1,-1],"nx":[8,13],"ny":[1,1],"nz":[1,0]},{"size":2,"px":[9,2],"py":[3,2],"pz":[0,-1],"nx":[3,4],"ny":[6,5],"nz":[1,1]},{"size":2,"px":[10,8],"py":[6,1],"pz":[1,-1],"nx":[11,8],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[9,3],"py":[7,0],"pz":[1,-1],"nx":[19,19],"ny":[18,16],"nz":[0,0]},{"size":2,"px":[3,2],"py":[1,1],"pz":[2,2],"nx":[22,11],"ny":[4,0],"nz":[0,-1]},{"size":2,"px":[10,10],"py":[9,8],"pz":[1,1],"nx":[4,4],"ny":[10,2],"nz":[1,-1]},{"size":2,"px":[0,1],"py":[0,5],"pz":[0,-1],"nx":[10,8],"ny":[2,2],"nz":[0,0]},{"size":2,"px":[3,3],"py":[8,7],"pz":[1,1],"nx":[8,2],"ny":[8,3],"nz":[0,-1]},{"size":2,"px":[13,5],"py":[21,3],"pz":[0,-1],"nx":[13,3],"ny":[20,5],"nz":[0,2]},{"size":2,"px":[12,5],"py":[11,2],"pz":[0,-1],"nx":[1,0],"ny":[19,9],"nz":[0,1]},{"size":2,"px":[7,10],"py":[9,10],"pz":[1,1],"nx":[8,4],"ny":[10,2],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[5,9],"pz":[2,1],"nx":[2,11],"ny":[9,19],"nz":[1,-1]},{"size":2,"px":[3,5],"py":[1,2],"pz":[2,1],"nx":[8,23],"ny":[4,9],"nz":[1,-1]},{"size":2,"px":[3,4],"py":[2,4],"pz":[2,1],"nx":[5,9],"ny":[2,5],"nz":[2,-1]},{"size":2,"px":[11,11],"py":[2,3],"pz":[1,1],"nx":[19,9],"ny":[6,5],"nz":[0,-1]},{"size":2,"px":[9,4],"py":[5,10],"pz":[1,-1],"nx":[10,22],"ny":[0,16],"nz":[1,0]},{"size":3,"px":[19,9,19],"py":[3,1,2],"pz":[0,1,0],"nx":[6,3,6],"ny":[10,3,0],"nz":[1,-1,-1]},{"size":2,"px":[8,3],"py":[10,3],"pz":[1,2],"nx":[23,14],"ny":[3,18],"nz":[0,-1]},{"size":2,"px":[11,11],"py":[19,0],"pz":[0,-1],"nx":[4,16],"ny":[4,11],"nz":[1,0]},{"size":2,"px":[22,23],"py":[3,22],"pz":[0,-1],"nx":[9,3],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[7,2],"py":[12,4],"pz":[0,-1],"nx":[8,4],"ny":[10,5],"nz":[0,1]},{"size":2,"px":[12,13],"py":[5,13],"pz":[0,-1],"nx":[11,3],"ny":[2,0],"nz":[0,2]},{"size":2,"px":[3,17],"py":[0,16],"pz":[1,-1],"nx":[12,12],"ny":[5,6],"nz":[0,0]},{"size":2,"px":[4,3],"py":[1,0],"pz":[2,2],"nx":[4,3],"ny":[0,3],"nz":[0,-1]},{"size":2,"px":[10,3],"py":[12,0],"pz":[0,-1],"nx":[12,12],"ny":[13,12],"nz":[0,0]},{"size":2,"px":[13,4],"py":[11,14],"pz":[0,-1],"nx":[0,0],"ny":[4,6],"nz":[1,0]},{"size":2,"px":[8,7],"py":[7,8],"pz":[1,1],"nx":[3,0],"ny":[5,21],"nz":[2,-1]},{"size":2,"px":[1,3],"py":[4,14],"pz":[2,0],"nx":[8,8],"ny":[7,7],"nz":[1,-1]},{"size":2,"px":[13,11],"py":[20,7],"pz":[0,-1],"nx":[21,21],"ny":[20,18],"nz":[0,0]},{"size":2,"px":[2,1],"py":[11,0],"pz":[0,-1],"nx":[2,2],"ny":[15,14],"nz":[0,0]},{"size":2,"px":[10,1],"py":[8,0],"pz":[1,-1],"nx":[8,4],"ny":[7,4],"nz":[1,2]},{"size":2,"px":[17,6],"py":[13,1],"pz":[0,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[7,15],"py":[1,3],"pz":[1,0],"nx":[15,5],"ny":[1,8],"nz":[0,-1]},{"size":2,"px":[16,1],"py":[20,10],"pz":[0,-1],"nx":[6,8],"ny":[11,10],"nz":[1,1]},{"size":2,"px":[7,14],"py":[0,0],"pz":[1,0],"nx":[7,8],"ny":[7,3],"nz":[1,-1]},{"size":2,"px":[12,5],"py":[17,4],"pz":[0,-1],"nx":[12,5],"ny":[16,10],"nz":[0,1]},{"size":2,"px":[13,3],"py":[15,0],"pz":[0,-1],"nx":[12,7],"ny":[17,8],"nz":[0,1]},{"size":2,"px":[7,1],"py":[14,1],"pz":[0,-1],"nx":[4,6],"ny":[6,12],"nz":[1,0]},{"size":2,"px":[8,7],"py":[0,0],"pz":[0,0],"nx":[6,20],"ny":[5,5],"nz":[0,-1]},{"size":2,"px":[10,2],"py":[22,5],"pz":[0,-1],"nx":[4,8],"ny":[4,9],"nz":[2,1]},{"size":4,"px":[8,2,2,9],"py":[6,5,3,11],"pz":[1,-1,-1,-1],"nx":[2,7,4,3],"ny":[2,1,0,2],"nz":[2,0,1,2]},{"size":2,"px":[12,6],"py":[12,6],"pz":[0,1],"nx":[8,2],"ny":[4,1],"nz":[1,-1]},{"size":2,"px":[13,11],"py":[19,8],"pz":[0,-1],"nx":[13,13],"ny":[20,17],"nz":[0,0]},{"size":2,"px":[11,19],"py":[5,14],"pz":[0,-1],"nx":[3,4],"ny":[8,4],"nz":[1,1]},{"size":2,"px":[10,0],"py":[8,6],"pz":[1,-1],"nx":[21,21],"ny":[16,15],"nz":[0,0]},{"size":2,"px":[1,12],"py":[7,6],"pz":[1,-1],"nx":[2,7],"ny":[5,14],"nz":[2,0]},{"size":2,"px":[2,9],"py":[7,5],"pz":[1,-1],"nx":[2,5],"ny":[5,9],"nz":[2,1]},{"size":2,"px":[12,5],"py":[15,6],"pz":[0,-1],"nx":[3,12],"ny":[0,2],"nz":[2,0]},{"size":2,"px":[23,22],"py":[23,1],"pz":[0,-1],"nx":[0,0],"ny":[2,3],"nz":[2,2]},{"size":2,"px":[3,6],"py":[1,2],"pz":[2,1],"nx":[8,0],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[5,1],"py":[9,1],"pz":[0,-1],"nx":[4,2],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[0,1],"py":[0,0],"pz":[2,0],"nx":[2,3],"ny":[9,10],"nz":[0,-1]},{"size":2,"px":[6,0],"py":[16,14],"pz":[0,-1],"nx":[6,3],"ny":[23,14],"nz":[0,0]},{"size":2,"px":[3,3],"py":[2,3],"pz":[2,1],"nx":[13,3],"ny":[19,14],"nz":[0,-1]},{"size":2,"px":[11,5],"py":[8,18],"pz":[0,-1],"nx":[4,7],"ny":[1,2],"nz":[2,1]},{"size":2,"px":[4,4],"py":[5,6],"pz":[1,1],"nx":[2,2],"ny":[5,3],"nz":[2,-1]},{"size":2,"px":[7,3],"py":[13,7],"pz":[0,1],"nx":[4,3],"ny":[4,1],"nz":[1,-1]},{"size":2,"px":[0,0],"py":[5,6],"pz":[1,0],"nx":[2,1],"ny":[5,1],"nz":[1,-1]},{"size":2,"px":[7,14],"py":[3,5],"pz":[1,0],"nx":[5,0],"ny":[16,7],"nz":[0,-1]},{"size":2,"px":[11,2],"py":[18,5],"pz":[0,2],"nx":[11,4],"ny":[16,4],"nz":[0,-1]},{"size":2,"px":[6,16],"py":[19,20],"pz":[0,-1],"nx":[3,2],"ny":[10,5],"nz":[1,2]},{"size":2,"px":[5,3],"py":[3,1],"pz":[0,1],"nx":[1,3],"ny":[4,8],"nz":[0,-1]},{"size":2,"px":[12,6],"py":[13,6],"pz":[0,1],"nx":[10,1],"ny":[12,2],"nz":[0,-1]},{"size":2,"px":[8,3],"py":[6,2],"pz":[1,-1],"nx":[4,8],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[9,3],"py":[21,2],"pz":[0,-1],"nx":[8,4],"ny":[1,0],"nz":[1,2]},{"size":2,"px":[8,4],"py":[1,0],"pz":[1,-1],"nx":[8,6],"ny":[4,2],"nz":[1,1]},{"size":2,"px":[2,7],"py":[1,6],"pz":[2,-1],"nx":[7,9],"ny":[6,4],"nz":[1,1]},{"size":2,"px":[6,3],"py":[8,3],"pz":[1,2],"nx":[10,5],"ny":[19,11],"nz":[0,-1]},{"size":2,"px":[2,2],"py":[3,4],"pz":[2,2],"nx":[3,6],"ny":[4,6],"nz":[1,-1]},{"size":2,"px":[3,11],"py":[5,20],"pz":[2,0],"nx":[11,5],"ny":[21,8],"nz":[0,-1]},{"size":3,"px":[5,9,5],"py":[4,7,5],"pz":[2,0,2],"nx":[23,10,4],"ny":[23,3,22],"nz":[0,-1,-1]},{"size":4,"px":[11,9,7,1],"py":[13,8,11,10],"pz":[0,-1,-1,-1],"nx":[8,2,11,12],"ny":[4,2,4,4],"nz":[1,2,0,0]},{"size":2,"px":[0,0],"py":[7,6],"pz":[1,1],"nx":[0,4],"ny":[1,0],"nz":[2,-1]},{"size":2,"px":[19,20],"py":[0,1],"pz":[0,0],"nx":[21,1],"ny":[0,2],"nz":[0,-1]},{"size":2,"px":[8,5],"py":[11,0],"pz":[0,-1],"nx":[11,0],"ny":[12,1],"nz":[0,2]},{"size":2,"px":[11,11],"py":[1,1],"pz":[0,-1],"nx":[4,7],"ny":[5,4],"nz":[1,1]},{"size":2,"px":[5,12],"py":[4,23],"pz":[2,-1],"nx":[13,15],"ny":[5,4],"nz":[0,0]},{"size":2,"px":[12,20],"py":[4,16],"pz":[0,-1],"nx":[9,4],"ny":[2,1],"nz":[0,1]},{"size":2,"px":[12,13],"py":[2,2],"pz":[0,0],"nx":[4,16],"ny":[2,11],"nz":[2,0]},{"size":2,"px":[19,14],"py":[10,17],"pz":[0,-1],"nx":[3,8],"ny":[0,2],"nz":[2,0]},{"size":2,"px":[8,12],"py":[1,2],"pz":[1,0],"nx":[19,10],"ny":[3,1],"nz":[0,-1]},{"size":4,"px":[17,2,3,10],"py":[8,6,2,12],"pz":[0,1,2,0],"nx":[17,9,12,2],"ny":[9,22,13,5],"nz":[0,-1,-1,-1]},{"size":2,"px":[20,10],"py":[15,7],"pz":[0,1],"nx":[13,9],"ny":[7,3],"nz":[0,-1]},{"size":2,"px":[0,0],"py":[1,0],"pz":[2,2],"nx":[10,3],"ny":[9,2],"nz":[1,-1]},{"size":2,"px":[4,3],"py":[1,0],"pz":[2,2],"nx":[0,22],"ny":[14,6],"nz":[0,-1]},{"size":2,"px":[16,3],"py":[4,0],"pz":[0,2],"nx":[16,3],"ny":[2,0],"nz":[0,-1]},{"size":2,"px":[8,16],"py":[6,12],"pz":[1,0],"nx":[8,12],"ny":[4,7],"nz":[1,-1]},{"size":2,"px":[5,11],"py":[0,5],"pz":[2,1],"nx":[10,1],"ny":[5,5],"nz":[1,-1]},{"size":2,"px":[7,4],"py":[5,5],"pz":[0,-1],"nx":[3,6],"ny":[2,3],"nz":[1,0]},{"size":2,"px":[11,11],"py":[11,12],"pz":[0,0],"nx":[23,7],"ny":[20,2],"nz":[0,-1]},{"size":2,"px":[16,8],"py":[12,5],"pz":[0,1],"nx":[8,2],"ny":[2,1],"nz":[1,-1]},{"size":3,"px":[6,11,11],"py":[11,23,20],"pz":[1,0,0],"nx":[11,3,22],"ny":[21,3,16],"nz":[0,-1,-1]},{"size":2,"px":[17,15],"py":[3,2],"pz":[0,-1],"nx":[4,4],"ny":[3,2],"nz":[2,2]},{"size":2,"px":[21,21],"py":[11,10],"pz":[0,0],"nx":[11,3],"ny":[6,2],"nz":[1,-1]},{"size":2,"px":[23,21],"py":[22,10],"pz":[0,-1],"nx":[20,10],"ny":[18,10],"nz":[0,1]},{"size":2,"px":[4,2],"py":[6,3],"pz":[1,2],"nx":[3,2],"ny":[4,3],"nz":[1,-1]},{"size":2,"px":[16,0],"py":[18,11],"pz":[0,-1],"nx":[8,7],"ny":[4,4],"nz":[0,0]},{"size":2,"px":[6,21],"py":[3,16],"pz":[0,-1],"nx":[1,8],"ny":[2,14],"nz":[2,0]},{"size":2,"px":[8,1],"py":[3,0],"pz":[0,-1],"nx":[11,11],"ny":[2,1],"nz":[0,0]},{"size":3,"px":[11,11,11],"py":[9,10,8],"pz":[1,1,1],"nx":[23,1,0],"ny":[23,9,11],"nz":[0,-1,-1]},{"size":2,"px":[6,3],"py":[2,1],"pz":[1,2],"nx":[7,1],"ny":[8,2],"nz":[0,-1]},{"size":2,"px":[10,17],"py":[17,19],"pz":[0,-1],"nx":[10,4],"ny":[16,9],"nz":[0,1]},{"size":2,"px":[3,6],"py":[7,1],"pz":[1,-1],"nx":[11,0],"ny":[11,8],"nz":[0,1]},{"size":2,"px":[10,5],"py":[11,4],"pz":[1,2],"nx":[5,5],"ny":[0,0],"nz":[2,-1]},{"size":2,"px":[3,6],"py":[3,6],"pz":[2,1],"nx":[8,0],"ny":[4,16],"nz":[1,-1]},{"size":2,"px":[14,1],"py":[20,2],"pz":[0,-1],"nx":[7,7],"ny":[11,9],"nz":[1,1]},{"size":3,"px":[11,13,4],"py":[16,21,3],"pz":[0,0,2],"nx":[14,16,5],"ny":[20,14,9],"nz":[0,-1,-1]},{"size":2,"px":[7,0],"py":[1,1],"pz":[1,-1],"nx":[4,7],"ny":[2,4],"nz":[2,1]},{"size":2,"px":[23,11],"py":[9,4],"pz":[0,1],"nx":[11,3],"ny":[1,3],"nz":[0,-1]},{"size":2,"px":[11,13],"py":[23,23],"pz":[0,0],"nx":[13,13],"ny":[20,20],"nz":[0,-1]},{"size":2,"px":[10,8],"py":[5,11],"pz":[0,-1],"nx":[20,19],"ny":[18,20],"nz":[0,0]},{"size":2,"px":[19,5],"py":[22,4],"pz":[0,-1],"nx":[2,9],"ny":[3,17],"nz":[1,0]},{"size":2,"px":[15,2],"py":[13,7],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":2,"px":[14,13],"py":[17,2],"pz":[0,-1],"nx":[15,13],"ny":[19,15],"nz":[0,0]},{"size":2,"px":[12,23],"py":[8,22],"pz":[0,-1],"nx":[7,10],"ny":[5,9],"nz":[1,0]},{"size":2,"px":[2,6],"py":[21,10],"pz":[0,-1],"nx":[3,4],"ny":[3,3],"nz":[1,1]},{"size":2,"px":[15,11],"py":[5,0],"pz":[0,-1],"nx":[3,4],"ny":[17,16],"nz":[0,0]},{"size":2,"px":[3,1],"py":[18,8],"pz":[0,1],"nx":[14,4],"ny":[17,7],"nz":[0,-1]},{"size":2,"px":[15,3],"py":[18,3],"pz":[0,2],"nx":[1,22],"ny":[0,1],"nz":[0,-1]},{"size":2,"px":[13,3],"py":[9,3],"pz":[0,-1],"nx":[0,1],"ny":[9,20],"nz":[1,0]},{"size":2,"px":[1,1],"py":[1,0],"pz":[2,2],"nx":[9,23],"ny":[10,12],"nz":[1,-1]},{"size":4,"px":[9,0,9,1],"py":[8,0,0,10],"pz":[1,-1,-1,-1],"nx":[23,7,5,23],"ny":[20,7,5,19],"nz":[0,1,2,0]},{"size":2,"px":[18,18],"py":[12,12],"pz":[0,-1],"nx":[8,4],"ny":[4,2],"nz":[1,2]},{"size":3,"px":[0,4,1],"py":[3,5,3],"pz":[1,-1,-1],"nx":[16,11,8],"ny":[8,5,6],"nz":[0,0,0]},{"size":5,"px":[9,10,14,11,11],"py":[0,0,0,0,0],"pz":[0,0,0,0,-1],"nx":[8,3,4,6,2],"ny":[22,9,5,4,0],"nz":[0,1,0,0,2]},{"size":2,"px":[6,5],"py":[2,2],"pz":[1,1],"nx":[7,3],"ny":[8,7],"nz":[0,-1]},{"size":2,"px":[11,5],"py":[15,2],"pz":[0,-1],"nx":[3,10],"ny":[0,1],"nz":[2,0]},{"size":2,"px":[0,11],"py":[11,12],"pz":[1,-1],"nx":[22,22],"ny":[14,13],"nz":[0,0]},{"size":2,"px":[2,2],"py":[15,14],"pz":[0,0],"nx":[1,2],"ny":[11,8],"nz":[1,-1]},{"size":2,"px":[11,6],"py":[0,7],"pz":[1,-1],"nx":[19,5],"ny":[3,0],"nz":[0,2]},{"size":2,"px":[2,3],"py":[3,7],"pz":[2,1],"nx":[1,5],"ny":[5,0],"nz":[1,-1]},{"size":2,"px":[10,14],"py":[4,5],"pz":[0,-1],"nx":[4,18],"ny":[2,12],"nz":[2,0]},{"size":2,"px":[19,10],"py":[12,2],"pz":[0,-1],"nx":[13,4],"ny":[10,2],"nz":[0,2]},{"size":2,"px":[6,1],"py":[21,6],"pz":[0,-1],"nx":[6,5],"ny":[0,0],"nz":[1,1]}],"alpha":[-1.044179e+00,1.044179e+00,-6.003138e-01,6.003138e-01,-4.091282e-01,4.091282e-01,-4.590148e-01,4.590148e-01,-4.294004e-01,4.294004e-01,-3.360846e-01,3.360846e-01,-3.054186e-01,3.054186e-01,-2.901743e-01,2.901743e-01,-3.522417e-01,3.522417e-01,-3.195838e-01,3.195838e-01,-2.957309e-01,2.957309e-01,-2.876727e-01,2.876727e-01,-2.637460e-01,2.637460e-01,-2.607900e-01,2.607900e-01,-2.455714e-01,2.455714e-01,-2.749847e-01,2.749847e-01,-2.314217e-01,2.314217e-01,-2.540871e-01,2.540871e-01,-2.143416e-01,2.143416e-01,-2.565697e-01,2.565697e-01,-1.901272e-01,1.901272e-01,-2.259981e-01,2.259981e-01,-2.012333e-01,2.012333e-01,-2.448460e-01,2.448460e-01,-2.192845e-01,2.192845e-01,-2.005951e-01,2.005951e-01,-2.259000e-01,2.259000e-01,-1.955758e-01,1.955758e-01,-2.235332e-01,2.235332e-01,-1.704490e-01,1.704490e-01,-1.584628e-01,1.584628e-01,-2.167710e-01,2.167710e-01,-1.592909e-01,1.592909e-01,-1.967292e-01,1.967292e-01,-1.432268e-01,1.432268e-01,-2.039949e-01,2.039949e-01,-1.404068e-01,1.404068e-01,-1.788201e-01,1.788201e-01,-1.498714e-01,1.498714e-01,-1.282541e-01,1.282541e-01,-1.630182e-01,1.630182e-01,-1.398111e-01,1.398111e-01,-1.464143e-01,1.464143e-01,-1.281712e-01,1.281712e-01,-1.417014e-01,1.417014e-01,-1.779164e-01,1.779164e-01,-2.067174e-01,2.067174e-01,-1.344947e-01,1.344947e-01,-1.357351e-01,1.357351e-01,-1.683191e-01,1.683191e-01,-1.821768e-01,1.821768e-01,-2.158307e-01,2.158307e-01,-1.812857e-01,1.812857e-01,-1.635445e-01,1.635445e-01,-1.474934e-01,1.474934e-01,-1.771993e-01,1.771993e-01,-1.517620e-01,1.517620e-01,-1.283184e-01,1.283184e-01,-1.862675e-01,1.862675e-01,-1.420491e-01,1.420491e-01,-1.232165e-01,1.232165e-01,-1.472696e-01,1.472696e-01,-1.192156e-01,1.192156e-01,-1.602034e-01,1.602034e-01,-1.321473e-01,1.321473e-01,-1.358101e-01,1.358101e-01,-1.295821e-01,1.295821e-01,-1.289102e-01,1.289102e-01,-1.232520e-01,1.232520e-01,-1.332227e-01,1.332227e-01,-1.358887e-01,1.358887e-01,-1.179559e-01,1.179559e-01,-1.263694e-01,1.263694e-01,-1.444876e-01,1.444876e-01,-1.933141e-01,1.933141e-01,-1.917886e-01,1.917886e-01,-1.199760e-01,1.199760e-01,-1.359937e-01,1.359937e-01,-1.690073e-01,1.690073e-01,-1.894222e-01,1.894222e-01,-1.699422e-01,1.699422e-01,-1.340361e-01,1.340361e-01,-1.840622e-01,1.840622e-01,-1.277397e-01,1.277397e-01,-1.381610e-01,1.381610e-01,-1.282241e-01,1.282241e-01,-1.211334e-01,1.211334e-01,-1.264628e-01,1.264628e-01,-1.373010e-01,1.373010e-01,-1.363356e-01,1.363356e-01,-1.562568e-01,1.562568e-01,-1.268735e-01,1.268735e-01,-1.037859e-01,1.037859e-01,-1.394322e-01,1.394322e-01,-1.449225e-01,1.449225e-01,-1.109657e-01,1.109657e-01,-1.086931e-01,1.086931e-01,-1.379135e-01,1.379135e-01,-1.881974e-01,1.881974e-01,-1.304956e-01,1.304956e-01,-9.921777e-02,9.921777e-02,-1.398624e-01,1.398624e-01,-1.216469e-01,1.216469e-01,-1.272741e-01,1.272741e-01,-1.878236e-01,1.878236e-01,-1.336894e-01,1.336894e-01,-1.256289e-01,1.256289e-01,-1.247231e-01,1.247231e-01,-1.853400e-01,1.853400e-01,-1.087805e-01,1.087805e-01,-1.205676e-01,1.205676e-01,-1.023182e-01,1.023182e-01,-1.268422e-01,1.268422e-01,-1.422900e-01,1.422900e-01,-1.098174e-01,1.098174e-01,-1.317018e-01,1.317018e-01,-1.378142e-01,1.378142e-01,-1.274550e-01,1.274550e-01,-1.142944e-01,1.142944e-01,-1.713488e-01,1.713488e-01,-1.103035e-01,1.103035e-01,-1.045221e-01,1.045221e-01,-1.293015e-01,1.293015e-01,-9.763183e-02,9.763183e-02,-1.387213e-01,1.387213e-01,-9.031167e-02,9.031167e-02,-1.283052e-01,1.283052e-01,-1.133462e-01,1.133462e-01,-9.370681e-02,9.370681e-02,-1.079269e-01,1.079269e-01,-1.331913e-01,1.331913e-01,-8.969902e-02,8.969902e-02,-1.044560e-01,1.044560e-01,-9.387466e-02,9.387466e-02,-1.208988e-01,1.208988e-01,-1.252011e-01,1.252011e-01,-1.401277e-01,1.401277e-01,-1.461381e-01,1.461381e-01,-1.323763e-01,1.323763e-01,-9.923889e-02,9.923889e-02,-1.142899e-01,1.142899e-01,-9.110853e-02,9.110853e-02,-1.106607e-01,1.106607e-01,-1.253140e-01,1.253140e-01,-9.657895e-02,9.657895e-02,-1.030010e-01,1.030010e-01,-1.348857e-01,1.348857e-01,-1.237793e-01,1.237793e-01,-1.296943e-01,1.296943e-01,-1.323385e-01,1.323385e-01,-8.331554e-02,8.331554e-02,-8.417589e-02,8.417589e-02,-1.104431e-01,1.104431e-01,-1.170710e-01,1.170710e-01,-1.391725e-01,1.391725e-01,-1.485189e-01,1.485189e-01,-1.840393e-01,1.840393e-01,-1.238250e-01,1.238250e-01,-1.095287e-01,1.095287e-01,-1.177869e-01,1.177869e-01,-1.036409e-01,1.036409e-01,-9.802581e-02,9.802581e-02,-9.364054e-02,9.364054e-02,-9.936022e-02,9.936022e-02,-1.117201e-01,1.117201e-01,-1.081300e-01,1.081300e-01,-1.331861e-01,1.331861e-01,-1.192122e-01,1.192122e-01,-9.889761e-02,9.889761e-02,-1.173456e-01,1.173456e-01,-1.032917e-01,1.032917e-01,-9.268551e-02,9.268551e-02,-1.178563e-01,1.178563e-01,-1.215065e-01,1.215065e-01,-1.060437e-01,1.060437e-01,-1.010044e-01,1.010044e-01,-1.021683e-01,1.021683e-01,-9.974968e-02,9.974968e-02,-1.161528e-01,1.161528e-01,-8.686721e-02,8.686721e-02,-8.145259e-02,8.145259e-02,-9.937060e-02,9.937060e-02,-1.170885e-01,1.170885e-01,-7.693779e-02,7.693779e-02,-9.047233e-02,9.047233e-02,-9.168442e-02,9.168442e-02,-1.054105e-01,1.054105e-01,-9.036177e-02,9.036177e-02,-1.251949e-01,1.251949e-01,-9.523847e-02,9.523847e-02,-1.038930e-01,1.038930e-01,-1.433660e-01,1.433660e-01,-1.489830e-01,1.489830e-01,-8.393174e-02,8.393174e-02,-8.888026e-02,8.888026e-02,-9.347861e-02,9.347861e-02,-1.044838e-01,1.044838e-01,-1.102144e-01,1.102144e-01,-1.383415e-01,1.383415e-01,-1.466476e-01,1.466476e-01,-1.129741e-01,1.129741e-01,-1.310915e-01,1.310915e-01,-1.070648e-01,1.070648e-01,-7.559007e-02,7.559007e-02,-8.812082e-02,8.812082e-02,-1.234272e-01,1.234272e-01,-1.088022e-01,1.088022e-01,-8.388703e-02,8.388703e-02,-7.179593e-02,7.179593e-02,-1.008961e-01,1.008961e-01,-9.030070e-02,9.030070e-02,-8.581345e-02,8.581345e-02,-9.023431e-02,9.023431e-02,-9.807321e-02,9.807321e-02,-9.621402e-02,9.621402e-02,-1.730195e-01,1.730195e-01,-8.984631e-02,8.984631e-02,-9.556661e-02,9.556661e-02,-1.047576e-01,1.047576e-01,-7.854313e-02,7.854313e-02,-8.682118e-02,8.682118e-02,-1.159761e-01,1.159761e-01,-1.339540e-01,1.339540e-01,-1.003048e-01,1.003048e-01,-9.747544e-02,9.747544e-02,-9.501058e-02,9.501058e-02,-1.321566e-01,1.321566e-01,-9.194706e-02,9.194706e-02,-9.359276e-02,9.359276e-02,-1.015916e-01,1.015916e-01,-1.174192e-01,1.174192e-01,-1.039931e-01,1.039931e-01,-9.746733e-02,9.746733e-02,-1.286120e-01,1.286120e-01,-1.044899e-01,1.044899e-01,-1.066385e-01,1.066385e-01,-8.368626e-02,8.368626e-02,-1.271919e-01,1.271919e-01,-1.055946e-01,1.055946e-01,-8.272876e-02,8.272876e-02,-1.370564e-01,1.370564e-01,-8.539379e-02,8.539379e-02,-1.100343e-01,1.100343e-01,-8.102170e-02,8.102170e-02,-1.028728e-01,1.028728e-01,-1.305065e-01,1.305065e-01,-1.059506e-01,1.059506e-01,-1.264646e-01,1.264646e-01,-8.383843e-02,8.383843e-02,-9.357698e-02,9.357698e-02,-7.474400e-02,7.474400e-02,-7.814045e-02,7.814045e-02,-8.600970e-02,8.600970e-02,-1.206090e-01,1.206090e-01,-9.986512e-02,9.986512e-02,-8.516476e-02,8.516476e-02,-7.198783e-02,7.198783e-02,-7.838409e-02,7.838409e-02,-1.005142e-01,1.005142e-01,-9.951857e-02,9.951857e-02,-7.253998e-02,7.253998e-02,-9.913739e-02,9.913739e-02,-7.500360e-02,7.500360e-02,-9.258090e-02,9.258090e-02,-1.400287e-01,1.400287e-01,-1.044404e-01,1.044404e-01,-7.404339e-02,7.404339e-02,-7.256833e-02,7.256833e-02,-1.006995e-01,1.006995e-01,-1.426043e-01,1.426043e-01,-1.036529e-01,1.036529e-01,-1.208443e-01,1.208443e-01,-1.074245e-01,1.074245e-01,-1.141448e-01,1.141448e-01,-1.015809e-01,1.015809e-01,-1.028822e-01,1.028822e-01,-1.055682e-01,1.055682e-01,-9.468699e-02,9.468699e-02,-1.010098e-01,1.010098e-01,-1.205054e-01,1.205054e-01,-8.392956e-02,8.392956e-02,-8.052297e-02,8.052297e-02,-9.576507e-02,9.576507e-02,-9.515692e-02,9.515692e-02,-1.564745e-01,1.564745e-01,-7.357238e-02,7.357238e-02,-1.129262e-01,1.129262e-01,-1.013265e-01,1.013265e-01,-8.760761e-02,8.760761e-02,-8.714771e-02,8.714771e-02,-9.605039e-02,9.605039e-02,-9.064677e-02,9.064677e-02,-8.243857e-02,8.243857e-02,-8.495858e-02,8.495858e-02,-8.350249e-02,8.350249e-02,-7.423234e-02,7.423234e-02,-7.930799e-02,7.930799e-02,-6.620023e-02,6.620023e-02,-7.311919e-02,7.311919e-02,-1.237938e-01,1.237938e-01,-1.086814e-01,1.086814e-01,-6.379798e-02,6.379798e-02,-7.526021e-02,7.526021e-02,-8.297097e-02,8.297097e-02,-8.186337e-02,8.186337e-02,-7.627362e-02,7.627362e-02,-1.061638e-01,1.061638e-01,-8.328494e-02,8.328494e-02,-1.040895e-01,1.040895e-01,-7.649056e-02,7.649056e-02,-7.299058e-02,7.299058e-02,-9.195198e-02,9.195198e-02,-7.990880e-02,7.990880e-02,-7.429346e-02,7.429346e-02,-9.991702e-02,9.991702e-02,-9.755385e-02,9.755385e-02,-1.344138e-01,1.344138e-01,-1.707917e-01,1.707917e-01,-8.325450e-02,8.325450e-02,-8.137793e-02,8.137793e-02,-8.308659e-02,8.308659e-02,-7.440414e-02,7.440414e-02,-7.012744e-02,7.012744e-02,-8.122943e-02,8.122943e-02,-8.845462e-02,8.845462e-02,-8.803450e-02,8.803450e-02,-9.653392e-02,9.653392e-02,-8.795691e-02,8.795691e-02,-1.119045e-01,1.119045e-01,-1.068308e-01,1.068308e-01,-8.406359e-02,8.406359e-02,-1.220414e-01,1.220414e-01,-1.024235e-01,1.024235e-01,-1.252897e-01,1.252897e-01,-1.121234e-01,1.121234e-01,-9.054150e-02,9.054150e-02,-8.974435e-02,8.974435e-02,-1.351578e-01,1.351578e-01,-1.106442e-01,1.106442e-01,-8.093913e-02,8.093913e-02,-9.800762e-02,9.800762e-02,-7.012823e-02,7.012823e-02,-7.434949e-02,7.434949e-02,-8.684816e-02,8.684816e-02,-8.916388e-02,8.916388e-02,-8.773159e-02,8.773159e-02,-7.709608e-02,7.709608e-02,-7.230518e-02,7.230518e-02,-9.662156e-02,9.662156e-02,-7.957632e-02,7.957632e-02,-7.628441e-02,7.628441e-02,-8.050202e-02,8.050202e-02,-1.290593e-01,1.290593e-01,-9.246182e-02,9.246182e-02,-9.703662e-02,9.703662e-02,-7.866445e-02,7.866445e-02,-1.064783e-01,1.064783e-01,-1.012339e-01,1.012339e-01,-6.828389e-02,6.828389e-02,-1.005039e-01,1.005039e-01,-7.559687e-02,7.559687e-02,-6.359878e-02,6.359878e-02,-8.387002e-02,8.387002e-02,-7.851323e-02,7.851323e-02,-8.878569e-02,8.878569e-02,-7.767654e-02,7.767654e-02,-8.033338e-02,8.033338e-02,-9.142797e-02,9.142797e-02,-8.590585e-02,8.590585e-02,-1.052318e-01,1.052318e-01,-8.760062e-02,8.760062e-02,-9.222192e-02,9.222192e-02,-7.548828e-02,7.548828e-02,-8.003344e-02,8.003344e-02,-1.177076e-01,1.177076e-01,-1.064964e-01,1.064964e-01,-8.655553e-02,8.655553e-02,-9.418112e-02,9.418112e-02,-7.248163e-02,7.248163e-02,-7.120974e-02,7.120974e-02,-6.393114e-02,6.393114e-02,-7.997487e-02,7.997487e-02,-1.220941e-01,1.220941e-01,-9.892518e-02,9.892518e-02,-8.270271e-02,8.270271e-02,-1.069400e-01,1.069400e-01,-5.860771e-02,5.860771e-02,-9.126600e-02,9.126600e-02,-6.212559e-02,6.212559e-02,-9.397538e-02,9.397538e-02,-8.070447e-02,8.070447e-02,-8.415587e-02,8.415587e-02,-8.564455e-02,8.564455e-02,-7.791811e-02,7.791811e-02,-6.642259e-02,6.642259e-02,-8.266167e-02,8.266167e-02,-1.134986e-01,1.134986e-01,-1.045267e-01,1.045267e-01,-7.122085e-02,7.122085e-02,-7.979415e-02,7.979415e-02,-7.922347e-02,7.922347e-02,-9.003421e-02,9.003421e-02,-8.796449e-02,8.796449e-02,-7.933279e-02,7.933279e-02,-8.307947e-02,8.307947e-02,-8.946349e-02,8.946349e-02,-7.643384e-02,7.643384e-02,-7.818534e-02,7.818534e-02,-7.990991e-02,7.990991e-02,-9.885664e-02,9.885664e-02,-8.071329e-02,8.071329e-02,-6.952112e-02,6.952112e-02,-6.429706e-02,6.429706e-02,-6.307229e-02,6.307229e-02,-8.100137e-02,8.100137e-02,-7.693623e-02,7.693623e-02,-6.906625e-02,6.906625e-02,-7.390462e-02,7.390462e-02,-6.487217e-02,6.487217e-02,-1.233681e-01,1.233681e-01,-6.979273e-02,6.979273e-02,-8.358669e-02,8.358669e-02,-1.095420e-01,1.095420e-01,-8.519717e-02,8.519717e-02,-7.599857e-02,7.599857e-02,-6.042816e-02,6.042816e-02,-6.546304e-02,6.546304e-02,-1.016245e-01,1.016245e-01,-8.308787e-02,8.308787e-02,-7.385708e-02,7.385708e-02,-6.751630e-02,6.751630e-02,-9.036695e-02,9.036695e-02,-9.371335e-02,9.371335e-02,-1.116088e-01,1.116088e-01,-5.693741e-02,5.693741e-02,-6.383983e-02,6.383983e-02,-5.389843e-02,5.389843e-02,-8.383191e-02,8.383191e-02,-7.820822e-02,7.820822e-02,-7.067557e-02,7.067557e-02,-7.971948e-02,7.971948e-02,-7.360668e-02,7.360668e-02,-7.008027e-02,7.008027e-02,-8.013378e-02,8.013378e-02,-8.331605e-02,8.331605e-02,-7.145702e-02,7.145702e-02,-7.863940e-02,7.863940e-02,-6.992679e-02,6.992679e-02,-5.716495e-02,5.716495e-02,-5.306006e-02,5.306006e-02,-8.855639e-02,8.855639e-02,-7.656397e-02,7.656397e-02,-6.939272e-02,6.939272e-02,-7.523742e-02,7.523742e-02,-8.472299e-02,8.472299e-02,-8.114341e-02,8.114341e-02,-6.795517e-02,6.795517e-02,-7.890130e-02,7.890130e-02,-7.488741e-02,7.488741e-02,-9.281972e-02,9.281972e-02,-9.325498e-02,9.325498e-02,-1.401587e-01,1.401587e-01,-1.176284e-01,1.176284e-01,-8.867597e-02,8.867597e-02,-8.124232e-02,8.124232e-02,-9.441235e-02,9.441235e-02,-8.029452e-02,8.029452e-02,-8.581848e-02,8.581848e-02,-1.029819e-01,1.029819e-01,-9.569118e-02,9.569118e-02,-7.690893e-02,7.690893e-02,-9.018228e-02,9.018228e-02,-1.049209e-01,1.049209e-01,-8.969413e-02,8.969413e-02,-8.651891e-02,8.651891e-02,-8.613331e-02,8.613331e-02,-7.120468e-02,7.120468e-02,-8.743959e-02,8.743959e-02,-7.607158e-02,7.607158e-02,-1.015547e-01,1.015547e-01,-8.090879e-02,8.090879e-02,-7.114079e-02,7.114079e-02,-8.744835e-02,8.744835e-02,-6.074904e-02,6.074904e-02,-6.919871e-02,6.919871e-02,-7.607774e-02,7.607774e-02,-9.444600e-02,9.444600e-02,-7.833429e-02,7.833429e-02,-6.817555e-02,6.817555e-02,-8.997390e-02,8.997390e-02,-9.845223e-02,9.845223e-02,-7.894180e-02,7.894180e-02,-7.921373e-02,7.921373e-02,-7.448032e-02,7.448032e-02,-1.178165e-01,1.178165e-01,-8.216686e-02,8.216686e-02,-8.103286e-02,8.103286e-02,-6.981470e-02,6.981470e-02,-8.709008e-02,8.709008e-02,-8.336259e-02,8.336259e-02,-6.213589e-02,6.213589e-02,-7.068045e-02,7.068045e-02,-6.915676e-02,6.915676e-02,-7.103416e-02,7.103416e-02,-6.523849e-02,6.523849e-02,-7.634760e-02,7.634760e-02,-7.263038e-02,7.263038e-02,-7.164396e-02,7.164396e-02,-8.745559e-02,8.745559e-02,-6.960181e-02,6.960181e-02,-8.500098e-02,8.500098e-02,-6.523260e-02,6.523260e-02,-7.319714e-02,7.319714e-02,-6.268125e-02,6.268125e-02,-7.083135e-02,7.083135e-02,-7.984517e-02,7.984517e-02,-1.256265e-01,1.256265e-01,-1.065412e-01,1.065412e-01,-8.524323e-02,8.524323e-02,-9.291364e-02,9.291364e-02,-7.936567e-02,7.936567e-02,-8.607723e-02,8.607723e-02,-7.583416e-02,7.583416e-02,-7.931928e-02,7.931928e-02,-7.408357e-02,7.408357e-02,-1.034404e-01,1.034404e-01,-1.012127e-01,1.012127e-01,-7.916689e-02,7.916689e-02,-8.753651e-02,8.753651e-02,-6.090366e-02,6.090366e-02,-7.500103e-02,7.500103e-02,-1.228709e-01,1.228709e-01,-6.318201e-02,6.318201e-02,-7.585420e-02,7.585420e-02,-7.089090e-02,7.089090e-02,-1.053542e-01,1.053542e-01,-8.549521e-02,8.549521e-02,-7.906308e-02,7.906308e-02,-6.338780e-02,6.338780e-02,-8.417910e-02,8.417910e-02,-7.115511e-02,7.115511e-02,-7.693949e-02,7.693949e-02,-7.446749e-02,7.446749e-02,-1.037929e-01,1.037929e-01,-7.991005e-02,7.991005e-02,-7.119439e-02,7.119439e-02,-7.071340e-02,7.071340e-02,-8.587362e-02,8.587362e-02,-7.001236e-02,7.001236e-02,-7.567115e-02,7.567115e-02,-7.118930e-02,7.118930e-02,-6.844895e-02,6.844895e-02,-1.035118e-01,1.035118e-01,-8.156618e-02,8.156618e-02,-7.449593e-02,7.449593e-02,-8.154360e-02,8.154360e-02,-9.110878e-02,9.110878e-02,-6.222534e-02,6.222534e-02,-1.033841e-01,1.033841e-01,-6.811687e-02,6.811687e-02,-6.828443e-02,6.828443e-02,-5.769408e-02,5.769408e-02,-5.917684e-02,5.917684e-02,-8.358868e-02,8.358868e-02]}]};

/**
 * @author auduno / github.com/auduno
 */

headtrackr.getWhitebalance = function(canvas) {
	
	// returns average gray value in canvas
	
	var avggray,avgr,avgb,avgg;
	
	var canvasContext = canvas.getContext('2d');
	var image = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
	var id = image.data;
	var imagesize = image.width * image.height;
	var r = g = b = 0;
	
	for (var i = 0;i < imagesize;i++) {
		r += id[4*i];
		g += id[(4*i)+1];
		b += id[(4*i)+2];
	}
	
	avgr = r/imagesize;
	avgg = g/imagesize;
	avgb = b/imagesize;
	avggray = (avgr+avgg+avgb)/3;
	
	return avggray;
	
}
/**
 * Smoother for smoothing tracked positions of face
 *
 * Double Exponential Smoothing-based Prediction
 *	 see: http://www.cs.brown.edu/people/jjl/pubs/kfvsexp_final_laviola.pdf
 *	 "Double Exponential Smoothing: An alternative to Kalman Filter-based Predictive Tracking"
 *
 * @author auduno / github.com/auduno
 * @param {number} a Smoothing parameter, between 0 and 1. 0 is max smoothing, 1 no smoothing.
 * @param {number} interval The ms interval between tracking events
 * @constructor
 */
headtrackr.Smoother = function(alpha, interval) {
	
	// alpha = 0.35 smoothes ok while not introducing too much lag
	
	var sp, sp2, sl, newPositions, positions;
	var updateTime = new Date();
	
	this.initialized = false;
	
	// whether to use linear interpolation for times in intervals
	this.interpolate = false;
	
	this.init = function(initPos) {
		this.initialized = true;
		sp = [initPos.x, initPos.y, initPos.z, initPos.width, initPos.height];
		sp2 = sp;
		sl = sp.length;
	}
	
	this.smooth = function(pos) {
		
		positions = [pos.x, pos.y, pos.z, pos.width, pos.height];
		
		if (this.initialized) {
			// update
			for (var i = 0;i < sl;i++) {
				sp[i] = alpha*positions[i]+(1-alpha)*sp[i];
				sp2[i] = alpha*sp[i]+(1-alpha)*sp2[i];
			}
			
			// set time
			updateTime = new Date();
			
			var msDiff = (new Date())-updateTime;
			var newPositions = predict(msDiff);
			
			pos.x = newPositions[0];
			pos.y = newPositions[1];
			pos.z = newPositions[2];
			pos.width = newPositions[3];
			pos.height = newPositions[4];
			
			return pos;
		} else {
			return false;
		}
	}
	
	function predict(time) {
		
		var retPos = [];
		
		if (this.interpolate) {
			var step = time/interval;
			var stepLo = step >> 0;
			var ratio = alpha/(1-alpha);
			
			var a = (step-stepLo)*ratio;
			var b = (2 + stepLo*ratio);
			var c = (1 + stepLo*ratio);
			
			for (var i = 0;i < sl;i++) {
				retPos[i] = a*(sp[i]-sp2[i]) + b*sp[i] - c*sp2[i];
			}
		} else {
			var step = time/interval >> 0;
			var ratio = (alpha*step)/(1-alpha);
			var a = 2 + ratio;
			var b = 1 + ratio;
			for (var i = 0;i < sl;i++) {
				retPos[i] = a*sp[i] - b*sp2[i];
			}
		}
		
		return retPos;
	}
}
/**
 * camshift object tracker
 *
 * ported with some optimizations from actionscript3 library FaceIt:
 *	 http://www.mukimuki.fr/flashblog/2009/06/18/camshift-going-to-the-source/
 *	 http://www.libspark.org/browser/as3/FaceIt
 * some explanation of algorithm here : 
 *	 http://www.cognotics.com/opencv/servo_2007_series/part_3/sidebar.html
 *
 * usage:
 *	 // create a new tracker
 *	 var cstracker = new headtrackr.camshift.Tracker();
 *	 // initialize it with a canvas, and a rectangle around the object on the canvas we'd like to track
 *	 cstracker.initTracker(some_canvas, new headtrackr.camshift.Rectangle(x,y,w,h));
 *	 // find object in same or some other canvas
 *	 cstracker.track(some_canvas);
 *	 // get position of found object
 *	 var currentPos = cstracker.getTrackObj();
 *	 currentPos.x // x-coordinate of center of object on canvas 
 *	 currentPos.y // y-coordinate of center of object on canvas 
 *	 currentPos.width // width of object
 *	 currentPos.height // heigh of object
 *	 currentPos.angle // angle of object in radians
 *
 * @author Benjamin Jung / jungbenj@gmail.com
 * @author auduno / github.com/auduno
 *
 * License of original actionscript code:
 *
 * Copyright (C)2009 Benjamin Jung
 * 
 * Licensed under the MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

headtrackr.camshift = {};

/**
 * RGB histogram
 *
 * @constructor
 */
headtrackr.camshift.Histogram = function(imgdata) {

  this.size = 4096;
  
  var bins = [];
  var i, x, r, g, b, il;
  
  //initialize bins
  for (i = 0; i < this.size; i++) {
    bins.push(0);
  }
  
  //add histogram data
  for (x = 0, il = imgdata.length;x < il; x += 4) {
    r = imgdata[x+0] >> 4; // round down to bins of 16
    g = imgdata[x+1] >> 4;
    b = imgdata[x+2] >> 4;
    bins[256 * r + 16 * g + b] += 1;
  }
  
  this.getBin = function( index ) {
    return bins[index];
  }
};

/**
 * moments object
 *
 * @constructor
 */
headtrackr.camshift.Moments = function(data, x, y, w, h, second) {
  
  this.m00 = 0;
  this.m01 = 0;
  this.m10 = 0;
  this.m11 = 0;
  this.m02 = 0;
  this.m20 = 0;
  
  var i, j, val, vx, vy;
  var a = [];
  for (i = x; i < w; i++) {
    a = data[i];
    vx = i-x;
    
    for (j = y; j < h; j++) {
      val = a[j];
      
      vy = j-y;
      this.m00 += val;
      this.m01 += vy * val;
      this.m10 += vx * val;
      if (second) {
        this.m11 += vx * vy * val;
        this.m02 += vy * vy * val;
        this.m20 += vx * vx * val;
      }
    }
  }
  
  this.invM00 = 1 / this.m00;
  this.xc = this.m10 * this.invM00;
  this.yc = this.m01 * this.invM00;
  this.mu00 = this.m00;
  this.mu01 = 0;
  this.mu10 = 0;
  if (second) {
    this.mu20 = this.m20 - this.m10 * this.xc;
    this.mu02 = this.m02 - this.m01 * this.yc;
    this.mu11 = this.m11 - this.m01 * this.xc;
  }
};

/**
 * rectangle object
 *
 * @constructor
 */
headtrackr.camshift.Rectangle = function(x,y,w,h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  
  this.clone = function() {
    var c = new headtrackr.camshift.Rectangle();
    c.height = this.height;
    c.width = this.width;
    c.x = this.x;
    c.y = this.y;
    return c;
  }
};

/**
 * Tracker object
 *
 * @constructor
 */
headtrackr.camshift.Tracker = function(params) {
  
  if (params === undefined) params = {};
  if (params.calcAngles === undefined) params.calcAngles = true;
  
  var _modelHist,
    _curHist, //current histogram
    _pdf, // pixel probability data for current searchwindow
    _searchWindow, // rectangle where we are searching
    _trackObj, // object holding data about where current tracked object is
    _canvasCtx, // canvas context for initial canvas
    _canvasw, // canvas width for tracking canvas
    _canvash; // canvas height for tracking canvas
  
  this.getSearchWindow = function() {
    // return the search window used by the camshift algorithm in the current analysed image
    return _searchWindow.clone();
  }
  
  this.getTrackObj = function() {
    // return a trackobj with the size and orientation of the tracked object in the current analysed image
    return _trackObj.clone();
  }
  
  this.getPdf = function() {
    // returns a nested array representing color
    return _pdf;
  }
  
  this.getBackProjectionImg = function() {
    // return imgData representing pixel color probabilities, which can then be put into canvas
    var weights = _pdf;
    var w = _canvasw;
    var h = _canvash;
    var img = _canvasCtx.createImageData(w, h);
    var imgData = img.data;
    var x, y, val;
    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) {
        val = Math.floor(255 * weights[x][y]);
        pos = ((y*w)+x)*4;
        imgData[pos] = val;
        imgData[pos+1] = val;
        imgData[pos+2] = val;
        imgData[pos+3] = 255;
      }
    }
    return img;
  }
  
  this.initTracker = function(canvas, trackedArea) {
    // initialize the tracker with canvas and the area of interest as a rectangle
    
    _canvasCtx = canvas.getContext("2d");
    var taw = trackedArea.width;
    var tah = trackedArea.height;
    var tax = trackedArea.x;
    var tay = trackedArea.y;
    var trackedImg = _canvasCtx.getImageData(tax, tay, taw, tah);
    
    _modelHist = new headtrackr.camshift.Histogram(trackedImg.data);
    _searchWindow = trackedArea.clone();
    _trackObj = new headtrackr.camshift.TrackObj();
  }
  
  this.track = function(canvas) {
    // search the tracked object by camshift
    var canvasCtx = canvas.getContext("2d");
    _canvash = canvas.height;
    _canvasw = canvas.width;
    var imgData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
    if (imgData.width != 0 && imgData.height != 0) camShift(imgData);
  }
  
  function camShift(frame) {

    var w = frame.width;
    var h = frame.height;
    
    // search location
    var m = meanShift(frame);
    
    var a = m.mu20 * m.invM00;
    var c = m.mu02 * m.invM00;
    
    if (params.calcAngles) {
      // use moments to find size and orientation
      var b = m.mu11 * m.invM00;
      var d = a + c;
      var e = Math.sqrt((4*b * b) + ((a - c) * (a - c)));
      
      // update object position
      _trackObj.width = Math.sqrt((d - e)*0.5) << 2;
      _trackObj.height = Math.sqrt((d + e)*0.5) << 2;
      _trackObj.angle = Math.atan2(2 * b, a - c + e);
      
      // to have a positive counter clockwise angle
      if (_trackObj.angle < 0) _trackObj.angle = _trackObj.angle + Math.PI;
    } else {
      _trackObj.width = Math.sqrt(a) << 2;
      _trackObj.height = Math.sqrt(c) << 2;
      _trackObj.angle = Math.PI/2;
    }
    
    // check if tracked object is into the limit
    _trackObj.x = Math.floor(Math.max(0, Math.min(_searchWindow.x + _searchWindow.width/2, w)));
    _trackObj.y = Math.floor(Math.max(0, Math.min(_searchWindow.y + _searchWindow.height/2, h)));
    
    // new search window size
    _searchWindow.width = Math.floor(1.1 * _trackObj.width);
    _searchWindow.height = Math.floor(1.1 * _trackObj.height);
  }
  
  function meanShift(frame) {
    // mean-shift algorithm on frame
    
    var w = frame.width;
    var h = frame.height;
    var imgData = frame.data;
    
    var curHist = new headtrackr.camshift.Histogram(imgData);
    
    var weights = getWeights(_modelHist, curHist);
    
    // Color probabilities distributions
    _pdf = getBackProjectionData(imgData, frame.width, frame.height, weights);
    
    var m, x, y, i, wadx, wady, wadw, wadh;
    
    var meanShiftIterations = 10; // maximum number of iterations
    
    // store initial searchwindow
    var prevx = _searchWindow.x;
    var prevy = _searchWindow.y;
    
    // Locate by iteration the maximum of density into the probability distributions
    for (i = 0;i < meanShiftIterations; i++) {
      // get searchwindow from _pdf:
      wadx = Math.max(_searchWindow.x,0);
      wady = Math.max(_searchWindow.y,0);
      wadw = Math.min(wadx + _searchWindow.width,w);
      wadh = Math.min(wady + _searchWindow.height,h);
      
      m = new headtrackr.camshift.Moments(_pdf, wadx, wady, wadw, wadh, (i == meanShiftIterations -1));
      x = m.xc;
      y = m.yc;
      
      _searchWindow.x += ((x - _searchWindow.width/2) >> 0);
      _searchWindow.y += ((y - _searchWindow.height/2) >> 0);
      
      // if we have reached maximum density, get second moments and stop iterations
      if (_searchWindow.x == prevx && _searchWindow.y == prevy) {
        m = new headtrackr.camshift.Moments(_pdf, wadx, wady, wadw, wadh, true);
        break;
      } else {
        prevx = _searchWindow.x;
        prevy = _searchWindow.y;
      }
    }
    
    _searchWindow.x = Math.max(0, Math.min(_searchWindow.x, w));
    _searchWindow.y = Math.max(0, Math.min(_searchWindow.y, h));
    
    return m;
  }
  
  function getWeights(mh, ch) {
    // Return an array of the probabilities of each histogram color bins
    var weights = [];
    var p;
    
    // iterate over the entire histogram and compare
    for (var i = 0; i < 4096; i++) {
      if (ch.getBin(i) != 0) {
        p = Math.min(mh.getBin(i)/ch.getBin(i), 1);
      } else {
        p = 0;
      }
      weights.push(p);
    }
    
    return weights;
  }
  
  function getBackProjectionData(imgData, idw, idh, weights, hsMap) {
    // Return a matrix representing pixel color probabilities
    var data = [];
    var x,y,r,g,b,pos;
    var a = [];
    
    // TODO : we could use typed arrays here
    // but we should then do a compatibilitycheck
    
    for (x = 0; x < idw; x++) {
      a = [];
      for (y = 0; y < idh; y++) {
        pos = ((y*idw)+x)*4;
        r = imgData[pos] >> 4;
        g = imgData[pos+1] >> 4;
        b = imgData[pos+2] >> 4;
        a.push(weights[256 * r + 16 * g + b]);
      }
      data[x] = a;
    }
    return data;
  }
};

/**
 * Object returned by tracker
 *  note that x,y is the point of the center of the tracker
 *
 * @constructor
 */
headtrackr.camshift.TrackObj = function() {
  this.height = 0;
  this.width = 0;
  this.angle = 0;
  this.x = 0; 
  this.y = 0;
  
  this.clone = function() {
    var c = new headtrackr.camshift.TrackObj();
    c.height = this.height;
    c.width = this.width;
    c.angle = this.angle;
    c.x = this.x;
    c.y = this.y;
    return c;
  }
};
/**
 * Library for detecting and tracking the position of a face in a canvas object
 *
 * usage:
 *	 // create a new tracker
 *	 var ft = new headtrackr.facetrackr.Tracker();
 *	 // initialize it with a canvas
 *	 ft.init(some_canvas);
 *	 // track in canvas
 *	 ft.track();
 *	 // get position of found object
 *	 var currentPos = ft.getTrackObj();
 *	 currentPos.x // x-coordinate of center of object on canvas 
 *	 currentPos.y // y-coordinate of center of object on canvas 
 *	 currentPos.width // width of object
 *	 currentPos.height // height of object
 *	 currentPos.angle // angle of object in radians
 *	 currentPos.confidence // returns confidence (doesn't work for CS yet)
 *	 currentPos.detection // current detectionmethod (VJ or CS)
 *	 currentPos.time // time spent
 * 
 * @author auduno / github.com/auduno
 */

headtrackr.facetrackr = {};

/**
 * optional parameters to params:
 *	 smoothing : whether to use smoothing on output (default is true)
 *	 smoothingInterval : should be the same as detectionInterval plus time of tracking (default is 35 ms)
 *	 sendEvents : whether to send events (default is true)
 *	 whitebalancing : whether to wait for camera whitebalancing before starting detection (default is true)
 *   calcAnglss : whether to calculate orientation of tracked object (default for facetrackr is false)
 *
 * @constructor
 */
headtrackr.facetrackr.Tracker = function(params) {
  
  if (!params) params = {};
  
  if (params.sendEvents === undefined) params.sendEvents = true;
  if (params.whitebalancing === undefined) params.whitebalancing = true;
  if (params.debug === undefined) {
    params.debug = false;
  } else {
    if (params.debug.tagName != 'CANVAS') params.debug = false;
  }
  if (params.whitebalancing) {
    var _currentDetection = "WB";
  } else {
    var _currentDetection = "VJ";
  }
  if (params.calcAngles == undefined) params.calcAngles = false;
  
  var _inputcanvas, _curtracked, _cstracker;
  
  var _confidenceThreshold = -10; // needed confidence before switching to Camshift
  var previousWhitebalances = []; // array of previous 10 whitebalance values
  var pwbLength = 15;
  
  this.init = function(inputcanvas) {
    _inputcanvas = inputcanvas
    // initialize cs tracker
    _cstracker = new headtrackr.camshift.Tracker({calcAngles : params.calcAngles});
  }
  
  this.track = function() {
    var result;
    // do detection
    if (_currentDetection == "WB") {
      result = checkWhitebalance();
    } else if (_currentDetection == "VJ") {
      result = doVJDetection();
    } else if (_currentDetection == "CS") {
      result = doCSDetection();
    }
    
    // check whether whitebalance is stable before starting detection
    if (result.detection == "WB") {
      if (previousWhitebalances.length >= pwbLength) previousWhitebalances.pop();
      previousWhitebalances.unshift(result.wb);
      if (previousWhitebalances.length == pwbLength) {
        //get max
        var max = Math.max.apply(null, previousWhitebalances);
        //get min
        var min = Math.min.apply(null, previousWhitebalances);
        
        // if difference between the last ten whitebalances is less than 2,
        //   we assume whitebalance is stable
        if ((max-min) < 2) {
          // switch to facedetection
          _currentDetection = "VJ";
        }
      }
    }
    // check if Viola-Jones has found a viable face
    if (result.detection == "VJ" && result.confidence > _confidenceThreshold) {
      // switch to Camshift
      _currentDetection = "CS";
      // when switching, we initalize camshift with current found face
      var cRectangle = new headtrackr.camshift.Rectangle(
        Math.floor(result.x), 
        Math.floor(result.y), 
        Math.floor(result.width), 
        Math.floor(result.height)
      );
      _cstracker.initTracker(_inputcanvas, cRectangle);
    }
    
    _curtracked = result;
    
    if (result.detection == "CS" && params.sendEvents) {
      // send events
      var evt = document.createEvent("Event");
      evt.initEvent("facetrackingEvent", true, true);
      evt.height = result.height;
      evt.width = result.width;
      evt.angle = result.angle;
      evt.x = result.x;
      evt.y = result.y;
      evt.confidence = result.confidence;
      evt.detection = result.detection;
      evt.time = result.time;
      document.dispatchEvent(evt);
    }
  }
  
  this.getTrackingObject = function() {
    return _curtracked.clone();
  }
  
  // Viola-Jones detection
  function doVJDetection() {
    // start timing
    var start = (new Date).getTime();
    
    // we seem to have to copy canvas to avoid interference with camshift
    // not entirely sure why
    // TODO: ways to avoid having to copy canvas every time
    var ccvCanvas = document.createElement('canvas');
    ccvCanvas.width = _inputcanvas.width;
    ccvCanvas.height = _inputcanvas.height;
    ccvCanvas.getContext("2d").drawImage(
      _inputcanvas, 0, 0, ccvCanvas.width, ccvCanvas.height
    );
    
    var comp = headtrackr.ccv.detect_objects(
        headtrackr.ccv.grayscale(ccvCanvas), headtrackr.cascade, 5, 1
    );
    
    // end timing
    var diff = (new Date).getTime() - start;
    
    // loop through found faces and pick the most likely one
    // TODO: check amount of neighbors and size as well?
    // TODO: choose the face that is most in the center of canvas?
    var candidate;
    if (comp.length > 0) {
      candidate = comp[0];
    }
    for (var i = 1; i < comp.length; i++) {
      if (comp[i].confidence > candidate.confidence) {
        candidate = comp[i];
      }
    }
    
    // copy information from ccv object to a new trackObj
    var result = new headtrackr.facetrackr.TrackObj();
    if (!(candidate === undefined)) {
      result.width = candidate.width;
      result.height = candidate.height;
      result.x = candidate.x;
      result.y = candidate.y;
      result.confidence = candidate.confidence;
    }
    
    // copy timing to object
    result.time = diff;
    result.detection = "VJ";
    
    return result;
  }
  
  // Camshift detection
  function doCSDetection() {
    
    // start timing
    var start = (new Date).getTime();
    // detect
    _cstracker.track(_inputcanvas);
    var csresult = _cstracker.getTrackObj();
    
    // if debugging, draw backprojection image on debuggingcanvas
    if (params.debug) {
      params.debug.getContext('2d').putImageData(_cstracker.getBackProjectionImg(),0,0);
    }
    
    // end timing
    var diff = (new Date).getTime() - start;
    
    // copy information from CS object to a new trackObj
    var result = new headtrackr.facetrackr.TrackObj();
    result.width = csresult.width;
    result.height = csresult.height;
    result.x = csresult.x;
    result.y = csresult.y;
    // TODO: should we adjust this angle to be "clockwise"?
    result.angle = csresult.angle;
    // TODO: camshift should pass along some sort of confidence?
    result.confidence = 1;
    
    // copy timing to object
    result.time = diff;
    result.detection = "CS";
    
    return result;
  }
  
  // Whitebalancing
  function checkWhitebalance() {
    var result = new headtrackr.facetrackr.TrackObj();
    // get whitebalance value
    result.wb = headtrackr.getWhitebalance(_inputcanvas);
    result.detection = "WB";

    return result
  }
};

/**
 * @constructor
 */
headtrackr.facetrackr.TrackObj = function() {
  this.height = 0;
  this.width = 0;
  this.angle = 0;
  this.x = 0;
  this.y = 0;
  this.confidence = -10000;
  this.detection = '';
  this.time = 0;
  
  this.clone = function() {
    var c = new headtrackr.facetrackr.TrackObj();
    c.height = this.height;
    c.width = this.width;
    c.angle = this.angle;
    c.x = this.x;
    c.y = this.y;
    c.confidence = this.confidence;
    c.detection = this.detection;
    c.time = this.time;
    return c;
  }
};

/**
 * @author auduno / github.com/auduno
 * @constructor
 */
 
headtrackr.Ui = function() {

	var timeout;

	// create element and attach to body
	var d = document.createElement('div'),
        d2 = document.createElement('div'),
        p = document.createElement('p');
	d.setAttribute('id', 'headtrackerMessageDiv');
	
	d.style.left = "20%";
	d.style.right = "20%";
	d.style.top = "100px";
	d.style.fontSize = "90px";
	d.style.color = "#777";
	d.style.position = "absolute";
	d.style.fontFamily = "Helvetica, Arial, sans-serif";
	d.style.zIndex = '100002';
	
	d2.style.marginLeft = "auto";
	d2.style.marginRight = "auto";
	d2.style.width = "100%";
	d2.style.textAlign = "center";
	d2.style.color = "#fff";
	d2.style.backgroundColor = "#444";
	d2.style.opacity = "0.5";
	
	p.setAttribute('id', 'headtrackerMessage');
	d2.appendChild(p);
	d.appendChild(d2);
	document.body.appendChild(d);
  
  var supportMessages = {
    "no getUserMedia" : "getUserMedia is not supported in your browser :(",
    "no camera" : "no camera found :("
  };
  
  var statusMessages = {
    "whitebalance" : "Waiting for camera whitebalancing",
    "detecting" : "Please wait while camera is detecting your face...",
    "hints" : "We seem to have some problems detecting your face. Please make sure that your face is well and evenly lighted, and that your camera is working.",
    "redetecting" : "Lost track of face, trying to detect again..",
    "lost" : "Lost track of face :(",
    "found" : "Face found! Move your head!"
  };
  
  var override = false;
  
	// function to call messages (and to fade them out after a time)
  document.addEventListener("headtrackrStatus", function(event) {
    if (event.status in statusMessages) {
      window.clearTimeout(timeout);
		  if (!override) {
		    var messagep = document.getElementById('headtrackerMessage');
		    messagep.innerHTML = statusMessages[event.status];
		    timeout = window.setTimeout(function() {messagep.innerHTML = ''; }, 3000);
		  }
		} else if (event.status in supportMessages) {
		  override = true;
		  window.clearTimeout(timeout);
		  var messagep = document.getElementById('headtrackerMessage');
		  messagep.innerHTML = supportMessages[event.status];
		  window.setTimeout(function() {messagep.innerHTML = 'added fallback video for demo'; }, 2000);
		  window.setTimeout(function() {messagep.innerHTML = '';override = false;}, 4000);
		}
  }, true);
	
}
/**
 * Calculates an estimate of the position of the head of the user in relation to screen or camera
 *   based on input from facetrackrObject
 *
 * Usage:
 *	var hp = new headtrackr.headposition.Tracker(facetrackrObject, 640, 480);
 *	var currentPosition = hp.track(facetrackrObject);
 *
 * @author auduno / github.com/auduno
 */

headtrackr.headposition = {};

/**
 *
 * Parameters to Tracker() are:
 *	facetrackrObject : a generic object with attributes x, y, width, height, angle
 *		which describe the position of center of detected face
 *	camwidth : width of canvas where the face was detected
 *	camheight : height of canvas where the face was detected
 *
 * Optional parameters can be passed along like this:
 *	 headtrackr.headposition.Tracker(facetrackrObject, 640, 480, {fov : 60})
 *
 * Optional parameters:
 *	 fov {number} : horizontal field of view of camera (default is to detect via distance to screen, any fov overrides distance_to_screen)
 *	 distance_to_screen {number} : initial distance from face to camera, in cms (default is 60 cm)
 *	 edgecorrection {boolean} : whether to use heuristic for position of head when detection is on the edge of the screen (default is true)
 *	 distance_from_camera_to_screen : distance from camera to center of screen (default is 11.5 cm, typical for laptops)
 *
 * Returns a generic object with attributes x, y, z which is estimated headposition in cm in relation to center of screen
 *
 * @constructor
 */
headtrackr.headposition.Tracker = function(facetrackrObj, camwidth, camheight, params) {
	
	// some assumptions that are used when calculating distances and estimating horizontal fov
	//	 head width = 16 cm
	//	 head height = 19 cm
	//	 when initialized, user is approximately 60 cm from camera
	
	if (!params) params = {};
	
	if (params.edgecorrection === undefined) {
		var edgecorrection = true;
	} else {
		var edgecorrection = params.edgecorrection;
	}
	
	this.camheight_cam = camheight;
	this.camwidth_cam = camwidth;
	
	var head_width_cm = 16;
	var head_height_cm = 19;
	
	// angle between side of face and diagonal across
	var head_small_angle = Math.atan(head_width_cm/head_height_cm);
	
	var head_diag_cm = Math.sqrt((head_width_cm*head_width_cm)+(head_height_cm*head_height_cm)); // diagonal of face in real space
	
	var sin_hsa = Math.sin(head_small_angle); //precalculated sine
	var cos_hsa = Math.cos(head_small_angle); //precalculated cosine
	var tan_hsa = Math.tan(head_small_angle); //precalculated tan
	
	// estimate horizontal field of view of camera
	var init_width_cam = facetrackrObj.width;
	var init_height_cam = facetrackrObj.height;
	var head_diag_cam = Math.sqrt((init_width_cam*init_width_cam)+(init_height_cam*init_height_cam));
	if (params.fov === undefined) {
		// we use the diagonal of the faceobject to estimate field of view of the camera
		// we use the diagonal since this is less sensitive to errors in width or height
		var head_width_cam = sin_hsa * head_diag_cam;
		var camwidth_at_default_face_cm = (this.camwidth_cam/head_width_cam) * head_width_cm;
		// we assume user is sitting around 60 cm from camera (normal distance on a laptop)
		if (params.distance_to_screen === undefined) {
			var distance_to_screen = 60;
		} else {
			var distance_to_screen = params.distance_to_screen;
		}
		// calculate estimate of field of view
		var fov_width = Math.atan((camwidth_at_default_face_cm/2)/distance_to_screen) * 2;
	} else {
		var fov_width = params.fov * Math.PI/180;
	}
	
	// precalculate ratio between camwidth and distance
	var tan_fov_width = 2 * Math.tan(fov_width/2);
	
	var x, y, z; // holds current position of head (in cms from center of screen)
	
	this.track = function(facetrackrObj) {
		
		var w = facetrackrObj.width;
		var h = facetrackrObj.height;
		var fx = facetrackrObj.x; 
		var fy = facetrackrObj.y; 
		
		if (edgecorrection) {
			// recalculate head_diag_cam, fx, fy
			
			var margin = 11;
			
			var leftDistance = fx-(w/2);
			var rightDistance = this.camwidth_cam-(fx+(w/2));
			var topDistance = fy-(h/2);
			var bottomDistance = this.camheight_cam-(fy+(h/2));
			
			var onVerticalEdge = (leftDistance < margin || rightDistance < margin);
			var onHorizontalEdge = (topDistance < margin || bottomDistance < margin);
			
			if (onHorizontalEdge) {
				if (onVerticalEdge) {
					// we are in a corner, use previous diagonal as estimate, i.e. don't change head_diag_cam
					var onLeftEdge = (leftDistance < margin);
					var onTopEdge = (topDistance < margin);
					
					if (onLeftEdge) {
						fx = w-(head_diag_cam * sin_hsa/2);
					} else {
						fx = fx-(w/2)+(head_diag_cam * sin_hsa/2);
					}
					
					if (onTopEdge) {
						fy = h-(head_diag_cam * cos_hsa/2);
					} else {
						fy = fy-(h/2)+(head_diag_cam*cos_hsa/2);
					}
					
				} else {
					// we are on top or bottom edge of camera, use width instead of diagonal and correct y-position
					// fix fy
					if (topDistance < margin) {
            var originalWeight = topDistance/margin;
            var estimateWeight = (margin-topDistance)/margin;
						fy = h-(originalWeight*(h/2) + estimateWeight*((w/tan_hsa)/2));
            head_diag_cam = estimateWeight*(w/sin_hsa) + originalWeight*(Math.sqrt((w*w)+(h*h)));
					} else {
            var originalWeight = bottomDistance/margin;
            var estimateWeight = (margin-bottomDistance)/margin;
						fy = fy-(h/2)+(originalWeight*(h/2) + estimateWeight*((w/tan_hsa)/2));
            head_diag_cam = estimateWeight*(w/sin_hsa) + originalWeight*(Math.sqrt((w*w)+(h*h)));
					}
				}
			} else if (onVerticalEdge) {
				// we are on side edges of camera, use height and correct x-position
				if (leftDistance < margin) {
          var originalWeight = leftDistance/margin;
          var estimateWeight = (margin-leftDistance)/margin;
          head_diag_cam = estimateWeight*(h/cos_hsa) + originalWeight*(Math.sqrt((w*w)+(h*h)));
					fx = w-(originalWeight*(w/2)+(estimateWeight)*(h*tan_hsa/2));
				} else {
          var originalWeight = rightDistance/margin;
          var estimateWeight = (margin-rightDistance)/margin;
          head_diag_cam = estimateWeight*(h/cos_hsa) + originalWeight*(Math.sqrt((w*w)+(h*h)));
					fx = fx-(w/2)+(originalWeight*(w/2) + estimateWeight*(h*tan_hsa/2));
				}
			} else {
				head_diag_cam = Math.sqrt((w*w)+(h*h));
			}
		} else {
			head_diag_cam = Math.sqrt((w*w)+(h*h));
		}
		
		// calculate cm-distance from screen
		z = (head_diag_cm*this.camwidth_cam)/(tan_fov_width*head_diag_cam);
		// to transform to z_3ds : z_3ds = (head_diag_3ds/head_diag_cm)*z
		// i.e. just use ratio
		
		// calculate cm-position relative to center of screen
		x = -((fx/this.camwidth_cam) - 0.5) * z * tan_fov_width;
		y = -((fy/this.camheight_cam) - 0.5) * z * tan_fov_width * (this.camheight_cam/this.camwidth_cam);
		
		
		// Transformation from position relative to camera, to position relative to center of screen
		if (params.distance_from_camera_to_screen === undefined) {
			// default is 11.5 cm approximately
			y = y + 11.5;
		} else {
			y = y + params.distance_from_camera_to_screen;
		}
					
		// send off event
		var evt = document.createEvent("Event");
		evt.initEvent("headtrackingEvent", true, true);
		evt.x = x;
		evt.y = y;
		evt.z = z;
		document.dispatchEvent(evt);
		
		return new headtrackr.headposition.TrackObj(x,y,z);
	}
	
	
	this.getTrackerObj = function() {
		return new headtrackr.headposition.TrackObj(x,y,z);
	}
	
	this.getFOV = function() {
		return fov_width * 180/Math.PI;
	}
}; 

/**
 * @constructor
 */
headtrackr.headposition.TrackObj = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.clone = function() {
		var c = new headtrackr.headposition.TrackObj();
		c.x = this.x;
		c.y = this.y;
		c.z = this.z;
		return c;
	}
};
/**
 * Optional controllers for handling headtrackr events
 *
 * @author auduno / github.com/auduno
 */

headtrackr.controllers = {};

// NB! made for three.js revision 48. May not work with other revisions.

headtrackr.controllers.three = {};

/**
 * Controls a THREE.js camera to create pseudo-3D effect
 *
 * Needs the position of "screen" in 3d-model to be given up front, and to be static (i.e. absolute) during headtracking
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {number} scaling The scaling of the "screen" in the 3d model. 
 *   This is the vertical size of screen in 3d-model relative to vertical size of computerscreen in real life
 * @param {array} fixedPosition array with attributes x,y,z, position of "screen" in 3d-model
 * @param {THREE.Vector3} lookAt the object/position the camera should be pointed towards
 * @param {object} params optional object with optional parameters
 *
 * Optional parameters:
 *   screenHeight : vertical size of computer screen (default is 20 cm, i.e. typical laptop size)
 */
headtrackr.controllers.three.realisticAbsoluteCameraControl = function(camera, scaling, fixedPosition, lookAt, params) {
	
	if (params === undefined) params = {};
	if (params.screenHeight === undefined) {
		var screenHeight_cms = 20;
	} else {
		var screenHeight_cms = params.screenHeight;
	}
	if (params.damping === undefined) {
	  params.damping = 1;
	}
	
	camera.position.x = fixedPosition[0];
	camera.position.y = fixedPosition[1];
	camera.position.z = fixedPosition[2];
	camera.lookAt(lookAt);
	
	var wh = screenHeight_cms * scaling;
	var ww = wh * camera.aspect;
	
	document.addEventListener('headtrackingEvent', function(event) {
		
		// update camera
		var xOffset = event.x > 0 ? 0 : -event.x * 2 * params.damping * scaling;
		var yOffset = event.y < 0 ? 0 : event.y * 2 * params.damping * scaling;
		camera.setViewOffset(ww + Math.abs(event.x * 2 * params.damping * scaling), wh + Math.abs(event.y * params.damping * 2 * scaling), xOffset, yOffset, ww, wh);
		
		camera.position.x = fixedPosition[0] + (event.x * scaling * params.damping );
		camera.position.y = fixedPosition[1] + (event.y * scaling * params.damping );
		camera.position.z = fixedPosition[2] + (event.z * scaling);
		
		// update lookAt?
		
		// when changing height of window, we need to change field of view
		camera.fov = Math.atan((wh/2 + Math.abs(event.y * scaling * params.damping ))/(Math.abs(event.z*scaling)))*360/Math.PI;
		//debugger;
		
		camera.updateProjectionMatrix();
		
	}, false);
};

/**
 * Controls a THREE.js camera to create pseudo-3D effect
 *
 * Places "screen" in 3d-model in relation to original cameraposition at any given time
 * Currently not sure if this works properly, or at all
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {number} scaling The scaling of the "screen" in the 3d model. 
 *   This is the vertical size of screen in 3d-model relative to vertical size of computerscreen in real life
 * @param {array} relativeFixedDistance how long in front of (or behind) original cameraposition the fixed frame will be
 * @param {object} params optional object with optional parameters
 *
 * Optional parameters:
 *   screenHeight : vertical size of computer screen (default is 20 cm, i.e. typical laptop size)
 */
headtrackr.controllers.threerealisticRelativeCameraControl = function(camera, scaling, relativeFixedDistance, params) {
	
	// we assume that the parent of camera is the scene
	
	if (params === undefined) params = {};
	if (params.screenHeight === undefined) {
		var screenHeight_cms = 20;
	} else {
		var screenHeight_cms = params.screenHeight;
	}
	
	var scene = camera.parent;
	
	var init = true;
	
	// create an object to offset camera without affecting existing camera interaction
	var offset = new THREE.Object3D();
	offset.position.set(0,0,0);
	offset.add(camera);
	scene.add(offset);
	
	// TODO : we maybe need to offset functions like lookAt as well
	//	use prototype function replacement for this?
	
	var wh = screenHeight_cms * scaling;
	var ww = wh * camera.aspect;
	
	// set fov
	document.addEventListener('headtrackingEvent', function(event) {
		
		// update camera
		var xOffset = event.x > 0 ? 0 : -event.x * 2 * scaling;
		var yOffset = event.y > 0 ? 0 : -event.y * 2 * scaling;
		camera.setViewOffset(ww + Math.abs(event.x * 2 * scaling), wh + Math.abs(event.y * 2 * scaling), xOffset, yOffset, ww, wh);
		
		offset.rotation = camera.rotation;
		offset.position.x = 0;
		offset.position.y = 0;
		offset.position.z = 0;
		offset.translateX(event.x * scaling);
		offset.translateY(event.y * scaling);
		offset.translateZ((event.z * scaling)+relativeFixedDistance);
		
		//offset.position.x = (event.x * scaling);
		//offset.position.y = (event.y * scaling);
		//offset.position.z = (event.z * scaling)+relativeFixedDistance;
		
		// when changing height of window, we need to change field of view
		camera.fov = Math.atan((wh/2 + Math.abs(event.y * scaling))/(Math.abs(event.z*scaling)))*360/Math.PI;
		
		camera.updateProjectionMatrix();
		
	}, false);
}


	return headtrackr;
}));
},{}],11:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])