import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VehicleFilters from "../../app/components/VehicleFilters.jsx";

describe("VehicleFilters", () => {
  it("provides a mobile filter-sheet launcher for inventory pages", () => {
    const markup = renderToStaticMarkup(
      createElement(VehicleFilters, { mode: "listing", vehicles: [] }),
    );

    expect(markup).toContain('aria-label="Open vehicle filters"');
    expect(markup).toContain('aria-controls="vehicle-filter-dialog"');
  });

  it("uses the same filter-sheet launcher for search results", () => {
    const markup = renderToStaticMarkup(
      createElement(VehicleFilters, { mode: "search", vehicles: [] }),
    );

    expect(markup).toContain('aria-label="Open vehicle filters"');
  });

  it("prioritizes the first visible inventory image", () => {
    const markup = renderToStaticMarkup(createElement(VehicleFilters, {
      mode: "listing",
      vehicles: [{
        id: "vehicle-1",
        slug: "vehicle-1",
        year: 2020,
        makeName: "Toyota",
        modelName: "Corolla",
        stockNumber: "BD1",
        priceNzd: 18000,
        odometerKm: 42000,
        transmission: "automatic",
        fuelName: "Petrol",
        createdAt: "2026-11-01T10:00:00Z",
        images: [{ id: "image-1", url: "https://example.test/vehicle.webp", isCover: true }],
      }],
    }));

    expect(markup).toContain('<link rel="preload" as="image"');
  });
});