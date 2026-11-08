import { describe, expect, it } from 'vitest';
import { normalizeVehicleInput, VehicleValidationError } from '@/lib/vehicles/validation';

const validVehicle = {
  stockNumber: 'BD001',
  year: 2018,
  makeId: 'make-1',
  modelId: 'model-1',
  fuelId: 'fuel-1',
  bodyId: 'body-1',
  priceNzd: 12995,
  odometerKm: 85000,
  transmission: 'automatic',
  drivetrain: 'fwd',
  colour: 'White',
  seats: 5,
  doors: 5,
  origin: 'nz_new',
};

describe('normalizeVehicleInput', () => {
  it('applies safe defaults and normalizes user-facing strings', () => {
    expect(normalizeVehicleInput({ ...validVehicle, stockNumber: ' BD001 ' })).toMatchObject({
      stockNumber: 'BD001',
      status: 'draft',
      featured: false,
      variant: '',
      featureIds: [],
    });
  });

  it('rejects invalid status, negative price, and unknown fields', () => {
    expect(() => normalizeVehicleInput({
      ...validVehicle,
      status: 'published',
      priceNzd: -1,
      vin: 'not-stored',
    })).toThrow(VehicleValidationError);
  });

  it('normalizes only explicitly supplied fields for partial updates', () => {
    expect(normalizeVehicleInput({ status: 'sold', featured: true }, { partial: true })).toEqual({
      status: 'sold',
      featured: true,
    });
  });

  it('ignores server-owned fields included when the admin form edits a record', () => {
    expect(normalizeVehicleInput({
      id: 'vehicle-1',
      slug: '2018-toyota-aqua-bd001',
      makeName: 'Toyota',
      modelName: 'Aqua',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      status: 'sold',
    }, { partial: true })).toEqual({ status: 'sold' });
  });

  it('rejects invalid partial update values', () => {
    expect(() => normalizeVehicleInput({ odometerKm: -1 }, { partial: true }))
      .toThrow(VehicleValidationError);
  });
});