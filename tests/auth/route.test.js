import { afterEach, describe, expect, it, vi } from 'vitest';

const { ensureBootstrapUserMock, getAuthMock, isAuthConfiguredMock, postHandlerMock, toNextJsHandlerMock } = vi.hoisted(() => ({
  ensureBootstrapUserMock: vi.fn(),
  getAuthMock: vi.fn(() => ({})),
  isAuthConfiguredMock: vi.fn(() => true),
  postHandlerMock: vi.fn(() => Response.json({ success: true })),
  toNextJsHandlerMock: vi.fn(() => ({ POST: postHandlerMock, GET: vi.fn() })),
}));

vi.mock('@/lib/auth/index', () => ({
  ensureBootstrapUser: ensureBootstrapUserMock,
  getAuth: getAuthMock,
  isAuthConfigured: isAuthConfiguredMock,
}));
vi.mock('better-auth/next-js', () => ({ toNextJsHandler: toNextJsHandlerMock }));

import { POST } from '../../app/api/auth/[...all]/route';

afterEach(() => vi.clearAllMocks());

describe('Better Auth route bootstrap', () => {
  it.each([
    {
      path: '/api/auth/email-otp/send-verification-otp',
      body: { email: 'owner@example.com', type: 'sign-in' },
    },
    {
      path: '/api/auth/email-otp/request-password-reset',
      body: { email: 'owner@example.com' },
    },
  ])('bootstraps an initial admin before $path', async ({ path, body }) => {
    const request = new Request(`https://example.com${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(ensureBootstrapUserMock).toHaveBeenCalledWith('owner@example.com');
    expect(postHandlerMock).toHaveBeenCalledTimes(1);
  });
});