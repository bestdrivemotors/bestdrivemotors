import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('d1Query', () => {
  it('POSTs SQL and params to the Cloudflare D1 HTTP API', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: '1' }], success: true, meta: { changes: 0 } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { d1Query } = await import('@/lib/db/d1');
    const rows = await d1Query('SELECT * FROM vehicle WHERE id = ?', ['1']);

    expect(rows).toEqual([{ id: '1' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://api.cloudflare.com/client/v4/accounts/acct/d1/database/dbid/query',
    );
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(init.body)).toEqual({
      sql: 'SELECT * FROM vehicle WHERE id = ?',
      params: ['1'],
    });
  });

  it('exposes rows and mutation metadata for database drivers', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: '1' }], meta: { changes: 2, last_row_id: 7 } }],
      }),
    }));

    const { d1Execute } = await import('@/lib/db/d1');
    await expect(d1Execute('UPDATE vehicle SET status = ?', ['sold'])).resolves.toEqual({
      rows: [{ id: '1' }],
      numAffectedRows: 2,
      insertId: 7,
    });
  });

  it('throws a typed error when Cloudflare rejects the query', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ success: false, errors: [{ message: 'Unavailable' }] }),
    }));

    const { D1Error, d1Query } = await import('@/lib/db/d1');
    await expect(d1Query('SELECT 1')).rejects.toBeInstanceOf(D1Error);
    await expect(d1Query('SELECT 1')).rejects.toThrow(/unavailable/i);
  });

  it('returns each result in order from d1Batch', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, result: [{ results: [{ id: '1' }] }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, result: [{ results: [{ id: '2' }] }] }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { d1Batch } = await import('@/lib/db/d1');
    const results = await d1Batch([
      { sql: 'SELECT 1', params: [] },
      { sql: 'SELECT 2', params: [] },
    ]);

    expect(results).toEqual([[{ id: '1' }], [{ id: '2' }]]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('isD1Configured', () => {
  it('requires all Cloudflare D1 credentials', async () => {
    const { isD1Configured } = await import('@/lib/db/d1');
    expect(isD1Configured()).toBe(false);

    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    expect(isD1Configured()).toBe(true);
  });
});
