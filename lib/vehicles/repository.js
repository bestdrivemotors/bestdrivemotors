import { d1Batch, d1Query } from '@/lib/db/d1';
import { ensureUniqueSlug } from '@/lib/vehicles/slug';

const VEHICLE_FIELDS = {
  id: 'id',
  status: 'status',
  featured: 'featured',
  stockNumber: 'stock_number',
  slug: 'slug',
  year: 'year',
  makeId: 'make_id',
  modelId: 'model_id',
  fuelId: 'fuel_id',
  bodyId: 'body_id',
  variant: 'variant',
  priceNzd: 'price_nzd',
  odometerKm: 'odometer_km',
  transmission: 'transmission',
  drivetrain: 'drivetrain',
  colour: 'colour',
  seats: 'seats',
  doors: 'doors',
  origin: 'origin',
  wofExpiry: 'wof_expiry',
  regoExpiry: 'rego_expiry',
  description: 'description',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const IMAGE_FIELDS = {
  id: 'id',
  vehicleId: 'vehicle_id',
  r2Key: 'r2_key',
  publicUrl: 'public_url',
  thumbUrl: 'thumb_url',
  sortOrder: 'sort_order',
  isCover: 'is_cover',
  createdAt: 'created_at',
};

function fromVehicleRow(row) {
  if (!row) return null;
  const vehicle = {};
  for (const [property, column] of Object.entries(VEHICLE_FIELDS)) {
    vehicle[property] = row[column] ?? null;
  }
  vehicle.featured = Boolean(row.featured);
  for (const property of ['makeName', 'modelName', 'fuelName', 'bodyName']) {
    const column = property.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (row[column] != null) vehicle[property] = row[column];
  }
  if (row.feature_ids != null) {
    vehicle.featureIds = Array.isArray(row.feature_ids) ? row.feature_ids : JSON.parse(row.feature_ids);
  }
  return vehicle;
}

function vehicleSelect(where = '') {
  return `
    SELECT v.*, m.name AS make_name, md.name AS model_name,
      ft.name AS fuel_name, bs.name AS body_name,
      COALESCE((SELECT json_group_array(vf.feature_id)
        FROM vehicle_feature vf WHERE vf.vehicle_id = v.id), '[]') AS feature_ids
    FROM vehicle v
    LEFT JOIN make m ON m.id = v.make_id
    LEFT JOIN model md ON md.id = v.model_id
    LEFT JOIN fuel_type ft ON ft.id = v.fuel_id
    LEFT JOIN body_style bs ON bs.id = v.body_id
    ${where}
  `;
}

function toDatabaseValue(property, value) {
  return property === 'featured' ? Number(Boolean(value)) : value;
}

export async function listAllVehicles() {
  const rows = await d1Query(`${vehicleSelect()} ORDER BY v.updated_at DESC`);
  return rows.map(fromVehicleRow);
}

export async function getVehicleById(id) {
  const rows = await d1Query(`${vehicleSelect('WHERE v.id = ?')} LIMIT 1`, [id]);
  return fromVehicleRow(rows[0]);
}

export async function insertVehicle(row) {
  const existing = await d1Query(
    'SELECT slug FROM vehicle WHERE slug = ? OR slug LIKE ?',
    [row.slug, `${row.slug}-%`],
  );
  const vehicle = { ...row, slug: ensureUniqueSlug(row.slug, existing.map((item) => item.slug), row.id) };
  const properties = Object.keys(VEHICLE_FIELDS).filter((property) => vehicle[property] !== undefined);
  const columns = properties.map((property) => VEHICLE_FIELDS[property]);
  const values = properties.map((property) => toDatabaseValue(property, vehicle[property]));
  const rows = await d1Query(
    `INSERT INTO vehicle (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) RETURNING *`,
    values,
  );
  return fromVehicleRow(rows[0] ?? vehicle);
}

export async function updateVehicle(id, changes) {
  const properties = Object.keys(changes).filter(
    (property) => VEHICLE_FIELDS[property] && property !== 'id' && property !== 'updatedAt',
  );
  if (properties.length === 0) return getVehicleById(id);

  const assignments = properties.map((property) => `${VEHICLE_FIELDS[property]} = ?`);
  const values = properties.map((property) => toDatabaseValue(property, changes[property]));
  const rows = await d1Query(
    `UPDATE vehicle SET ${assignments.join(', ')}, updated_at = ? WHERE id = ? RETURNING *`,
    [...values, changes.updatedAt ?? new Date().toISOString(), id],
  );
  return fromVehicleRow(rows[0]);
}

export async function replaceFeatures(vehicleId, featureIds) {
  await d1Batch([
    { sql: 'DELETE FROM vehicle_feature WHERE vehicle_id = ?', params: [vehicleId] },
    ...featureIds.map((featureId) => ({
      sql: 'INSERT INTO vehicle_feature (vehicle_id, feature_id) VALUES (?, ?)',
      params: [vehicleId, featureId],
    })),
  ]);
  return featureIds;
}

export async function listImages(vehicleId) {
  const rows = await d1Query(
    'SELECT * FROM vehicle_image WHERE vehicle_id = ? ORDER BY sort_order ASC, created_at ASC',
    [vehicleId],
  );
  return rows.map((row) => {
    const image = Object.fromEntries(
      Object.entries(IMAGE_FIELDS).map(([property, column]) => [property, row[column] ?? null]),
    );
    image.isCover = Boolean(image.isCover);
    return image;
  });
}

export async function insertImage(image) {
  const properties = Object.keys(IMAGE_FIELDS);
  const columns = properties.map((property) => IMAGE_FIELDS[property]);
  const values = properties.map((property) => property === 'isCover'
    ? Number(Boolean(image[property]))
    : image[property]);
  const rows = await d1Query(
    `INSERT INTO vehicle_image (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) RETURNING *`,
    values,
  );
  return rows[0] ?? image;
}

export async function deleteImage(id) {
  const rows = await d1Query('DELETE FROM vehicle_image WHERE id = ? RETURNING id', [id]);
  return rows.length > 0;
}

export async function setImageCover(vehicleId, imageId) {
  const rows = await d1Query(
    'UPDATE vehicle_image SET is_cover = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE vehicle_id = ? RETURNING *',
    [imageId, vehicleId],
  );
  return rows.find((row) => row.id === imageId) ?? null;
}

export async function updateImage(id, changes) {
  const assignments = [];
  const values = [];
  if (Number.isInteger(changes.sortOrder) && changes.sortOrder >= 0) {
    assignments.push('sort_order = ?');
    values.push(changes.sortOrder);
  }
  if (typeof changes.isCover === 'boolean') {
    assignments.push('is_cover = ?');
    values.push(Number(changes.isCover));
  }
  if (!assignments.length) return null;
  const rows = await d1Query(
    `UPDATE vehicle_image SET ${assignments.join(', ')} WHERE id = ? RETURNING *`,
    [...values, id],
  );
  return rows[0] ?? null;
}

export async function deleteVehicle(id) {
  const rows = await d1Query('DELETE FROM vehicle WHERE id = ? RETURNING id', [id]);
  return rows.length > 0;
}