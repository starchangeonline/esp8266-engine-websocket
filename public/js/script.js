$(document).ready(function() {
  var lastMove = 0;
  //socket connection and events
  var socket = io('http://esp.ananas.life/');
  socket.on('connect', function() {
    console.log("CONNECTED");
  });
  socket.on('started', function() {
    console.log('started');
  });
  socket.on('stopped', function() {
    console.log('stopped');
  })
  socket.on('disconnect', function() {
    console.log("disconnected");
  });

  $("a.forward").click(function() {
    move(800, 800);
  });
  $("a.back").click(function() {
    move(-800, -800);
  });
  $("a.left").click(function() {
    move(-800, 800);
  });
  $("a.right").click(function() {
    move(800, -800);
  });


  $("a.start").click(function() {
    socket.emit("start");
  });
  $("a.stop").click(function() {
    move(0,0);
    socket.emit("stop");

  });

  //Check for if it's a mobile device or not
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
  } else {
    document.getElementById("dmEvent").innerHTML = "Accelerometer not supported."
  }

  //For Keyboard WASD
  document.onkeydown = function detectKey(event) {
    var e = event.keyCode;
    if (e == 87) { //W
      move(800, 800);
    }
    if (e == 83) { //S
      move(-800, -800);
    }
    if (e == 65) { //A
      move(-800, 800);
    }
    if (e == 68) { //D
      move(800, -800);
    }
  }

  function move(left, right) {
    var now = Date.now();
    if (lastMove + 200 < now) {
      lastMove = now;
      var obj = {
        left,
        right
      };
      socket.emit('engines', obj);
    }
  }


  function deviceMotionHandler(eventData) {
    acceleration = eventData.accelerationIncludingGravity;
    var left = 0;
    var right = 0;
    if (Math.abs(acceleration.y) > 1) { // back-/forward
      var speed = acceleration.y * 150;
      left = Math.min(1023, speed + acceleration.x * 100);
      right = Math.min(1023, speed - acceleration.x * 100);
    } else if (Math.abs(acceleration.x) > 1) {
      var speed = Math.min(1023, Math.abs(acceleration.x) * 123);
      if (acceleration.x > 0) {
        left = speed;
        right = -speed;
      } else {
        left = -speed;
        right = speed;
      }
    }
    if (Math.abs(left) > 100 || Math.abs(right) > 100) {
      if(left<-1023){
        left=-1023;
      }
      if(right<-1023){
        right=-1023;
      }
      move(left, right);
    }
    var direction = "stop";
    direction = "[" + Math.round(acceleration.x) + "," + Math.round(acceleration.y) + "," + Math.round(acceleration.z) + "]<BR/>" + Math.round(left) + ", " + Math.round(right);
    document.getElementById("vector").innerHTML = direction;
  }
});