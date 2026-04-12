import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildAutoReplyHtml(senderName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<div style="background:#0a0a0a;padding:32px 20px;font-family:'Courier New',monospace;">
  <div style="max-width:560px;margin:0 auto;">

    <!-- Terminal titlebar -->
    <div style="background:#1a1a1a;border-radius:10px 10px 0 0;padding:13px 18px;border-bottom:1px solid #2a2a2a;display:flex;align-items:center;">
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#ff5f57;margin-right:6px;"></span>
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#febc2e;margin-right:6px;"></span>
      <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#28c840;margin-right:14px;"></span>
      <span style="color:#555;font-size:11px;">~/portfolio — auto_reply.sh</span>
    </div>

    <!-- Terminal body -->
    <div style="background:#111;padding:36px 32px;border-radius:0 0 10px 10px;border:1px solid #1e1e1e;border-top:none;">

      <p style="margin:0 0 26px;color:#00e5a0;font-size:12px;letter-spacing:0.05em;">$ echo "message_received.log"</p>

      <p style="margin:0 0 14px;font-size:21px;color:#f0f0f0;font-weight:700;">
        Hey ${senderName} <span style="color:#00e5a0;">_</span>
      </p>

      <p style="margin:0 0 12px;font-size:14px;color:#aaa;line-height:1.75;">
        Your message landed safely. Thanks for reaching out — I'll review it and get back to you as soon as possible.
      </p>

      <p style="margin:0 0 28px;font-size:14px;color:#aaa;line-height:1.75;">
        In the meantime, feel free to check out my work or connect with me below.
      </p>

      <hr style="border:none;border-top:1px solid #222;margin:0 0 24px;">

      <!-- Status block -->
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

      <!-- CTA -->
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
</html>
  `.trim();
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmails(payload: ContactPayload): Promise<void> {
  const { name, email, message } = payload;
  const from = `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`;

  // 1) Notify Aziz
  await transporter.sendMail({
    from,
    to: process.env.SMTP_FROM_EMAIL,
    subject: `[Portfolio] New message from ${name}`,
    html: `
      <div style="font-family:monospace;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:8px;">
        <p style="color:#00e5a0;margin:0 0 16px;">New contact form submission</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#00e5a0;">${email}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left:2px solid #00e5a0;margin:8px 0;padding:8px 16px;color:#aaa;">${message.replace(/\n/g, '<br>')}</blockquote>
      </div>
    `,
  });

  // 2) Auto-reply to sender
  await transporter.sendMail({
    from,
    to: email,
    subject: `Got your message, ${name} 👋`,
    html: buildAutoReplyHtml(name),
  });
}
