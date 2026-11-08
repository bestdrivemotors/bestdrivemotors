import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Hero from "../../app/components/Hero.jsx";

describe("Hero", () => {
  it("provides a direct call action and a vehicle inventory path", () => {
    const markup = renderToStaticMarkup(createElement(Hero));

    expect(markup).toContain('href="tel:+64224353449"');
    expect(markup).toContain('href="/vehicles"');
  });
});