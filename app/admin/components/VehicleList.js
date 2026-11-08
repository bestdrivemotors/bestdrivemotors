'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

const currency = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-NZ');

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadVehicles() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/vehicles', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load vehicles.');
      setVehicles(data.vehicles ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-300 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Inventory</p>
          <h1 className="mt-1 text-2xl font-black">Vehicles</h1>
        </div>
        <div className="flex gap-2">
          <button aria-label="Refresh vehicles" className="inline-flex size-10 items-center justify-center border border-zinc-300 bg-white hover:bg-zinc-50" onClick={loadVehicles} title="Refresh" type="button">
            <FiRefreshCw aria-hidden="true" />
          </button>
          <Link className="inline-flex min-h-10 items-center gap-2 bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800" href="/admin/vehicles/new">
            <FiPlus aria-hidden="true" /> Add vehicle
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
      <div className="overflow-x-auto border border-zinc-300 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-bold">Vehicle</th>
              <th className="px-4 py-3 font-bold">Stock</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="px-4 py-3 font-bold">Odometer</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading && <tr><td className="px-4 py-8 text-zinc-500" colSpan="6">Loading vehicles…</td></tr>}
            {!loading && !error && vehicles.length === 0 && <tr><td className="px-4 py-8 text-zinc-500" colSpan="6">No vehicles yet.</td></tr>}
            {!loading && vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <span className="font-bold">{vehicle.year} {vehicle.makeName} {vehicle.modelName}</span>
                  {vehicle.variant && <span className="ml-1 text-zinc-500">{vehicle.variant}</span>}
                </td>
                <td className="px-4 py-3 text-zinc-600">{vehicle.stockNumber}</td>
                <td className="px-4 py-3 font-semibold">{currency.format(vehicle.priceNzd)}</td>
                <td className="px-4 py-3 text-zinc-600">{number.format(vehicle.odometerKm)} km</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex border px-2 py-1 text-xs font-bold uppercase ${vehicle.status === 'available' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : vehicle.status === 'sold' ? 'border-zinc-300 bg-zinc-100 text-zinc-600' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                    {vehicle.status}
                  </span>
                  {vehicle.featured && <span className="ml-2 text-xs font-semibold text-red-700">Featured</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link className="font-semibold text-red-700 hover:underline" href={`/admin/vehicles/${vehicle.id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}