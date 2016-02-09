'use strict';
// http://www.sitepoint.com/creating-accurate-timers-in-javascript/
(function() {
  var tick_callbacks = [];
  var PARTIAL_INTERVAL_LENGTH = 100;
  var NUMBER_INTERVALS_PER_TICK = 10;

  // new Date().getTime() any time the start button is pressed
  var start;

  // elapsed milliseconds since the last time the start button was pressed
  var intervalElapsed;

  var nextSecond = 1;
  var paused = true;

  // this happens multiple times per second
  function instance() {
    if (paused) { return; }
    intervalElapsed += PARTIAL_INTERVAL_LENGTH;
    Timer.elapsed_milliseconds += PARTIAL_INTERVAL_LENGTH;
    Timer.elapsed_seconds = (Timer.elapsed_milliseconds / 1000) % 60;
    if (nextSecond == Timer.elapsed_seconds) {
      nextSecond = (Timer.elapsed_seconds + 1) % 60;
      Timer.elapsed_minutes = (Timer.elapsed_milliseconds / 1000 / 60) | 0;
      setTimeout(function() {
        tick_callbacks.map(function(cb) {
          cb();
        })
      }, 0)
    }

    var diff = new Date().getTime() - start - intervalElapsed;
    setTimeout(instance, 100 - diff);
  }

  window.Timer = {
    elapsed_milliseconds: 0,
    elapsed_seconds: 0,
    elapsed_minutes: 0,
    start: function() {
      paused = false;
      intervalElapsed = 0;
      start = new Date().getTime();
      setTimeout(instance, PARTIAL_INTERVAL_LENGTH)
    },
    pause: function() {
      paused = true;
    },
    reset: function() {
      this.elapsed_milliseconds = 0;
      this.elapsed_seconds = 0;
      this.elapsed_minutes = 0;
      nextSecond = 1;
      paused = true;
    },
    onTick: function(fn) {
      tick_callbacks.push(fn.bind(Timer))
    }
  }
})()
