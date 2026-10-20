import { describe, expect, it } from "vitest";
import { properties, to24h } from "@apricot/schema";

describe("stay policies", () => {
  it("converts times for schema.org", () => {
    expect(to24h("2 PM")).toBe("14:00");
    expect(to24h("12 PM")).toBe("12:00");
    expect(to24h("11 AM")).toBe("11:00");
    expect(() => to24h("2pm")).toThrow();
  });

  it("matches the terms CK approved (20 Oct 2026)", () => {
    const by = Object.fromEntries(
      properties.map((p) => [
        p.slug,
        [p.policy.checkIn, p.policy.checkOut, p.policy.pets, p.policy.freeCancellation],
      ]),
    );
    expect(by).toEqual({
      "garden-cottage": ["2 PM", "12 PM", "Welcome", "Up to 14 days before"],
      "garden-courtyard": ["2 PM", "12 PM", "Welcome", "Up to 14 days before"],
      "garden-chateau": ["3 PM", "11 AM", "On request", "Up to 30 days before"],
      "garden-care": ["2 PM", "12 PM", "Welcome", "Up to 48 hours before"],
    });
  });

  it("keeps the Things to know cards short", () => {
    for (const p of properties) {
      expect(p.policy.rules.length, p.slug).toBeLessThanOrEqual(4);
      expect(p.policy.cancellation.length, p.slug).toBeLessThanOrEqual(4);
      expect(p.policy.cancellation[0], p.slug).toMatch(/^Free/);
    }
  });
});
