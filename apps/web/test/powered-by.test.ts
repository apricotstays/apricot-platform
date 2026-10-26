import { describe, expect, it } from "vitest";
import { poweredBy } from "@apricot/brand";

// CK, 26 Oct 2026: only the footer credit links to the STAIZ site (new tab, UTM,
// "for hosts" hint); the calendar credit stays plain text.
describe("Powered by STAIZ", () => {
  it("links the footer credit to the STAIZ site with UTM tags", () => {
    expect(poweredBy.url).toBe("https://staiz.apricotstays.in/");
    expect(poweredBy.utm).toBe("utm_source=apricotstays&utm_medium=footer");
  });
  it("tells guests the link is for hosts and operators", () => {
    expect(poweredBy.hint).toMatch(/hosts and operators/);
  });
});
