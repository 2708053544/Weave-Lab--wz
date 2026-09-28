/* A short, self-contained opening. Nothing below the overlay is modified. */
(function () {
  'use strict';
  var intro = document.getElementById('entryIntro');
  var canvas = document.getElementById('entryIntroLight');
  var skip = document.getElementById('entryIntroSkip');
  if (!intro || !canvas || !skip) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || (location.hash && location.hash !== '#hero')) {
    intro.remove();
    return;
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) { intro.remove(); return; }
  document.body.classList.add('entry-intro-active');

  var w = 0, h = 0, frame = 0, done = false, pointerAt = 0;
  var started = performance.now();
  var target = { x: 0, y: 0 };
  var head = { x: 0, y: 0 };
  var trail = [];

  function resize() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!trail.length) {
      head.x = target.x = w * .77;
      head.y = target.y = h * .72;
    }
  }

  function mix(a, b, t) { return a + (b - a) * t; }
  function color(progress) {
    var red = [255, 69, 77], violet = [209, 77, 213], blue = [123, 111, 255];
    var from = progress < .48 ? red : violet;
    var to = progress < .48 ? violet : blue;
    var t = progress < .48 ? progress / .48 : (progress - .48) / .52;
    return [0, 1, 2].map(function (i) { return Math.round(mix(from[i], to[i], t)); });
  }

  function render(now) {
    if (done) return;
    var elapsed = (now - started) / 1000;
    var shift = Math.min(1, Math.max(0, (elapsed - .55) / 2.45));
    var rgb = color(shift);
    if (elapsed > 1.25) intro.classList.add('is-transitioning');

    if (now - pointerAt > 900) {
      target.x = w * (.72 + .14 * Math.sin(elapsed * 1.85));
      target.y = h * (.48 + .27 * Math.sin(elapsed * 2.8 + 1.4));
    }
    head.x += (target.x - head.x) * .135;
    head.y += (target.y - head.y) * .135;
    trail.push({ x: head.x, y: head.y });
    if (trail.length > 52) trail.shift();

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    for (var i = 1; i < trail.length; i++) {
      var a = trail[i - 1], b = trail[i], strength = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (.04 + strength * .55) + ')';
      ctx.lineWidth = .8 + strength * 7;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(' + rgb.join(',') + ',.85)';
      ctx.shadowBlur = 16 + strength * 28;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    var pulse = 1 + .17 * Math.sin(now / 110);
    var radius = 52 * pulse;
    var halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
    halo.addColorStop(0, 'rgba(255,250,255,.96)');
    halo.addColorStop(.06, 'rgba(' + rgb.join(',') + ',.9)');
    halo.addColorStop(.3, 'rgba(' + rgb.join(',') + ',.25)');
    halo.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    frame = requestAnimationFrame(render);
  }

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(autoFinish);
    intro.classList.add('is-transitioning', 'is-leaving');
    document.body.classList.remove('entry-intro-active');
    setTimeout(function () { intro.remove(); }, 850);
  }

  function move(event) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    target.x = event.clientX;
    target.y = event.clientY;
    pointerAt = performance.now();
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  intro.addEventListener('pointermove', move, { passive: true });
  skip.addEventListener('click', finish);
  intro.addEventListener('keydown', function (event) { if (event.key === 'Escape') finish(); });
  var autoFinish = setTimeout(finish, 3300);
  frame = requestAnimationFrame(render);
})();
