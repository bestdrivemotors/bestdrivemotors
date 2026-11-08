import { describe, expect, it } from "vitest";
import { getGallerySwipeDirection, orderGalleryImages } from "../../lib/vehicles/gallery.js";

describe("orderGalleryImages", () => {
  it("puts the cover first and keeps the remaining sort order", () => {
    const images = [
      { id: "second", sortOrder: 2, isCover: false },
      { id: "cover", sortOrder: 3, isCover: true },
      { id: "first", sortOrder: 1, isCover: false },
    ];

    const ordered = orderGalleryImages(images);

    expect(ordered.map((image) => image.id)).toEqual(["cover", "first", "second"]);
    expect(images.map((image) => image.id)).toEqual(["second", "cover", "first"]);
  });

  it("returns an empty list when there are no photos", () => {
    expect(orderGalleryImages()).toEqual([]);
  });

  it("recognizes horizontal swipes but ignores vertical movement", () => {
    expect(getGallerySwipeDirection({ x: 180, y: 40 }, { x: 90, y: 45 })).toBe("next");
    expect(getGallerySwipeDirection({ x: 90, y: 45 }, { x: 180, y: 40 })).toBe("previous");
    expect(getGallerySwipeDirection({ x: 100, y: 40 }, { x: 90, y: 110 })).toBeNull();
    expect(getGallerySwipeDirection({ x: 100, y: 40 }, { x: 70, y: 42 })).toBeNull();
  });
});