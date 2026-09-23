(function() {
  // Only run on homepage
  if (!document.getElementById('hero')) return;

  var overlay = document.getElementById('intro-overlay');
  var canvas = document.getElementById('intro-canvas');
  if (!overlay || !canvas) return;

  var ctx = canvas.getContext('2d');
  var w, h, dpr;
  var startTime = performance.now();
  var fluidBlobs = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  function initFluid() {
    for (var i = 0; i < 6; i++) {
      fluidBlobs.push({
        x: Math.random() * w,
        y: h * 0.3 + Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        r: 180 + Math.random() * 220,
        hue: 270 + Math.random() * 40,
        opacity: 0,
        targetOpacity: 0.12 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function drawArc(t) {
    var cx = w * 0.5;
    var cy = h * 0.52;
    var radius = Math.max(w, h) * 0.65;
    var startAngle = Math.PI * 0.72;
    var endAngle = Math.PI * 1.28;

    var sweepEnd = startAngle + (endAngle - startAngle) * t;

    ctx.save();

    // Outer glow layers
    for (var layer = 5; layer >= 0; layer--) {
      var lineWidth = 2 + layer * 5;
      var alpha = 0.08 + (5 - layer) * 0.04;
      ctx.strokeStyle = 'rgba(200, 80, 255, ' + alpha + ')';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, sweepEnd);
      ctx.stroke();
    }

    // Bright core line
    ctx.strokeStyle = 'rgba(255, 200, 255, 1)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#cc44ff';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, sweepEnd);
    ctx.stroke();

    // White-hot center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, sweepEnd);
    ctx.stroke();

    // Trailing sparks at the leading edge
    var leadX = cx + radius * Math.cos(sweepEnd);
    var leadY = cy + radius * Math.sin(sweepEnd);

    for (var s = 0; s < 8; s++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.random() * 30 + 5;
      var sx = leadX + Math.cos(angle) * dist;
      var sy = leadY + Math.sin(angle) * dist;
      var sSize = Math.random() * 2 + 0.5;
      var sAlpha = Math.random() * 0.6 + 0.2;

      ctx.fillStyle = 'rgba(255, 180, 255, ' + sAlpha + ')';
      ctx.shadowColor = '#cc44ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function drawFluid(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (var i = 0; i < fluidBlobs.length; i++) {
      var b = fluidBlobs[i];

      if (b.opacity < b.targetOpacity) b.opacity += 0.005;
      b.opacity = Math.min(b.opacity, b.targetOpacity);

      b.phase += 0.005;
      b.x += b.vx + Math.sin(b.phase) * 0.2;
      b.y += b.vy + Math.cos(b.phase * 0.7) * 0.15;

      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, 'hsla(' + b.hue + ', 80%, 50%, ' + b.opacity + ')');
      grad.addColorStop(0.5, 'hsla(' + b.hue + ', 70%, 40%, ' + (b.opacity * 0.4) + ')');
      grad.addColorStop(1, 'hsla(' + b.hue + ', 60%, 30%, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function hideHeroContent() {
    var heroContent = document.getElementById('heroContent');
    var scrollHint = document.querySelector('.hero-scroll-bottom');
    var heroCanvas = document.getElementById('hero-particle-canvas');
    if (heroContent) heroContent.style.opacity = '0';
    if (scrollHint) scrollHint.style.opacity = '0';
    if (heroCanvas) heroCanvas.style.opacity = '0';
  }

  function revealHero() {
    var heroContent = document.getElementById('heroContent');
    var scrollHint = document.querySelector('.hero-scroll-bottom');
    var heroCanvas = document.getElementById('hero-particle-canvas');

    if (heroContent) {
      heroContent.style.transition = 'opacity 1.2s ease';
      heroContent.style.opacity = '1';
    }
    if (scrollHint) {
      scrollHint.style.transition = 'opacity 1s ease 0.5s';
      scrollHint.style.opacity = '';
    }
    if (heroCanvas) {
      heroCanvas.style.transition = 'opacity 1.5s ease';
      heroCanvas.style.opacity = '';
    }
  }

  hideHeroContent();
  initFluid();

  var ARC_START = 0;
  var ARC_DURATION = 1400;
  var FLUID_START = 800;
  var FLUID_DURATION = 2000;
  var FADE_START = 2800;
  var FADE_DURATION = 1000;
  var TOTAL = 3800;
  var heroRevealed = false;

  function animate(now) {
    var elapsed = now - startTime;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    if (elapsed >= ARC_START && elapsed < ARC_START + ARC_DURATION + 600) {
      var arcT = Math.max(0, Math.min(1, (elapsed - ARC_START) / ARC_DURATION));
      var eased = 1 - Math.pow(1 - arcT, 3);
      drawArc(eased);
    }

    if (elapsed >= FLUID_START) {
      var fluidT = Math.max(0, Math.min(1, (elapsed - FLUID_START) / FLUID_DURATION));
      var fluidEased = 1 - Math.pow(1 - fluidT, 2);
      for (var i = 0; i < fluidBlobs.length; i++) {
        fluidBlobs[i].targetOpacity = (0.12 + Math.random() * 0.08) * fluidEased;
      }
      drawFluid(fluidEased);
    }

    if (elapsed >= FADE_START) {
      var fadeT = Math.max(0, Math.min(1, (elapsed - FADE_START) / FADE_DURATION));

      ctx.fillStyle = 'rgba(0,0,0,' + fadeT + ')';
      ctx.fillRect(0, 0, w, h);

      if (!heroRevealed && fadeT > 0.3) {
        revealHero();
        heroRevealed = true;
      }
    }

    if (elapsed < TOTAL) {
      requestAnimationFrame(animate);
    } else {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 500);
    }
  }

  requestAnimationFrame(animate);

})();
