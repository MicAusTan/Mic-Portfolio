/* =========================================================
   MICHAEL AUSTIN TANG — main.js
   ========================================================= */

// ─── CORRECT HEPTAGON MATH (7 sides, starts at top) ───
function heptPoints(cx, cy, r, startAngle) {
  startAngle = startAngle ?? -Math.PI / 2;
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const a = startAngle + (2 * Math.PI * i) / 7;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function heptPath(cx, cy, r, startAngle) {
  const pts = heptPoints(cx, cy, r, startAngle);
  return 'M' + pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L') + 'Z';
}

// ─── BUILD HERO HEPTAGON SVG ───
function buildHeroHept() {
  const wrap = document.getElementById('heptagonHero');
  if (!wrap) return;

  const size = wrap.offsetWidth || 380;
  const cx = size / 2, cy = size / 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  const layers = [
    { r: cx * 0.97, stroke: 'rgba(0,224,90,0.07)',  fill: 'none', sw: 1 },
    { r: cx * 0.78, stroke: 'rgba(0,224,90,0.13)',  fill: 'none', sw: 1 },
    { r: cx * 0.56, stroke: 'rgba(0,224,90,0.22)',  fill: 'rgba(0,224,90,0.03)', sw: 1 },
    { r: cx * 0.32, stroke: 'rgba(0,224,90,0.40)',  fill: 'rgba(0,77,27,0.15)', sw: 1.5 },
  ];

  layers.forEach(l => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', heptPath(cx, cy, l.r));
    path.setAttribute('stroke', l.stroke);
    path.setAttribute('fill', l.fill);
    path.setAttribute('stroke-width', l.sw);
    svg.appendChild(path);
  });

  // Corner dots on outer layer
  heptPoints(cx, cy, cx * 0.97).forEach(([x, y]) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x.toFixed(2));
    dot.setAttribute('cy', y.toFixed(2));
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', 'rgba(0,224,90,0.45)');
    svg.appendChild(dot);
  });

  // Small dots on middle layer
  heptPoints(cx, cy, cx * 0.78).forEach(([x, y]) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x.toFixed(2));
    dot.setAttribute('cy', y.toFixed(2));
    dot.setAttribute('r', '2');
    dot.setAttribute('fill', 'rgba(0,224,90,0.25)');
    svg.appendChild(dot);
  });

  wrap.appendChild(svg);
}

buildHeroHept();

// ─── PAUSE HERO HEPT ON PHOTO HOVER ───
const heptEl = document.getElementById('heptagonHero');
const photoWrap = document.getElementById('heroPhotoWrap');

if (photoWrap && heptEl) {
  photoWrap.addEventListener('mouseenter', () => heptEl.classList.add('paused'));
  photoWrap.addEventListener('mouseleave', () => heptEl.classList.remove('paused'));
}

// ─── SOLAR SYSTEM (ABOUT) ───
function buildSolarSystem() {
  const sys = document.getElementById('solarSystem');
  const orbitSvg = document.getElementById('orbitSvg');
  if (!sys || !orbitSvg) return;

  const size = 320; // matches CSS width/height
  const cx = size / 2, cy = size / 2;
  const orbitR = 118;

  // Draw orbit ring as a circle (simpler, more reliable than hept path for orbit track)
  const orbitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  orbitCircle.setAttribute('cx', cx);
  orbitCircle.setAttribute('cy', cy);
  orbitCircle.setAttribute('r', orbitR);
  orbitCircle.setAttribute('fill', 'none');
  orbitCircle.setAttribute('stroke', 'rgba(0,224,90,0.1)');
  orbitCircle.setAttribute('stroke-width', '1');
  orbitCircle.setAttribute('stroke-dasharray', '4 6');
  orbitSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  orbitSvg.appendChild(orbitCircle);

  // 3 badges evenly spaced (120deg apart)
  const badgeIds = ['badge0', 'badge1', 'badge2'];
  let angleOffset = 0;
  const speed = 0.4; // degrees per frame

  function animateOrbit() {
    const rad = (angleOffset * Math.PI) / 180;
    badgeIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const a = rad + (2 * Math.PI * i) / 3;
      const x = cx + orbitR * Math.cos(a);
      const y = cy + orbitR * Math.sin(a);
      // Center the badge on the orbit point
      el.style.left = (x - el.offsetWidth / 2) + 'px';
      el.style.top  = (y - el.offsetHeight / 2) + 'px';
    });
    angleOffset += speed;
    requestAnimationFrame(animateOrbit);
  }
  animateOrbit();
}

window.addEventListener('load', buildSolarSystem);

// ─── PARTICLES ───
function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;
  const count = window.innerWidth < 768 ? 10 : 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    const size = Math.random() * 2.5 + 1;
    p.style.width = p.style.height = `${size}px`;
    const dur = Math.random() * 14 + 9;
    p.style.animationDuration = `${dur}s`;
    p.style.animationDelay = `-${Math.random() * dur}s`;
    container.appendChild(p);
  }
}
initParticles();

// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ─── SKILL BARS ───
const skillBars = document.querySelectorAll('.skill-bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.width = e.target.dataset.pct + '%';
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
skillBars.forEach(b => barObserver.observe(b));

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1600;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.8 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// ─── NAV: ACTIVE LINK + HAMBURGER ───
const navLinks = document.querySelectorAll('.nav-links a');
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');
const sections = document.querySelectorAll('section[id]');

hamburger?.addEventListener('click', () => {
  const open = navLinksContainer.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

navLinksContainer?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 220) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
  });
}, { passive: true });

// ─── SMOOTH ANCHORS ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ─── CURSOR GLOW (desktop) ───
if (window.innerWidth > 900) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9997;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,rgba(0,224,90,0.05) 0%,transparent 70%);
    transform:translate(-50%,-50%);
    transition:left 0.1s ease,top 0.1s ease;
    left:-999px;top:-999px;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

console.log('%c MAT. — Michael Austin Tang', 'color:#00e05a;font-family:monospace;font-size:13px;font-weight:bold;');
