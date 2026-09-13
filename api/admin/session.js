import { isAuthenticated } from '../_admin-auth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const authenticated = isAuthenticated(req);
  return res.status(authenticated ? 200 : 401).json({ authenticated });
}
