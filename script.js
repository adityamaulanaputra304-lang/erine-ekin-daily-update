/* =====================================================
   ERINE & EKIN — script.js
   Liquid Blob · Sparkle Cursor · Typewriter · 3D Tilt
===================================================== */

/* ==================== LOADER ==================== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('hidden');
  }, 1200);
});

/* ==================== SCROLL PROGRESS ==================== */
window.addEventListener('scroll', () => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';

  // back to top
  const btn = document.getElementById('backToTop');
  if (btn) btn.classList.toggle('show', window.scrollY > 400);

  // navbar shrink
  document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 60);
});

/* ==================== CUSTOM CURSOR + SPARKLE ==================== */
const dot   = document.getElementById('cursor-dot');
const ring  = document.getElementById('cursor-ring');
const sCanvas = document.getElementById('sparkle-canvas');
const sCtx   = sCanvas?.getContext('2d');
let sparkles = [];

function resizeSparkle() {
  if (!sCanvas) return;
  sCanvas.width  = window.innerWidth;
  sCanvas.height = window.innerHeight;
}
resizeSparkle();
window.addEventListener('resize', resizeSparkle);

let mx = -200, my = -200, rx = -200, ry = -200;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;

  if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }
  if (ring) {
    // ring follows with slight lag via rAF
  }

  // spawn sparkle
  if (Math.random() < 0.4) {
    sparkles.push({
      x: mx + (Math.random() - 0.5) * 12,
      y: my + (Math.random() - 0.5) * 12,
      r: Math.random() * 4 + 2,
      alpha: 1,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2.5 - 0.5,
      color: Math.random() > 0.5 ? '#ff4fa3' : '#ffd700'
    });
  }
});

function lerp(a, b, t) { return a + (b - a) * t; }

(function sparkleLoop() {
  if (sCtx) {
    sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    sparkles = sparkles.filter(s => s.alpha > 0.02);
    sparkles.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      s.alpha *= 0.93;
      s.r     *= 0.97;
      sCtx.globalAlpha = s.alpha;
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sCtx.fillStyle = s.color;
      sCtx.shadowColor = s.color;
      sCtx.shadowBlur  = 8;
      sCtx.fill();
    });
    sCtx.globalAlpha = 1;
    sCtx.shadowBlur  = 0;
  }

  // ring lag
  rx = lerp(rx, mx, 0.12);
  ry = lerp(ry, my, 0.12);
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }

  requestAnimationFrame(sparkleLoop);
})();

/* ==================== LIQUID BLOB CANVAS ==================== */
(function initBlob() {
  const canvas = document.getElementById('blob-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create several blobs
  const blobs = [
    { x: 0.3, y: 0.4, r: 0.28, speed: 0.0007, phase: 0,    color: 'rgba(255, 79, 163, 0.18)', pts: 7 },
    { x: 0.7, y: 0.55, r: 0.22, speed: 0.0009, phase: 1.2,  color: 'rgba(255, 215, 0, 0.12)',  pts: 6 },
    { x: 0.5, y: 0.3,  r: 0.18, speed: 0.0012, phase: 2.5,  color: 'rgba(200, 50, 200, 0.12)', pts: 8 },
  ];

  let t = 0;

  function drawBlob(blob) {
    const W = canvas.width, H = canvas.height;
    const cx = blob.x * W;
    const cy = blob.y * H;
    const baseR = blob.r * Math.min(W, H);

    ctx.beginPath();
    for (let i = 0; i <= blob.pts * 3; i++) {
      const angle = (i / (blob.pts * 3)) * Math.PI * 2;
      const noiseA = Math.sin(angle * 3 + t * blob.speed * 3000 + blob.phase) * 0.15;
      const noiseB = Math.cos(angle * 2 - t * blob.speed * 2000 + blob.phase) * 0.1;
      const r = baseR * (1 + noiseA + noiseB);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.3);
    grad.addColorStop(0, blob.color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.filter = 'blur(30px)';
    ctx.fill();
    ctx.filter = 'none';
  }

  function animateBlobs(ts) {
    t = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blobs.forEach(b => drawBlob(b));
    requestAnimationFrame(animateBlobs);
  }
  requestAnimationFrame(animateBlobs);
})();

/* ==================== TYPEWRITER ==================== */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const lines = [
    'ERINE & EKIN\nDaily Update ✦',
    'JKT48 Fan Portal 💖',
    'Always Supporting\nErine & Ekin 🌸',
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const current = lines[li];
    if (!deleting) {
      ci++;
      if (ci > current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      ci--;
      if (ci < 0) {
        ci = 0;
        deleting = false;
        li = (li + 1) % lines.length;
        setTimeout(tick, 400);
        return;
      }
    }
    // Render with line breaks and cursor
    const slice = current.slice(0, ci);
    el.innerHTML = slice.replace(/\n/g, '<br>') + '<span class="typed-cursor">|</span>';
    setTimeout(tick, deleting ? 40 : 80);
  }
  tick();
})();

/* ==================== 3D TILT EFFECT ==================== */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 12;
      const rotY =  dx * 12;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;

      const glow = card.querySelector('.card-glow');
      if (glow) {
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        glow.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,79,163,0.22), transparent 65%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}
initTiltCards();

