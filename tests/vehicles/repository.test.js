import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('insertVehicle', () => {
  it('uses the vehicle ID to resolve a slug collision', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, result: [{ results: [{ slug: '2018-toyota-aqua-bd001' }] }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          result: [{
            results: [{
              id: 'a1b2c3d4-0000',
              slug: '2018-toyota-aqua-bd001-a1b2c3d4',
              status: 'draft',
              featured: 0,
              stock_number: 'BD001',
              year: 2018,
            }],
          }],
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { insertVehicle } = await import('@/lib/vehicles/repository');
    const vehicle = await insertVehicle({
      id: 'a1b2c3d4-0000',
      slug: '2018-toyota-aqua-bd001',
      status: 'draft',
      featured: false,
      stockNumber: 'BD001',
      year: 2018,
    });

    expect(vehicle.slug).toBe('2018-toyota-aqua-bd001-a1b2c3d4');
    const insertRequest = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(insertRequest.sql).toMatch(/INSERT INTO vehicle/);
    expect(insertRequest.params).toContain('2018-toyota-aqua-bd001-a1b2c3d4');
  });
});

describe('updateVehicle', () => {
  it('updates the timestamp only once when changes include updatedAt', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: 'vehicle-1', featured: 1, updated_at: '2026-10-30T00:00:00.000Z' }] }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { updateVehicle } = await import('@/lib/vehicles/repository');
    await updateVehicle('vehicle-1', { featured: true, updatedAt: '2026-10-30T00:00:00.000Z' });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.sql.match(/updated_at = \?/g)).toHaveLength(1);
    expect(request.params).toEqual([1, '2026-10-30T00:00:00.000Z', 'vehicle-1']);
  });
});