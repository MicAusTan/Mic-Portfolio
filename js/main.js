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


// ─── SOLAR SYSTEM (ABOUT) ───
function buildSolarSystem() {
  const sys = document.getElementById('solarSystem');
  const orbitSvg = document.getElementById('orbitSvg');
  if (!sys || !orbitSvg) return;

  const size = 480;
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
    if (!perimeter) return pts[0]; // guard: not laid out yet
    let target = (t % 1) * perimeter;
    for (let i = 0; i < 7; i++) {
      const seg = Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]);
      if (target <= seg + 0.0001) {
        const f = seg > 0 ? Math.min(target / seg, 1) : 0;
        return [pts[i][0] + f * (pts[i+1][0] - pts[i][0]),
                pts[i][1] + f * (pts[i+1][1] - pts[i][1])];
      }
      target -= seg;
    }
    return pts[0]; // fallback
  }

  const orbits = [96, 152, 206];

  // Helper: 7 vertex points for a given radius
  function heptVerts(r) {
    const pts = [];
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 7;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  // Draw orbit paths (glow layer + crisp line)
  orbits.forEach((r, i) => {
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', heptPathForOrbit(r));
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', `rgba(0,224,90,${0.06 + i * 0.015})`);
    glow.setAttribute('stroke-width', '4');
    glow.setAttribute('stroke-dasharray', '5 9');
    orbitSvg.appendChild(glow);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', heptPathForOrbit(r));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', `rgba(0,224,90,${0.22 + i * 0.06})`);
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('stroke-dasharray', '5 9');
    orbitSvg.appendChild(path);
  });

  // Vertex flash dots — one per vertex per orbit, light up when badge passes near
  const vertexDots = orbits.map(r => {
    return heptVerts(r).map(([vx, vy]) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', vx.toFixed(1));
      dot.setAttribute('cy', vy.toFixed(1));
      dot.setAttribute('r', '3.5');
      dot.setAttribute('fill', 'none');  // invisible until badge approaches
      orbitSvg.appendChild(dot);
      return { el: dot, x: vx, y: vy, glow: 0 };
    });
  });

  // Comet dot trails
  const trailDots = [];
  [0, 1, 2].forEach(bi => {
    const dots = [];
    for (let d = 0; d < 5; d++) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', (3.5 - d * 0.55).toFixed(2));
      dot.setAttribute('fill', `rgba(0,224,90,${(0.55 - d * 0.1).toFixed(2)})`);
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
  const badgeHalf = badges.map(() => ({ w: 0, h: 0 }));

  // Center heptagon element for rotation
  const centerHept = document.getElementById('centerHept');
  let centerAngle = 0;

  function animateOrbits(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Slowly rotate center heptagon
    centerAngle = (centerAngle + 4 * dt) % 360;
    if (centerHept) {
      centerHept.setAttribute('transform', `rotate(${centerAngle.toFixed(2)}, 50, 50)`);
    }

    badges.forEach((b, i) => {
      progress[i] = (progress[i] + b.speed * dt) % 1;
      const pos = pointOnHept(orbits[b.orbitIdx], progress[i]);
      if (!pos) return;
      const [x, y] = pos;

      const el = document.getElementById(b.id);
      if (el) {
        if (!badgeHalf[i].w && el.offsetWidth) {
          badgeHalf[i].w = el.offsetWidth / 2;
          badgeHalf[i].h = el.offsetHeight / 2;
        }
        const hw = badgeHalf[i].w || 36;
        const hh = badgeHalf[i].h || 14;
        el.style.left = (x - hw) + 'px';
        el.style.top  = (y - hh) + 'px';
      }

      // Vertex glow: proximity-based approach-fade + slow decay after peak
      vertexDots[b.orbitIdx].forEach(v => {
        const dist = Math.hypot(x - v.x, y - v.y);
        // Approach: ramp up as badge gets within 55px, peak at 0px
        const approachGlow = dist < 55 ? Math.pow(1 - dist / 55, 2) : 0;
        // Keep whichever is higher — approach or lingering decay
        v.glow = Math.max(approachGlow, v.glow - dt * 0.7);
        // Fully invisible when glow is near zero — no static dots
        if (v.glow < 0.01) {
          v.el.setAttribute('fill', 'none');
        } else {
          const op = v.glow * 0.9;
          const r  = 3.5 + v.glow * 5;
          v.el.setAttribute('fill', `rgba(0,224,90,${op.toFixed(3)})`);
          v.el.setAttribute('r', r.toFixed(2));
        }
      });

      // Trail dots
      trailDots[i].forEach((dot, d) => {
        const tp = ((progress[i] - (d + 1) * 0.012) + 1) % 1;
        const tp_pos = pointOnHept(orbits[b.orbitIdx], tp);
        if (!tp_pos) return;
        const [tx, ty] = tp_pos;
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
document.querySelectorAll('[data-target].stat-num').forEach(el => counterObs.observe(el));

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

// ─── TYPING ANIMATION — name, discipline, then subtitle ───
function typeHeroName() {
  const firstEl = document.getElementById('heroFirst');
  const lastEl  = document.getElementById('heroLast');
  const discEl  = document.getElementById('heroDiscipline');
  const subEl   = document.getElementById('heroSub');
  if (!firstEl || !lastEl) return;

  const firstText = 'Michael Austin';
  const lastText  = 'Tang.';
  const discText  = 'IT · Music · Photography';
  // Subtitle with inline HTML — typed as plain text then rendered
  const subSegments = [
    { text: 'Vocational student specializing in ', html: false },
    { text: 'Information Technology', html: true, tag: 'strong' },
    { text: ', with a genuine interest in creative problem solving, digital media, and building skills that matter.', html: false },
  ];

  firstEl.textContent = '';
  lastEl.textContent  = '';
  if (discEl) discEl.textContent = '';
  if (subEl)  subEl.innerHTML   = '';

  function typeText(el, text, delay, onDone) {
    let i = 0;
    function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(step, delay);
      } else if (onDone) onDone();
    }
    step();
  }

  typeText(firstEl, firstText, 68, () => {
    setTimeout(() => typeText(lastEl, lastText, 68, () => {
      setTimeout(() => typeText(discEl || { textContent: '' }, discText, 32, () => {
        if (!subEl) return;
        setTimeout(() => {
          // Type subtitle segment by segment
          let segIdx = 0;
          function nextSeg() {
            if (segIdx >= subSegments.length) return;
            const seg = subSegments[segIdx++];
            if (seg.html) {
              const el = document.createElement(seg.tag);
              subEl.appendChild(el);
              typeText(el, seg.text, 28, nextSeg);
            } else {
              const node = document.createTextNode('');
              subEl.appendChild(node);
              let i = 0;
              function stepNode() {
                if (i < seg.text.length) {
                  node.textContent += seg.text[i++];
                  setTimeout(stepNode, 18);
                } else nextSeg();
              }
              stepNode();
            }
          }
          nextSeg();
        }, 200);
      }), 260);
    }), 180);
  });
}

window.addEventListener('load', () => {
  setTimeout(typeHeroName, 400);
});

// ─── KEYBOARD EASTER EGG — type "MAT" anywhere ───
(function() {
  const seq = ['m','a','t'];
  let buf = [];
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    buf.push(e.key.toLowerCase());
    if (buf.length > 3) buf.shift();
    if (buf.join('') === 'mat') {
      buf = [];
      triggerMATEasterEgg();
    }
  });

  function triggerMATEasterEgg() {
    // Burst 7 heptagons from screen center
    for (let i = 0; i < 7; i++) {
      const hept = document.createElement('div');
      const angle = (360 / 7) * i;
      const dist  = 120 + Math.random() * 80;
      hept.style.cssText = `
        position:fixed; z-index:99999; pointer-events:none;
        width:28px; height:28px;
        clip-path:polygon(50% 3%,86.75% 20.7%,95.82% 60.46%,70.39% 92.35%,29.61% 92.35%,4.18% 60.46%,13.25% 20.7%);
        background:rgba(0,224,90,0.85);
        left:50vw; top:50vh;
        transform:translate(-50%,-50%);
        transition:transform 0.7s cubic-bezier(.2,.8,.2,1), opacity 0.7s ease;
        opacity:1;
      `;
      document.body.appendChild(hept);
      requestAnimationFrame(() => {
        const rad = angle * Math.PI / 180;
        const tx  = Math.cos(rad) * dist;
        const ty  = Math.sin(rad) * dist;
        hept.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${angle}deg) scale(0)`;
        hept.style.opacity = '0';
      });
      setTimeout(() => hept.remove(), 800);
    }
  }
})();


// ─── ORBIT BADGE → SKILL CARD HIGHLIGHT ───
document.querySelectorAll('.orbit-badge[data-target]').forEach(badge => {
  badge.addEventListener('click', e => {
    const targetId = badge.dataset.target;
    const card = document.getElementById(targetId);
    if (!card) return;
    // Let the browser scroll first, then flash
    setTimeout(() => {
      card.classList.remove('skill-flash'); // reset if re-clicked quickly
      void card.offsetWidth; // force reflow
      card.classList.add('skill-flash');
      card.addEventListener('animationend', () => card.classList.remove('skill-flash'), { once: true });
    }, 350);
  });
});

// ─── SCROLL PROGRESS BAR ───
const scrollBar = document.getElementById('scrollProgress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
    scrollBar.style.width = pct + '%';
  }, { passive: true });
}

// ─── HERO: PARALLAX TILT + PHOTO HOVER — single unified handler ───
// Both effects write to the same transform, so they must be computed together.
const photoSystem = document.getElementById('heroPhotoSystem');
const photoWrap   = document.getElementById('heroPhotoWrap');
const heptEl      = document.getElementById('heptagonHero');

if (photoSystem && photoWrap && window.innerWidth > 900) {
  const hero    = document.getElementById('home');
  const heptSvg = heptEl ? heptEl.querySelector('svg') : null;
  const clip    = document.getElementById('heroPhotoClip');
  let overPhoto = false;

  hero.addEventListener('mousemove', e => {
    const sysRect   = photoSystem.getBoundingClientRect();
    const wrapRect  = photoWrap.getBoundingClientRect();

    // ── Parallax tilt based on mouse vs photo-system center ──
    const cx = sysRect.left + sysRect.width  / 2;
    const cy = sysRect.top  + sysRect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth  * 0.3);
    const dy = (e.clientY - cy) / (window.innerHeight * 0.3);
    const tiltX = Math.max(-10, Math.min(10, dy * -8));
    const tiltY = Math.max(-10, Math.min(10, dx *  8));

    // ── Hover detection: is mouse inside the photo wrap bounds? ──
    const inside = e.clientX >= wrapRect.left && e.clientX <= wrapRect.right
                && e.clientY >= wrapRect.top  && e.clientY <= wrapRect.bottom;

    if (inside !== overPhoto) {
      overPhoto = inside;
      const scale = inside ? 1.12 : 1;
      photoWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
      if (heptSvg) heptSvg.style.transform = inside ? 'scale(1.15)' : '';
      if (clip)    clip.style.filter = inside ? 'drop-shadow(0 0 32px rgba(0,224,90,0.6))' : '';
    }

    // ── Write tilt once — no other code touches this transform ──
    photoSystem.style.transform =
      `translateY(-50%) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    overPhoto = false;
    photoSystem.style.transform = 'translateY(-50%)';
    photoWrap.style.transform   = 'translate(-50%, -50%)';
    if (heptSvg) heptSvg.style.transform = '';
    if (clip)    clip.style.filter = '';
  });
}

// ─── TRACK SWITCHER ───
(function() {
  const tabs = Array.from(document.querySelectorAll('.track-tab'));
  if (!tabs.length) return;
  const audio    = document.getElementById('trackAudio');
  const nameEl   = document.getElementById('audioTrackName');
  const miniName = document.getElementById('miniTrackName');
  const flImg    = document.getElementById('flPeekImg');
  const flLabel  = document.getElementById('flPeekLabel');

  function activateTab(tab) {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const wasPlaying = audio && !audio.paused;
    if (audio) {
      audio.pause();
      audio.src = tab.dataset.src;
      audio.load();
      if (wasPlaying) audio.play().catch(() => {});
    }
    if (nameEl)   nameEl.textContent   = tab.dataset.label;
    if (miniName) miniName.textContent = tab.dataset.label;
    if (flImg)    flImg.src            = tab.dataset.img;
    if (flLabel)  flLabel.textContent  = tab.dataset.label + ' / FL Studio';

    ['audioBar','miniBar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = '0';
    });
    ['audioTimeCur','miniTime'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0:00';
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));

  // Mini player prev/next
  function skipTrack(dir) {
    const current = tabs.findIndex(t => t.classList.contains('active'));
    const next = (current + dir + tabs.length) % tabs.length;
    activateTab(tabs[next]);
  }

  const prevBtn = document.getElementById('miniPrevBtn');
  const nextBtn = document.getElementById('miniNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => skipTrack(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => skipTrack(1));
})();


// ─── EXPERIENCE CREATIVE TABS ───
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const group = tab.closest('.exp-creative');
    group.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
    group.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

// ─── INTERACTIVE TERMINAL ───
(function initTerm() {
  // Defer until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerm);
    return;
  }
  const input = document.getElementById('expTermInput');
  const body  = document.getElementById('expTermBody');
  if (!input || !body) return;

  // User-defined aliases: alias <name> <output>
  const aliases = {};

  const responses = {
    help: () => [
      'Commands available:',
      '  status   — current system status',
      '  ping     — test connection',
      '  whoami   — current user info',
      '  tasks    — active daily tasks',
      '  skills   — loaded skill modules',
      '  alias <name> <text>  — define your own command',
      '  clear    — clear terminal',
      Object.keys(aliases).length
        ? '  user aliases: ' + Object.keys(aliases).join(', ')
        : '  (no aliases yet — try: alias hi Hello there!)',
    ],
    status: () => [
      '[OK]  Hardware support: online',
      '[OK]  File management: active',
      '[OK]  User assistance: running',
      '[  ]  Formal IT certification: pending',
    ],
    ping: () => [
      'PING school-network.local',
      'Reply from 192.168.1.1: time=2ms',
      'Reply from 192.168.1.1: time=1ms',
      'Packet loss: 0% — connection stable',
    ],
    whoami: () => [
      'michael-tang',
      'Role: Student IT Support',
      'School: Sekolah Harapan Utama',
      'Status: Active since Jan 2024',
    ],
    tasks: () => [
      '1. Troubleshoot hardware issues      [daily]',
      '2. Software installation & setup     [weekly]',
      '3. Assist teachers with projectors   [daily]',
      '4. Organize shared digital files     [ongoing]',
    ],
    skills: () => [
      '[loaded]  troubleshooting v2.4',
      '[loaded]  file-management v1.8',
      '[loaded]  windows-os v10.0',
      '[loaded]  communication v3.1',
      '[loaded]  patience v9.9',
    ],
  };

  function addLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'exp-term-line';
    const span = document.createElement('span');
    span.className = cls || 'exp-term-response';
    span.textContent = text;
    div.appendChild(span);
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function addInput(cmd) {
    const div = document.createElement('div');
    div.className = 'exp-term-line';
    div.innerHTML = `<span class="term-prompt">$</span><span style="color:var(--white);margin-left:0.5rem">${cmd}</span>`;
    body.appendChild(div);
  }

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    addInput(raw);
    const parts = raw.toLowerCase().split(/\s+/);
    const cmd   = parts[0];

    if (cmd === 'clear') { body.innerHTML = ''; return; }

    // alias command
    if (cmd === 'alias') {
      const name = parts[1];
      const val  = raw.slice(raw.indexOf(parts[1]) + parts[1].length).trim();
      if (!name || !val) {
        addLine('Usage: alias <name> <output text>', 'exp-term-error');
      } else {
        aliases[name] = val;
        addLine(`Alias created: "${name}" → "${val}"`, 'exp-term-response');
      }
      return;
    }

    // user alias
    if (aliases[cmd]) {
      addLine(aliases[cmd]); return;
    }

    // built-in
    const fn = responses[cmd];
    if (fn) {
      fn().forEach((line, i) => setTimeout(() => addLine(line), i * 55));
    } else {
      addLine(`command not found: ${cmd} — type 'help' for commands`, 'exp-term-error');
    }
  });

  input.closest('.exp-terminal').addEventListener('click', () => input.focus());
})();


// ─── LIGHTBOX ───
(function() {
  const overlay    = document.getElementById('lightboxOverlay');
  const closeBtn   = document.getElementById('lightboxClose');
  const imgWrap    = document.getElementById('lightboxImgWrap');
  const baWrap     = document.getElementById('lightboxBaWrap');
  const lbImg      = document.getElementById('lightboxImg');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbBaSlider = document.getElementById('lightboxBaSlider');
  const lbAfter    = document.getElementById('lbAfterImg');
  const lbBefore   = document.getElementById('lbBeforeImg');
  const lbHandle   = document.getElementById('lbHandle');
  const lbBeforeWrap = document.getElementById('lbBeforeWrap');
  const lbBaCaption = document.getElementById('lightboxBaCaption');
  if (!overlay) return;

  // BA drag for lightbox — uses new wrapper-clip approach
  let lbDragging = false;
  function lbSetPos(clientX) {
    const s = document.getElementById('lightboxBaSlider');
    if (!s) return;
    const rect = s.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const lbBC = document.getElementById('lbBeforeClip');
    const lbD  = document.getElementById('lbDivider');
    if (lbBC) lbBC.style.width = (pct * 100) + '%';
    if (lbD)  lbD.style.left   = (pct * 100) + '%';
  }
  const lbBaSlider2 = document.getElementById('lightboxBaSlider');
  if (lbBaSlider2) {
    lbBaSlider2.addEventListener('mousedown',  e => { lbDragging = true; lbSetPos(e.clientX); });
    lbBaSlider2.addEventListener('touchstart', e => { lbDragging = true; lbSetPos(e.touches[0].clientX); }, { passive: true });
  }
  window.addEventListener('mousemove', e => { if (lbDragging) lbSetPos(e.clientX); });
  window.addEventListener('touchmove', e => { if (lbDragging) lbSetPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup',   () => lbDragging = false);
  window.addEventListener('touchend',  () => lbDragging = false);

  function open() { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function close() { overlay.classList.remove('active'); document.body.style.overflow = ''; }

  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Image lightbox
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.lightbox-trigger');
    if (!trigger) return;
    imgWrap.style.display  = 'flex';
    baWrap.style.display   = 'none';
    lbImg.src              = trigger.src || trigger.dataset.src;
    lbCaption.textContent  = trigger.dataset.caption || trigger.alt || '';
    open();
  });

  // BA lightbox (called from multi-example code)
  window.openBaLightbox = function(idx) {
    const ex = window._baExamples && window._baExamples[idx];
    if (!ex) return;
    imgWrap.style.display  = 'none';
    baWrap.style.display   = 'flex';
    const lbA  = document.getElementById('lbAfterImg');
    const lbB  = document.getElementById('lbBeforeImg');
    const lbBC = document.getElementById('lbBeforeClip');
    const lbD  = document.getElementById('lbDivider');
    if (lbA)  lbA.src  = ex.after;
    if (lbB)  lbB.src  = ex.before;
    if (lbBC) lbBC.style.width = '50%';
    if (lbD)  lbD.style.left   = '50%';
    if (lbBaCaption) lbBaCaption.textContent = ex.label;
    open();
  };

  // Exp panel image clicks (FL screenshot in experience)
  document.querySelectorAll('.exp-img').forEach(img => {
    img.classList.add('lightbox-trigger');
    img.style.cursor = 'zoom-in';
    img.dataset.caption = img.alt || '';
  });

  // Exp thumb clicks
  document.querySelectorAll('.exp-thumb img').forEach(img => {
    img.classList.add('lightbox-trigger');
    img.style.cursor = 'zoom-in';
    const cap = img.closest('.exp-thumb')?.querySelector('span');
    img.dataset.caption = cap ? cap.textContent : '';
  });
})();



// ─── BEFORE / AFTER SLIDER (skill card) ───
// Pattern: after image at back, before image inside overflow:hidden wrapper whose width is controlled by JS
// The before image itself is set to the container's actual pixel width so it never shrinks with its wrapper
(function() {
  const examples = [
    { before: 'assets/devinguitart.png',      after: 'assets/elvis_ciputra.png',    label: 'Guitar Edit' },
    { before: 'assets/herobannerbefore.png',   after: 'assets/hero-banner-dark.jpg', label: 'Dark Banner' },
    { before: 'assets/precipice1.png',         after: 'assets/precipicingaft.png',   label: 'Precipice' },
  ];
  let current = 0;
  let dragging = false;

  const container  = document.getElementById('baSlider');
  const beforeClip = document.getElementById('baBeforeClip');
  const beforeInner= document.getElementById('baBeforeImg');
  const afterImg   = document.getElementById('baAfterImg');
  const divider    = document.getElementById('baDivider');
  const navLabel   = document.getElementById('baNavLabel');
  const prevBtn    = document.getElementById('baPrev');
  const nextBtn    = document.getElementById('baNext');
  const expandBtn  = document.getElementById('baExpandBtn');
  if (!container || !beforeClip || !beforeInner || !divider) return;

  function syncBeforeWidth() {
    // Keep before inner image anchored at full container width
    beforeInner.style.width = container.offsetWidth + 'px';
  }

  function setPos(pct) {
    pct = Math.max(0, Math.min(1, pct));
    syncBeforeWidth();
    beforeClip.style.width = (pct * 100) + '%';
    divider.style.left     = (pct * 100) + '%';
  }

  function getPct(clientX) {
    const rect = container.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }

  container.addEventListener('mousedown', e => {
    if (expandBtn && (e.target === expandBtn || expandBtn.contains(e.target))) return;
    dragging = true;
    setPos(getPct(e.clientX));
  });
  container.addEventListener('touchstart', e => {
    dragging = true;
    setPos(getPct(e.touches[0].clientX));
  }, { passive: true });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(getPct(e.clientX)); });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(getPct(e.touches[0].clientX)); }, { passive: true });
  window.addEventListener('mouseup',    () => dragging = false);
  window.addEventListener('touchend',   () => dragging = false);

  function loadExample(idx) {
    current = ((idx % examples.length) + examples.length) % examples.length;
    const ex = examples[current];
    afterImg.src  = ex.after;
    beforeInner.src = ex.before;
    navLabel.textContent = ex.label + ' · ' + (current + 1) + ' / ' + examples.length;
    setPos(0.5);
  }

  prevBtn  && prevBtn.addEventListener('click',  () => loadExample(current - 1));
  nextBtn  && nextBtn.addEventListener('click',  () => loadExample(current + 1));
  expandBtn && expandBtn.addEventListener('click', e => {
    e.stopPropagation();
    window.openBaLightbox && window.openBaLightbox(current);
  });

  window.addEventListener('resize', syncBeforeWidth);

  loadExample(0);
  window._baExamples = examples;
})();

