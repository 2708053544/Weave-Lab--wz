/* Blue-violet cursor light, enabled only after the opening layer is gone.
   只在首屏（.hero-viewport）范围内显示，滚过首屏后自动隐藏 */
(function () {
  'use strict';
  var hero = document.querySelector('.hero-viewport');
  var canvas = document.querySelector('.hero-trail-canvas');
  if (!hero || !canvas || !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = 0, h = 0, frame = 0, started = false, active = false, visible = true;
  var lastMove = 0, lastBloom = 0, bloomX = 0, bloomY = 0;
  var head = { x: 0, y: 0 }, target = { x: 0, y: 0 }, trail = [], blooms = [];

  function resize() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var rect = hero.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    trail = [];
    blooms = [];
    active = false;
  }

  function drawBlooms(now) {
    for (var i = 0; i < blooms.length; i++) {
      var bloom = blooms[i], progress = (now - bloom.time) / 1450;
      var radius = 16 + progress * 100;
      var alpha = Math.pow(1 - progress, 1.6) * .17;
      var diffusion = ctx.createRadialGradient(bloom.x, bloom.y, 0, bloom.x, bloom.y, radius);
      diffusion.addColorStop(0, 'rgba(197,221,255,' + alpha + ')');
      diffusion.addColorStop(.45, 'rgba(145,155,255,' + (alpha * .48) + ')');
      diffusion.addColorStop(1, 'rgba(126,107,242,0)');
      ctx.fillStyle = diffusion;
      ctx.beginPath(); ctx.arc(bloom.x, bloom.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bloom.x, bloom.y, radius * .72, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(177,185,255,' + (alpha * .32) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function tracePath() {
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (var i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
  }

  function shortenTrail() {
    var maxLength = Math.min(260, Math.max(160, w * .21));
    var distance = 0;
    for (var i = trail.length - 1; i > 0; i--) {
      var current = trail[i], previous = trail[i - 1];
      var segment = Math.hypot(current.x - previous.x, current.y - previous.y);
      if (distance + segment > maxLength) {
        var portion = (maxLength - distance) / segment;
        trail = trail.slice(i);
        trail.unshift({
          x: current.x + (previous.x - current.x) * portion,
          y: current.y + (previous.y - current.y) * portion,
          time: previous.time
        });
        return;
      }
      distance += segment;
    }
  }

  function drawRibbon(fade) {
    if (trail.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(head.x, head.y, 300, 0, Math.PI * 2);
    ctx.clip();

    // 先做插值：确保相邻点之间距离不超过3px，快速移动也不断
    var dense = [];
    for (var s = 0; s < trail.length - 1; s++) {
      var p1 = trail[s], p2 = trail[s + 1];
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var dist = Math.hypot(dx, dy);
      dense.push({ x: p1.x, y: p1.y, t: s / (trail.length - 1) });
      if (dist > 3) {
        var steps = Math.ceil(dist / 3);
        for (var k = 1; k < steps; k++) {
          var ratio = k / steps;
          dense.push({
            x: p1.x + dx * ratio,
            y: p1.y + dy * ratio,
            t: (s + ratio) / (trail.length - 1)
          });
        }
      }
    }
    dense.push({ x: trail[trail.length - 1].x, y: trail[trail.length - 1].y, t: 1 });

    // 外层：柔和光晕 - 原来的粗细
    for (var i = 0; i < dense.length; i++) {
      var point = dense[i];
      var t = point.t;
      var radius = 4 + 14 * Math.pow(t, 1.6);
      var alpha = 0.05 + 0.09 * Math.pow(t, 1.3);
      var glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      glow.addColorStop(0, 'rgba(180,190,255,' + (alpha * fade) + ')');
      glow.addColorStop(.5, 'rgba(150,140,235,' + (alpha * 0.5 * fade) + ')');
      glow.addColorStop(1, 'rgba(127,112,249,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 内层：稍亮核心 - 原来的粗细
    for (var j = 0; j < dense.length; j++) {
      var pt = dense[j];
      var t2 = pt.t;
      var r2 = 1.5 + 6 * Math.pow(t2, 1.8);
      var a2 = 0.06 + 0.1 * Math.pow(t2, 1.5);
      var glow2 = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r2);
      glow2.addColorStop(0, 'rgba(210,220,255,' + (a2 * fade) + ')');
      glow2.addColorStop(.6, 'rgba(170,160,245,' + (a2 * 0.4 * fade) + ')');
      glow2.addColorStop(1, 'rgba(127,112,249,0)');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawHead(now, fade) {
    var radius = 31 * (1 + .08 * Math.sin(now / 135));
    var glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
    glow.addColorStop(0, 'rgba(255,255,255,' + (.5 * fade) + ')');
    glow.addColorStop(.09, 'rgba(216,235,255,' + (.45 * fade) + ')');
    glow.addColorStop(.3, 'rgba(162,177,255,' + (.18 * fade) + ')');
    glow.addColorStop(1, 'rgba(127,112,249,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(head.x, head.y, radius, 0, Math.PI * 2); ctx.fill();
  }

  function render(now) {
    frame = 0;
    ctx.clearRect(0, 0, w, h);
    if (!active || document.hidden || !visible) return;
    var idle = now - lastMove;
    var fade = Math.min(1, Math.max(0, (2600 - idle) / 900));
    head.x += (target.x - head.x) * .16;
    head.y += (target.y - head.y) * .16;
    var latest = trail[trail.length - 1];
    if ((!latest || Math.hypot(head.x - latest.x, head.y - latest.y) > .8) && idle < 800) {
      trail.push({ x: head.x, y: head.y, time: now });
      if (trail.length > 40) trail.shift();
    }
    trail = trail.filter(function (point) { return now - point.time < 900; });
    shortenTrail();
    blooms = blooms.filter(function (bloom) { return now - bloom.time < 1450; });
    if (fade > 0) {
      ctx.globalCompositeOperation = 'screen';
      drawBlooms(now);
      drawRibbon(fade);
      drawHead(now, fade);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (trail.length || blooms.length || fade > 0 || idle < 2600) frame = requestAnimationFrame(render);
    else active = false;
  }

  function onMove(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (!visible) return;
    // 只在首屏范围内响应
    var rect = hero.getBoundingClientRect();
    var mx = event.clientX - rect.left;
    var my = event.clientY - rect.top;
    if (mx < 0 || mx > w || my < 0 || my > h) return;

    if (!active) {
      head.x = mx; head.y = my;
      trail = [];
      blooms = [];
      bloomX = mx; bloomY = my; lastBloom = performance.now();
      active = true;
    }
    target.x = mx; target.y = my;
    lastMove = performance.now();
    if (lastMove - lastBloom > 55 && Math.hypot(target.x - bloomX, target.y - bloomY) > 48) {
      blooms.push({ x: head.x, y: head.y, time: lastMove });
      if (blooms.length > 6) blooms.shift();
      bloomX = target.x; bloomY = target.y; lastBloom = lastMove;
    }
    if (!frame) frame = requestAnimationFrame(render);
  }

  function checkScroll() {
    var rect = hero.getBoundingClientRect();
    // 首屏滚出视野了就隐藏
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      if (visible) {
        visible = false;
        canvas.style.opacity = '0';
        active = false;
        trail = [];
        blooms = [];
        ctx.clearRect(0, 0, w, h);
      }
    } else {
      if (!visible) {
        visible = true;
        canvas.style.opacity = '1';
      }
    }
  }

  function start() {
    if (started) return;
    started = true;
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { ctx.clearRect(0, 0, w, h); trail = []; blooms = []; active = false; }
    });
    checkScroll();
  }

  var opening = document.getElementById('opening');
  if (!opening) { start(); return; }
  var checked = 0;
  var timer = setInterval(function () {
    checked++;
    if (!document.getElementById('opening')) {
      clearInterval(timer);
      start();
    } else if (checked > 30) {
      clearInterval(timer);
      start();
    }
  }, 200);
  var observer = new MutationObserver(function () {
    if (!document.getElementById('opening')) {
      observer.disconnect();
      clearInterval(timer);
      start();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
