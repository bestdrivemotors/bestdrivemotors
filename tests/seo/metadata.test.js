import { describe, expect, it } from "vitest";
import {
  buildLocalBusinessSchema,
  buildVehicleSchema,
  buildVehicleListingRobots,
  buildSitemapEntries,
  serializeJsonLd,
} from "../../lib/seo/metadata.js";

describe("SEO metadata builders", () => {
  it("uses South Auckland without inventing a street address", () => {
    const schema = buildLocalBusinessSchema();

    expect(schema.areaServed.name).toBe("South Auckland, New Zealand");
    expect(schema.address).toBeUndefined();
    expect(schema.telephone).toBe("+64224353449");
    expect(schema.serviceType).toBeUndefined();
  });

  it("includes only canonical public pages and available vehicle details", () => {
    const entries = buildSitemapEntries([
      { slug: "available-car", status: "available", updatedAt: "2026-11-01T10:00:00Z" },
      { slug: "draft-car", status: "draft" },
      { slug: "sold-car", status: "sold" },
    ], "https://example.test");

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://example.test",
      "https://example.test/vehicles",
      "https://example.test/finance",
      "https://example.test/our-privacy-policy",
      "https://example.test/vehicles/available-car",
    ]);
    expect(entries.at(-1).lastModified).toEqual(new Date("2026-11-01T10:00:00Z"));
  });

  it("keeps filtered or sorted vehicle URLs out of the index", () => {
    expect(buildVehicleListingRobots({})).toEqual({ index: true, follow: true });
    expect(buildVehicleListingRobots({ sort: "price_asc" })).toEqual({ index: false, follow: true });
  });

  it("builds a vehicle schema from public listing fields without a VIN", () => {
    const schema = buildVehicleSchema({
      year: 2020,
      makeName: "Toyota",
      modelName: "Corolla",
      stockNumber: "BD123",
      priceNzd: 18990,
      odometerKm: 42000,
      fuelName: "Petrol",
      transmission: "automatic",
      colour: "Silver",
      images: [{ url: "https://cdn.example.test/car.webp" }],
    });

    expect(schema['@type']).toBe('Car');
    expect(schema.offers.price).toBe(18990);
    expect(schema.mileageFromOdometer.value).toBe(42000);
    expect(schema.image).toEqual(['https://cdn.example.test/car.webp']);
    expect(schema.vehicleIdentificationNumber).toBeUndefined();
  });

  it("escapes less-than characters before embedding JSON-LD in HTML", () => {
    expect(serializeJsonLd({ description: "</script><script>" })).toBe(
      '{"description":"\\u003c/script>\\u003cscript>"}',
    );
  });
});