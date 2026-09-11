import { createSessionCookie, passwordMatches } from '../_admin-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (!passwordMatches(body.password)) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return res.status(401).json({ error: 'Incorrect password' });
  }
  res.setHeader('Set-Cookie', createSessionCookie());
  return res.status(200).json({ ok: true });
}
