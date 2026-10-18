import { describe, expect, it } from "vitest";
import { formatPrice, orderMessage, products, shop } from "../src/data/shop";

describe("Garden Shop", () => {
  it("numbers designs 01, 02, … with no gaps or repeats", () => {
    expect(products.map((p) => p.no)).toEqual(
      products.map((_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  it("has no duplicate lines", () => {
    expect(new Set(products.map((p) => p.quote)).size).toBe(products.length);
  });

  it("prices in whole rupees, formatted the Indian way", () => {
    expect(Number.isInteger(shop.price)).toBe(true);
    expect(formatPrice(1199)).toBe("₹1,199");
  });

  it("names the design and its number in the WhatsApp order", () => {
    expect(orderMessage({ no: "04", quote: "The gate is where it begins." })).toBe(
      'Hi Apricot Stays, I\'d like the "The gate is where it begins." tumbler (No. 04).',
    );
  });
});
