/* =========================================================
   MICHAEL AUSTIN TANG — main.js
   ========================================================= */

// ─── CORRECT HEPTAGON MATH (7 sides, starts at top) ───
function heptPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 7;  // Start at top
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

function heptPath(cx, cy, r) {
  const pts = heptPoints(cx, cy, r);
  return 'M' + pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L') + 'Z';
}

// ─── BUILD HERO HEPTAGON SVG WITH MULTIPLE SPEEDS ───
function buildHeroHept() {
  const wrap = document.getElementById('heptagonHero');
  if (!wrap) return;

  const size = wrap.offsetWidth || 380;
  const cx = size / 2, cy = size / 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  // 4 rings with speeds that align every 10 seconds
  // Convergence math: speeds are ratios (1x, 1.2x, 1.5x, 2x) so they converge when slower ones complete full rotations
  const layers = [
    { r: cx * 0.97, stroke: 'rgba(0,224,90,0.08)',  fill: 'none', sw: 1, speed: 36, dotSize: 3 },      // 10s per rotation
    { r: cx * 0.80, stroke: 'rgba(0,224,90,0.14)',  fill: 'none', sw: 1, speed: 43.2, dotSize: 2.5 },  // 8.33s per rotation
    { r: cx * 0.58, stroke: 'rgba(0,224,90,0.24)',  fill: 'rgba(0,224,90,0.03)', sw: 1, speed: 54, dotSize: 2 }, // 6.67s per rotation
    { r: cx * 0.34, stroke: 'rgba(0,224,90,0.45)',  fill: 'rgba(0,77,27,0.15)', sw: 1.5, speed: 72, dotSize: 0 },  // 5s per rotation
  ];

  layers.forEach((l, idx) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `hept-layer hept-layer-${idx}`);
    g.style.transformOrigin = `${cx}px ${cy}px`;
    g.style.transformBox = 'view-box';
    g.style.animation = `heptRing${idx} ${l.speed}s linear infinite`;
    
    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `@keyframes heptRing${idx} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', heptPath(cx, cy, l.r));
    path.setAttribute('stroke', l.stroke);
    path.setAttribute('fill', l.fill);
    path.setAttribute('stroke-width', l.sw);
    g.appendChild(path);

    // Corner dots
    if (l.dotSize > 0) {
      heptPoints(cx, cy, l.r).forEach(([x, y]) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x.toFixed(2));
        dot.setAttribute('cy', y.toFixed(2));
        dot.setAttribute('r', l.dotSize);
        dot.setAttribute('fill', l.stroke.replace('0.08', '0.45').replace('0.14', '0.35').replace('0.24', '0.25'));
        g.appendChild(dot);
      });
    }

    svg.appendChild(g);
  });

  wrap.appendChild(svg);
}

buildHeroHept();

// ─── SCALE RINGS ON PHOTO HOVER ───
const photoWrap = document.getElementById('heroPhotoWrap');
const heptEl = document.getElementById('heptagonHero');

if (photoWrap && heptEl) {
  // Target the SVG directly so scaling doesn't interfere with child <g> animation transforms
  const heptSvg = heptEl.querySelector('svg');

  photoWrap.addEventListener('mouseenter', () => {
    if (heptSvg) heptSvg.style.transform = 'scale(1.15)';
  });

  photoWrap.addEventListener('mouseleave', () => {
    if (heptSvg) heptSvg.style.transform = '';
  });
}

// ─── SOLAR SYSTEM (ABOUT) ───
function buildSolarSystem() {
  const sys = document.getElementById('solarSystem');
  const orbitSvg = document.getElementById('orbitSvg');
  if (!sys || !orbitSvg) return;

  const size = 440;
  const cx = size / 2, cy = size / 2;
  sys.style.width = size + 'px';
  sys.style.height = size + 'px';
  orbitSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // Heptagonal orbit path helper
  function heptPathForOrbit(r) {
    const pts = [];
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 7;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
  }

  // Point-on-heptagon interpolation (0..1 around the perimeter)
  function pointOnHept(r, t) {
    const pts = [];
    for (let i = 0; i <= 7; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 7;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    const perimeter = pts.slice(0, 7).reduce((acc, p, i) => {
      const next = pts[i + 1];
      return acc + Math.hypot(next[0] - p[0], next[1] - p[1]);
    }, 0);
    let target = (t % 1) * perimeter;
    for (let i = 0; i < 7; i++) {
      const seg = Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]);
      if (target <= seg) {
        const f = target / seg;
        return [pts[i][0] + f * (pts[i+1][0] - pts[i][0]),
                pts[i][1] + f * (pts[i+1][1] - pts[i][1])];
      }
      target -= seg;
    }
    return pts[0];
  }

  const orbits = [88, 140, 188];

  // Draw heptagonal orbit paths
  orbits.forEach((r, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', heptPathForOrbit(r));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', `rgba(0,224,90,${0.07 + i * 0.02})`);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '4 7');
    orbitSvg.appendChild(path);
  });

  // Comet dot trails (3 dots per badge, fading)
  const trailDots = [];
  [0, 1, 2].forEach(bi => {
    const dots = [];
    for (let d = 0; d < 4; d++) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', 3 - d * 0.55);
      dot.setAttribute('fill', `rgba(0,224,90,${0.45 - d * 0.1})`);
      orbitSvg.appendChild(dot);
      dots.push(dot);
    }
    trailDots.push(dots);
  });

  const badges = [
    { id: 'badge0', orbitIdx: 0, speed: 0.032, startT: 0 },
    { id: 'badge1', orbitIdx: 1, speed: 0.022, startT: 0.33 },
    { id: 'badge2', orbitIdx: 2, speed: 0.015, startT: 0.66 },
  ];

  let lastTime = null;
  const progress = badges.map(b => b.startT);

  function animateOrbits(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms to avoid jumps
    lastTime = now;

    badges.forEach((b, i) => {
      progress[i] = (progress[i] + b.speed * dt) % 1;
      const [x, y] = pointOnHept(orbits[b.orbitIdx], progress[i]);

      const el = document.getElementById(b.id);
      if (el) {
        el.style.left = (x - el.offsetWidth / 2) + 'px';
        el.style.top  = (y - el.offsetHeight / 2) + 'px';
      }

      // Trail dots slightly behind
      trailDots[i].forEach((dot, d) => {
        const tp = ((progress[i] - (d + 1) * 0.012) + 1) % 1;
        const [tx, ty] = pointOnHept(orbits[b.orbitIdx], tp);
        dot.setAttribute('cx', tx.toFixed(1));
        dot.setAttribute('cy', ty.toFixed(1));
      });
    });

    requestAnimationFrame(animateOrbits);
  }
  requestAnimationFrame(animateOrbits);
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

// ─── CURSOR GLOW (desktop) — RAF lerp for smooth tracking ───
if (window.innerWidth > 900) {
  const glow = document.createElement('div');
  glow.id = 'cursorGlow';
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9997;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,rgba(0,224,90,0.05) 0%,transparent 70%);
    will-change:transform;
    top:0;left:0;
  `;
  document.body.appendChild(glow);

  let mx = -999, my = -999, cx = -999, cy = -999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function tick() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    glow.style.transform = `translate(${cx - 160}px,${cy - 160}px)`;
    requestAnimationFrame(tick);
  })();
}

