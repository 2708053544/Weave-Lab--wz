/* ============================================
   Weave Lab - Global JavaScript
   交互功能：导航、滚动、拖拽、动画
   ============================================ */

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initScrollAnimations();
  initHorizontalScroll();
  initProjectFilter();
  initMobileNav();
  initHeroCanvas();
  initHeroParallax();
  initHeroTitleAnimation();
  initMagneticButtons();
  initMentorFullpage();
  initMentorFullpageSection();
  initStudent3DCarousel();
});

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Check if this is the homepage (has hero section)
  const heroSection = document.querySelector('.hero, .hero-immersive, .hero-v2');
  const isHomepage = !!heroSection;

  // Hide navbar initially on homepage
  if (isHomepage && heroSection) {
    navbar.classList.add('hidden-nav');
  }

  // Scroll effect
  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // Scrolled state
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Homepage: show/hide navbar based on scroll position
    if (isHomepage && heroSection) {
      const heroHeight = heroSection.offsetHeight;
      // Show navbar when scrolled past 60% of hero
      if (scrollY > heroHeight * 0.6) {
        navbar.classList.remove('hidden-nav');
      } else {
        navbar.classList.add('hidden-nav');
      }
    }
  });

  // Active nav link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
  });
}

/* ---------- Mobile Navigation ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    // Toggle mobile menu state
    const isOpen = menu.style.display === 'flex';
    menu.style.display = isOpen ? 'none' : 'flex';

    if (!isOpen) {
      menu.style.position = 'absolute';
      menu.style.top = '100%';
      menu.style.left = '0';
      menu.style.right = '0';
      menu.style.flexDirection = 'column';
      menu.style.background = 'var(--bg-primary)';
      menu.style.borderBottom = '1px solid var(--border-color)';
      menu.style.padding = '20px';
      menu.style.gap = '8px';
    }

    // Animate toggle icon
    const spans = toggle.querySelectorAll('span');
    if (!isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
}

/* ---------- Scroll Animations (Fade In) ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ---------- Horizontal Scroll with Drag & Auto Scroll ---------- */
function initHorizontalScroll() {
  const containers = document.querySelectorAll('.scroll-container');
  if (containers.length === 0) return;

  containers.forEach(container => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;
    let autoScrollSpeed = 1;
    let isPaused = false;

    // Mouse drag
    container.addEventListener('mousedown', (e) => {
      isDown = true;
      isPaused = true;
      container.classList.add('active');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      stopAutoScroll();
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('active');
      if (!isPaused) startAutoScroll();
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('active');
      isPaused = false;
      setTimeout(() => {
        if (!isPaused) startAutoScroll();
      }, 1000);
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    let touchStartX = 0;
    let touchScrollLeft = 0;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX - container.offsetLeft;
      touchScrollLeft = container.scrollLeft;
      isPaused = true;
      stopAutoScroll();
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - touchStartX) * 1.5;
      container.scrollLeft = touchScrollLeft - walk;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isPaused = false;
      setTimeout(() => {
        if (!isPaused) startAutoScroll();
      }, 2000);
    });

    // Auto scroll
    function startAutoScroll() {
      if (autoScrollInterval) return;

      autoScrollInterval = setInterval(() => {
        if (isPaused || isDown) return;

        const maxScroll = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScroll - 1) {
          // Reset to start with smooth scroll
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollLeft += autoScrollSpeed;
        }
      }, 30);
    }

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    // Hover pause
    container.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAutoScroll();
    });

    container.addEventListener('mouseleave', () => {
      if (!isDown) {
        isPaused = false;
        startAutoScroll();
      }
    });

    // Scroll buttons
    const wrapper = container.closest('.scroll-container-wrapper');
    if (wrapper) {
      const prevBtn = wrapper.querySelector('.scroll-btn.prev');
      const nextBtn = wrapper.querySelector('.scroll-btn.next');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          container.scrollBy({ left: -360, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          container.scrollBy({ left: 360, behavior: 'smooth' });
        });
      }
    }

    // Start auto scroll after a delay
    setTimeout(startAutoScroll, 2000);
  });
}

