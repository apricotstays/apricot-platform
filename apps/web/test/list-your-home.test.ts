import { describe, expect, it } from "vitest";
import page from "../src/pages/list-your-home.astro?raw";
import navbar from "../src/components/Navbar.astro?raw";
import sitemap from "../src/pages/sitemap.xml.ts?raw";
import llms from "../src/pages/llms.txt.ts?raw";
import { careReviews, fee, ownerWhatsapp } from "../src/data/list-your-home";
import { reviews } from "../src/data/reviews";

// List your home + header v2 (CK, 19 Nov 2026).
describe("list your home page", () => {
  it("is public: indexed, in the sitemap and llms.txt", () => {
    expect(page).not.toMatch(/noindex/);
    expect(sitemap).toMatch(/"\/list-your-home"/);
    expect(llms).toMatch(/\/list-your-home/);
  });

  it("splits the fee so it adds up", () => {
    expect(fee.owner + fee.apricot + fee.caretaker).toBe(100);
    expect(100 - fee.owner).toBe(fee.total);
  });

  it("quotes only consented guest reviews already on the site", () => {
    for (const c of careReviews) {
      expect(
        reviews[c.home].reviews.some((r) => r.name === c.name),
        c.name,
      ).toBe(true);
    }
  });

  it("takes enquiries on WhatsApp only, with no form", () => {
    expect(ownerWhatsapp).toMatch(/Where:/);
    expect(ownerWhatsapp).toMatch(/Bedrooms:/);
    expect(page).not.toMatch(/<form/);
  });
});

describe("header v2", () => {
  it("shows Book a stay and List your home, and nothing else in the middle", () => {
    expect(navbar).toMatch(/"Book a stay", href: "\/"/);
    expect(navbar).toMatch(/"List your home", href: "\/list-your-home"/);
    expect(navbar).not.toMatch(/navLinks|nav-sheet|bookHref/);
  });

  it("has the account menu: log in, sign up, manage your booking", () => {
    expect(navbar).toMatch(/https:\/\/app\.apricotstays\.in\//);
    expect(navbar).toMatch(/Log in/);
    expect(navbar).toMatch(/Sign up/);
    expect(navbar).toMatch(/Manage your booking/);
    expect(navbar).not.toMatch(/action\?:/);
  });
});
