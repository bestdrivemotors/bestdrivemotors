import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  d1QueryMock,
  getAuthMock,
  isAuthConfiguredMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  d1QueryMock: vi.fn(),
  getAuthMock: vi.fn(),
  isAuthConfiguredMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({ requireAdminSession: requireAdminSessionMock, adminErrorResponse: adminErrorResponseMock }));
vi.mock('@/lib/db/d1', () => ({ d1Query: d1QueryMock }));
vi.mock('@/lib/auth/index', () => ({ getAuth: getAuthMock, isAuthConfigured: isAuthConfiguredMock }));

import { POST } from '../../app/api/admin/team/route';

afterEach(() => vi.clearAllMocks());

describe('admin team invite API', () => {
  it('creates an invited user before requesting a password setup code', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    isAuthConfiguredMock.mockReturnValueOnce(true);
    d1QueryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'user-1' }]);
    const requestPasswordResetEmailOTP = vi.fn().mockResolvedValue({ success: true });
    getAuthMock.mockReturnValue({ api: { requestPasswordResetEmailOTP } });

    const response = await POST(new Request('https://example.com/api/admin/team', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: ' New.Staff@example.com ' }),
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, email: 'new.staff@example.com' });
    expect(requestPasswordResetEmailOTP).toHaveBeenCalledWith({ body: { email: 'new.staff@example.com' } });
    expect(d1QueryMock.mock.calls[1][0]).toMatch(/INSERT INTO user/);
  });

  it('removes the provisional user if OTP email delivery fails', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    isAuthConfiguredMock.mockReturnValueOnce(true);
    d1QueryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'user-1' }])
      .mockResolvedValueOnce([]);
    getAuthMock.mockReturnValue({ api: {
      requestPasswordResetEmailOTP: vi.fn().mockRejectedValue(new Error('SMTP failed')),
    } });

    const response = await POST(new Request('https://example.com/api/admin/team', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'staff@example.com' }),
    }));

    expect(response.status).toBe(500);
    expect(d1QueryMock.mock.calls[2][0]).toMatch(/DELETE FROM user/);
  });
});