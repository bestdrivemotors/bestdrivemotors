import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !Number.isInteger(port) || !user || !pass) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function sendEmail({ to, subject, text }) {
  return createTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

export function sendAdminOtp(email, otp, type = 'sign-in') {
  return sendEmail({
    to: email,
    subject: 'Best Drive Motors admin verification code',
    text: `Your Best Drive Motors admin code is ${otp}. It expires soon. If you did not request this code, you can ignore this email.`,
  });
}