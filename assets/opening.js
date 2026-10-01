/* Opening typography, color-shifting light trail, and one firework reveal. */
(function () {
  'use strict';
  var layer = document.getElementById('opening');
  var canvas = document.getElementById('opening-canvas');
  var skip = document.getElementById('opening-skip');
  var heroTitle = document.querySelector('.hero-title');
  if (!layer || !canvas || !skip) return;
  // 仅“直接进入/登录（无锚点）”或“首屏锚点（#hero/#top/#explore）”播放开屏动画；
  // 从其他页面跳转到首页的具体区块（#about/#works 等）不播放动画，直达目标区块。
  var openingHash = location.hash || '';
  if (openingHash && openingHash !== '#hero' && openingHash !== '#top' && openingHash !== '#explore') {
    layer.remove();
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reduced motion: keep a brief static brand frame, then dismiss. The splash is never fully removed.
    layer.classList.add('is-static');
    setTimeout(function () {
      layer.classList.add('is-done');
      setTimeout(function () { layer.remove(); }, 450);
    }, 1400);
    return;
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) { layer.remove(); return; }
  document.body.classList.add('opening-active');

  var w = 0, h = 0, frame = 0, phase = 'trail', pointerAt = 0, titleWritten = false;
  var start = performance.now(), lastFrame = start, burstAt = 0;
  var head = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  var trail = [], sparks = [], handoffTrail = [];
  var burstOrigin = { x: 0, y: 0 }, tracedLetter = -1;
  var titleLetters = heroTitle ? Array.prototype.slice.call(heroTitle.querySelectorAll('.hero-word .hero-jump-letter')) : [];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!trail.length) {
      head.x = target.x = w * .78;
      head.y = target.y = h * .73;
    }
  }
  function mix(a, b, t) { return a + (b - a) * t; }
  function color(t) {
    var red = [198, 111, 129], pink = [185, 116, 188], blue = [170, 160, 249];
    var from = t < .48 ? red : pink, to = t < .48 ? pink : blue;
    var amount = t < .48 ? t / .48 : (t - .48) / .52;
    return [0, 1, 2].map(function (i) { return Math.round(mix(from[i], to[i], amount)); });
  }
  function lightColor(t) {
    var red = [198, 111, 129], pink = [185, 116, 188];
    var ice = [161, 199, 255], violet = [170, 160, 249];
    var from = t < .4 ? red : t < .75 ? pink : ice;
    var to = t < .4 ? pink : t < .75 ? ice : violet;
    var amount = t < .4 ? t / .4 : t < .75 ? (t - .4) / .35 : (t - .75) / .25;
    return [0, 1, 2].map(function (i) { return Math.round(mix(from[i], to[i], amount)); });
  }

  function ease(t) { return t * t * (3 - 2 * t); }
  function bezier(a, b, c, d, t) {
    var inverse = 1 - t;
    return inverse * inverse * inverse * a + 3 * inverse * inverse * t * b +
      3 * inverse * t * t * c + t * t * t * d;
  }

  // A small moving light sketches each letter's main strokes after the burst.
  function letterPoint(progress) {
    if (!titleLetters.length) return null;
    var paths = [
      [[.03,.12],[.22,.86],[.48,.38],[.69,.86],[.96,.12]], // W
      [[.88,.45],[.13,.45],[.25,.23],[.77,.23],[.86,.57],[.25,.73],[.82,.79]], // e
      [[.85,.38],[.51,.21],[.17,.45],[.42,.79],[.81,.49],[.85,.8]], // a
      [[.07,.25],[.49,.83],[.94,.24]], // v
      [[.88,.45],[.13,.45],[.25,.23],[.77,.23],[.86,.57],[.25,.73],[.82,.79]], // e
      [[.3,.08],[.2,.84],[.9,.79]], // L
      [[.84,.38],[.5,.2],[.17,.47],[.43,.81],[.82,.47],[.86,.79]], // a
      [[.15,.08],[.16,.83],[.17,.49],[.48,.23],[.83,.44],[.62,.79],[.2,.72]] // b
    ];
    var position = Math.min(titleLetters.length - .001, progress * titleLetters.length);
    var index = Math.floor(position), local = position - index;
    var points = paths[index], segment = Math.min(points.length - 2, Math.floor(local * (points.length - 1)));
    var amount = ease(local * (points.length - 1) - segment);
    var rect = titleLetters[index].getBoundingClientRect();
    return {
      x: rect.left + mix(points[segment][0], points[segment + 1][0], amount) * rect.width,
      y: rect.top + mix(points[segment][1], points[segment + 1][1], amount) * rect.height,
      index: index
    };
  }

  function drawHandoff(now, age) {
    if (!titleLetters.length || age < .18 || age > 3.55) return;
    var handoffFade = Math.min(1, Math.max(0, (3.55 - age) / .45));
    var destination = letterPoint(0);
    if (!destination) return;
    var point;
    if (age < .82) {
      var t = ease((age - .18) / .64);
      point = {
        x: bezier(burstOrigin.x, burstOrigin.x - w * .08, destination.x + w * .13, destination.x, t),
        y: bezier(burstOrigin.y, burstOrigin.y - h * .18, destination.y - h * .12, destination.y, t)
      };
    } else {
      var writingProgress = Math.min(.999, (age - .82) / 2.2);
      point = letterPoint(writingProgress);
      var writingPosition = writingProgress * titleLetters.length;
      for (var n = 0; n < titleLetters.length && !titleWritten; n++) {
        var reveal = Math.max(0, Math.min(100, (writingPosition - n) * 100));
        titleLetters[n].style.setProperty('--ink-progress', reveal + '%');
      }
      if (!titleWritten && point.index !== tracedLetter) {
        tracedLetter = point.index;
        var letter = titleLetters[tracedLetter];
        letter.classList.add('is-traced');
        setTimeout(function () { letter.classList.remove('is-traced'); }, 430);
      }
    }
    handoffTrail.push({ x: point.x, y: point.y, time: now });
    handoffTrail = handoffTrail.filter(function (item) { return now - item.time < 390; });
    for (var k = 1; k < handoffTrail.length; k++) {
      var strength = k / handoffTrail.length;
      ctx.beginPath();
      ctx.moveTo(handoffTrail[k - 1].x, handoffTrail[k - 1].y);
      ctx.lineTo(handoffTrail[k].x, handoffTrail[k].y);
      ctx.lineWidth = .8 + strength * 1.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(171,205,255,' + ((.08 + strength * .72) * handoffFade) + ')';
      ctx.shadowColor = 'rgba(158,134,255,.85)';
      ctx.shadowBlur = 9 + strength * 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    var glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 19);
    glow.addColorStop(0, 'rgba(255,255,255,' + (.94 * handoffFade) + ')');
    glow.addColorStop(.17, 'rgba(211,234,255,' + (.85 * handoffFade) + ')');
    glow.addColorStop(.5, 'rgba(158,171,255,' + (.42 * handoffFade) + ')');
    glow.addColorStop(1, 'rgba(137,119,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(point.x, point.y, 19, 0, Math.PI * 2); ctx.fill();
  }

  function finishWriting() {
    if (titleWritten) return;
    titleWritten = true;
    titleLetters.forEach(function (letter) {
      letter.style.setProperty('--ink-progress', '100%');
      letter.classList.remove('is-traced');
    });
    document.body.classList.remove('opening-active');
    if (heroTitle) heroTitle.classList.add('is-written');
  }

  function burst() {
    if (phase !== 'trail') return;
    phase = 'burst'; burstAt = performance.now();
    burstOrigin.x = head.x; burstOrigin.y = head.y;
    layer.classList.add('is-cooling', 'is-bursting');
    document.body.classList.add('opening-burst');
    if (heroTitle) heroTitle.classList.add('is-writing');
    var count = w < 600 ? 120 : 210;
    var palette = [[170,151,255],[122,169,255],[227,177,255],[246,244,255],[133,117,255]];
    for (var i = 0; i < count; i++) {
      var angle = Math.PI * 2 * (i / count) + (Math.random() - .5) * .12;
      var speed = 135 + Math.random() * Math.min(480, Math.max(w, h) * .42);
      sparks.push({
        x: head.x, y: head.y, oldX: head.x, oldY: head.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: Math.random() < .14 ? 2.2 : .8 + Math.random() * 1.1,
        life: .75 + Math.random() * .65, age: 0,
        rgb: palette[i % palette.length]
      });
    }
    setTimeout(function () { finishWriting(); layer.classList.add('is-done'); }, 3200);
    setTimeout(function () {
      finishWriting();
      phase = 'done'; cancelAnimationFrame(frame); layer.remove();
    }, 3550);
  }

  function render(now) {
    if (phase === 'done') return;
    var dt = Math.min(.045, (now - lastFrame) / 1000);
    lastFrame = now;
    var elapsed = (now - start) / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';

    if (phase === 'trail') {
      if (elapsed > 1.25) layer.classList.add('is-cooling');
      if (elapsed > 2.42) {
        target.x = w * .68; target.y = h * .4;
      } else if (now - pointerAt > 850) {
        target.x = w * (.72 + .13 * Math.sin(elapsed * 1.9));
        target.y = h * (.47 + .27 * Math.sin(elapsed * 2.75 + 1.4));
      }
      head.x += (target.x - head.x) * .14;
      head.y += (target.y - head.y) * .14;
      trail.push({ x: head.x, y: head.y });
      if (trail.length > 56) trail.shift();
      var colorProgress = Math.min(1, Math.max(0, (elapsed - 1.15) / 1.85));
      var rgb = lightColor(colorProgress);
      layer.style.setProperty('--opening-lab-color', 'rgb(' + color(colorProgress).join(',') + ')');
      for (var i = 1; i < trail.length; i++) {
        var strength = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (.05 + strength * .6) + ')';
        ctx.lineWidth = 1 + strength * 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(' + rgb.join(',') + ',.8)';
        ctx.shadowBlur = 16 + strength * 28;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      var radius = 51 * (1 + .16 * Math.sin(now / 115));
      var glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
      glow.addColorStop(0, 'rgba(255,255,255,.96)');
      glow.addColorStop(.07, 'rgba(' + rgb.join(',') + ',.85)');
      glow.addColorStop(.32, 'rgba(' + rgb.join(',') + ',.22)');
      glow.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(head.x, head.y, radius, 0, Math.PI * 2); ctx.fill();
      if (elapsed >= 3.22) burst();
    } else {
      var age = (now - burstAt) / 1000;
      if (age < .45) {
        var flashRadius = 20 + age * Math.min(w, h) * .95;
        var flash = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, flashRadius);
        flash.addColorStop(0, 'rgba(255,255,255,' + Math.max(0, .82 - age * 2) + ')');
        flash.addColorStop(.18, 'rgba(177,159,255,' + Math.max(0, .42 - age * .8) + ')');
        flash.addColorStop(1, 'rgba(122,119,255,0)');
        ctx.fillStyle = flash;
        ctx.beginPath(); ctx.arc(head.x, head.y, flashRadius, 0, Math.PI * 2); ctx.fill();
      }
      for (var j = 0; j < sparks.length; j++) {
        var spark = sparks[j];
        spark.age += dt;
        if (spark.age >= spark.life) continue;
        spark.oldX = spark.x; spark.oldY = spark.y;
        spark.x += spark.vx * dt; spark.y += spark.vy * dt;
        spark.vx *= Math.pow(.982, dt * 60);
        spark.vy = spark.vy * Math.pow(.982, dt * 60) + 24 * dt;
        var alpha = Math.pow(1 - spark.age / spark.life, 1.3);
        ctx.strokeStyle = 'rgba(' + spark.rgb.join(',') + ',' + alpha + ')';
        ctx.lineWidth = spark.radius;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 13;
        ctx.beginPath(); ctx.moveTo(spark.oldX, spark.oldY); ctx.lineTo(spark.x, spark.y); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      drawHandoff(now, age);
      if (age >= 3.04) finishWriting();
    }
    ctx.globalCompositeOperation = 'source-over';
    frame = requestAnimationFrame(render);
  }

  layer.addEventListener('pointermove', function (event) {
    if (phase !== 'trail' || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    target.x = event.clientX; target.y = event.clientY;
    pointerAt = performance.now();
  }, { passive: true });
  skip.addEventListener('click', burst);
  layer.addEventListener('keydown', function (event) { if (event.key === 'Escape') burst(); });
  window.addEventListener('resize', resize, { passive: true });
  resize();
  frame = requestAnimationFrame(render);
})();
