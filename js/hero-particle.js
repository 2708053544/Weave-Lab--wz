/* ========================================
   Hero Particle Canvas - 粒子转动效果
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  initHeroParticle();
});

function initHeroParticle() {
  const canvas = document.getElementById('hero-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId;
  let isActive = true;

  // Resize canvas
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    createParticles();
  }

  // Create particles
  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 12000);
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2.5 + 0.8;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      // Rotation orbit parameters
      const centerX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6;
      const centerY = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.6;
      const orbitRadius = Math.random() * Math.min(canvas.width, canvas.height) * 0.4 + 50;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() - 0.5) * 0.003 + 0.001;
      const tilt = Math.random() * 0.6 + 0.4; // Ellipse tilt

      particles.push({
        x, y, size,
        centerX, centerY,
        orbitRadius,
        angle,
        speed,
        tilt,
        baseSize: size
      });
    }
  }

  // Draw particles and connections
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Orbital motion
      p.angle += p.speed;
      p.x = p.centerX + Math.cos(p.angle) * p.orbitRadius;
      p.y = p.centerY + Math.sin(p.angle) * p.orbitRadius * p.tilt;

      // Mouse interaction - push particles away
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += dx * force * 0.05;
          p.y += dy * force * 0.05;
          p.size = p.baseSize * (1 + force * 1.5);
        } else {
          p.size = p.baseSize;
        }
      } else {
        p.size = p.baseSize;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      // Draw connections between nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const opacity = (1 - dist / 100) * 0.2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Draw connection to mouse
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const opacity = (1 - dist / mouse.radius) * 0.4;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    if (!isActive) return;
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // Mouse tracking
  const hero = canvas.parentElement;
  if (hero) {
    hero.addEventListener('mousemove', function(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // Pause when out of view (performance)
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      isActive = entry.isIntersecting;
      if (isActive) animate();
    });
  }, { threshold: 0 });

  if (hero) observer.observe(hero);

  // Init
  window.addEventListener('resize', resize);
  resize();
  animate();
}
