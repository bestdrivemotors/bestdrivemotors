import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  requireAdminSessionMock,
  adminErrorResponseMock,
  listAllVehiclesMock,
  insertVehicleMock,
  replaceFeaturesMock,
  revalidateInventoryMock,
  d1QueryMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  adminErrorResponseMock: vi.fn((error) => Response.json(
    { message: error.message },
    { status: error.status ?? 500 },
  )),
  listAllVehiclesMock: vi.fn(),
  insertVehicleMock: vi.fn(),
  replaceFeaturesMock: vi.fn(),
  revalidateInventoryMock: vi.fn(),
  d1QueryMock: vi.fn(),
}));

vi.mock('@/app/api/admin/session', () => ({
  requireAdminSession: requireAdminSessionMock,
  adminErrorResponse: adminErrorResponseMock,
}));
vi.mock('@/lib/vehicles/repository', () => ({
  listAllVehicles: listAllVehiclesMock,
  insertVehicle: insertVehicleMock,
  replaceFeatures: replaceFeaturesMock,
}));
vi.mock('@/lib/revalidate-inventory', () => ({ revalidateInventory: revalidateInventoryMock }));
vi.mock('@/lib/db/d1', () => ({ d1Query: d1QueryMock }));

import { GET, POST } from '../../app/api/admin/vehicles/route';

afterEach(() => vi.clearAllMocks());

describe('admin vehicle collection API', () => {
  it('rejects unauthenticated GET requests', async () => {
    requireAdminSessionMock.mockRejectedValueOnce({ status: 401, message: 'Authentication required.' });

    const response = await GET(new Request('https://example.com/api/admin/vehicles'));

    expect(response.status).toBe(401);
    expect(listAllVehiclesMock).not.toHaveBeenCalled();
  });

  it('rejects invalid vehicle input before database writes', async () => {
    requireAdminSessionMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });

    const response = await POST(new Request('https://example.com/api/admin/vehicles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'published', vin: 'not-accepted' }),
    }));

    expect(response.status).toBe(400);
    expect(insertVehicleMock).not.toHaveBeenCalled();
    expect(d1QueryMock).not.toHaveBeenCalled();
  });
});