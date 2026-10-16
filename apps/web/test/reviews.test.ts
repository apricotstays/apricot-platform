import { describe, expect, it } from "vitest";
import { properties } from "@apricot/schema";
import { listingLine, reviews } from "../src/data/reviews";

describe("guest reviews", () => {
  it("covers every home with 1–3 reviews", () => {
    for (const p of properties) {
      const r = reviews[p.slug];
      expect(r, p.slug).toBeDefined();
      expect(r.reviews.length, p.slug).toBeGreaterThan(0);
      expect(r.reviews.length, p.slug).toBeLessThanOrEqual(3);
    }
  });

  it("uses first name + month only", () => {
    for (const r of Object.values(reviews).flatMap((h) => h.reviews)) {
      expect(r.name).toMatch(/^[A-Z][a-z]+$/);
      expect(r.month).toMatch(
        /^(January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d$/,
      );
      expect(r.text.length).toBeGreaterThan(5);
    }
  });

  it("labels reviews borrowed from another home", () => {
    const c = reviews["garden-chateau"];
    expect(c.isNew).toBe(true);
    expect(c.reviews.every((r) => r.stayedAt)).toBe(true);
  });

  it("builds the listing line", () => {
    expect(listingLine(reviews["garden-cottage"])).toBe(
      "Airbnb Guest Favourite · 4.98 from 64 reviews",
    );
    expect(listingLine(reviews["garden-care"])).toBe("2 reviews on Airbnb");
    expect(listingLine(reviews["garden-chateau"])).toBeNull();
  });
});
