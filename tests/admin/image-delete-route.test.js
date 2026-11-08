import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  getVehicleByIdMock,
  listImagesMock,
  deleteImageMock,
  deleteR2ObjectMock,
  revalidateInventoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  getVehicleByIdMock: vi.fn(),
  listImagesMock: vi.fn(),
  deleteImageMock: vi.fn(),
  deleteR2ObjectMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({ requireAdminSession: requireAdminSessionMock, adminErrorResponse: adminErrorResponseMock }));
vi.mock('@/lib/vehicles/repository', () => ({
  getVehicleById: getVehicleByIdMock,
  listImages: listImagesMock,
  deleteImage: deleteImageMock,
}));
vi.mock('@/lib/r2', () => ({ deleteR2Object: deleteR2ObjectMock }));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));

import { DELETE } from '../../app/api/admin/vehicles/[id]/images/[imageId]/route';

afterEach(() => vi.clearAllMocks());

describe('admin vehicle image deletion API', () => {
  it('deletes gallery and thumbnail objects before removing the database row', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    listImagesMock.mockResolvedValueOnce([{ id: 'image-1', r2Key: 'vehicles/vehicle-1/image.webp' }]);
    deleteR2ObjectMock.mockResolvedValue(undefined);
    deleteImageMock.mockResolvedValueOnce(true);

    const response = await DELETE(new Request('https://example.com'), {
      params: Promise.resolve({ id: 'vehicle-1', imageId: 'image-1' }),
    });

    expect(response.status).toBe(200);
    expect(deleteR2ObjectMock.mock.calls.map(([key]) => key)).toEqual([
      'vehicles/vehicle-1/image.webp',
      'vehicles/vehicle-1/image-thumb.webp',
    ]);
    expect(deleteImageMock).toHaveBeenCalledWith('image-1');
  });
});