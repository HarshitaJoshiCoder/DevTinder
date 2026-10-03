const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

// Falls back to logging the email to the console when SMTP isn't configured,
// so password reset works out of the box in local/dev environments.
async function sendMail({ to, subject, html, text }) {
  const client = getTransporter();
  if (!client) {
    console.log(`[mailer] SMTP not configured — would send email to ${to}:\n[mailer] Subject: ${subject}\n${text || html}`);
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || 'DevTinder <no-reply@devtinder.local>',
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendMail };
