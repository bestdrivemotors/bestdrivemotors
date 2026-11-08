'use client';

import { startTransition, useEffect, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { filterVehicles, sortVehicles } from '@/lib/vehicles/filter';
import { searchVehicles } from '@/lib/vehicles/search';
import VehicleCard from './VehicleCard';

const STORAGE_KEY = 'vehicle_listing_filters';
const EMPTY_FILTERS = {
  makeId: '', modelId: '', fuelId: '', bodyId: '', minPrice: '', maxPrice: '',
  minYear: '', maxYear: '', minKm: '', maxKm: '', featureIds: [],
};

function uniqueOptions(vehicles, idKey, nameKey) {
  const values = new Map();
  for (const vehicle of vehicles) {
    if (vehicle[idKey] && vehicle[nameKey]) values.set(vehicle[idKey], vehicle[nameKey]);
  }
  return [...values].sort((a, b) => a[1].localeCompare(b[1]));
}

export default function VehicleFilters({ vehicles, mode = 'listing' }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (mode !== 'listing') return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved) startTransition(() => setFilters({ ...EMPTY_FILTERS, ...saved }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [mode]);

  function updateFilter(key, value) {
    const updated = { ...filters, [key]: value };
    if (key === 'makeId') updated.modelId = '';
    setFilters(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setSort('newest');
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const selectedFeatures = new Set(filters.featureIds);
  const availableFeatures = new Map();
  for (const vehicle of vehicles) {
    for (const feature of vehicle.features ?? []) availableFeatures.set(feature.id, feature.name);
  }
  const filtered = mode === 'search'
    ? searchVehicles(vehicles, query)
    : filterVehicles(vehicles, {
        ...filters,
        minPrice: filters.minPrice === '' ? undefined : Number(filters.minPrice),
        maxPrice: filters.maxPrice === '' ? undefined : Number(filters.maxPrice),
        minYear: filters.minYear === '' ? undefined : Number(filters.minYear),
        maxYear: filters.maxYear === '' ? undefined : Number(filters.maxYear),
        minKm: filters.minKm === '' ? undefined : Number(filters.minKm),
        maxKm: filters.maxKm === '' ? undefined : Number(filters.maxKm),
      });
  const results = sortVehicles(filtered, sort);
  const makes = uniqueOptions(vehicles, 'makeId', 'makeName');
  const models = uniqueOptions(vehicles.filter((vehicle) => !filters.makeId || vehicle.makeId === filters.makeId), 'modelId', 'modelName');
  const fuels = uniqueOptions(vehicles, 'fuelId', 'fuelName');
  const bodies = uniqueOptions(vehicles, 'bodyId', 'bodyName');
  const inputClass = 'min-h-10 w-full border border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none focus:border-red-700';
  const labelClass = 'block text-xs font-semibold text-zinc-600';

  return (
    <div>
      {mode === 'search' ? (
        <label className="mb-6 flex min-h-12 items-center gap-3 border border-zinc-300 bg-white px-4 focus-within:border-red-700">
          <FiSearch aria-hidden="true" className="shrink-0 text-zinc-500" />
          <input aria-label="Search vehicles" autoComplete="off" className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Year, make, model, variant, or stock number" value={query} />
          {query && <button aria-label="Clear search" className="text-zinc-500 hover:text-zinc-950" onClick={() => setQuery('')} type="button"><FiX aria-hidden="true" /></button>}
        </label>
      ) : (
        <div className="mb-6 border-y border-zinc-300 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide">Filter vehicles</h2>
            <button className="text-xs font-semibold text-red-700 hover:underline" onClick={clearFilters} type="button">Clear all</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className={labelClass}>Make<select className={`${inputClass} mt-1`} onChange={(event) => updateFilter('makeId', event.target.value)} value={filters.makeId}><option value="">All makes</option>{makes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={labelClass}>Model<select className={`${inputClass} mt-1`} disabled={!filters.makeId} onChange={(event) => updateFilter('modelId', event.target.value)} value={filters.modelId}><option value="">All models</option>{models.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={labelClass}>Fuel<select className={`${inputClass} mt-1`} onChange={(event) => updateFilter('fuelId', event.target.value)} value={filters.fuelId}><option value="">Any fuel</option>{fuels.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={labelClass}>Body style<select className={`${inputClass} mt-1`} onChange={(event) => updateFilter('bodyId', event.target.value)} value={filters.bodyId}><option value="">Any body style</option>{bodies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label className={labelClass}>Minimum price<input className={`${inputClass} mt-1`} min="0" onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="NZD" type="number" value={filters.minPrice} /></label>
            <label className={labelClass}>Maximum price<input className={`${inputClass} mt-1`} min="0" onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="NZD" type="number" value={filters.maxPrice} /></label>
            <label className={labelClass}>From year<input className={`${inputClass} mt-1`} min="1900" onChange={(event) => updateFilter('minYear', event.target.value)} placeholder="Year" type="number" value={filters.minYear} /></label>
            <label className={labelClass}>To year<input className={`${inputClass} mt-1`} min="1900" onChange={(event) => updateFilter('maxYear', event.target.value)} placeholder="Year" type="number" value={filters.maxYear} /></label>
            <label className={labelClass}>Minimum kilometres<input className={`${inputClass} mt-1`} min="0" onChange={(event) => updateFilter('minKm', event.target.value)} placeholder="km" type="number" value={filters.minKm} /></label>
            <label className={labelClass}>Maximum kilometres<input className={`${inputClass} mt-1`} min="0" onChange={(event) => updateFilter('maxKm', event.target.value)} placeholder="km" type="number" value={filters.maxKm} /></label>
          </div>
          {availableFeatures.size > 0 && (
            <fieldset className="mt-4">
              <legend className={`${labelClass} mb-2`}>Features (all selected)</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[...availableFeatures].map(([id, name]) => (
                  <label key={id} className="inline-flex items-center gap-2 text-sm text-zinc-700">
                    <input checked={selectedFeatures.has(id)} onChange={() => updateFilter('featureIds', selectedFeatures.has(id) ? filters.featureIds.filter((value) => value !== id) : [...filters.featureIds, id])} type="checkbox" />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <p className="text-sm text-zinc-600">{mode === 'search' && !query.trim() ? 'Enter a search term to find a vehicle.' : `${results.length} ${results.length === 1 ? 'vehicle' : 'vehicles'}`}</p>
        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">Sort by
          <select className="min-h-9 border border-zinc-300 bg-white px-2 text-sm text-zinc-900" onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="km_asc">Lowest kilometres</option><option value="km_desc">Highest kilometres</option>
          </select>
        </label>
      </div>
      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      ) : (
        <p className="border-y border-zinc-200 py-10 text-center text-sm text-zinc-600">{mode === 'search' && !query.trim() ? 'Search by year, make, model, variant, or stock number.' : 'No vehicles match these filters.'}</p>
      )}
    </div>
  );
}