console.log('%c MAT. — Michael Austin Tang', 'color:#00e05a;font-family:monospace;font-size:13px;font-weight:bold;');

// ─── SCROLL TO TOP BUTTON ───
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── TYPING ANIMATION FOR HERO NAME ───
function typeHeroName() {
  const firstEl  = document.getElementById('heroFirst');
  const lastEl   = document.getElementById('heroLast');
  const discEl   = document.getElementById('heroDiscipline');
  if (!firstEl || !lastEl) return;

  const firstText  = 'Michael Austin';
  const lastText   = 'Tang.';
  const discText   = 'IT · Music · Photography';

  firstEl.textContent = '';
  lastEl.textContent  = '';
  if (discEl) discEl.textContent = '';

  let i = 0;
  function typeFirst() {
    if (i < firstText.length) {
      firstEl.textContent += firstText[i++];
      setTimeout(typeFirst, 72);
    } else {
      setTimeout(typeLast, 180);
    }
  }

  let j = 0;
  function typeLast() {
    if (j < lastText.length) {
      lastEl.textContent += lastText[j++];
      setTimeout(typeLast, 72);
    } else {
      setTimeout(typeDisc, 280);
    }
  }

  let k = 0;
  function typeDisc() {
    if (!discEl) return;
    if (k < discText.length) {
      discEl.textContent += discText[k++];
      setTimeout(typeDisc, 38);
    }
  }

  typeFirst();
}

window.addEventListener('load', () => {
  setTimeout(typeHeroName, 400);
});

