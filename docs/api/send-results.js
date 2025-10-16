// /api/send-results.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Optionnel : verrouiller le destinataire côté serveur
const TO_EMAIL = process.env.TO_EMAIL || 'exemple@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { subject, text, html, meta } = req.body || {};
    if (!subject || !text) return res.status(400).json({ error: 'Missing subject or text' });

    // Hygiène minimale anti-abus
    if (text.length > 20000) return res.status(413).json({ error: 'Payload too large' });

    const r = await resend.emails.send({
      from: 'Diagnostic <no-reply@your-domain.tld>', // un domaine vérifié Resend
      to: [TO_EMAIL],
      subject,
      text,
      html: html || `<pre>${escapeHtml(text)}</pre>`,
      headers: { 'X-App': 'diagnostic-industrie' },
    });

    return res.status(200).json({ ok: true, id: r?.data?.id || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Email send failed' });
  }
}

function escapeHtml(s=''){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
