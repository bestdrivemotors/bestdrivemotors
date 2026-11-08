import { toNextJsHandler } from 'better-auth/next-js';
import { ensureBootstrapUser, getAuth, isAuthConfigured } from '@/lib/auth/index';

async function handle(request) {
  if (!isAuthConfigured()) {
    return Response.json({ message: 'Admin authentication is not configured.' }, { status: 503 });
  }

  const pathname = new URL(request.url).pathname;
  const bootstrapPaths = [
    '/email-otp/send-verification-otp',
    '/email-otp/request-password-reset',
  ];
  if (request.method === 'POST' && bootstrapPaths.some((path) => pathname.endsWith(path))) {
    const body = await request.clone().json().catch(() => null);
    const isSignInCode = pathname.endsWith('/email-otp/send-verification-otp')
      && body?.type === 'sign-in';
    const isPasswordResetCode = pathname.endsWith('/email-otp/request-password-reset');
    if (isSignInCode || isPasswordResetCode) await ensureBootstrapUser(body?.email);
  }

  const handlers = toNextJsHandler(getAuth());
  return handlers[request.method](request);
}

export const GET = handle;
export const POST = handle;