import Image from 'next/image';
import Link from 'next/link';

const currency = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-NZ');

export default function VehicleCard({ vehicle, priority = false }) {
  const cover = vehicle.images?.find((image) => image.isCover) ?? vehicle.images?.[0];
  const imageUrl = cover?.thumbUrl || cover?.url;

  return (
    <article className="min-w-0 overflow-hidden border border-zinc-300 bg-white">
      <Link aria-label={`${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`} className="group block" href={`/vehicles/${vehicle.slug}`}>
        <div className="relative aspect-[4/3] bg-zinc-200">
          {imageUrl ? (
            <Image alt={`${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}`} className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" fill priority={priority} sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 2rem), (max-width: 1280px) 25vw, 22rem" src={imageUrl} />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500">Photos coming soon</div>
          )}
          {vehicle.featured && <span className="absolute left-3 top-3 bg-red-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Featured</span>}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{vehicle.year} · {vehicle.stockNumber}</p>
              <h2 className="mt-1 truncate text-base font-bold text-zinc-950">{vehicle.makeName} {vehicle.modelName}</h2>
              {vehicle.variant && <p className="mt-0.5 truncate text-sm text-zinc-600">{vehicle.variant}</p>}
            </div>
            <p className="shrink-0 text-base font-black text-zinc-950">{currency.format(vehicle.priceNzd)}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-zinc-200 pt-3 text-xs font-medium text-zinc-600">
            <span>{number.format(vehicle.odometerKm)} km</span>
            <span>{vehicle.transmission}</span>
            <span>{vehicle.fuelName}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}