/* ---------- Project Filter Tabs ---------- */
function initProjectFilter() {
  const worksSection = document.getElementById('works');
  if (!worksSection) return;
  
  const tabs = worksSection.querySelectorAll('.filter-tab');
  const cards = worksSection.querySelectorAll('.project-card');

  if (tabs.length === 0 || cards.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      // Filter cards
      cards.forEach(card => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          // Trigger reflow for animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ---------- Smooth Scroll for Anchor Links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

/* ---------- Parallax Effect for Hero ---------- */
window.addEventListener('scroll', function () {
  const heroContent = document.querySelector('.hero-content');
  const heroGrid = document.querySelector('.hero-grid');
  const scrolled = window.pageYOffset;

  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
  }

  if (heroGrid && scrolled < window.innerHeight) {
    heroGrid.style.transform = `translateY(${scrolled * 0.1}px)`;
  }
});

/* ---------- Card Hover Enhancement ---------- */
document.querySelectorAll('.scroll-card, .student-card, .project-card, .activity-card, .research-card').forEach(card => {
  card.addEventListener('mouseenter', function () {
    this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

/* ---------- Theme Detection ---------- */
function isDarkTheme() {
  return document.body.classList.contains('theme-dark');
}

/* ============================================
   Hero Canvas Particle Network Effect
   ============================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = (Math.random() - 0.5) * 0.5;
      const speedY = (Math.random() - 0.5) * 0.5;
      particles.push({ x, y, size, speedX, speedY, baseX: x, baseY: y });
    }
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = 1 - distance / 120;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[a].x - mouse.x;
        const dy = particles[a].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          particles[a].x += dx * force * 0.02;
          particles[a].y += dy * force * 0.02;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${force * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.speedX;
      p.y += p.speedY;

      // Return to base position gently
      p.x += (p.baseX - p.x) * 0.005;
      p.y += (p.baseY - p.y) * 0.005;

      // Bounce off edges
      if (p.x < 0 || p.x > canvas.width) p.speedX = -p.speedX;
      if (p.y < 0 || p.y > canvas.height) p.speedY = -p.speedY;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles();
    connectParticles();
    updateParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Mouse move
  window.addEventListener('mousemove', function (e) {
    const hero = document.querySelector('.hero-immersive');
    if (hero && hero.contains(e.target)) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  // Resize
  window.addEventListener('resize', function () {
    resize();
    createParticles();
  });

  // Init
  resize();
  createParticles();
  animate();

  // Pause when not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

/* ============================================
   Hero 3D Parallax Effect
   ============================================ */
function initHeroParallax() {
  const hero = document.querySelector('.hero-immersive');
  const heroContent = document.getElementById('heroContent');
  if (!hero || !heroContent) return;

  hero.addEventListener('mousemove', function (e) {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Move orbs (background only, no content movement)
    const orbs = document.querySelectorAll('.hero-orb');
    orbs.forEach((orb, index) => {
      const factor = (index + 1) * 15;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });

    // Move grid
    const grid = document.querySelector('.hero-grid');
    if (grid) {
      grid.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    }
  });

  hero.addEventListener('mouseleave', function () {
    const orbs = document.querySelectorAll('.hero-orb');
    orbs.forEach(orb => {
      orb.style.transform = '';
    });

    const grid = document.querySelector('.hero-grid');
    if (grid) {
      grid.style.transform = '';
    }
  });
}

/* ============================================
   Hero Title Character Animation
   ============================================ */
function initHeroTitleAnimation() {
  const title = document.getElementById('heroTitle');
  if (!title) return;

  const line = title.querySelector('.line');
  if (!line) return;

  const text = line.textContent;
  line.innerHTML = '';

  [...text].forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'hero-title-char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${0.5 + index * 0.08}s`;
    line.appendChild(span);
  });
}

/* ============================================
   Magnetic Buttons Effect
   ============================================ */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');
  if (buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ============================================
   Mentor Fullpage Scroll
   ============================================ */
function initMentorFullpage() {
  const container = document.querySelector('.mentor-fullpage');
  if (!container) return;

  const slides = container.querySelectorAll('.mentor-slide');
  const slidesWrapper = container.querySelector('.mentor-slides');
  const dots = container.querySelectorAll('.mentor-nav-dot');
  const prevBtn = container.querySelector('.mentor-arrow-nav.prev');
  const nextBtn = container.querySelector('.mentor-arrow-nav.next');
  const counterCurrent = container.querySelector('.mentor-counter .current');
  const counterTotal = container.querySelector('.mentor-counter .total');

  let currentSlide = 0;
  let isAnimating = false;
  const totalSlides = slides.length;

  if (counterTotal) counterTotal.textContent = String(totalSlides).padStart(2, '0');

  function goToSlide(index) {
    if (isAnimating || index < 0 || index >= totalSlides) return;

    isAnimating = true;

    // Update slides
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');

    // Translate wrapper
    slidesWrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Update counter
    if (counterCurrent) {
      counterCurrent.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    // Reset animation lock
    setTimeout(() => {
      isAnimating = false;
    }, 800);
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  // Mouse wheel navigation
  let wheelTimeout;
  container.addEventListener('wheel', function (e) {
    e.preventDefault();

    if (wheelTimeout) clearTimeout(wheelTimeout);

    wheelTimeout = setTimeout(() => {
      if (e.deltaY > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    }, 50);
  }, { passive: false });

  // Touch navigation
  let touchStartY = 0;
  let touchEndY = 0;

  container.addEventListener('touchstart', function (e) {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', function (e) {
    touchEndY = e.changedTouches[0].screenY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    }
  });

  // Check URL hash for initial slide
  const hash = window.location.hash.replace('#', '');
  const initialIndex = parseInt(hash) ? parseInt(hash) - 1 : 0;

  // Init first slide
  if (slides[initialIndex]) {
    slides[initialIndex].classList.add('active');
  }
  if (dots[initialIndex]) {
    dots[initialIndex].classList.add('active');
  }
  if (counterCurrent) {
    counterCurrent.textContent = String(initialIndex + 1).padStart(2, '0');
  }

  // Set initial transform (without animation)
  if (initialIndex > 0) {
    slidesWrapper.style.transition = 'none';
    slidesWrapper.style.transform = `translateY(-${initialIndex * 100}vh)`;
    currentSlide = initialIndex;
    // Restore transition after a frame
    requestAnimationFrame(() => {
      slidesWrapper.style.transition = '';
    });
  }
}

/* ---------- Mentor Fullpage Section (in about page) ---------- */
function initMentorFullpageSection() {
  const section = document.querySelector('.mentor-fullpage-section');
  if (!section) return;

  const slides = section.querySelectorAll('.mentor-fp-slide');
  const dots = section.querySelectorAll('.mentor-fp-dot');
  const prevBtn = section.querySelector('.mentor-fp-arrow.prev');
  const nextBtn = section.querySelector('.mentor-fp-arrow.next');
  const counterCurrent = section.querySelector('.mentor-fp-counter .current');

  let currentSlide = 0;
  let isAnimating = false;
  const totalSlides = slides.length;
  let isSectionInView = false;

  function goToSlide(index) {
    if (isAnimating || index < 0 || index >= totalSlides) return false;

    isAnimating = true;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    if (counterCurrent) {
      counterCurrent.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    setTimeout(() => { isAnimating = false; }, 800);
    return true;
  }

  // Button controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Wheel scroll within section
  let wheelTimeout;
  section.addEventListener('wheel', (e) => {
    if (!isSectionInView) return;
    
    clearTimeout(wheelTimeout);
    
    const direction = e.deltaY > 0 ? 1 : -1;
    
    // Scrolling down on last slide: let page scroll
    if (direction === 1 && currentSlide === totalSlides - 1) {
      return; // allow default scroll
    }
    
    // Scrolling up on first slide: let page scroll
    if (direction === -1 && currentSlide === 0) {
      return; // allow default scroll
    }
    
    e.preventDefault();
    
    if (!isAnimating) {
      goToSlide(currentSlide + direction);
    }
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!isSectionInView) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    }
  });

  // Touch swipe
  let touchStartY = 0;
  let touchEndY = 0;

  section.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  section.addEventListener('touchend', (e) => {
    if (!isSectionInView) return;
    touchEndY = e.changedTouches[0].screenY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
      const direction = diff > 0 ? 1 : -1;
      
      if (direction === 1 && currentSlide === totalSlides - 1) return;
      if (direction === -1 && currentSlide === 0) return;
      
      goToSlide(currentSlide + direction);
    }
  }, { passive: true });

  // Intersection Observer to detect when section is in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isSectionInView = entry.isIntersecting && entry.intersectionRatio > 0.5;
    });
  }, { threshold: [0, 0.5, 1] });

  observer.observe(section);

  // URL hash support
  const hash = window.location.hash;
  if (hash && hash.startsWith('#mentor-')) {
    const idx = parseInt(hash.replace('#mentor-', '')) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < totalSlides) {
      setTimeout(() => goToSlide(idx), 300);
    }
  }
}

