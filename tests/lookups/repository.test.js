import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('lookup repositories', () => {
  it('creates a model scoped to its make', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: 'model-1', make_id: 'make-1', name: 'Civic' }] }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { createModel } = await import('@/lib/lookups/repository');
    const model = await createModel('make-1', 'Civic');

    expect(model).toEqual({ id: 'model-1', makeId: 'make-1', name: 'Civic' });
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.sql).toMatch(/INSERT INTO model/);
    expect(request.params.slice(1, 3)).toEqual(['make-1', 'Civic']);
  });
});