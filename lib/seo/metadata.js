const SITE_URL = 'https://bestdrivemotors.co.nz';

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: 'Best Drive Motors',
    url: SITE_URL,
    logo: `${SITE_URL}/best-deal-motors-logo.png`,
    image: `${SITE_URL}/best-deal-motors-logo.png`,
    description: 'Used vehicles and finance assistance in South Auckland, New Zealand.',
    telephone: '+64224353449',
    email: 'bestdrivemotors@outlook.co.nz',
    areaServed: {
      '@type': 'Place',
      name: 'South Auckland, New Zealand',
    },
    sameAs: [
      'https://www.facebook.com/bestdrivemotors',
      'https://www.instagram.com/bestdrivemotors',
    ],
  };
}

export function buildVehicleListingRobots(searchParams = {}) {
  return {
    index: Object.keys(searchParams).length === 0,
    follow: true,
  };
}

export function buildVehicleSchema(vehicle, baseUrl = SITE_URL) {
  const url = `${baseUrl.replace(/\/$/, '')}/vehicles/${encodeURIComponent(vehicle.slug)}`;
  const images = (vehicle.images ?? [])
    .map((image) => image.url ?? image.publicUrl ?? image.public_url)
    .filter(Boolean);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.makeName} ${vehicle.modelName}${vehicle.variant ? ` ${vehicle.variant}` : ''}`,
    brand: { '@type': 'Brand', name: vehicle.makeName },
    model: vehicle.modelName,
    vehicleModelDate: String(vehicle.year),
    sku: vehicle.stockNumber,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'NZD',
      price: vehicle.priceNzd,
      availability: 'https://schema.org/InStock',
    },
  };

  if (images.length) schema.image = images;
  if (vehicle.odometerKm != null) {
    schema.mileageFromOdometer = {
      '@type': 'QuantitativeValue',
      value: vehicle.odometerKm,
      unitCode: 'KMT',
      unitText: 'km',
    };
  }
  if (vehicle.fuelName) schema.fuelType = vehicle.fuelName;
  if (vehicle.transmission) schema.vehicleTransmission = vehicle.transmission;
  if (vehicle.colour) schema.color = vehicle.colour;
  if (vehicle.description) schema.description = vehicle.description;

  return schema;
}

export function buildSitemapEntries(vehicles = [], baseUrl = SITE_URL) {
  const origin = baseUrl.replace(/\/$/, '');
  const entries = [
    { url: origin },
    { url: `${origin}/vehicles` },
    { url: `${origin}/finance` },
    { url: `${origin}/our-privacy-policy` },
  ];
  const seenSlugs = new Set();

  for (const vehicle of vehicles) {
    if (vehicle.status !== 'available' || !vehicle.slug || seenSlugs.has(vehicle.slug)) continue;
    seenSlugs.add(vehicle.slug);

    const entry = { url: `${origin}/vehicles/${encodeURIComponent(vehicle.slug)}` };
    const updatedAt = new Date(vehicle.updatedAt);
    if (vehicle.updatedAt && !Number.isNaN(updatedAt.getTime())) entry.lastModified = updatedAt;
    entries.push(entry);
  }

  return entries;
}
