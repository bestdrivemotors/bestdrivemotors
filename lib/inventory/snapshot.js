import { unstable_cache } from 'next/cache';
import { d1Query, isD1Configured } from '@/lib/db/d1';

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isPublicVehicle(vehicle) {
  return vehicle?.status === 'available';
}

export function mapPublicVehicle(row) {
  if (!isPublicVehicle(row)) return null;

  const features = parseArray(row.features).map((feature) => ({
    id: feature.id,
    name: feature.name,
  }));
  const images = parseArray(row.images).map((image) => ({
    id: image.id,
    url: image.url ?? image.publicUrl ?? image.public_url,
    thumbUrl: image.thumbUrl ?? image.thumb_url,
    sortOrder: image.sortOrder ?? image.sort_order ?? 0,
    isCover: Boolean(image.isCover ?? image.is_cover),
  }));

  return {
    id: row.id,
    status: row.status,
    featured: Boolean(row.featured),
    stockNumber: row.stock_number ?? row.stockNumber,
    slug: row.slug,
    year: row.year,
    makeId: row.make_id ?? row.makeId,
    makeName: row.make_name ?? row.makeName,
    modelId: row.model_id ?? row.modelId,
    modelName: row.model_name ?? row.modelName,
    variant: row.variant ?? '',
    fuelId: row.fuel_id ?? row.fuelId,
    fuelName: row.fuel_name ?? row.fuelName,
    bodyId: row.body_id ?? row.bodyId,
    bodyName: row.body_name ?? row.bodyName,
    priceNzd: row.price_nzd ?? row.priceNzd,
    odometerKm: row.odometer_km ?? row.odometerKm,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    colour: row.colour,
    seats: row.seats,
    doors: row.doors,
    origin: row.origin,
    wofExpiry: row.wof_expiry ?? row.wofExpiry,
    regoExpiry: row.rego_expiry ?? row.regoExpiry,
    description: row.description ?? '',
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
    featureIds: parseArray(row.feature_ids).length
      ? parseArray(row.feature_ids)
      : features.map((feature) => feature.id),
    features,
    images,
  };
}

export function featuredVehicles(vehicles) {
  return vehicles.filter((vehicle) => isPublicVehicle(vehicle) && Boolean(vehicle.featured));
}

const loadCachedInventory = unstable_cache(
  async () => {
    if (!isD1Configured()) return [];

    const rows = await d1Query(`
      SELECT v.*, m.name AS make_name, md.name AS model_name,
        ft.name AS fuel_name, bs.name AS body_name,
        COALESCE((SELECT json_group_array(f.id)
          FROM vehicle_feature vf JOIN feature f ON f.id = vf.feature_id
          WHERE vf.vehicle_id = v.id), '[]') AS feature_ids,
        COALESCE((SELECT json_group_array(json_object(
          'id', vi.id, 'url', vi.public_url, 'thumbUrl', vi.thumb_url,
          'sortOrder', vi.sort_order, 'isCover', vi.is_cover
        )) FROM vehicle_image vi WHERE vi.vehicle_id = v.id), '[]') AS images,
        COALESCE((SELECT json_group_array(json_object('id', f.id, 'name', f.name))
          FROM vehicle_feature vf JOIN feature f ON f.id = vf.feature_id
          WHERE vf.vehicle_id = v.id), '[]') AS features
      FROM vehicle v
      LEFT JOIN make m ON m.id = v.make_id
      LEFT JOIN model md ON md.id = v.model_id
      LEFT JOIN fuel_type ft ON ft.id = v.fuel_id
      LEFT JOIN body_style bs ON bs.id = v.body_id
      WHERE v.status = 'available'
      ORDER BY v.created_at DESC
    `);

    return rows.map(mapPublicVehicle).filter(Boolean);
  },
  ['public-inventory-v1'],
  { revalidate: 300, tags: ['inventory'] },
);

export async function getPublicInventory() {
  return loadCachedInventory();
}