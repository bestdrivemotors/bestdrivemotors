import { describe, expect, it } from "vitest";
import { dealershipContact } from "../lib/contact.js";

describe("dealershipContact", () => {
  it("provides a dialable New Zealand phone link", () => {
    expect(dealershipContact.phone).toEqual({
      label: "022 435 3449",
      href: "tel:+64224353449",
    });
  });
});