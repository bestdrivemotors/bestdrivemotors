import { afterEach, describe, expect, it, vi } from 'vitest';
import { featuredVehicles, getPublicInventory, isPublicVehicle, mapPublicVehicle } from '@/lib/inventory/snapshot';

vi.mock('next/cache', () => ({ unstable_cache: (callback) => callback }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_D1_DATABASE_ID;
  delete process.env.CLOUDFLARE_D1_API_TOKEN;
});

describe('isPublicVehicle', () => {
  it('only allows available vehicles', () => {
    expect(isPublicVehicle({ status: 'available' })).toBe(true);
    expect(isPublicVehicle({ status: 'draft' })).toBe(false);
    expect(isPublicVehicle({ status: 'sold' })).toBe(false);
  });
});

describe('featuredVehicles', () => {
  it('returns only available featured cars', () => {
    const list = [
      { id: '1', status: 'available', featured: true },
      { id: '2', status: 'available', featured: false },
      { id: '3', status: 'sold', featured: true },
    ];
    expect(featuredVehicles(list).map((v) => v.id)).toEqual(['1']);
  });
});

describe('mapPublicVehicle', () => {
  it('maps public fields, gallery images, and feature data', () => {
    expect(mapPublicVehicle({
      id: '1',
      status: 'available',
      featured: 1,
      stock_number: 'BD001',
      make_name: 'Toyota',
      model_name: 'Aqua',
      feature_ids: '["bluetooth"]',
      images: '[{"id":"img-1","publicUrl":"https://cdn/car.webp","thumbUrl":"https://cdn/thumb.webp","isCover":1}]',
    })).toMatchObject({
      id: '1',
      status: 'available',
      featured: true,
      stockNumber: 'BD001',
      makeName: 'Toyota',
      modelName: 'Aqua',
      featureIds: ['bluetooth'],
      images: [{ id: 'img-1', url: 'https://cdn/car.webp', thumbUrl: 'https://cdn/thumb.webp', isCover: true }],
    });
  });

  it('does not map sold or draft vehicles', () => {
    expect(mapPublicVehicle({ id: '1', status: 'sold' })).toBeNull();
    expect(mapPublicVehicle({ id: '2', status: 'draft' })).toBeNull();
  });
});

describe('getPublicInventory', () => {
  it('queries only available vehicles and returns mapped snapshot rows', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ results: [{ id: '1', status: 'available', stock_number: 'BD001' }] }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const inventory = await getPublicInventory();

    expect(inventory.map((vehicle) => vehicle.stockNumber)).toEqual(['BD001']);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).sql).toMatch(/v\.status = 'available'/);
  });

  it('propagates a configured D1 failure so ISR does not cache an empty inventory', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct';
    process.env.CLOUDFLARE_D1_DATABASE_ID = 'dbid';
    process.env.CLOUDFLARE_D1_API_TOKEN = 'token';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));

    await expect(getPublicInventory()).rejects.toThrow(/D1 request failed/i);
  });
});
