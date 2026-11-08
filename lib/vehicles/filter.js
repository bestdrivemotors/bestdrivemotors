export function filterVehicles(vehicles, filters = {}) {
  const {
    makeId,
    modelId,
    fuelId,
    bodyId,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minKm,
    maxKm,
    featureIds = [],
  } = filters;

  return vehicles.filter((vehicle) => {
    if (makeId && vehicle.makeId !== makeId) return false;
    if (modelId && vehicle.modelId !== modelId) return false;
    if (fuelId && vehicle.fuelId !== fuelId) return false;
    if (bodyId && vehicle.bodyId !== bodyId) return false;
    if (minPrice != null && vehicle.priceNzd < minPrice) return false;
    if (maxPrice != null && vehicle.priceNzd > maxPrice) return false;
    if (minYear != null && vehicle.year < minYear) return false;
    if (maxYear != null && vehicle.year > maxYear) return false;
    if (minKm != null && vehicle.odometerKm < minKm) return false;
    if (maxKm != null && vehicle.odometerKm > maxKm) return false;
    if (!featureIds.every((featureId) => vehicle.featureIds?.includes(featureId))) return false;
    return true;
  });
}

export function sortVehicles(vehicles, sort = 'newest') {
  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    price_asc: (a, b) => a.priceNzd - b.priceNzd,
    price_desc: (a, b) => b.priceNzd - a.priceNzd,
    km_asc: (a, b) => a.odometerKm - b.odometerKm,
    km_desc: (a, b) => b.odometerKm - a.odometerKm,
  };

  return [...vehicles].sort(sorters[sort] ?? sorters.newest);
}