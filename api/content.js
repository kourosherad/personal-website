import { head, put } from '@vercel/blob';
import { I18N } from '../src/i18n.js';
import { isAuthenticated } from './_admin-auth.js';

const PATH = 'portfolio/site-content.json';
const defaults = {
  translations: I18N,
  links: {
    sepehr: 'https://temporary-brisk-emerald-kgw3h90.vercel.app/',
    autora: 'https://autora-red.vercel.app/',
    cabino: 'https://cabino-test.vercel.app/#/login',
    github: 'https://github.com/kourosherad',
    linkedin: 'https://linkedin.com/in/kourosherad',
    instagram: 'https://instagram.com/kourosherad',
    telegram: 'https://t.me/kourosherad',
    x: 'https://x.com/kourosherad',
  },
  sections: [
    { id: 'about', visible: true }, { id: 'skills', visible: true },
    { id: 'experience', visible: true }, { id: 'projects', visible: true },
    { id: 'services', visible: true }, { id: 'contact', visible: true },
  ],
};

async function readStored() {
  try {
    const blob = await head(PATH, { access: 'public' });
    const response = await fetch(`${blob.url}?v=${Date.now()}`, { cache: 'no-store' });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function validContent(body) {
  if (!body?.translations?.en || !body?.translations?.fa || !Array.isArray(body.sections)) return false;
  if (JSON.stringify(body).length > 100_000) return false;
  const validUrl = (value) => {
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  };
  if (!Object.values(body.links || {}).every(validUrl)) return false;
  return body.sections.every((section) => typeof section.id === 'string' && typeof section.visible === 'boolean');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const stored = await readStored();
    return res.status(200).json(stored || defaults);
  }
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  if (!validContent(body)) {
    return res.status(400).json({ error: 'Invalid content' });
  }
  await put(PATH, JSON.stringify(body), {
    access: 'public', allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60,
  });
  return res.status(200).json({ ok: true });
}
