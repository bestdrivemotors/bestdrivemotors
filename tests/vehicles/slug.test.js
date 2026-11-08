import { describe, expect, it } from 'vitest';
import { buildVehicleSlug, ensureUniqueSlug } from '@/lib/vehicles/slug';

describe('buildVehicleSlug', () => {
  it('builds a lowercase dashed slug from year, make, model, and stock number', () => {
    expect(
      buildVehicleSlug({
        year: 2018,
        makeName: 'Toyota',
        modelName: 'Aqua',
        stockNumber: 'BD001',
      }),
    ).toBe('2018-toyota-aqua-bd001');
  });

  it('collapses punctuation and extra spaces', () => {
    expect(
      buildVehicleSlug({
        year: 2020,
        makeName: 'Mercedes-Benz',
        modelName: 'C 200',
        stockNumber: 'BD 99',
      }),
    ).toBe('2020-mercedes-benz-c-200-bd-99');
  });
});

describe('ensureUniqueSlug', () => {
  it('returns the slug when it is unused', () => {
    expect(ensureUniqueSlug('2018-toyota-aqua-bd001', [])).toBe('2018-toyota-aqua-bd001');
  });

  it('appends a short vehicle ID suffix when the slug is taken', () => {
    expect(ensureUniqueSlug('car', ['car'], 'a1b2c3d4-0000')).toBe('car-a1b2c3d4');
  });

  it('keeps the slug unique if the short ID suffix is also taken', () => {
    expect(ensureUniqueSlug('car', ['car', 'car-a1b2c3d4'], 'a1b2c3d4-0000')).toBe(
      'car-a1b2c3d4-2',
    );
  });
});
