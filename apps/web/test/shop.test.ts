import { describe, expect, it } from "vitest";
import {
  collections,
  findCollection,
  formatPrice,
  fromPrice,
  orderMessage,
  productHref,
} from "../src/data/shop";

const URL_PART = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("Garden Shop", () => {
  it("has unique, URL-safe collection slugs", () => {
    const slugs = collections.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(URL_PART);
  });

  it("lists shelves in position order, with no ties", () => {
    const positions = collections.map((c) => c.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(new Set(positions).size).toBe(positions.length);
  });

  it("puts Birds of the Garden first while it is new", () => {
    expect(collections[0].slug).toBe("birds-of-the-garden");
  });

  for (const c of collections) {
    describe(c.title, () => {
      it("numbers designs 01, 02, … with no gaps or repeats", () => {
        expect(c.items.map((p) => p.no)).toEqual(
          c.items.map((_, i) => String(i + 1).padStart(2, "0")),
        );
      });

      it("has unique titles and URL-safe, unique item slugs", () => {
        expect(new Set(c.items.map((p) => p.title)).size).toBe(c.items.length);
        expect(new Set(c.items.map((p) => p.slug)).size).toBe(c.items.length);
        for (const p of c.items) expect(p.slug).toMatch(URL_PART);
      });

      it("gives every item a description and alt text", () => {
        for (const p of c.items) {
          expect(p.description.length, p.slug).toBeGreaterThan(20);
          expect(p.alt.length, p.slug).toBeGreaterThan(20);
        }
      });

      it("prices in whole rupees", () => {
        expect(Number.isInteger(c.price)).toBe(true);
        expect(c.price).toBeGreaterThan(0);
      });
    });
  }

  it("formats prices the Indian way", () => {
    expect(formatPrice(1199)).toBe("₹1,199");
    expect(fromPrice({ price: 999 })).toBe("from ₹999");
  });

  it("builds product links", () => {
    const birds = findCollection("birds-of-the-garden")!;
    expect(productHref(birds, birds.items[0])).toBe(
      "/shop/birds-of-the-garden/indian-grey-hornbill",
    );
  });

  it("names the design, collection and number in the WhatsApp order", () => {
    const words = findCollection("words-of-the-garden")!;
    const birds = findCollection("birds-of-the-garden")!;
    expect(orderMessage(words, { no: "03", title: "The gate is where it begins." })).toBe(
      'Hi Apricot Stays, I\'d like the "The gate is where it begins." tumbler (Words of the Garden, No. 03).',
    );
    expect(orderMessage(birds, { no: "01", title: "Indian grey hornbill" })).toBe(
      "Hi Apricot Stays, I'd like the Indian grey hornbill framed poster (Birds of the Garden, No. 01).",
    );
  });
});
