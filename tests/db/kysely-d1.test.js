import { afterEach, describe, expect, it, vi } from 'vitest';
import { Kysely } from 'kysely';
import { D1HttpDialect } from '@/lib/db/kysely-d1';

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('D1HttpDialect', () => {
  it('executes Kysely SQLite queries over the D1 HTTP API', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: 'vehicle-1' }], meta: { changes: 0 } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const db = new Kysely({ dialect: new D1HttpDialect() });

    const rows = await db.selectFrom('vehicle').select('id').where('id', '=', 'vehicle-1').execute();

    expect(rows).toEqual([{ id: 'vehicle-1' }]);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.sql).toMatch(/SELECT "id" FROM "vehicle" WHERE "id" = \?/i);
    expect(request.params).toEqual(['vehicle-1']);
    await db.destroy();
  });
});