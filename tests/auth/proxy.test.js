import { afterEach, describe, expect, it, vi } from 'vitest';

const { getAuthMock, isAuthConfiguredMock, nextMock, redirectMock, getSessionMock } = vi.hoisted(() => ({
  getAuthMock: vi.fn(),
  isAuthConfiguredMock: vi.fn(),
  nextMock: vi.fn(() => ({ type: 'next' })),
  redirectMock: vi.fn((url) => ({ type: 'redirect', url: url.toString() })),
  getSessionMock: vi.fn(),
}));

vi.mock('@/lib/auth/index', () => ({
  getAuth: getAuthMock,
  isAuthConfigured: isAuthConfiguredMock,
}));
vi.mock('next/server', () => ({
  NextResponse: { next: nextMock, redirect: redirectMock },
}));

import { proxy } from '../../proxy';

afterEach(() => {
  vi.clearAllMocks();
});

describe('admin proxy', () => {
  it('redirects protected admin pages without a valid session', async () => {
    isAuthConfiguredMock.mockReturnValue(true);
    getAuthMock.mockReturnValue({ api: { getSession: getSessionMock } });
    getSessionMock.mockResolvedValue(null);

    const result = await proxy({
      nextUrl: { pathname: '/admin/vehicles' },
      url: 'https://bestdrivemotors.co.nz/admin/vehicles',
      headers: new Headers(),
    });

    expect(result).toEqual({
      type: 'redirect',
      url: 'https://bestdrivemotors.co.nz/admin/login',
    });
    expect(getSessionMock).toHaveBeenCalledTimes(1);
  });

  it('allows the public admin login page without checking a session', async () => {
    const result = await proxy({ nextUrl: { pathname: '/admin/login' } });

    expect(result).toEqual({ type: 'next' });
    expect(getSessionMock).not.toHaveBeenCalled();
  });
});