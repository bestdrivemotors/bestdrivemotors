import { describe, expect, it } from "vitest";
import {
  createPublicAnalyticsEvent,
  isPublicAnalyticsPath,
  trackPublicAnalyticsEvent,
} from "../../lib/analytics/events.js";

describe("public analytics events", () => {
  it("keeps only the approved event parameters", () => {
    expect(createPublicAnalyticsEvent("finance_success", {
      source: "finance_form",
      firstName: "Customer",
      email: "customer@example.com",
    })).toEqual({ event: "finance_success", source: "finance_form" });
  });

  it("rejects unknown event names", () => {
    expect(createPublicAnalyticsEvent("form_payload", { email: "customer@example.com" })).toBeNull();
  });

  it("keeps finance CTA clicks separate from application starts", () => {
    expect(createPublicAnalyticsEvent("finance_cta_click", { source: "home" })).toEqual({
      event: "finance_cta_click",
      source: "home",
    });
  });

  it("excludes admin and API routes", () => {
    expect(isPublicAnalyticsPath("/admin/vehicles")).toBe(false);
    expect(isPublicAnalyticsPath("/api/submit-finance")).toBe(false);
    expect(isPublicAnalyticsPath("/vehicles/2020-toyota-corolla-123")).toBe(true);
  });

  it("does not dispatch events from admin routes", () => {
    expect(trackPublicAnalyticsEvent("contact_click", { method: "phone" }, "/admin/vehicles")).toBe(false);
  });
});