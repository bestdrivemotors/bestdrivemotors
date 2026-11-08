import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  listMakesMock,
  listModelsMock,
  listFuelTypesMock,
  listBodyStylesMock,
  listFeaturesMock,
  createMakeMock,
  createModelMock,
  createFuelTypeMock,
  createBodyStyleMock,
  createFeatureMock,
  updateMakeMock,
  updateModelMock,
  updateFuelTypeMock,
  updateBodyStyleMock,
  updateFeatureMock,
  deleteMakeMock,
  deleteModelMock,
  deleteFuelTypeMock,
  deleteBodyStyleMock,
  deleteFeatureMock,
  revalidateInventoryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json({ message: error.message }, { status: error.status ?? 500 })),
  listMakesMock: vi.fn(),
  listModelsMock: vi.fn(),
  listFuelTypesMock: vi.fn(),
  listBodyStylesMock: vi.fn(),
  listFeaturesMock: vi.fn(),
  createMakeMock: vi.fn(),
  createModelMock: vi.fn(),
  createFuelTypeMock: vi.fn(),
  createBodyStyleMock: vi.fn(),
  createFeatureMock: vi.fn(),
  updateMakeMock: vi.fn(),
  updateModelMock: vi.fn(),
  updateFuelTypeMock: vi.fn(),
  updateBodyStyleMock: vi.fn(),
  updateFeatureMock: vi.fn(),
  deleteMakeMock: vi.fn(),
  deleteModelMock: vi.fn(),
  deleteFuelTypeMock: vi.fn(),
  deleteBodyStyleMock: vi.fn(),
  deleteFeatureMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({ requireAdminSession: requireAdminSessionMock, adminErrorResponse: adminErrorResponseMock }));
vi.mock('@/lib/lookups/repository', () => ({
  listMakes: listMakesMock,
  listModels: listModelsMock,
  listFuelTypes: listFuelTypesMock,
  listBodyStyles: listBodyStylesMock,
  listFeatures: listFeaturesMock,
  createMake: createMakeMock,
  createModel: createModelMock,
  createFuelType: createFuelTypeMock,
  createBodyStyle: createBodyStyleMock,
  createFeature: createFeatureMock,
  updateMake: updateMakeMock,
  updateModel: updateModelMock,
  updateFuelType: updateFuelTypeMock,
  updateBodyStyle: updateBodyStyleMock,
  updateFeature: updateFeatureMock,
  deleteMake: deleteMakeMock,
  deleteModel: deleteModelMock,
  deleteFuelType: deleteFuelTypeMock,
  deleteBodyStyle: deleteBodyStyleMock,
  deleteFeature: deleteFeatureMock,
}));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));

import { GET, POST } from '../../app/api/admin/lookups/route';

afterEach(() => vi.clearAllMocks());

describe('admin lookups API', () => {
  it('requires an authenticated admin to read lookup values', async () => {
    requireAdminSessionMock.mockRejectedValueOnce({ status: 401, message: 'Authentication required.' });

    const response = await GET(new Request('https://example.com/api/admin/lookups'));

    expect(response.status).toBe(401);
    expect(listMakesMock).not.toHaveBeenCalled();
  });

  it('creates a model under the selected make', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    createModelMock.mockResolvedValueOnce({ id: 'model-1', makeId: 'make-1', name: 'Civic' });

    const response = await POST(new Request('https://example.com/api/admin/lookups', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'model', makeId: 'make-1', name: 'Civic' }),
    }));

    expect(response.status).toBe(201);
    expect(createModelMock).toHaveBeenCalledWith('make-1', 'Civic');
  });
});