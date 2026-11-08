import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicInventory } from '@/lib/inventory/snapshot';
import { dealershipContact } from '@/lib/contact';
import VehicleGallery from '@/app/components/VehicleGallery';
import VehicleContactActions from '@/app/components/VehicleContactActions';
import VehicleSpecifications from '@/app/components/VehicleSpecifications';
import AnswerFaq from '@/app/components/AnswerFaq';
import { buildVehicleSchema, serializeJsonLd } from '@/lib/seo/metadata';

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
    title: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`,
    description: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName} for ${new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(vehicle.priceNzd)}. View specifications and photos.`,
    alternates: { canonical: `/vehicles/${slug}` },
    openGraph: {
      title: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName} | Best Drive Motors`,
      description: `View photos, specifications, and price for this ${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}.`,
      type: 'website',
    },
  };
}

export default async function VehicleDetailPage({ params }) {
  const { slug } = await params;
  const vehicle = await findVehicle(slug);
  if (!vehicle) notFound();

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
    <main className="min-h-screen bg-white px-4 py-6 pb-32 text-zinc-950 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <Link className="text-sm font-semibold text-red-700 hover:underline" href="/vehicles">← All vehicles</Link>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <section aria-label="Vehicle gallery" className="min-w-0">
            <VehicleGallery images={vehicle.images} title={`${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`} />
          </section>

          <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Stock {vehicle.stockNumber}</p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{vehicle.year} {vehicle.makeName} {vehicle.modelName}</h1>
            {vehicle.variant && <p className="mt-1 text-lg text-zinc-600">{vehicle.variant}</p>}
            <p className="mt-4 text-2xl font-black sm:text-3xl">{currency.format(vehicle.priceNzd)}</p>
            <p className="mt-1 text-sm text-zinc-600">{number.format(vehicle.odometerKm)} km</p>
            <VehicleContactActions phoneHref={dealershipContact.phone.href} phoneLabel={dealershipContact.phone.label} />

            <VehicleSpecifications features={vehicle.features} specs={specs} />
          </section>
        </div>
        {vehicle.description && <section className="mt-10 max-w-4xl border-t border-zinc-300 pt-5"><h2 className="text-lg font-bold">Vehicle description</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">{vehicle.description}</p></section>}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildVehicleSchema(vehicle)) }}
      />
      <AnswerFaq
        title="Questions about this vehicle"
        items={[
          { question: 'How can I ask about this vehicle?', answer: `Call Best Drive Motors on ${dealershipContact.phone.label} and mention stock number ${vehicle.stockNumber}.` },
          { question: 'How can I explore finance options?', answer: 'Visit the finance page to read about finance assistance and start an application. An application does not guarantee approval.' },
        ]}
      />
    </main>
  );
}