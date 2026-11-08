import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  getVehicleByIdMock,
  listImagesMock,
  setImageCoverMock,
  updateImageMock,
  revalidateInventoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  getVehicleByIdMock: vi.fn(),
  listImagesMock: vi.fn(),
  setImageCoverMock: vi.fn(),
  updateImageMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({ requireAdminSession: requireAdminSessionMock, adminErrorResponse: adminErrorResponseMock }));
vi.mock('@/lib/vehicles/repository', () => ({
  getVehicleById: getVehicleByIdMock,
  listImages: listImagesMock,
  setImageCover: setImageCoverMock,
  updateImage: updateImageMock,
}));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));

import { PATCH } from '../../app/api/admin/vehicles/[id]/images/[imageId]/route';

afterEach(() => vi.clearAllMocks());

describe('admin vehicle image update API', () => {
  it('sets the selected gallery image as the vehicle cover', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    listImagesMock.mockResolvedValueOnce([{ id: 'image-1', isCover: false }]);
    setImageCoverMock.mockResolvedValueOnce({ id: 'image-1', isCover: true });

    const response = await PATCH(new Request('https://example.com', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isCover: true }),
    }), { params: Promise.resolve({ id: 'vehicle-1', imageId: 'image-1' }) });

    expect(response.status).toBe(200);
    expect(setImageCoverMock).toHaveBeenCalledWith('vehicle-1', 'image-1');
    expect(revalidateInventoryMock).toHaveBeenCalledWith('car');
  });
});