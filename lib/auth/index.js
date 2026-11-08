import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { emailOTP } from 'better-auth/plugins';
import { Kysely } from 'kysely';
import { d1Query, isD1Configured } from '@/lib/db/d1';
import { D1HttpDialect } from '@/lib/db/kysely-d1';
import { canSendAdminOtp, parseInitialAdminEmails } from '@/lib/auth/allowlist';
import { sendAdminOtp } from '@/lib/email/send';

let authInstance;

export function isAuthConfigured() {
  return Boolean(
    process.env.BETTER_AUTH_SECRET?.length >= 32
      && process.env.BETTER_AUTH_URL
      && isD1Configured(),
  );
}

export async function ensureBootstrapUser(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const initialEmails = parseInitialAdminEmails(process.env.INITIAL_ADMIN_EMAILS);
  if (!normalizedEmail || !initialEmails.includes(normalizedEmail) || !isD1Configured()) return false;

  const existing = await d1Query('SELECT id FROM user WHERE lower(email) = lower(?) LIMIT 1', [normalizedEmail]);
  if (existing.length) return true;

  const now = new Date().toISOString();
  await d1Query(
    'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)',
    [randomUUID(), normalizedEmail.split('@')[0], normalizedEmail, now, now],
  );
  return true;
}

async function sendAllowedOtp({ email, otp }) {
  const initialEmails = parseInitialAdminEmails(process.env.INITIAL_ADMIN_EMAILS);
  const rows = await d1Query('SELECT email FROM user WHERE lower(email) = lower(?) LIMIT 1', [email]);
  if (!canSendAdminOtp(email, {
    initialEmails,
    existingUserEmails: rows.map((row) => row.email),
  })) return;
  await sendAdminOtp(email, otp);
}

export function getAuth() {
  if (!isAuthConfigured()) {
    throw new Error('Admin authentication is not configured.');
  }
  if (authInstance) return authInstance;

  const database = new Kysely({ dialect: new D1HttpDialect() });
  authInstance = betterAuth({
    appName: 'Best Drive Motors',
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.BETTER_AUTH_URL, 'https://*.vercel.app', 'http://192.168.68.101:3000', 'http://localhost:3000/'],
    database: kyselyAdapter(database, { type: 'sqlite', transaction: false }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    plugins: [emailOTP({
      disableSignUp: true,
      sendVerificationOTP: sendAllowedOtp,
    })],
  });
  return authInstance;
}