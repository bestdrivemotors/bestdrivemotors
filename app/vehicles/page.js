import VehicleFilters from '../components/VehicleFilters';
import { getPublicInventory } from '@/lib/inventory/snapshot';

export const revalidate = 300;
export const metadata = { title: 'Used vehicles | Best Drive Motors', description: 'Browse available used vehicles at Best Drive Motors.' };

export default async function VehiclesPage() {
  const vehicles = await getPublicInventory();
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-zinc-300 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Best Drive Motors · Auckland</p>
          <h1 className="mt-1 text-3xl font-black">Available vehicles</h1>
        </div>
        <VehicleFilters mode="listing" vehicles={vehicles} />
      </div>
    </main>
  );
}