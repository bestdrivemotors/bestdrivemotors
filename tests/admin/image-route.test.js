import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  getVehicleByIdMock,
  insertImageMock,
  putR2ObjectMock,
  deleteR2ObjectMock,
  optimizeToWebpMock,
  setImageCoverMock,
  deleteImageMock,
  revalidateInventoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  getVehicleByIdMock: vi.fn(),
  insertImageMock: vi.fn(),
  putR2ObjectMock: vi.fn(),
  deleteR2ObjectMock: vi.fn(),
  optimizeToWebpMock: vi.fn(),
  setImageCoverMock: vi.fn(),
  deleteImageMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({ requireAdminSession: requireAdminSessionMock, adminErrorResponse: adminErrorResponseMock }));
vi.mock('@/lib/vehicles/repository', () => ({ getVehicleById: getVehicleByIdMock, insertImage: insertImageMock, setImageCover: setImageCoverMock, deleteImage: deleteImageMock }));
vi.mock('@/lib/r2', () => ({ putR2Object: putR2ObjectMock, deleteR2Object: deleteR2ObjectMock }));
vi.mock('@/lib/images/optimize', () => ({ optimizeToWebp: optimizeToWebpMock }));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));

import { POST } from '../../app/api/admin/vehicles/[id]/images/route';

afterEach(() => vi.clearAllMocks());

const context = { params: Promise.resolve({ id: 'vehicle-1' }) };

function uploadRequest(fileSize = 4) {
  const form = new FormData();
  form.set('file', new Blob([Buffer.alloc(fileSize)], { type: 'image/jpeg' }), 'car.jpg');
  form.set('isCover', 'true');
  return new Request('https://example.com/api/admin/vehicles/vehicle-1/images', {
    method: 'POST',
    body: form,
  });
}

describe('admin vehicle image API', () => {
  it('stores both WebP variants in R2 before inserting the image row', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    optimizeToWebpMock.mockResolvedValueOnce({ gallery: Buffer.from('gallery'), thumb: Buffer.from('thumb') });
    putR2ObjectMock
      .mockResolvedValueOnce({ key: 'vehicles/vehicle-1/image-1.webp', publicUrl: 'https://cdn/image-1.webp' })
      .mockResolvedValueOnce({ key: 'vehicles/vehicle-1/image-1-thumb.webp', publicUrl: 'https://cdn/image-1-thumb.webp' });
    insertImageMock.mockResolvedValueOnce({ id: 'image-1' });
    setImageCoverMock.mockResolvedValueOnce({ id: 'image-1', isCover: true });

    const response = await POST(uploadRequest(), context);

    expect(response.status).toBe(201);
    expect(putR2ObjectMock).toHaveBeenCalledTimes(2);
    const galleryKey = putR2ObjectMock.mock.calls[0][0].key;
    const thumbKey = putR2ObjectMock.mock.calls[1][0].key;
    expect(thumbKey).toBe(galleryKey.replace(/\.webp$/, '-thumb.webp'));
    expect(insertImageMock).toHaveBeenCalledWith(expect.objectContaining({
      vehicleId: 'vehicle-1',
      r2Key: galleryKey,
      publicUrl: 'https://cdn/image-1.webp',
      thumbUrl: 'https://cdn/image-1-thumb.webp',
      isCover: false,
    }));
    expect(setImageCoverMock).toHaveBeenCalledWith('vehicle-1', expect.any(String));
  });

  it('rejects uploads over 8 MB before optimization or R2 writes', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });

    const response = await POST(uploadRequest(9 * 1024 * 1024), context);

    expect(response.status).toBe(413);
    expect(optimizeToWebpMock).not.toHaveBeenCalled();
    expect(putR2ObjectMock).not.toHaveBeenCalled();
    expect(insertImageMock).not.toHaveBeenCalled();
  });

  it('removes R2 objects if the database row insert fails', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    optimizeToWebpMock.mockResolvedValueOnce({ gallery: Buffer.from('gallery'), thumb: Buffer.from('thumb') });
    putR2ObjectMock
      .mockResolvedValueOnce({ key: 'vehicles/vehicle-1/image-1.webp', publicUrl: 'https://cdn/image-1.webp' })
      .mockResolvedValueOnce({ key: 'vehicles/vehicle-1/image-1-thumb.webp', publicUrl: 'https://cdn/image-1-thumb.webp' });
    insertImageMock.mockRejectedValueOnce(new Error('D1 unavailable'));

    const response = await POST(uploadRequest(), context);

    expect(response.status).toBe(500);
    expect(deleteR2ObjectMock).toHaveBeenCalledTimes(2);
  });

  it('does not insert an image row if either R2 upload fails', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    optimizeToWebpMock.mockResolvedValueOnce({ gallery: Buffer.from('gallery'), thumb: Buffer.from('thumb') });
    putR2ObjectMock
      .mockResolvedValueOnce({ key: 'vehicles/vehicle-1/image.webp', publicUrl: 'https://cdn/image.webp' })
      .mockRejectedValueOnce(new Error('R2 unavailable'));

    const response = await POST(uploadRequest(), context);

    expect(response.status).toBe(500);
    expect(deleteR2ObjectMock).toHaveBeenCalledWith(putR2ObjectMock.mock.calls[0][0].key);
    expect(insertImageMock).not.toHaveBeenCalled();
  });

  it('returns a client error when the image cannot be decoded', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    getVehicleByIdMock.mockResolvedValueOnce({ id: 'vehicle-1', slug: 'car' });
    optimizeToWebpMock.mockRejectedValueOnce(Object.assign(new Error('Unable to process this image.'), { status: 400 }));

    const response = await POST(uploadRequest(), context);

    expect(response.status).toBe(400);
    expect(insertImageMock).not.toHaveBeenCalled();
  });
});