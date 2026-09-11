import './style.css';
import * as THREE from 'three';
import anime from 'animejs/lib/anime.es.js';
import { I18N } from './i18n.js';

/* ----------------------- i18n ----------------------- */
let lang = localStorage.getItem('lang') || 'en';

function applyLang(l) {
  lang = l;
  const dict = I18N[l];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (dict[k] !== undefined) el.textContent = dict[k];
  });
  const html = document.documentElement;
  html.setAttribute('lang', l);
  html.setAttribute('dir', l === 'fa' ? 'rtl' : 'ltr');
  document.getElementById('lang-toggle').textContent = l === 'en' ? 'EN / فا' : 'فا / EN';
  localStorage.setItem('lang', l);
}

/* ----------------------- theme ----------------------- */
const root = document.documentElement;

function setTheme(dark) {
  root.classList.toggle('dark', dark);
  document.getElementById('icon-sun').classList.toggle('hidden', !dark);
  document.getElementById('icon-moon').classList.toggle('hidden', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  if (window.__updateParticleColor) window.__updateParticleColor(dark);
}

// Default dark, unless the user previously chose light.
const startDark = localStorage.getItem('theme') !== 'light';
setTheme(startDark);

document
  .getElementById('theme-toggle')
  .addEventListener('click', () => setTheme(!root.classList.contains('dark')));
document
  .getElementById('lang-toggle')
  .addEventListener('click', () => applyLang(lang === 'en' ? 'fa' : 'en'));

/* mobile menu */
const mm = document.getElementById('mobile-menu');
document.getElementById('menu-btn').addEventListener('click', () => mm.classList.toggle('hidden'));
mm.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mm.classList.add('hidden')));

document.getElementById('year').textContent = new Date().getFullYear();
applyLang(lang);

/* ----------------------- contact form ----------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.getElementById('c-send').addEventListener('click', async () => {
  const btn = document.getElementById('c-send');
  const status = document.getElementById('c-status');
  const payload = {
    name: document.getElementById('c-name').value.trim(),
    email: document.getElementById('c-email').value.trim(),
    message: document.getElementById('c-message').value.trim(),
    company: document.getElementById('c-company').value.trim(), // honeypot
  };

  if (!payload.name || !payload.message || !EMAIL_RE.test(payload.email)) {
    status.textContent = I18N[lang]['contact.invalid'];
    status.className = 'text-sm text-center text-red-500';
    status.classList.remove('hidden');
    return;
  }

  btn.textContent = I18N[lang]['contact.sending'];
  btn.disabled = true;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('bad response');
    status.textContent = I18N[lang]['contact.success'];
    status.className = 'text-sm text-center text-green-500';
    document.getElementById('c-name').value = '';
    document.getElementById('c-email').value = '';
    document.getElementById('c-message').value = '';
  } catch (err) {
    console.error('Contact submission failed:', err);
    status.textContent = I18N[lang]['contact.error'];
    status.className = 'text-sm text-center text-red-500';
  } finally {
    btn.textContent = I18N[lang]['contact.send'];
    btn.disabled = false;
    status.classList.remove('hidden');
  }
});

/* ----------------------- anime.js reveals ----------------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.classList.contains('reveal-group')) {
        anime({
          targets: el.querySelectorAll('.r-child'),
          opacity: [0, 1],
          translateY: [28, 0],
          delay: anime.stagger(90),
          duration: 700,
          easing: 'easeOutCubic',
        });
      } else {
        anime({ targets: el, opacity: [0, 1], translateY: [28, 0], duration: 700, easing: 'easeOutCubic' });
      }
      io.unobserve(el);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal, .reveal-group').forEach((el) => io.observe(el));

/* hero entrance */
window.addEventListener('load', () => {
  anime
    .timeline({ easing: 'easeOutExpo' })
    .add({ targets: '#hero-role', opacity: [0, 1], translateY: [20, 0], duration: 700 })
    .add({ targets: '#hero-name', opacity: [0, 1], translateY: [30, 0], duration: 800 }, '-=450')
    .add({ targets: '#hero-tagline', opacity: [0, 1], translateY: [20, 0], duration: 700 }, '-=500')
    .add({ targets: '#hero-cta', opacity: [0, 1], translateY: [20, 0], duration: 700 }, '-=450');
});

/* ----------------------- three.js particle field ----------------------- */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, hero.clientWidth / hero.clientHeight, 1, 1000);
  camera.position.z = 380;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(hero.clientWidth, hero.clientHeight);

  const COUNT = 700;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 900;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 2.4, color: 0xa878ff, transparent: true, opacity: 0.85, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // connecting lines for a subtle network look
  const lineMat = new THREE.LineBasicMaterial({ color: 0x7c33e0, transparent: true, opacity: 0.12 });
  const linePos = [];
  for (let i = 0; i < 90; i++) {
    const a = Math.floor(Math.random() * COUNT) * 3,
      b = Math.floor(Math.random() * COUNT) * 3;
    linePos.push(pos[a], pos[a + 1], pos[a + 2], pos[b], pos[b + 1], pos[b + 2]);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  window.__updateParticleColor = (dark) => {
    mat.color.set(dark ? 0xa878ff : 0x7c33e0);
    mat.opacity = dark ? 0.85 : 0.6;
    lineMat.opacity = dark ? 0.12 : 0.08;
  };
  window.__updateParticleColor(root.classList.contains('dark'));

  let mx = 0,
    my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0004;
    lines.rotation.copy(points.rotation);
    camera.position.x += (mx * 60 - camera.position.x) * 0.04;
    camera.position.y += (-my * 60 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = hero.clientWidth / hero.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(hero.clientWidth, hero.clientHeight);
  });
})();
