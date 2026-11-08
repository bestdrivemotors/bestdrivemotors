export function buildVehicleSlug({ year, makeName, modelName, stockNumber }) {
  return [year, makeName, modelName, stockNumber]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ensureUniqueSlug(slug, existingSlugs, vehicleId) {
  const existing = new Set(existingSlugs);
  if (!existing.has(slug)) return slug;

  const idSuffix = String(vehicleId ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  if (!idSuffix) throw new TypeError('vehicleId is required when the slug is already taken');

  const candidate = `${slug}-${idSuffix}`;
  if (!existing.has(candidate)) return candidate;

  let suffix = 2;
  while (existing.has(`${candidate}-${suffix}`)) suffix += 1;
  return `${candidate}-${suffix}`;
}