// ========== CLAW MACHINE ==========
(function() {
  const canvas = document.getElementById('clawCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // ── Prize definitions ──
  const ALL_PRIZES = [
    { id:'kielick',   src:'assets/kielickbg.png',   name:'Kiel',    effect:'shake'    },
    { id:'nazshine',  src:'assets/nazshine.jpg',     name:'Naz✨',   effect:'flash'    },
    { id:'rahmadaura',src:'assets/rahmadaurabg.png', name:'Rahmad🌑',effect:'dark'     },
    { id:'gavban',    src:'assets/gavban.png',        name:'Gav🍜',   effect:'nograv'   },
    { id:'kiewle',    src:'assets/kiewle.png',        name:'Kie',     effect:'trail'    },
    { id:'kevinbg',   src:'assets/kevinbg.png',       name:'Kevin🥛', effect:'grow'     },
    { id:'devenier',  src:'assets/devenierbg.png',    name:'Deven',   effect:'clone'    },
    { id:'kieheheh',  src:'assets/kieheheh.jpg',      name:'Kie😂',   effect:'flip'     },
    { id:'naufalbg',  src:'assets/naufalbg.png',      name:'Naufal',  effect:'fast'     },
    { id:'justinfour',src:'assets/justinfour.png',    name:'Justin',  effect:'split'    },
    { id:'RezBG',     src:'assets/RezBG.png',         name:'Rez',     effect:'reverse'  },
    { id:'rezmotorbg',src:'assets/rezmotorbg.jpg',    name:'Rez🏍️',  effect:'gold'     },
    { id:'rahmadBG',  src:'assets/rahmadBG.png',      name:'Rahmad',  effect:'normal'   },
    { id:'gavril',    src:'assets/gavril.png',         name:'Gavril',  effect:'normal'   },
    { id:'NazBG',     src:'assets/NazBG.png',          name:'Naz',     effect:'normal'   },
  ];

  // Pick 8 random prizes for this session, shuffle rest back in when depleted
  let remaining = [...ALL_PRIZES].sort(() => Math.random() - 0.5);
  const collected = new Set();

  // Preload images
  const imgs = {};
  ALL_PRIZES.forEach(p => {
    const im = new Image();
    im.src = p.src;
    imgs[p.id] = im;
  });

  // ── Machine state ──
  const PRIZE_SIZE = 54;
  const MACHINE_TOP = 60, MACHINE_LEFT = 30, MACHINE_RIGHT = W - 30;
  const FLOOR = H - 50;
  const prizes = [];

  function spawnPrizes() {
    prizes.length = 0;
    // Filter out already collected, pick up to 8
    const pool = remaining.filter(p => !collected.has(p.id)).slice(0, 8);
    for (let i = 0; i < pool.length; i++) {
      prizes.push({
        prize: pool[i],
        x: MACHINE_LEFT + 30 + Math.random() * (MACHINE_RIGHT - MACHINE_LEFT - 80),
        y: MACHINE_TOP + 80 + Math.random() * (FLOOR - MACHINE_TOP - 160),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }
  }
  spawnPrizes();

  // ── Claw state ──
  let clawX = W / 2;
  let clawY = MACHINE_TOP + 20;
  let clawState = 'idle'; // idle | dropping | grabbing | rising | releasing
  let clawOpen = true;
  let grabbed = null;
  let clawTargetY = MACHINE_TOP + 20;
  let dropTargetY = 0;
  let moveDir = 0;
  let controlsReversed = false;

  // ── Controls ──
  const leftBtn = document.getElementById('clawLeft');
  const rightBtn = document.getElementById('clawRight');
  const dropBtn  = document.getElementById('clawDrop');

  function handleLeft()  { if (clawState === 'idle') moveDir = controlsReversed ? 1 : -1; }
  function handleRight() { if (clawState === 'idle') moveDir = controlsReversed ? -1 : 1; }
  function stopMove()    { moveDir = 0; }

  leftBtn.addEventListener('mousedown',  handleLeft);
  leftBtn.addEventListener('touchstart', handleLeft, {passive:true});
  rightBtn.addEventListener('mousedown',  handleRight);
  rightBtn.addEventListener('touchstart', handleRight, {passive:true});
  document.addEventListener('mouseup',  stopMove);
  document.addEventListener('touchend', stopMove);

  dropBtn.addEventListener('click', () => {
    if (clawState !== 'idle') return;
    clawState = 'dropping';
    clawOpen = true;
    dropBtn.disabled = true;
    // Find what the claw might hit — drop to prize center
    dropTargetY = FLOOR - 10;
    for (const p of prizes) {
      if (Math.abs(p.x + (p.pw||PRIZE_SIZE)/2 - clawX) < (p.pw||PRIZE_SIZE) * 0.75) {
        // pin must be CLAW_TIP above prize center for tips to reach it
        dropTargetY = Math.min(dropTargetY, p.y + (p.ph||PRIZE_SIZE) * 0.4 - 28);
      }
    }
  });

  // ── Drop/grab physics ──
  // Claw success chance: 72% — harder than guaranteed but not brutal
  const CLAW_TIP = 28; // claw arms extend this far below the pin
  function attemptGrab() {
    const tipY = clawY + CLAW_TIP;
    const candidates = prizes.filter(p =>
      Math.abs(p.x + (p.pw||PRIZE_SIZE)/2 - clawX) < (p.pw||PRIZE_SIZE) * 0.85 &&
      tipY >= p.y - 5 && tipY <= p.y + (p.ph||PRIZE_SIZE) + 5
    );
    if (!candidates.length) return null;
    if (Math.random() > 0.72) return null; // ~72% success
    return candidates[0];
  }

  // ── Main loop ──
  let last = 0;
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Move claw horizontally
    if (clawState === 'idle' && moveDir !== 0) {
      clawX = Math.max(MACHINE_LEFT + 20, Math.min(MACHINE_RIGHT - 20, clawX + moveDir * 160 * dt));
    }

    // Dropping
    if (clawState === 'dropping') {
      clawY += 180 * dt;
      if (clawY >= dropTargetY) {
        clawY = dropTargetY;
        clawOpen = false;
        grabbed = attemptGrab();
        clawState = 'rising';
        if (grabbed) {
          prizes.splice(prizes.indexOf(grabbed), 1);
        }
      }
    }

    // Rising
    if (clawState === 'rising') {
      clawY -= 160 * dt;
      if (grabbed) { grabbed.x = clawX - PRIZE_SIZE/2; grabbed.y = clawY + 30; }
      if (clawY <= MACHINE_TOP + 20) {
        clawY = MACHINE_TOP + 20;
        clawState = 'releasing';
        setTimeout(() => {
          if (grabbed) addToInventory(grabbed.prize);
          else showMiss();
          grabbed = null;
          clawOpen = true;
          clawState = 'idle';
          dropBtn.disabled = false;
          if (prizes.length === 0) {
            remaining = [...ALL_PRIZES].filter(p => !collected.has(p.id)).sort(() => Math.random() - 0.5);
            spawnPrizes();
          }
        }, 400);
      }
    }

    // Gentle prize drift
    prizes.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < MACHINE_LEFT + 5) { p.x = MACHINE_LEFT + 5; p.vx *= -1; }
      if (p.x + PRIZE_SIZE > MACHINE_RIGHT - 5) { p.x = MACHINE_RIGHT - PRIZE_SIZE - 5; p.vx *= -1; }
      if (p.y < MACHINE_TOP + 60) { p.y = MACHINE_TOP + 60; p.vy *= -1; }
      if (p.y + PRIZE_SIZE > FLOOR - 5) { p.y = FLOOR - PRIZE_SIZE - 5; p.vy *= -1; }
    });

    draw();
    requestAnimationFrame(loop);
  }

  // ── Drawing ──
  function drawClaw(x, y, open) {
    ctx.strokeStyle = '#00e05a';
    ctx.lineWidth = 2.5;
    // Wire from top
    ctx.beginPath(); ctx.moveTo(x, MACHINE_TOP); ctx.lineTo(x, y); ctx.stroke();
    // Claw arms
    const spread = open ? 18 : 8;
    ctx.beginPath();
    ctx.moveTo(x - spread, y);
    ctx.quadraticCurveTo(x - spread - 8, y + 18, x - spread - 4, y + 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + spread, y);
    ctx.quadraticCurveTo(x + spread + 8, y + 18, x + spread + 4, y + 28);
    ctx.stroke();
    // Center pin
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00e05a'; ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Machine frame
    ctx.strokeStyle = 'rgba(0,224,90,0.3)';
    ctx.lineWidth = 1.5;
    // Glass box
    ctx.strokeRect(MACHINE_LEFT, MACHINE_TOP, MACHINE_RIGHT - MACHINE_LEFT, FLOOR - MACHINE_TOP);
    // Top rail
    ctx.fillStyle = 'rgba(0,224,90,0.12)';
    ctx.fillRect(MACHINE_LEFT, MACHINE_TOP, MACHINE_RIGHT - MACHINE_LEFT, 8);
    // Floor
    ctx.fillStyle = 'rgba(0,224,90,0.06)';
    ctx.fillRect(MACHINE_LEFT, FLOOR - 6, MACHINE_RIGHT - MACHINE_LEFT, 6);

    // Guide lines on ceiling
    ctx.setLineDash([3, 8]);
    ctx.strokeStyle = 'rgba(0,224,90,0.1)';
    ctx.beginPath(); ctx.moveTo(clawX, MACHINE_TOP); ctx.lineTo(clawX, MACHINE_TOP + 8); ctx.stroke();
    ctx.setLineDash([]);

    // Prizes — draw at natural aspect ratio, max 72px tall
    prizes.forEach(p => {
      const im = imgs[p.prize.id];
      if (im && im.complete && im.naturalWidth > 0) {
        const aspect = im.naturalWidth / im.naturalHeight;
        const ph = Math.min(72, im.naturalHeight);
        const pw = ph * aspect;
        // Store actual draw size on prize object for hitbox use
        p.pw = pw; p.ph = ph;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, pw, ph, 6);
        ctx.clip();
        ctx.drawImage(im, p.x, p.y, pw, ph);
        ctx.restore();
        // Name tag
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(p.x, p.y + ph - 13, pw, 13);
        ctx.fillStyle = '#6b9c7e';
        ctx.font = '8px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.prize.name, p.x + pw/2, p.y + ph - 3);
      } else {
        p.pw = PRIZE_SIZE; p.ph = PRIZE_SIZE;
        ctx.fillStyle = 'rgba(0,224,90,0.15)';
        ctx.beginPath(); ctx.roundRect(p.x, p.y, PRIZE_SIZE, PRIZE_SIZE, 8); ctx.fill();
        ctx.fillStyle = '#00e05a'; ctx.font = '9px Space Mono'; ctx.textAlign = 'center';
        ctx.fillText(p.prize.name, p.x + PRIZE_SIZE/2, p.y + PRIZE_SIZE/2);
      }
    });

    // Grabbed prize held by claw
    if (grabbed && imgs[grabbed.prize.id]) {
      const im = imgs[grabbed.prize.id];
      const pw = grabbed.pw || PRIZE_SIZE;
      const ph = grabbed.ph || PRIZE_SIZE;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(grabbed.x, grabbed.y, pw, ph, 8);
      ctx.clip();
      ctx.drawImage(im, grabbed.x, grabbed.y, pw, ph);
      ctx.restore();
    }

    drawClaw(clawX, clawY, clawOpen);

    // Miss flash text
    if (missFlash > 0) {
      ctx.globalAlpha = Math.min(1, missFlash);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 20px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DROPPED!', W/2, H/2);
      ctx.globalAlpha = 1;
      missFlash -= 0.04;
    }
  }

  let missFlash = 0;
  function showMiss() { missFlash = 1.5; }

  requestAnimationFrame(loop);

  // ── Inventory ──
  const invSlots = document.getElementById('invSlots');
  function addToInventory(prize) {
    collected.add(prize.id);
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    slot.innerHTML = `<img src="${prize.src}" alt="${prize.name}" draggable="false"><span class="inv-name">${prize.name}</span>`;
    slot.title = 'Drag to release!';
    slot.addEventListener('mousedown', e => startDragFromInventory(e, prize, slot));
    slot.addEventListener('touchstart', e => startDragFromInventory(e, prize, slot), {passive:true});
    invSlots.appendChild(slot);

    // Green flash on canvas
    ctx.fillStyle = 'rgba(0,224,90,0.18)';
    ctx.fillRect(0, 0, W, H);
  }

  // ── Physics playground ──
  const overlay = document.getElementById('physicsOverlay');
  const physObjects = [];
  let reverseTimeout = null;

  function startDragFromInventory(e, prize, slotEl) {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    spawnPhysObject(prize, clientX, clientY, slotEl);
  }

  function spawnPhysObject(prize, startX, startY, slotEl) {
    const imgEl = imgs[prize.id];
    const { w: PW, h: PH } = getPrizeDisplaySize(prize.effect, imgEl);
    const el = document.createElement('div');
    el.className = 'phys-obj';
    el.style.width = PW + 'px';
    el.style.height = PH + 'px';
    el.style.left = (startX - PW/2) + 'px';
    el.style.top  = (startY - PH/2) + 'px';
    el.innerHTML = `<img src="${prize.src}" alt="${prize.name}" draggable="false">`;
    overlay.appendChild(el);

    const obj = {
      el, prize,
      x: startX - PW/2, y: startY - PH/2,
      vx: (Math.random()-0.5)*4, vy: -3,
      size: PW, sizeH: PH,
      dragging: false,
      dragOffX: 0, dragOffY: 0,
      trailEls: [],
      growTime: 0,
      flipped: false,
      flipTimer: 0,
    };
    physObjects.push(obj);

    if (slotEl) slotEl.remove();
    applyEntryEffect(obj);
    setupObjDrag(obj);
  }

  function getPrizeDisplaySize(effect, imgEl) {
    // Use natural image size, cap height at 130px, preserve aspect
    if (imgEl && imgEl.naturalWidth > 0) {
      const maxH = effect === 'grow' ? 90 : effect === 'split' ? 80 : 130;
      const h = Math.min(imgEl.naturalHeight, maxH);
      const w = h * (imgEl.naturalWidth / imgEl.naturalHeight);
      return { w: Math.round(w), h: Math.round(h) };
    }
    return { w: 90, h: 90 };
  }

  function applyEntryEffect(obj) {
    switch(obj.prize.effect) {
      case 'gold':
        obj.el.style.boxShadow = '0 0 20px gold, 0 0 40px rgba(255,215,0,0.4)';
        obj.el.style.filter = 'sepia(0.5) brightness(1.3)';
        break;
      case 'trail':
        obj.el.style.filter = 'contrast(1.1) saturate(1.2)';
        break;
    }
  }

  function isOverInventory(cx, cy) {
    const inv = document.getElementById('clawInventory');
    if (!inv) return false;
    const r = inv.getBoundingClientRect();
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }

  function setupObjDrag(obj) {
    function onDown(e) {
      obj.dragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      obj.dragOffX = cx - obj.x;
      obj.dragOffY = cy - obj.y;
      obj.vx = 0; obj.vy = 0;
    }
    function onMove(e) {
      if (!obj.dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const nx = cx - obj.dragOffX;
      const ny = cy - obj.dragOffY;
      obj.vx = (nx - obj.x) * 0.3;
      obj.vy = (ny - obj.y) * 0.3;
      obj.x = nx; obj.y = ny;
      // Highlight inventory when hovering over it
      const inv = document.getElementById('clawInventory');
      if (inv) inv.classList.toggle('inv-drop-hover', isOverInventory(cx, cy));
    }
    function onUp(e) {
      if (!obj.dragging) return;
      obj.dragging = false;
      const cx = e.touches ? e.changedTouches[0].clientX : e.clientX;
      const cy = e.touches ? e.changedTouches[0].clientY : e.clientY;
      // Remove inventory hover state
      const inv = document.getElementById('clawInventory');
      if (inv) inv.classList.remove('inv-drop-hover');
      // Only return to inventory if moving slowly (not a fast throw)
      const speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
      if (isOverInventory(cx, cy) && speed < 6) {
        returnToInventory(obj);
      }
    }
    obj.el.addEventListener('mousedown',  onDown);
    obj.el.addEventListener('touchstart', onDown, {passive:true});
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('touchmove',  onMove, {passive:true});
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);
  }

  function returnToInventory(obj) {
    // Remove physics object from overlay and list
    obj.el.remove();
    const idx = physObjects.indexOf(obj);
    if (idx !== -1) physObjects.splice(idx, 1);
    // Clear any side effects it may have applied
    if (obj.prize.effect === 'reverse') {
      controlsReversed = false;
      if (reverseTimeout) { clearTimeout(reverseTimeout); reverseTimeout = null; }
    }
    // Re-add to inventory
    addToInventory(obj.prize);
  }

  // ── Physics tick ──
  function physTick() {
    const VW = window.innerWidth, VH = window.innerHeight;
    physObjects.forEach(obj => {
      if (obj.dragging) { updateEl(obj); return; }

      const GRAVITY = obj.prize.effect === 'nograv' ? 0 : 0.35;
      const SPEED_MULT = obj.prize.effect === 'fast' ? 2.2 : 1;

      obj.vy += GRAVITY;
      obj.x += obj.vx * SPEED_MULT;
      obj.y += obj.vy * SPEED_MULT;

      // Flip timer
      if (obj.flipped) {
        obj.flipTimer -= 0.016;
        if (obj.flipTimer <= 0) {
          obj.flipped = false;
          obj.el.style.transform = '';
        }
      }

      // Wall collisions
      let hitWall = false;
      if (obj.x < 0) { obj.x = 0; obj.vx = Math.abs(obj.vx) * 0.8; hitWall = true; }
      if (obj.x + obj.size > VW) { obj.x = VW - obj.size; obj.vx = -Math.abs(obj.vx) * 0.8; hitWall = true; }
      if (obj.y < 0) { obj.y = 0; obj.vy = Math.abs(obj.vy) * 0.8; hitWall = true; }
      if (obj.y + obj.size > VH) { obj.y = VH - obj.size; obj.vy = -Math.abs(obj.vy) * 0.85; obj.vx *= 0.92; hitWall = true; }

      const speed = Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy);

      if (hitWall && speed > 4) {
        triggerWallEffect(obj, speed);
      }

      // Trail effect
      if (obj.prize.effect === 'trail' && speed > 1.5) {
        spawnTrailDot(obj);
      }

      updateEl(obj);
    });
    requestAnimationFrame(physTick);
  }
  requestAnimationFrame(physTick);

  function updateEl(obj) {
    obj.el.style.left = obj.x + 'px';
    obj.el.style.top  = obj.y + 'px';
  }

  function triggerWallEffect(obj, speed) {
    switch(obj.prize.effect) {
      case 'shake':
        if (speed > 5) screenShake(Math.min(speed * 1.2, 18));
        break;
      case 'flash':
        flashScreen('rgba(255,255,180,0.5)', 180, obj);
        break;
      case 'dark':
        flashScreen('rgba(0,0,0,0.5)', 220, obj);
        break;
      case 'grow':
        // Grow a step each bounce, cap at 3x original size
        if (!obj.growSteps) obj.growSteps = 0;
        if (obj.growSteps < 12) {
          obj.growSteps++;
          const newW = obj.size + obj.growSteps * 10;
          const newH = (obj.sizeH || obj.size) + obj.growSteps * 10;
          obj.el.style.width  = newW + 'px';
          obj.el.style.height = newH + 'px';
        }
        break;
      case 'flip':
        if (!obj.flipped && speed > 4) {
          obj.flipped = true;
          obj.flipTimer = 1.8;
          obj.el.style.transform = 'rotate(180deg)';
        }
        break;
      case 'clone': {
        const total = physObjects.filter(o => o.prize.id === obj.prize.id).length;
        const now2 = Date.now();
        if (!obj.lastClone) obj.lastClone = 0;
        // Global cap of 4, per-object cooldown of 2s, speed threshold
        if (speed > 7 && total < 4 && now2 - obj.lastClone > 2000) {
          obj.lastClone = now2;
          spawnPhysObject(obj.prize, obj.x + obj.size/2 + (Math.random()-0.5)*60,
                          obj.y + obj.size/2, null);
          const newObj = physObjects[physObjects.length-1];
          // Mark clones so they don't chain-clone
          newObj.isClone = true;
          newObj.lastClone = now2;
          newObj.vx = -obj.vx * 0.8;
          newObj.vy = obj.vy * 0.6;
        }
        break;
      }
      case 'split':
        if (speed > 8 && physObjects.filter(o=>o.prize.id===obj.prize.id).length < 5) {
          for (let i = 0; i < 3; i++) {
            spawnPhysObject(obj.prize, obj.x + obj.size/2, obj.y + obj.size/2, null);
            const s = physObjects[physObjects.length-1];
            s.size = 45; s.el.style.width = '45px'; s.el.style.height = '45px';
            s.vx = (Math.random()-0.5)*10; s.vy = -Math.random()*6;
          }
        }
        break;
      case 'reverse':
        if (!controlsReversed) {
          controlsReversed = true;
          if (reverseTimeout) clearTimeout(reverseTimeout);
          reverseTimeout = setTimeout(() => { controlsReversed = false; }, 5000);
          showToast('Controls reversed! 😵');
        }
        break;
    }
  }

  function spawnTrailDot(obj) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;width:${obj.size*0.3}px;height:${obj.size*0.3}px;
      border-radius:50%;background:rgba(0,224,90,0.35);
      left:${obj.x+obj.size*0.35}px;top:${obj.y+obj.size*0.35}px;
      pointer-events:none;z-index:9499;transition:opacity 0.5s`;
    overlay.appendChild(dot);
    setTimeout(() => { dot.style.opacity='0'; }, 80);
    setTimeout(() => dot.remove(), 600);
  }

  function screenShake(intensity) {
    // Use the canvas element only — avoids full layout repaint from body transform
    const target = canvas;
    let t = 0;
    const dur = 14;
    const origTransform = target.style.transform || '';
    function shake() {
      if (t++ > dur) { target.style.transform = origTransform; return; }
      const d = intensity * (1 - t/dur) * 0.6;
      target.style.transform = `translate(${(Math.random()-0.5)*d}px,${(Math.random()-0.5)*d}px)`;
      requestAnimationFrame(shake);
    }
    requestAnimationFrame(shake);
  }

  function flashScreen(color, ms, obj) {
    // Local flash at collision point, not fullscreen
    const cx = obj ? obj.x + (obj.size||60)/2 : window.innerWidth/2;
    const cy = obj ? obj.y + (obj.sizeH||obj.size||60)/2 : window.innerHeight/2;
    const size = (obj ? obj.size : 80) * 2.5;
    const fl = document.createElement('div');
    fl.style.cssText = `position:fixed;left:${cx - size/2}px;top:${cy - size/2}px;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};z-index:9998;pointer-events:none;
      transition:opacity ${ms}ms, transform ${ms}ms;transform:scale(1)`;
    document.body.appendChild(fl);
    requestAnimationFrame(() => { fl.style.opacity='0'; fl.style.transform='scale(2)'; });
    setTimeout(() => fl.remove(), ms + 50);
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
      background:var(--surface2);border:1px solid var(--green);color:var(--green);
      font-family:'Space Mono',monospace;font-size:0.75rem;padding:0.5rem 1.2rem;
      border-radius:100px;z-index:9999;pointer-events:none;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
})();
