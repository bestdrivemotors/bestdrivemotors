'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { MdClose, MdTune } from 'react-icons/md';
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
  const filterDialogRef = useRef(null);

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
  const searchedVehicles = mode === 'search' ? searchVehicles(vehicles, query) : vehicles;
  const filtered = filterVehicles(searchedVehicles, {
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
  const inputClass = 'mt-1 min-h-10 w-full border border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700';
  const labelClass = 'block text-xs font-semibold text-zinc-600';
  const countLabel = `${results.length} ${results.length === 1 ? 'vehicle' : 'vehicles'}`;

  const filterPanel = (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase text-zinc-950">Filter vehicles</h2>
        <button className="text-xs font-semibold text-red-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700" onClick={clearFilters} type="button">Clear all</button>
      </div>
      <div className="grid gap-3">
        <label className={labelClass}>Make<select className={inputClass} onChange={(event) => updateFilter('makeId', event.target.value)} value={filters.makeId}><option value="">All makes</option>{makes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className={labelClass}>Model<select className={inputClass} disabled={!filters.makeId} onChange={(event) => updateFilter('modelId', event.target.value)} value={filters.modelId}><option value="">All models</option>{models.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className={labelClass}>Fuel<select className={inputClass} onChange={(event) => updateFilter('fuelId', event.target.value)} value={filters.fuelId}><option value="">Any fuel</option>{fuels.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className={labelClass}>Body style<select className={inputClass} onChange={(event) => updateFilter('bodyId', event.target.value)} value={filters.bodyId}><option value="">Any body style</option>{bodies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className={labelClass}>Minimum price<input className={inputClass} min="0" onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="NZD" type="number" value={filters.minPrice} /></label>
        <label className={labelClass}>Maximum price<input className={inputClass} min="0" onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="NZD" type="number" value={filters.maxPrice} /></label>
        <label className={labelClass}>From year<input className={inputClass} min="1900" onChange={(event) => updateFilter('minYear', event.target.value)} placeholder="Year" type="number" value={filters.minYear} /></label>
        <label className={labelClass}>To year<input className={inputClass} min="1900" onChange={(event) => updateFilter('maxYear', event.target.value)} placeholder="Year" type="number" value={filters.maxYear} /></label>
        <label className={labelClass}>Minimum kilometres<input className={inputClass} min="0" onChange={(event) => updateFilter('minKm', event.target.value)} placeholder="km" type="number" value={filters.minKm} /></label>
        <label className={labelClass}>Maximum kilometres<input className={inputClass} min="0" onChange={(event) => updateFilter('maxKm', event.target.value)} placeholder="km" type="number" value={filters.maxKm} /></label>
      </div>
      {availableFeatures.size > 0 && (
        <fieldset className="mt-5 border-t border-zinc-200 pt-4">
          <legend className={`${labelClass} mb-3`}>Features (all selected)</legend>
          <div className="grid gap-2">
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
  );

  const resultsToolbar = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
      <p aria-live="polite" className="text-sm text-zinc-600">{mode === 'search' && !query.trim() ? 'Enter a search term to find a vehicle.' : countLabel}</p>
      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">Sort by
        <select className="min-h-10 border border-zinc-300 bg-white px-2 text-sm text-zinc-900 focus:border-red-700 focus:outline-none" onChange={(event) => setSort(event.target.value)} value={sort}>
          <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="km_asc">Lowest kilometres</option><option value="km_desc">Highest kilometres</option>
        </select>
      </label>
    </div>
  );

  const resultsContent = results.length ? (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.map((vehicle, index) => <VehicleCard key={vehicle.id} priority={index === 0} vehicle={vehicle} />)}</div>
  ) : (
    <p className="border-y border-zinc-200 py-10 text-center text-sm text-zinc-600">{mode === 'search' && !query.trim() ? 'Search by year, make, model, variant, or stock number.' : 'No vehicles match these filters.'}</p>
  );

  return (
    <div>
      {mode === 'search' && (
        <label className="mb-6 flex min-h-12 items-center gap-3 border border-zinc-300 bg-white px-4 focus-within:border-red-700 focus-within:ring-1 focus-within:ring-red-700">
          <FiSearch aria-hidden="true" className="shrink-0 text-zinc-500" />
          <input aria-label="Search vehicles" autoComplete="off" className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Year, make, model, variant, or stock number" value={query} />
          {query && <button aria-label="Clear search" className="text-zinc-500 hover:text-zinc-950" onClick={() => setQuery('')} type="button"><FiX aria-hidden="true" /></button>}
        </label>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 border-y border-zinc-300 py-5">{filterPanel}</div>
        </aside>
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
            <button
              aria-controls="vehicle-filter-dialog"
              aria-label="Open vehicle filters"
              className="inline-flex min-h-11 items-center gap-2 border border-zinc-300 px-4 text-sm font-bold text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              onClick={() => filterDialogRef.current?.showModal()}
              type="button"
            >
              <MdTune aria-hidden="true" className="text-lg" />
              Filters
            </button>
            <p className="text-sm text-zinc-600">{countLabel}</p>
          </div>
          <dialog
            aria-labelledby="vehicle-filter-title"
            className="m-0 mt-auto h-[88dvh] max-h-[88dvh] w-full max-w-none border-0 p-0 text-zinc-950 backdrop:bg-black/55 lg:hidden"
            id="vehicle-filter-dialog"
            onClick={(event) => {
              if (event.target === filterDialogRef.current) filterDialogRef.current.close();
            }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') filterDialogRef.current?.close();
              }}
            ref={filterDialogRef}
          >
            <div className="flex h-full flex-col bg-white">
              <div className="flex min-h-16 items-center justify-between border-b border-zinc-200 px-5">
                <h2 className="font-bold text-zinc-950" id="vehicle-filter-title">Filter vehicles</h2>
                <button aria-label="Close vehicle filters" className="flex size-11 items-center justify-center text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700" onClick={() => filterDialogRef.current?.close()} title="Close filters" type="button">
                  <MdClose aria-hidden="true" className="text-xl" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">{filterPanel}</div>
              <div className="border-t border-zinc-200 p-4">
                <button className="min-h-12 w-full bg-red-700 px-5 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" onClick={() => filterDialogRef.current?.close()} type="button">
                  Show {countLabel}
                </button>
              </div>
            </div>
          </dialog>
          {resultsToolbar}
          {resultsContent}
        </section>
      </div>
    </div>
  );
}
