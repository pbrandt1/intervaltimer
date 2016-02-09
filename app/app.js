console.log('🚴🚴🚴🚴🚴🚴🚴🚴🚴🚴🚴')

var debug = function() { window.location.href.indexOf('localhost') >= 0 && console.log.apply(console, arguments); }

var $t = $('#time');
var $display = $('#display');
var $start = $('#start')
var $reset = $('#reset')

var intervals_cached;
var active_index = -1;
var paused = true;

var sound = new Howl({
  urls: ['quindar.mp3']
})

// input modification behavior
Rx.Observable.fromEvent($t, 'input')
  .pluck('target', 'value')
  .debounce(200)
  .filter(function(data) {
    return data > 0
  })
  .distinctUntilChanged()
  .map(createIntervals)
  .subscribe(render)

// onload trigger input so the graph is initially drawn
$t.trigger('input')

// woo rendering it all every second
function render(intervals) {
  intervals = intervals || intervals_cached;
  intervals_cached = intervals;
  debug(intervals);

  var totalElapsedSeconds = 60 * Timer.elapsed_minutes + Timer.elapsed_seconds;
  var renderedSeconds = 0;
  var html = '<ul>' + intervals.map(function(i, index) {
    var time;
    var c = '';
    var m = i.length | 0;
    var s = i.length * 60 - (m * 60);
    debug(m, s)

    if (totalElapsedSeconds < renderedSeconds) {
      time = mmss(m, s);
    } else if (totalElapsedSeconds >= renderedSeconds + i.length * 60) {
      time = mmss(0, 0)
      c = 'complete'
    } else {
      // this is the one that's ticking down.
      var seconds_left = 60 * i.length - (totalElapsedSeconds - renderedSeconds);
      time = mmss(seconds_left / 60 | 0, seconds_left % 60);
      c = 'active'
      if (active_index !== index && !paused) {
        debug('playing sound')
        sound.play();
        active_index = index;
      }
    }
    renderedSeconds += i.length * 60;
    return '<li class="' + c + '"><span class="time">' + time  + '</span><span class="bar">' + emojis[i.difficulty] + '</span></li>'
  }).join('') + '</ul>';
  $display.html(html);
}

function mmss(m, s) {
  return ('00' + (m|0)).slice(-2) + ':' + ('00' + (s|0)).slice(-2);
}

// start stop pause reset behavior
Timer.onTick(function() {
  debug('tick')
  debug(this.elapsed_minutes + ':' + this.elapsed_seconds)
  render()
})

$start.on('click', function() {
  paused = !paused;
  if (paused) {
    Timer.pause()
    $start.text('UNPAUSE')
  } else {
    Timer.start()
    $start.text('PAUSE')
  }
})

$reset.on('click', function() {
  Timer.pause();
  Timer.reset();
  paused = true;
  $start.text('START')
  var active_index = -1;
  render();
})

// TOP SECRET ALGORITHM
var emojis = ['👻', '😀', '😅😅', '😬😬😬', '😵😵😵😵']
function createIntervals(length) {
  var warmup = Math.min(5, length*.2);
  length -= warmup;
  var cooldown = warmup;
  length -= cooldown;

  var intervals = [
    {length: warmup, difficulty: 1}
  ];

  difficulty = [2, 3, 4]

  var difficulty_index = 0;
  while (length > 0) {
    intervals.push({
      difficulty: difficulty[(difficulty_index++) % 3],
      length: Math.min(5, length)
    })
    length -=5
  }
  intervals.push({
    difficulty: 1,
    length: cooldown
  })

  return intervals;
}
