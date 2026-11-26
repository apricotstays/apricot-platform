import { describe, expect, it } from "vitest";
import { trust } from "@apricot/brand";
import { buildPostcards, postcardSpecs } from "../src/data/postcards";
import { reviews } from "../src/data/reviews";

const cards = buildPostcards((slug) => slug);

describe("homepage postcards", () => {
  it("quotes only consented reviews from reviews.ts, at the guest's own home", () => {
    expect(cards.length).toBe(postcardSpecs.length);
    for (const c of cards) {
      const r = reviews[c.home].reviews.find((x) => x.name === c.name);
      expect(r, c.name).toBeDefined();
      expect(r!.stayedAt, c.name).toBeUndefined();
      expect(r!.text.startsWith(c.text.replace(/[.!]$/, "")), c.name).toBe(true);
    }
  });

  it("never shows a guest twice and keeps 6–10 cards", () => {
    const names = cards.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(cards.length).toBeGreaterThanOrEqual(6);
    expect(cards.length).toBeLessThanOrEqual(10);
  });

  it("gives every card a real photo with alt text and its own bird stamp", () => {
    for (const c of cards) expect(c.photo.alt.length, c.name).toBeGreaterThan(10);
    const birds = cards.map((c) => c.bird.name);
    expect(new Set(birds).size).toBe(birds.length);
  });

  it("builds the postmark from the review month", () => {
    expect(cards.find((c) => c.name === "Kshitij")?.postmark).toBe("OCT 2026");
    expect(cards.find((c) => c.name === "Yashika")?.postmark).toBe("SEP 2025");
  });

  it("shows the host review count as 100+", () => {
    expect(trust.reviews).toBe("100+");
  });
});
