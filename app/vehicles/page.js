import VehicleFilters from '../components/VehicleFilters';
import { getPublicInventory } from '@/lib/inventory/snapshot';
import { buildVehicleListingRobots } from '@/lib/seo/metadata';

export const revalidate = 300;

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  return {
    title: 'Available Used Vehicles in South Auckland',
    description: 'Browse the vehicles currently available at Best Drive Motors in South Auckland.',
    alternates: { canonical: '/vehicles' },
    robots: buildVehicleListingRobots(params),
  };
}

export default async function VehiclesPage() {
  const vehicles = await getPublicInventory();
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-zinc-300 pb-4">
          <p className="text-xs font-bold uppercase text-red-700">Best Drive Motors · South Auckland</p>
          <h1 className="mt-1 text-3xl font-black">Available vehicles</h1>
        </div>
        <VehicleFilters mode="listing" vehicles={vehicles} />
      </div>
    </main>
  );
}