import { afterEach, describe, expect, it, vi } from 'vitest';

const { getAuthMock, isAuthConfiguredMock, getSessionMock } = vi.hoisted(() => ({
  getAuthMock: vi.fn(),
  isAuthConfiguredMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock('@/lib/auth/index', () => ({
  getAuth: getAuthMock,
  isAuthConfigured: isAuthConfiguredMock,
}));

import { AdminAccessError, requireAdminSession } from '@/app/api/admin/session';

afterEach(() => vi.clearAllMocks());

describe('requireAdminSession', () => {
  it('returns the session for an authenticated request', async () => {
    const session = { user: { id: 'admin-1' } };
    isAuthConfiguredMock.mockReturnValue(true);
    getAuthMock.mockReturnValue({ api: { getSession: getSessionMock } });
    getSessionMock.mockResolvedValue(session);

    await expect(requireAdminSession(new Request('https://example.com/api/admin', {
      headers: { cookie: 'session=valid' },
    }))).resolves.toBe(session);
  });

  it('rejects requests with no session', async () => {
    isAuthConfiguredMock.mockReturnValue(true);
    getAuthMock.mockReturnValue({ api: { getSession: getSessionMock } });
    getSessionMock.mockResolvedValue(null);

    await expect(requireAdminSession(new Request('https://example.com/api/admin')))
      .rejects.toMatchObject({ status: 401 });
  });

  it('returns unavailable when auth configuration is missing', async () => {
    isAuthConfiguredMock.mockReturnValue(false);

    await expect(requireAdminSession(new Request('https://example.com/api/admin')))
      .rejects.toBeInstanceOf(AdminAccessError);
    await expect(requireAdminSession(new Request('https://example.com/api/admin')))
      .rejects.toMatchObject({ status: 503 });
  });
});