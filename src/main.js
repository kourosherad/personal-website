import './style.css';
import anime from 'animejs/lib/anime.es.js';
import { I18N } from './i18n.js';
import { STUDIO } from './studio-content.js';
import './studio.css';
import { setupScrollMotion } from './scroll-motion.js';
Object.assign(I18N.en, STUDIO.en);
Object.assign(I18N.fa, STUDIO.fa);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------- i18n ----------------------- */
let lang = localStorage.getItem('lang') === 'en' ? 'en' : 'fa';

async function loadManagedContent() {
  try {
    const response = await fetch('/api/content', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!response.ok) return;
    const content = await response.json();
    if (content.translations?.en) Object.assign(I18N.en, content.translations.en);
    if (content.translations?.fa) Object.assign(I18N.fa, content.translations.fa);
    document.querySelectorAll('[data-content-link]').forEach((link) => {
      const href = content.links?.[link.dataset.contentLink];
      if (href) link.href = href;
    });
    const main = document.querySelector('main');
    content.sections?.forEach(({ id, visible }) => {
      const section = document.getElementById(id);
      if (!section || section.parentElement !== main) return;
      section.hidden = !visible;
      main.appendChild(section);
    });
  } catch (error) {
    console.warn('Using built-in site content:', error);
  }
}

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
loadManagedContent().then(() => applyLang(lang));
import('./scene.js').then(({ mountScene }) => mountScene(document.getElementById('studio-scene'))).catch(() => document.getElementById('studio-scene').classList.add('scene-fallback'));
document.getElementById('print-resume').addEventListener('click', () => window.print());

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
setupScrollMotion();

/* hero entrance */
if (!reducedMotion) {
  anime
    .timeline({ easing: 'easeOutExpo' })
    .add({ targets: '#hero-role', opacity: [0, 1], translateY: [20, 0], duration: 700 })
    .add({ targets: '#hero-name', opacity: [0, 1], translateY: [30, 0], duration: 800 }, '-=450')
    .add({ targets: '#hero-tagline', opacity: [0, 1], translateY: [20, 0], duration: 700 }, '-=500')
    .add({ targets: '#hero-cta', opacity: [0, 1], translateY: [20, 0], duration: 700 }, '-=450');
}

/* ----------------------- hero scroll fade ----------------------- */
const hero = document.getElementById('hero');

function updateHeroFade() {
  const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight * 0.72, 1), 1);
  hero.style.setProperty('--hero-opacity', String(1 - progress * 0.72));
  hero.style.setProperty('--hero-scale', String(1 + progress * 0.035));
  hero.style.setProperty('--hero-content-opacity', String(1 - progress));
  hero.style.setProperty('--hero-content-shift', `${progress * 28}px`);
}

updateHeroFade();
window.addEventListener('scroll', updateHeroFade, { passive: true });
