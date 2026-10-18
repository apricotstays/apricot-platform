import { describe, expect, it } from "vitest";
import { collections, formatPrice, orderMessage } from "../src/data/shop";

describe("Garden Shop", () => {
  it("has unique collection ids", () => {
    expect(new Set(collections.map((c) => c.id)).size).toBe(collections.length);
  });

  for (const c of collections) {
    describe(c.title, () => {
      it("numbers designs 01, 02, … with no gaps or repeats", () => {
        expect(c.items.map((p) => p.no)).toEqual(
          c.items.map((_, i) => String(i + 1).padStart(2, "0")),
        );
      });

      it("has no duplicate titles", () => {
        expect(new Set(c.items.map((p) => p.title)).size).toBe(c.items.length);
      });

      it("prices in whole rupees", () => {
        expect(Number.isInteger(c.price)).toBe(true);
        expect(c.price).toBeGreaterThan(0);
      });
    });
  }

  it("formats prices the Indian way", () => {
    expect(formatPrice(1199)).toBe("₹1,199");
  });

  it("names the design, collection and number in the WhatsApp order", () => {
    const [tumblers, birds] = collections;
    expect(orderMessage(tumblers, { no: "03", title: "The gate is where it begins." })).toBe(
      'Hi Apricot Stays, I\'d like the "The gate is where it begins." tumbler (Tumblers, No. 03).',
    );
    expect(orderMessage(birds, { no: "01", title: "Indian grey hornbill" })).toBe(
      "Hi Apricot Stays, I'd like the Indian grey hornbill print (Birds of the Garden, No. 01).",
    );
  });
});
