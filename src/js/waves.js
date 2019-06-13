$(function() {
  var setWaves;
  setWaves = function() {
    var Anchor, Canvas, Motion, Mouse, Spring, Stage, Water, Wave, app, bezier, canvas, clamp, distance, func, options, rand, size, times;
    canvas = document.getElementById('waves');

    /*
     * UTILITIES
     */
    times = function(amount, closure) {
      var i;
      i = 0;
      while (i < amount) {
        closure(i);
        i++;
      }
    };
    func = function(name) {
      return function(obj) {
        return obj[name]();
      };
    };
    rand = function(min, max) {
      return min + (max - min) * Math.random();
    };
    bezier = function(points, context) {
      var a, b, i, length, x, y;
      a = void 0;
      b = void 0;
      x = void 0;
      y = void 0;
      i = 1;
      length = points.length - 2;
      while (i < length) {
        a = points[i];
        b = points[i + 1];
        x = (a.x + b.x) * 0.5;
        y = (a.y + b.y) * 0.5;
        context.quadraticCurveTo(a.x, a.y, x, y);
        i++;
      }
      a = points[i];
      b = points[i + 1];
      context.quadraticCurveTo(a.x, a.y, b.x, b.y);
    };
    distance = function(a, b) {
      var x, y;
      x = b.x - a.x;
      y = b.y - a.y;
      return Math.sqrt(x * x + y * y);
    };
    clamp = function(val, min, max) {
      if (val < min) {
        return min;
      } else if (val > max) {
        return max;
      } else {
        return val;
      }
    };
    if (!$(canvas).length) {
      return;
    }
    size = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    /*
     * CONFIG
     */
    options = {
      color: '#414141',
      waveAmplitude: 10,
      waveRadius: 100,
      waveElasticity: 0.7,
      waveStrength: 0.011,
      waveMouse: 40,
      waveMax: 200,
      waveComeUp: function() {},
      waveRiseSpeed: 1,
      lineWidth: 1,
      waveLength: 200,
      distance: 30
    };

    /*
     * GLOBAL CLASSES
     */
    Mouse = (function() {
      var exports, onMouseMove, onTouchMove;
      exports = {
        x: 0,
        y: 0,
        bind: function(canvas) {
          canvas.addEventListener('mousemove', onMouseMove);
          canvas.addEventListener('touchmove', onTouchMove);
        },
        unbind: function(canvas) {
          canvas.removeEventListener('mousemove', onMouseMove);
          canvas.removeEventListener('touchmove', onTouchMove);
        }
      };
      onMouseMove = function(event) {
        exports.x = event.pageX - window.scrollX;
        exports.y = event.pageY - window.scrollY;
      };
      onTouchMove = function(event) {
        exports.x = event.touches[0].pageX;
        exports.y = event.touches[0].pageY;
      };
      return exports;
    })();
    Stage = {
      width: 1,
      height: 1,
      set: function(values) {
        Stage.width = values.width;
        Stage.height = values.height;
      }
    };

    /*
     * ARCHITECTURE CLASSES
     */
    Water = function(context) {
      var createWaves, init, waves;
      waves = void 0;
      init = function() {
        options.waveComeUp = this.start.bind(this);
      };
      createWaves = function(height) {
        var distance;
        waves = [];
        distance = options.distance;
        times(height / distance, function(index) {
          waves.push(new Wave(0, index * distance + 10, context, rand(0.08, 0.12) * index));
        });
      };
      this.render = function() {
        context.strokeStyle = options.color;
        context.lineWidth = options.lineWidth;
        context.lineCap = 'round';
        context.beginPath();
        waves.forEach(func('render'));
        context.stroke();
      };
      this.setSize = function(width, height) {
        createWaves(height);
        waves.forEach(function(wave) {
          wave.setSize(width, height);
        });
      };
      this.start = function() {
        waves.forEach(func('start'));
      };
      init.call(this);
    };
    Wave = function(originalX, originalY, context, offset) {
      var anchors, height, init, mouseDirection, oldMouse, update, updateMouse, width, x, y;
      anchors = void 0;
      width = void 0;
      height = void 0;
      mouseDirection = void 0;
      oldMouse = void 0;
      x = void 0;
      y = void 0;
      init = function() {
        var anchor, current, delta, start, step, target;
        x = originalX;
        y = originalY;
        anchors = [];
        mouseDirection = {
          x: 0,
          y: 0
        };
        anchor = void 0;
        current = 0;
        start = -options.waveAmplitude;
        target = options.waveAmplitude;
        delta = offset;
        step = 0.4;
        times(window.innerWidth / options.waveLength, function() {
          anchor = new Anchor(current, 0, start, target, delta);
          anchor.setOrigin(current + x, y);
          anchors.push(anchor);
          current += 90;
          delta += step;
          if (delta > 1) {
            times(Math.floor(delta), function() {
              delta--;
              start *= -1;
              target *= -1;
            });
          }
        });
      };
      update = function() {
        var targetY;
        targetY = Math.min(y, Mouse.y + originalY);
        y += (targetY - y) / options.waveRiseSpeed;
        updateMouse();
        anchors.forEach(function(anchor) {
          anchor.update(mouseDirection, y);
        });
      };
      updateMouse = function() {
        if (!oldMouse) {
          oldMouse = {
            x: Mouse.x,
            y: Mouse.y
          };
          return;
        }
        mouseDirection.x = Mouse.x - oldMouse.x;
        mouseDirection.y = Mouse.y - oldMouse.y;
        oldMouse = {
          x: Mouse.x,
          y: Mouse.y
        };
      };
      this.render = function() {
        update();
        context.save();
        context.translate(x, y);
        context.moveTo(anchors[0].x, anchors[0].y);
        bezier(anchors, context);
        context.restore();
      };
      this.setSize = function(_width, _height) {
        var step;
        width = _width;
        height = _height;
        step = _width / (anchors.length - 1);
        anchors.forEach(function(anchor, i) {
          anchor.x = step * i;
          anchor.setOrigin(anchor.x, y);
        });
      };
      this.onAmpChange = function() {
        anchors.forEach(func('onAmpChange'));
      };
      this.start = function() {
        y = height + 300 + originalY * 0.4;
      };
      init.call(this);
    };
    Anchor = function(x, y, start, target, delta) {
      var getMultiplier, init, motion, origin, spring;
      spring = void 0;
      motion = void 0;
      origin = void 0;
      init = function() {
        spring = new Spring;
        motion = new Motion(start, target, delta);
        origin = {};
        this.x = x;
        this.y = y;
      };
      getMultiplier = function() {
        var lang, radius;
        lang = distance(Mouse, origin);
        radius = options.waveRadius;
        if (lang < radius) {
          return 1 - (lang / radius);
        } else {
          return 0;
        }
      };
      this.update = function(mouseDirection, currentY) {
        var factor, vector;
        origin.y = currentY;
        factor = getMultiplier();
        vector = {
          x: mouseDirection.x * factor * options.waveMouse,
          y: mouseDirection.y * factor * options.waveMouse
        };
        if (factor > 0) {
          spring.shoot(vector);
        }
        spring.update();
        motion.update();
        this.y = motion.get() + spring.y;
      };
      this.onAmpChange = function() {
        motion.onAmpChange();
      };
      this.setOrigin = function(x, y) {
        origin.x = x;
        origin.y = y;
      };
      init.call(this);
    };
    Motion = function(start, target, delta) {
      var SPEED, half, init, lower, max, min, upper;
      SPEED = 0.02;
      half = void 0;
      upper = void 0;
      lower = void 0;
      min = void 0;
      max = void 0;
      init = function() {
        this.onAmpChange();
      };
      this.setRange = function(a, b) {
        min = a;
        max = b;
      };
      this.update = function() {
        delta += SPEED;
        if (delta > 1) {
          delta = 0;
          start = target;
          target = target < half ? rand(upper, max) : rand(min, lower);
        }
      };
      this.get = function() {
        var factor;
        factor = (Math.cos((1 + delta) * Math.PI) + 1) / 2;
        return start + factor * (target - start);
      };
      this.onAmpChange = function() {
        min = -options.waveAmplitude;
        max = options.waveAmplitude;
        half = min + (max - min) / 2;
        upper = min + (max - min) * 0.75;
        lower = min + (max - min) * 0.25;
      };
      init.call(this);
    };
    Spring = function() {
      var cancelOffset, init, px, py, targetX, targetY, timeout, vx, vy;
      px = 0;
      py = 0;
      vx = 0;
      vy = 0;
      targetX = 0;
      targetY = 0;
      timeout = void 0;
      init = function() {
        this.x = 0;
        this.y = 0;
      };
      cancelOffset = function() {
        targetX = 0;
        targetY = 0;
      };
      this.update = function() {
        vx = targetX - this.x;
        vy = targetY - this.y;
        px = px * options.waveElasticity + vx * options.waveStrength;
        py = py * options.waveElasticity + vy * options.waveStrength;
        this.x += px;
        this.y += py;
      };
      this.shoot = function(vector) {
        targetX = clamp(vector.x, -options.waveMax, options.waveMax);
        targetY = clamp(vector.y, -options.waveMax, options.waveMax);
        clearTimeout(timeout);
        timeout = setTimeout(cancelOffset, 100);
      };
      init.call(this);
    };
    Canvas = function(canvas, size) {
      var animation, context, height, init, render, width;
      context = void 0;
      width = void 0;
      height = void 0;
      animation = void 0;
      init = function() {
        context = canvas.getContext('2d');
        window.canvasCTX = context;
        setTimeout((function() {
          Mouse.bind(document);
        }), 1000);
        Stage.set(size);
        animation = new Water(context);
        this.setSize(size.width, size.height);
        animation.start();
        requestAnimationFrame(render);
      };
      render = function() {
        context.setTransform(1, 0, 0, 1, 0, context.clearRect(0, 0, width, height));
        context.save();
        animation.render();
        context.restore();
        requestAnimationFrame(render);
      };
      this.setSize = function(_width, _height) {
        canvas.width = Stage.width = width = _width;
        canvas.height = Stage.height = height = _height;
        animation.setSize(_width, _height);
      };
      init.call(this);
    };

    /*
     * START
     */
    app = new Canvas(canvas, size);
    window.addEventListener('resize', (function() {
      app.setSize(window.innerWidth, window.innerHeight);
    }), false);
  };
  return setWaves();
});

// ---
// generated by coffee-script 1.9.2