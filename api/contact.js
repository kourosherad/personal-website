// Serverless contact endpoint (Vercel-style: /api/contact).
// Sends the submitted message as an email via Resend (https://resend.com).
//
// Required environment variables:
//   RESEND_API_KEY    – your Resend API key
//   CONTACT_TO_EMAIL   – where messages are delivered (e.g. you@domain.com)
//   CONTACT_FROM_EMAIL – a verified Resend sender (e.g. site@yourdomain.com)
//
// On Netlify, place an equivalent function under netlify/functions/ instead;
// the request/response handling differs slightly but the logic is the same.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const message = (body.message || '').toString().trim();

  // Honeypot: bots fill hidden fields. Pretend success to waste their time.
  if (body.company) return res.status(200).json({ ok: true });

  if (!name || !message || !EMAIL_RE.test(email) || message.length > 5000) {
    return res.status(400).json({ error: 'Invalid submission' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error('Contact endpoint missing env config (RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL).');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Portfolio <${from}>`,
        to: [to],
        reply_to: email,
        subject: `New message from ${name} — kouroshmoradi.dev`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        `,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Resend error:', r.status, detail);
      return res.status(502).json({ error: 'Email delivery failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
