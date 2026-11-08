import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AnswerFaq from "../../app/components/AnswerFaq.jsx";

describe("AnswerFaq", () => {
  it("renders accessible answers and escapes JSON-LD script content", () => {
    const markup = renderToStaticMarkup(createElement(AnswerFaq, {
      title: "Quick answers",
      items: [{ question: "Vehicle details?", answer: "Safe text </script><script>alert(1)</script>" }],
    }));

    expect(markup).toContain("Quick answers");
    expect(markup).toContain("Vehicle details?");
    expect(markup).toContain("\\u003c/script>");
    expect(markup).not.toContain("</script><script>alert(1)");
  });
});