import { afterEach, describe, expect, it, vi } from 'vitest';

const { loadEnvConfigMock } = vi.hoisted(() => ({ loadEnvConfigMock: vi.fn() }));
vi.mock('@next/env', () => ({ default: { loadEnvConfig: loadEnvConfigMock } }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  loadEnvConfigMock.mockReset();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('migrate', () => {
  it('loads Next environment files before checking D1 configuration', async () => {
    loadEnvConfigMock.mockImplementation(() => {
      process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
      process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
      process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, result: [{ results: [] }] }),
    }));

    const { migrate } = await import('@/lib/db/migrate');
    await migrate();

    expect(loadEnvConfigMock).toHaveBeenCalledWith(process.cwd());
  });

  it('executes each schema statement through the D1 HTTP client', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const statements = [];
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url, init) => {
      statements.push(JSON.parse(init.body).sql);
      return {
        ok: true,
        json: async () => ({ success: true, result: [{ results: [] }] }),
      };
    }));

    const { migrate } = await import('@/lib/db/migrate');
    await migrate();

    expect(statements.some((sql) => /CREATE TABLE IF NOT EXISTS vehicle_image/.test(sql))).toBe(true);
    expect(statements.some((sql) => /thumb_url/.test(sql))).toBe(true);
    expect(statements.some((sql) => /CREATE TABLE IF NOT EXISTS session/.test(sql))).toBe(true);
  });
});