import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VehicleSpecifications from "../../app/components/VehicleSpecifications.jsx";

describe("VehicleSpecifications", () => {
  it("uses one column on narrow phones and wraps long spec values", () => {
    const markup = renderToStaticMarkup(createElement(VehicleSpecifications, {
      specs: [["Odometer", "23,432,432,423 km"], ["Stock number", "BD123"]],
      features: [{ id: "feature-1", name: "Long feature name that should wrap safely" }],
    }));

    expect(markup).toContain("grid-cols-1");
    expect(markup).toContain("min-[420px]:grid-cols-2");
    expect(markup).toContain("break-words");
    expect(markup).toContain("grid-cols-1 gap-2");
    expect(markup).toContain("sm:grid-cols-2");
    expect(markup).toContain("23,432,432,423 km");
  });
});