/* ---------- Student 3D Cover Flow Carousel ---------- */
function initStudent3DCarousel() {
  const carousel = document.getElementById('student3DCarousel');
  if (!carousel) return;

  const stage = document.getElementById('student3DStage');
  const cards = stage.querySelectorAll('.student-3d-card');
  const prevBtn = document.getElementById('student3DPrev');
  const nextBtn = document.getElementById('student3DNext');
  const dotsContainer = document.getElementById('student3DDots');
  const progressFill = document.getElementById('student3DProgress');
  const currentLabel = document.getElementById('student3DCurrent');

  const total = cards.length;
  let current = 0;
  let isAnimating = false;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'student-3d-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.student-3d-dot');

  function updateCards() {
    cards.forEach((card, i) => {
      const offset = i - current;
      const absOffset = Math.abs(offset);
      
      if (absOffset > 2) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(' + (offset > 0 ? '400px' : '-400px') + ') scale(0.5) rotateY(' + (offset > 0 ? '-45deg' : '45deg') + ')';
        card.style.pointerEvents = 'none';
        return;
      }

      const translateX = offset * 200;
      const rotateY = offset * -25;
      const scale = absOffset === 0 ? 1 : (1 - absOffset * 0.18);
      const opacity = absOffset === 0 ? 1 : (1 - absOffset * 0.3);
      const zIndex = 10 - absOffset;

      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.pointerEvents = absOffset === 0 ? 'auto' : 'none';
      card.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;

      if (absOffset === 0) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });

    // Update progress
    if (progressFill) {
      progressFill.style.width = ((current / (total - 1)) * 100) + '%';
    }
    if (currentLabel) {
      currentLabel.textContent = String(current + 1).padStart(2, '0');
    }

    // Update buttons
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  function goTo(index) {
    if (isAnimating) return;
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current) return;
    
    isAnimating = true;
    current = index;
    updateCards();
    
    setTimeout(() => { isAnimating = false; }, 600);
  }

  // Button controls
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    const rect = carousel.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(current + 1);
    }
  });

  // Wheel scroll
  let wheelTimeout;
  carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    clearTimeout(wheelTimeout);
    
    if (!isAnimating) {
      const direction = e.deltaY > 0 ? 1 : -1;
      goTo(current + direction);
    }
    
    wheelTimeout = setTimeout(() => {}, 100);
  }, { passive: false });

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 40) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });

  // Drag to scroll
  let dragStartX = 0;
  let isDragging = false;

  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    carousel.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = '';
    
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    // Visual feedback during drag could be added here
  });

  // Init
  updateCards();

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => updateCards(), 200);
  });
}
