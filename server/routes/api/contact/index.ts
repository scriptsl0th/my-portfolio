import { Router, Request, Response } from 'express';
import { sendContactEmails, ContactPayload } from '../../../services/email.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body as Partial<ContactPayload>;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Basic email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Check SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Contact] SMTP not configured — skipping email send');
    return res.json({ ok: true, note: 'SMTP not configured, email not sent.' });
  }

  try {
    await sendContactEmails({ name, email, message });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Contact]', err);
    return res.status(500).json({ error: 'Failed to send email. Try again later.' });
  }
});

export default router;