/* ==================== SCROLL REVEAL ==================== */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-title, .about-card, .stat-card, .news-card, .social-card, .tilt-card')
    .forEach(el => { el.classList.add('reveal'); observer.observe(el); });
}
initReveal();

/* ==================== COUNTER ANIMATION ==================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const dur    = 2000;
  const step   = 16;
  const inc    = target / (dur / step);
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + inc, target);
    el.textContent = cur >= 1000000
      ? (cur / 1000000).toFixed(1) + 'M'
      : cur >= 1000
        ? (cur / 1000).toFixed(0) + 'K+'
        : Math.floor(cur) + '+';
    if (cur >= target) clearInterval(t);
  }, step);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ==================== COUNTDOWN ==================== */
(function countdown() {
  const target = new Date('2025-12-31T23:59:59');
  function update() {
    const diff = target - new Date();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    const pad = n => String(n).padStart(2, '0');
    const get = id => document.getElementById(id);
    if (get('cd-days'))  get('cd-days').textContent  = pad(d);
    if (get('cd-hours')) get('cd-hours').textContent = pad(h);
    if (get('cd-mins'))  get('cd-mins').textContent  = pad(m);
    if (get('cd-secs'))  get('cd-secs').textContent  = pad(s);
  }
  update();
  setInterval(update, 1000);
})();

/* ==================== THEME TOGGLE ==================== */
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
  });
}

/* ==================== MOBILE MENU ==================== */
const menuBtn   = document.getElementById('menu-btn');
const navLinks  = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}

/* ==================== NEWS FILTER ==================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ==================== GALLERY LIGHTBOX ==================== */
(function initLightbox() {
  const box = document.createElement('div');
  box.className = 'lightbox';
  const img = document.createElement('img');
  box.appendChild(img);
  document.body.appendChild(box);

  document.querySelectorAll('.gallery-grid img').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.src;
      img.alt = el.alt;
      box.classList.add('active');
    });
  });
  box.addEventListener('click', () => box.classList.remove('active'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') box.classList.remove('active');
  });
})();

/* ==================== MODAL ==================== */
const modal      = document.getElementById('memberModal');
const closeModal = document.querySelector('.close-modal');
if (closeModal && modal) {
  closeModal.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
}

/* ==================== CONTACT FORM ==================== */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sent! 🎉';
    btn.style.background = 'linear-gradient(135deg, #00c853, #00a840)';
    setTimeout(() => {
      btn.textContent = 'Send Message 💌';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

/* ==================== BACK TO TOP ==================== */
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==================== ACTIVE NAV ON SCROLL ==================== */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop, bot = top + sec.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (link) link.style.color = (y >= top && y < bot) ? 'var(--primary)' : '';
  });
}, { passive: true });
