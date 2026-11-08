import { randomUUID } from 'node:crypto';
import { adminErrorResponse, requireAdminSession } from '@/app/api/admin/session';
import { getAuth, isAuthConfigured } from '@/lib/auth/index';
import { d1Query } from '@/lib/db/d1';

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  try {
    await requireAdminSession(request);
    if (!isAuthConfigured()) {
      return Response.json({ message: 'Admin authentication is not configured.' }, { status: 503 });
    }
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!isEmail(email)) return Response.json({ message: 'Enter a valid email address.' }, { status: 400 });

    const existing = await d1Query('SELECT id FROM user WHERE lower(email) = lower(?) LIMIT 1', [email]);
    if (existing.length) {
      return Response.json({ message: 'That email is already a team member.' }, { status: 409 });
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    await d1Query(
      'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)',
      [id, email.split('@')[0], email, now, now],
    );

    try {
      await getAuth().api.requestPasswordResetEmailOTP({ body: { email } });
    } catch (error) {
      await d1Query('DELETE FROM user WHERE id = ?', [id]).catch(() => {});
      throw error;
    }

    return Response.json({ success: true, email }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}