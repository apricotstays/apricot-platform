import { describe, expect, it } from "vitest";
import { formatRupees, fromLine, properties } from "@apricot/schema";

describe("starting nightly rates", () => {
  it("formats rupees the Indian way", () => {
    expect(formatRupees(5500)).toBe("₹5,500");
    expect(formatRupees(45000)).toBe("₹45,000");
    expect(formatRupees(150000)).toBe("₹1,50,000");
  });

  it("builds the card line", () => {
    expect(fromLine({ fromPerNight: 8500 })).toBe("From ₹8,500 / night");
  });

  it("gives every home a positive whole-rupee rate", () => {
    for (const p of properties) {
      expect(Number.isInteger(p.fromPerNight), p.slug).toBe(true);
      expect(p.fromPerNight, p.slug).toBeGreaterThan(0);
    }
  });

  it("matches the rates set by the owner (Oct 2026)", () => {
    const by = Object.fromEntries(properties.map((p) => [p.slug, p.fromPerNight]));
    expect(by).toEqual({
      "garden-cottage": 5500,
      "garden-courtyard": 8500,
      "garden-chateau": 45000,
      "garden-care": 4500,
    });
  });
});
