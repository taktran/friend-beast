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
