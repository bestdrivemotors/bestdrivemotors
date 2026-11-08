import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
  delete process.env.INITIAL_ADMIN_EMAILS;
});

describe('ensureBootstrapUser', () => {
  it('creates a Better Auth user only for an allowlisted initial admin', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    process.env.INITIAL_ADMIN_EMAILS = 'owner@example.com';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, result: [{ results: [] }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, result: [{ results: [{ id: 'user-1' }] }] }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { ensureBootstrapUser } = await import('@/lib/auth/index');
    await expect(ensureBootstrapUser('OWNER@example.com')).resolves.toBe(true);

    const insert = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(insert.sql).toMatch(/INSERT INTO user/);
    expect(insert.params).toContain('owner@example.com');
  });

  it('does not create users for non-allowlisted emails', async () => {
    process.env.INITIAL_ADMIN_EMAILS = 'owner@example.com';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { ensureBootstrapUser } = await import('@/lib/auth/index');
    await expect(ensureBootstrapUser('stranger@example.com')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('getAuth', () => {
  it('initializes Better Auth with the configured HTTP-backed Kysely database', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    process.env.BETTER_AUTH_URL = 'https://bestdrivemotors.co.nz';
    process.env.BETTER_AUTH_SECRET = '0123456789abcdef0123456789abcdef';

    const { getAuth } = await import('@/lib/auth/index');
    const auth = getAuth();

    expect(auth.api.getSession).toBeTypeOf('function');
  });
});