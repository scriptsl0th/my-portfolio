import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

// ── In-memory rate limiter ────────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  // ── Rate limit ──────────────────────────────────────────────────────────
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait before sending another message.',
    });
  }

  const { name, email, message, website } = req.body ?? {};

  // ── Honeypot ────────────────────────────────────────────────────────────
  if (website && String(website).trim().length > 0) {
    return res.json({ ok: true }); // silent accept for bots
  }

  // ── Validation ──────────────────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ error: 'Name is too long.' });
  }
  if (message.trim().length > 5000) {
    return res.status(400).json({ error: 'Message is too long (max 5000 characters).' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // ── SMTP config ─────────────────────────────────────────────────────────
  const {
    SMTP_HOST       = 'smtp-relay.brevo.com',
    SMTP_PORT       = '587',
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME  = 'Aziz Dridi',
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    console.warn('[Contact] SMTP not fully configured — skipping send');
    return res.json({ ok: true, note: 'SMTP not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      requireTLS: true,
      auth: { type: 'LOGIN', user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: true },
    } as any);

    await transporter.verify();

    const from = `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`;

    await transporter.sendMail({
      from,
      to:      SMTP_FROM_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `[Portfolio] New message from ${name}`,
      html: `
        <div style="font-family:monospace;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:8px;">
          <p style="color:#00e5a0;margin:0 0 16px;font-size:14px;">📬 New contact form submission</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="color:#888;padding:4px 0;font-size:13px;width:80px;">Name</td><td style="color:#f0f0f0;font-size:13px;">${name}</td></tr>
            <tr><td style="color:#888;padding:4px 0;font-size:13px;">Email</td><td style="font-size:13px;"><a href="mailto:${email}" style="color:#00e5a0;">${email}</a></td></tr>
            <tr><td style="color:#888;padding:4px 0;font-size:13px;">IP</td><td style="color:#555;font-size:12px;">${ip}</td></tr>
          </table>
          <p style="color:#888;font-size:13px;margin:16px 0 6px;">Message:</p>
          <blockquote style="border-left:2px solid #00e5a0;margin:0;padding:8px 16px;color:#aaa;font-size:13px;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</blockquote>
        </div>`,
    });

    await transporter.sendMail({
      from,
      to:      email,
      subject: `Got your message, ${name} 👋`,
      html:    buildAutoReplyHtml(name),
    });

    return res.json({ ok: true });

  } catch (err: any) {
    console.error('[Contact] SMTP error:', {
      message:  err?.message,
      code:     err?.code,
      command:  err?.command,
      response: err?.response,
    });

    if (err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: 'Could not reach mail server. Try again later.' });
    }
    if (err?.responseCode === 535 || err?.code === 'EAUTH') {
      return res.status(500).json({ error: 'Mail authentication failed. Check SMTP credentials.' });
    }

    return res.status(500).json({ error: 'Failed to send email. Try again later.' });
  }
});

function buildAutoReplyHtml(senderName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<div style="background:#0a0a0a;padding:32px 20px;font-family:'Courier New',monospace;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#1a1a1a;border-radius:10px 10px 0 0;padding:13px 18px;border-bottom:1px solid #2a2a2a;">
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#ff5f57;margin-right:6px;"></span>
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#febc2e;margin-right:6px;"></span>
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#28c840;margin-right:14px;"></span>
      <span style="color:#555;font-size:11px;">~/portfolio — auto_reply.sh</span>
    </div>
    <div style="background:#111;padding:36px 32px;border-radius:0 0 10px 10px;border:1px solid #1e1e1e;border-top:none;">
      <p style="margin:0 0 26px;color:#00e5a0;font-size:12px;letter-spacing:0.05em;">$ echo "message_received.log"</p>
      <p style="margin:0 0 14px;font-size:21px;color:#f0f0f0;font-weight:700;">Hey ${senderName} <span style="color:#00e5a0;">_</span></p>
      <p style="margin:0 0 12px;font-size:14px;color:#aaa;line-height:1.75;">Your message landed safely. Thanks for reaching out — I'll review it and get back to you as soon as possible.</p>
      <p style="margin:0 0 28px;font-size:14px;color:#aaa;line-height:1.75;">In the meantime, feel free to check out my work or connect with me below.</p>
      <hr style="border:none;border-top:1px solid #222;margin:0 0 24px;">
      <div style="background:#0d0d0d;border:1px solid #222;border-radius:6px;padding:14px 18px;">
        <div style="margin-bottom:6px;">
          <span style="color:#555;font-size:11px;">STATUS</span>
          <span style="color:#00e5a0;font-size:11px;margin-left:12px;">● message received</span>
        </div>
        <div>
          <span style="color:#555;font-size:11px;">RESPONSE TIME</span>
          <span style="color:#e0e0e0;font-size:11px;margin-left:12px;">within 24–48h</span>
        </div>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://www.azizdridi.tn"
           style="display:inline-block;background:#00e5a0;color:#0a0a0a;font-family:'Courier New',monospace;font-size:12px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:6px;letter-spacing:0.06em;">
          VIEW MY WORK →
        </a>
      </div>
    </div>
    <p style="margin:20px 0 0;text-align:center;color:#333;font-size:10px;">
      © ${new Date().getFullYear()} Dridi · This is an automated reply, please don't respond to this email.
    </p>
  </div>
</div>
</body>
</html>`.trim();
}

export default router;
