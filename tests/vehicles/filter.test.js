import { describe, expect, it } from 'vitest';
import { filterVehicles, sortVehicles } from '@/lib/vehicles/filter';

const aqua = {
  id: '1',
  status: 'available',
  featured: true,
  stockNumber: 'BD001',
  year: 2018,
  makeId: 'toyota',
  makeName: 'Toyota',
  modelId: 'aqua',
  modelName: 'Aqua',
  fuelId: 'petrol',
  bodyId: 'hatch',
  priceNzd: 12995,
  odometerKm: 85000,
  featureIds: ['bt', 'cam'],
  createdAt: '2026-02-01T00:00:00.000Z',
};

const demio = {
  id: '2',
  status: 'available',
  featured: false,
  stockNumber: 'BD002',
  year: 2015,
  makeId: 'mazda',
  makeName: 'Mazda',
  modelId: 'demio',
  modelName: 'Demio',
  fuelId: 'petrol',
  bodyId: 'hatch',
  priceNzd: 8995,
  odometerKm: 120000,
  featureIds: ['bt'],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const ranger = {
  id: '3',
  status: 'available',
  featured: false,
  stockNumber: 'BD003',
  year: 2021,
  makeId: 'ford',
  makeName: 'Ford',
  modelId: 'ranger',
  modelName: 'Ranger',
  fuelId: 'diesel',
  bodyId: 'ute',
  priceNzd: 32995,
  odometerKm: 45000,
  featureIds: ['cam', 'tow'],
  createdAt: '2026-03-01T00:00:00.000Z',
};

describe('filterVehicles', () => {
  it('returns all vehicles when no filters are set', () => {
    expect(filterVehicles([aqua, demio, ranger], {})).toHaveLength(3);
  });

  it('ANDs make, fuel, price, year, km, and required features', () => {
    const result = filterVehicles([aqua, demio, ranger], {
      makeId: 'toyota',
      fuelId: 'petrol',
      minPrice: 10000,
      maxPrice: 15000,
      minYear: 2016,
      maxYear: 2020,
      minKm: 0,
      maxKm: 90000,
      featureIds: ['bt', 'cam'],
    });
    expect(result.map((v) => v.id)).toEqual(['1']);
  });

  it('applies model only when provided', () => {
    const result = filterVehicles([aqua, demio], { makeId: 'toyota', modelId: 'aqua' });
    expect(result.map((v) => v.id)).toEqual(['1']);
  });
});

describe('sortVehicles', () => {
  it('sorts newest first by createdAt', () => {
    expect(sortVehicles([aqua, demio, ranger], 'newest').map((v) => v.id)).toEqual(['3', '1', '2']);
  });

  it('sorts by price and kilometres', () => {
    expect(sortVehicles([aqua, demio, ranger], 'price_asc').map((v) => v.id)).toEqual(['2', '1', '3']);
    expect(sortVehicles([aqua, demio, ranger], 'km_desc').map((v) => v.id)).toEqual(['2', '1', '3']);
  });
});
