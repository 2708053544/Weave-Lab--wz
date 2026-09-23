/* ========================================
   Hero V2 - Premium Homepage Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  initLineReveal();
  initScrollReveal();
  initHeroCanvas();
  initSmoothScroll();
});

/* --- Line Reveal Animations --- */
function initLineReveal() {
  const reveals = document.querySelectorAll('.line-reveal');
  if (!reveals.length) return;
  
  // Stagger hero reveals on page load
  const heroReveals = document.querySelectorAll('.hero-v2 .line-reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 300 + i * 150);
  });
  
  // Observe other reveals on scroll
  const otherReveals = document.querySelectorAll(':not(.hero-v2) > .line-reveal, *:not(.hero-v2) .line-reveal');
  if (!otherReveals.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger within the same parent
        const parent = entry.target.parentElement;
        const siblings = parent.querySelectorAll('.line-reveal');
        const index = Array.from(siblings).indexOf(entry.target);
        
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  otherReveals.forEach(el => observer.observe(el));
}

/* --- Scroll Reveal for Cards & Text --- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-text, .reveal-card');
  if (!revealEls.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  
  revealEls.forEach(el => observer.observe(el));
}

/* --- Hero Canvas Particle Effect --- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 180 };
  let animationId;
  let isActive = true;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }
  
  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 0.5;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = (Math.random() - 0.5) * 0.4;
      const speedY = (Math.random() - 0.5) * 0.4;
      particles.push({ x, y, size, speedX, speedY });
    }
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Mouse interaction
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= dx * force * 0.02;
          p.y -= dy * force * 0.02;
        }
      }
      
      // Move
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const opacity = (1 - dist / 120) * 0.15;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      
      // Mouse connection
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const opacity = (1 - dist / mouse.radius) * 0.3;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    if (!isActive) return;
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }
  
  // Mouse tracking
  const hero = document.querySelector('.hero-v2');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    
    hero.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }
  
  // Pause when hero is out of view (performance)
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isActive = entry.isIntersecting;
      if (isActive) animate();
    });
  }, { threshold: 0 });
  
  if (hero) heroObserver.observe(hero);
  
  // Init
  window.addEventListener('resize', resize);
  resize();
  animate();
}

/* --- Smooth Scroll for anchor links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      
      const target = document.querySelector(targetId);
      if (!target) return;
      
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
}
