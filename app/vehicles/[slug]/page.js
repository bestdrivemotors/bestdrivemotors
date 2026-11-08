import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicInventory } from '@/lib/inventory/snapshot';

export const revalidate = 300;

async function findVehicle(slug) {
  const vehicles = await getPublicInventory();
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = await findVehicle(slug);
  if (!vehicle) return { title: 'Vehicle not found | Best Drive Motors' };
  return {
    title: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName} | Best Drive Motors`,
    description: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName} for ${new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(vehicle.priceNzd)}. View specifications and photos.`,
  };
}

export default async function VehicleDetailPage({ params }) {
  const { slug } = await params;
  const vehicle = await findVehicle(slug);
  if (!vehicle) notFound();

  const images = [...(vehicle.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const cover = images.find((image) => image.isCover) ?? images[0];
  const currency = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat('en-NZ');
  const specs = [
    ['Year', vehicle.year],
    ['Make', vehicle.makeName],
    ['Model', vehicle.modelName],
    ['Variant', vehicle.variant || '—'],
    ['Odometer', `${number.format(vehicle.odometerKm)} km`],
    ['Fuel', vehicle.fuelName],
    ['Body style', vehicle.bodyName],
    ['Transmission', vehicle.transmission],
    ['Drivetrain', vehicle.drivetrain?.toUpperCase()],
    ['Colour', vehicle.colour],
    ['Seats', vehicle.seats],
    ['Doors', vehicle.doors],
    ['Origin', vehicle.origin === 'nz_new' ? 'NZ new' : 'Import'],
    ['WOF expiry', vehicle.wofExpiry || '—'],
    ['Registration expiry', vehicle.regoExpiry || '—'],
    ['Stock number', vehicle.stockNumber],
  ];

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link className="text-sm font-semibold text-red-700 hover:underline" href="/vehicles">← All vehicles</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <section aria-label="Vehicle gallery">
            <div className="relative aspect-[4/3] bg-zinc-200">
              {cover?.url ? (
                <Image alt={`${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 65vw" src={cover.url} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-wide text-zinc-500">Photos coming soon</div>
              )}
            </div>
            {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{images.filter((image) => image.id !== cover?.id).map((image) => (
              <div key={image.id} className="relative aspect-[4/3] bg-zinc-200">
                <Image alt={`${vehicle.makeName} ${vehicle.modelName} photo`} className="object-cover" fill sizes="(max-width: 640px) 25vw, 12vw" src={image.thumbUrl || image.url} />
              </div>
            ))}</div>}
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Stock {vehicle.stockNumber}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">{vehicle.year} {vehicle.makeName} {vehicle.modelName}</h1>
            {vehicle.variant && <p className="mt-1 text-lg text-zinc-600">{vehicle.variant}</p>}
            <p className="mt-4 text-3xl font-black">{currency.format(vehicle.priceNzd)}</p>
            <p className="mt-1 text-sm text-zinc-600">{number.format(vehicle.odometerKm)} km</p>
            <Link className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800 sm:w-auto" href="/finance">Explore finance options</Link>

            <div className="mt-8 border-y border-zinc-300">
              <h2 className="py-3 text-sm font-bold uppercase tracking-wide">Specifications</h2>
              <dl className="grid grid-cols-2 border-t border-zinc-200 text-sm">
                {specs.map(([label, value]) => <div key={label} className="border-b border-zinc-200 py-2.5 pr-2"><dt className="text-xs font-medium text-zinc-500">{label}</dt><dd className="mt-0.5 font-semibold capitalize">{value}</dd></div>)}
              </dl>
            </div>
            {vehicle.features?.length > 0 && <div className="mt-6"><h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Features</h2><ul className="grid grid-cols-2 gap-2 text-sm text-zinc-700">{vehicle.features.map((feature) => <li key={feature.id} className="border-l-2 border-red-700 pl-2">{feature.name}</li>)}</ul></div>}
          </section>
        </div>
        {vehicle.description && <section className="mt-10 max-w-4xl border-t border-zinc-300 pt-5"><h2 className="text-lg font-bold">Vehicle description</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{vehicle.description}</p></section>}
      </div>
    </main>
  );
}