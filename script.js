/* =====================================================
   Dechen Dolma Sherpa — Portfolio interactions
   ===================================================== */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================
     Custom cursor
     ========================= */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(min-width: 769px)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    const hoverTargets = document.querySelectorAll('a, button, .skill-card, .exp-card, .cert-card, .contact-card, .timeline-item, .about-pills li');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* =========================
     Scroll progress + nav state
     ========================= */
  const progressBar = document.querySelector('.scroll-progress');
  const nav = document.querySelector('.nav');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (nav) nav.classList.toggle('scrolled', scrollTop > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================
     Mobile menu
     ========================= */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks   = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* =========================
     Reveal-on-scroll
     ========================= */
  const revealEls = document.querySelectorAll('.reveal, .skill-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* =========================
     Animated background — drifting leaves & water particles
     ========================= */
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle types: 0 = leaf, 1 = waterdrop, 2 = pollen
    const COLORS = {
      leaf:  ['#6b8e5a', '#a8bfa1', '#4a6b4a'],
      water: ['#6fa8b6', '#c5dde2', '#3d6b78'],
      pollen:['#e8dfc9', '#f7f3ea']
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const particles = [];
    const PARTICLE_COUNT = Math.min(50, Math.floor((W * H) / 26000));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const type = Math.random();
      let p;
      if (type < 0.45) {
        p = {
          kind: 'leaf',
          x: rand(0, W),
          y: rand(-H, H),
          size: rand(8, 18),
          vx: rand(-0.3, 0.3),
          vy: rand(0.2, 0.6),
          rot: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.01, 0.01),
          sway: rand(0.5, 1.5),
          swayPhase: rand(0, Math.PI * 2),
          color: COLORS.leaf[Math.floor(Math.random() * COLORS.leaf.length)],
          opacity: rand(0.25, 0.55)
        };
      } else if (type < 0.8) {
        p = {
          kind: 'pollen',
          x: rand(0, W),
          y: rand(0, H),
          size: rand(1.5, 3),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.15, 0.15),
          color: COLORS.pollen[Math.floor(Math.random() * COLORS.pollen.length)],
          opacity: rand(0.4, 0.8),
          twinklePhase: rand(0, Math.PI * 2)
        };
      } else {
        p = {
          kind: 'water',
          x: rand(0, W),
          y: rand(0, H),
          size: rand(3, 6),
          vx: rand(-0.15, 0.15),
          vy: rand(0.1, 0.4),
          color: COLORS.water[Math.floor(Math.random() * COLORS.water.length)],
          opacity: rand(0.3, 0.6)
        };
      }
      particles.push(p);
    }

    const drawLeaf = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.8, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.8, s * 0.6, -s * 0.8, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, s * 0.9);
      ctx.stroke();
      ctx.restore();
    };

    const drawCircle = (p, alphaMod = 1) => {
      ctx.save();
      ctx.globalAlpha = p.opacity * alphaMod;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let t = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      particles.forEach((p) => {
        if (p.kind === 'leaf') {
          p.x += p.vx + Math.sin(t * p.sway + p.swayPhase) * 0.4;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          if (p.y - p.size > H) { p.y = -p.size; p.x = rand(0, W); }
          if (p.x < -50) p.x = W + 20;
          if (p.x > W + 50) p.x = -20;
          drawLeaf(p);
        } else if (p.kind === 'pollen') {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
          const twinkle = (Math.sin(t * 2 + p.twinklePhase) + 1) / 2;
          drawCircle(p, 0.5 + twinkle * 0.5);
        } else {
          // water — drift down, gentle drift
          p.x += p.vx + Math.sin(t + p.y * 0.01) * 0.2;
          p.y += p.vy;
          if (p.y > H + p.size) { p.y = -p.size; p.x = rand(0, W); }
          drawCircle(p);
        }
      });

      requestAnimationFrame(tick);
    };
    tick();
  }

  /* =========================
     Smooth-scroll nudge for # links (extra easing)
     ========================= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        const target = document.querySelector(id);
        const navEl = document.querySelector('.nav');
        const navH = navEl ? navEl.getBoundingClientRect().height : 60;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* =========================
     Subtle parallax on hero name
     ========================= */
  const heroName = document.querySelector('.hero-name');
  if (heroName && !prefersReduced && window.matchMedia('(min-width: 769px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      heroName.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
})();
