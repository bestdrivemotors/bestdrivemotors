import { getAuth, isAuthConfigured } from '@/lib/auth/index';

export class AdminAccessError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AdminAccessError';
    this.status = status;
  }
}

export async function requireAdminSession(request) {
  if (!isAuthConfigured()) {
    throw new AdminAccessError('Admin authentication is not configured.', 503);
  }

  let session;
  try {
    session = await getAuth().api.getSession({ headers: request.headers });
  } catch (cause) {
    throw new AdminAccessError('Admin authentication is temporarily unavailable.', 503, { cause });
  }

  if (!session) throw new AdminAccessError('Authentication required.', 401);
  return session;
}

export function adminErrorResponse(error) {
  const status = error instanceof AdminAccessError
    ? error.status
    : Number.isInteger(error?.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;
  const message = status === 500 ? 'Admin request failed.' : error.message;
  return Response.json({ message }, { status });
}