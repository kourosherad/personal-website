import crypto from 'node:crypto';

const COOKIE = 'retro_session';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function isAuthenticated(req) {
  if (!secret()) return false;
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, value.join('=')];
  }));
  const [expires, signature] = (cookies[COOKIE] || '').split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function createSessionCookie() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${COOKIE}=${expires}.${sign(expires)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function passwordMatches(candidate) {
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password || password.length < 12) return false;
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(password);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
