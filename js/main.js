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

// ─── PAUSE HERO HEPT ON PHOTO HOVER + SNAP TO UPRIGHT ───
const heptEl = document.getElementById('heptagonHero');
const photoWrap = document.getElementById('heroPhotoWrap');

if (photoWrap && heptEl) {
  photoWrap.addEventListener('mouseenter', () => {
    // Read current rotation from computed style
    const style = window.getComputedStyle(heptEl);
    const matrix = new DOMMatrix(style.transform);
    const currentAngle = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
    
    // Set current rotation as inline style, pause animation
    heptEl.style.transform = `rotate(${currentAngle}deg)`;
    heptEl.classList.add('paused');
    
    // After a frame, animate to upright scaled position
    requestAnimationFrame(() => {
      heptEl.style.transition = 'transform 0.9s cubic-bezier(.34,1.56,.64,1), opacity 0.9s ease';
      heptEl.style.transform = 'scale(1.2) rotate(0deg)';
      heptEl.style.opacity = '0.7';
    });
  });

  photoWrap.addEventListener('mouseleave', () => {
    heptEl.style.transition = '';
    heptEl.style.transform = '';
    heptEl.style.opacity = '';
    heptEl.classList.remove('paused');
  });
}

// ─── SOLAR SYSTEM (ABOUT) ───
function buildSolarSystem() {
  const sys = document.getElementById('solarSystem');
  const orbitSvg = document.getElementById('orbitSvg');
  if (!sys || !orbitSvg) return;

  const size = 380;
  const cx = size / 2, cy = size / 2;
  orbitSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // 3 orbit circles — EVEN WIDER
  const orbits = [90, 140, 185];
  orbits.forEach(r => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'rgba(0,224,90,0.08)');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('stroke-dasharray', '3 5');
    orbitSvg.appendChild(circle);
  });

  // Badge config — 2X FASTER
  const badges = [
    { id: 'badge0', orbitIdx: 0, speed: 2.4, startAngle: 0 },      // IT Support: inner, fastest
    { id: 'badge1', orbitIdx: 1, speed: 1.7, startAngle: 120 },   // Music: middle, medium
    { id: 'badge2', orbitIdx: 2, speed: 1.2, startAngle: 240 },    // Photo: outer, slower
  ];

  function animateOrbits() {
    badges.forEach(b => {
      const el = document.getElementById(b.id);
      if (!el) return;
      const r = orbits[b.orbitIdx];
      const angle = (performance.now() * b.speed / 1000 + b.startAngle) * (Math.PI / 180);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      el.style.left = (x - el.offsetWidth / 2) + 'px';
      el.style.top  = (y - el.offsetHeight / 2) + 'px';
    });
    requestAnimationFrame(animateOrbits);
  }
  animateOrbits();
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
  glow.id = 'cursorGlow';
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9997;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,rgba(0,224,90,0.05) 0%,transparent 70%);
    transform:translate(-50%,-50%);
    transition:left 0.05s ease,top 0.05s ease;
    left:-999px;top:-999px;
  `;
  document.body.appendChild(glow);
  
  let mouseX = -999, mouseY = -999;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.left = mouseX + 'px';
    glow.style.top = mouseY + 'px';
  }, { passive: true });
  
  // In UV mode, make the glow purple and larger
  const updateGlowForUV = () => {
    if (document.body.classList.contains('uv-mode')) {
      glow.style.width = '420px';
      glow.style.height = '420px';
      glow.style.background = 'radial-gradient(circle,rgba(168,85,247,0.15) 0%,rgba(168,85,247,0.05) 40%,transparent 70%)';
    } else {
      glow.style.width = '320px';
      glow.style.height = '320px';
      glow.style.background = 'radial-gradient(circle,rgba(0,224,90,0.05) 0%,transparent 70%)';
    }
  };
  
  // Watch for UV mode changes
  const observer = new MutationObserver(updateGlowForUV);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

console.log('%c MAT. — Michael Austin Tang', 'color:#00e05a;font-family:monospace;font-size:13px;font-weight:bold;');

// ─── UV MODE TOGGLE + FLASHLIGHT REVEAL ───
const uvToggle = document.getElementById('uvToggle');
const body = document.body;

// Check for saved preference
if (localStorage.getItem('uvMode') === 'true') {
  body.classList.add('uv-mode');
}

uvToggle?.addEventListener('click', () => {
  body.classList.toggle('uv-mode');
  const isUV = body.classList.contains('uv-mode');
  localStorage.setItem('uvMode', isUV);

  // Secret console message in UV mode
  if (isUV) {
    console.clear();
    console.log('%c█████████████████████████████████████████', 'color:#a855f7;font-size:8px');
    console.log('%c     UV MODE ACTIVATED', 'color:#a855f7;font-family:monospace;font-size:16px;font-weight:bold;text-shadow:0 0 10px #a855f7');
    console.log('%c█████████████████████████████████████████', 'color:#a855f7;font-size:8px');
    console.log('%c', 'font-size:1px');
    console.log('%c 7 SECRETS HIDDEN', 'color:#8b5cf6;font-family:monospace;font-size:12px');
    console.log('%c Shine your light to reveal...', 'color:#6d28d9;font-family:monospace;font-size:10px;font-style:italic');
    console.log('%c', 'font-size:1px');
    console.log('%c "Seven is the number of completeness"', 'color:#5b21b6;font-family:monospace;font-size:9px');
  } else {
    console.clear();
    console.log('%c MAT. — Michael Austin Tang', 'color:#00e05a;font-family:monospace;font-size:13px;font-weight:bold;');
  }
});

// Flashlight proximity reveal for UV mode
if (window.innerWidth > 768) {
  let mouseX = 0, mouseY = 0;
  const revealRadius = 220; // Distance threshold for reveal
  
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (body.classList.contains('uv-mode')) {
      updateEasterEggVisibility();
    }
  }, { passive: true });
  
  function updateEasterEggVisibility() {
    const scrollY = window.scrollY;
    
    // Check all easter eggs
    document.querySelectorAll('.easter-egg, .uv-secret-text, .contact-ghost').forEach(el => {
      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;
      
      // Calculate distance from cursor
      const distance = Math.sqrt(Math.pow(mouseX - elX, 2) + Math.pow(mouseY - elY, 2));
      
      if (distance < revealRadius) {
        el.classList.add('revealed');
      } else {
        el.classList.remove('revealed');
      }
    });
  }
  
  // Also update on scroll
  window.addEventListener('scroll', () => {
    if (body.classList.contains('uv-mode')) {
      updateEasterEggVisibility();
    }
  }, { passive: true });
}

// ─── SCROLL TO TOP BUTTON ───
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
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
  const firstName = document.querySelector('.hero-name .first');
  const lastName = document.querySelector('.hero-name .last');
  if (!firstName || !lastName) return;

  const firstText = 'Michael Austin';
  const lastText = 'Tang.';

  firstName.textContent = '';
  lastName.textContent = '';
  firstName.style.opacity = '1';

  let i = 0;
  function typeFirst() {
    if (i < firstText.length) {
      firstName.textContent += firstText[i];
      i++;
      setTimeout(typeFirst, 80);
    } else {
      setTimeout(typeLast, 200);
    }
  }

  let j = 0;
  function typeLast() {
    lastName.style.opacity = '1';
    if (j < lastText.length) {
      lastName.textContent += lastText[j];
      j++;
      setTimeout(typeLast, 80);
    }
  }

  typeFirst();
}

window.addEventListener('load', () => {
  setTimeout(typeHeroName, 400);
});

