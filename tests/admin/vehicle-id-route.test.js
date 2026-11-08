import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  getVehicleByIdMock,
  updateVehicleMock,
  deleteVehicleMock,
  listImagesMock,
  deleteImageMock,
  deleteR2ObjectMock,
  revalidateInventoryMock,
  d1QueryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  getVehicleByIdMock: vi.fn(),
  updateVehicleMock: vi.fn(),
  deleteVehicleMock: vi.fn(),
  listImagesMock: vi.fn(),
  deleteImageMock: vi.fn(),
  deleteR2ObjectMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
  d1QueryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({
  requireAdminSession: requireAdminSessionMock,
  adminErrorResponse: adminErrorResponseMock,
}));
vi.mock('@/lib/vehicles/repository', () => ({
  getVehicleById: getVehicleByIdMock,
  updateVehicle: updateVehicleMock,
  deleteVehicle: deleteVehicleMock,
  listImages: listImagesMock,
  deleteImage: deleteImageMock,
}));
vi.mock('@/lib/r2', () => ({ deleteR2Object: deleteR2ObjectMock }));
vi.mock('@/lib/db/d1', () => ({ d1Query: d1QueryMock }));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));

import { DELETE, GET, PATCH } from '../../app/api/admin/vehicles/[id]/route';

afterEach(() => vi.clearAllMocks());

const context = { params: Promise.resolve({ id: 'vehicle-1' }) };

describe('admin vehicle item API', () => {
  it('returns a vehicle with its gallery', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    listImagesMock.mockResolvedValueOnce([{ id: 'image-1' }]);

    const response = await GET(new Request('https://example.com'), context);

    expect(await response.json()).toEqual({
      vehicle: { id: 'vehicle-1', slug: 'car' },
      images: [{ id: 'image-1' }],
    });
  });

  it('validates and revalidates a partial update', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    updateVehicleMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car', status: 'sold' });

    const response = await PATCH(new Request('https://example.com', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'sold' }),
    }), context);

    expect(response.status).toBe(200);
    expect(updateVehicleMock).toHaveBeenCalledWith('vehicle-1', expect.objectContaining({ status: 'sold' }));
    expect(revalidateInventoryMock).toHaveBeenCalledWith('car');
  });

  it('regenerates the slug when only the year changes', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({
      id: 'vehicle-1',
      slug: '2018-toyota-aqua-bd001',
      year: 2018,
      stockNumber: 'BD001',
      makeId: 'make-1',
      modelId: 'model-1',
    });
    d1QueryMock
      .mockResolvedValueOnce([{ make_name: 'Toyota', model_name: 'Aqua' }])
      .mockResolvedValueOnce([]);
    updateVehicleMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: '2020-toyota-aqua-bd001' });

    const response = await PATCH(new Request('https://example.com', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ year: 2020 }),
    }), context);

    expect(response.status).toBe(200);
    expect(updateVehicleMock).toHaveBeenCalledWith('vehicle-1', expect.objectContaining({
      year: 2020,
      slug: '2020-toyota-aqua-bd001',
    }));
    expect(revalidateInventoryMock).toHaveBeenCalledWith('2020-toyota-aqua-bd001');
  });

  it('deletes an existing vehicle and its R2 assets', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    listImagesMock.mockResolvedValueOnce([{ r2Key: 'vehicles/vehicle-1/a.webp' }]);
    deleteR2ObjectMock.mockResolvedValue(undefined);
    deleteVehicleMock.mockResolvedValueOnce(true);

    const response = await DELETE(new Request('https://example.com'), context);

    expect(response.status).toBe(200);
    expect(deleteR2ObjectMock).toHaveBeenCalledWith('vehicles/vehicle-1/a.webp');
    expect(deleteR2ObjectMock).toHaveBeenCalledWith('vehicles/vehicle-1/a-thumb.webp');
    expect(deleteVehicleMock).toHaveBeenCalledWith('vehicle-1');
  });
});