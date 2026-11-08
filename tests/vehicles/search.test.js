import { describe, expect, it } from 'vitest';
import { searchVehicles } from '@/lib/vehicles/search';

const vehicles = [
  {
    year: 2018,
    makeName: 'Toyota',
    modelName: 'Aqua',
    variant: 'S',
    stockNumber: 'BD001',
  },
  {
    year: 2015,
    makeName: 'Mazda',
    modelName: 'Demio',
    variant: '',
    stockNumber: 'BD002',
  },
];

describe('searchVehicles', () => {
  it('returns an empty list for a blank query so search does not dump the full lot', () => {
    expect(searchVehicles(vehicles, '   ')).toEqual([]);
  });

  it('matches year, make, model, variant, or stock number case-insensitively', () => {
    expect(searchVehicles(vehicles, 'aqua').map((v) => v.stockNumber)).toEqual(['BD001']);
    expect(searchVehicles(vehicles, '2015').map((v) => v.stockNumber)).toEqual(['BD002']);
    expect(searchVehicles(vehicles, 'bd001').map((v) => v.stockNumber)).toEqual(['BD001']);
  });
});
