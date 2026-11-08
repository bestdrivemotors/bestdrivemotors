import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FinanceSection from "../../app/components/FinanceSection.jsx";

describe("FinanceSection", () => {
  it("does not promise rates or approvals", () => {
    const markup = renderToStaticMarkup(createElement(FinanceSection));

    expect(markup).not.toContain("best rates");
    expect(markup).not.toContain("approval process");
  });
});