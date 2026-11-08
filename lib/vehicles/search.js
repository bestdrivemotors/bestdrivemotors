export function searchVehicles(vehicles, query) {
  const term = String(query ?? '').trim().toLowerCase();
  if (!term) return [];

  return vehicles.filter((vehicle) =>
    [vehicle.year, vehicle.makeName, vehicle.modelName, vehicle.variant, vehicle.stockNumber].some(
      (value) => String(value ?? '').toLowerCase().includes(term),
    ),
  );
}