/**
 * The City Club (DLF Hyde Park) — food menu shared with in-house guests at /menu.
 * Details confirmed by CK, 15 Oct 2026. The club sets its own menu, prices and hours.
 *
 * To update the menu: replace the page images in src/assets/menu/ and the PDF in
 * public/menu/, then change `asOf` (and `sections` if the pages change).
 * The /menu link and the QR cards in the homes stay the same.
 */
import page1 from "../assets/menu/page-1.jpg";
import page2 from "../assets/menu/page-2.jpg";
import page3 from "../assets/menu/page-3.jpg";
import page4 from "../assets/menu/page-4.jpg";
import page5 from "../assets/menu/page-5.jpg";
import page6 from "../assets/menu/page-6.jpg";
import page7 from "../assets/menu/page-7.jpg";

export const club = {
  name: "The City Club",
  phoneE164: "+919646964064",
  phoneDisplay: "+91 96469 64064",
  hours: "9:30 am – 10 pm",
  delivers: true,
} as const;

export const menu = {
  /** Date printed on the scanned menu we have. */
  asOf: "August 2026",
  pdf: "/menu/the-city-club-menu.pdf",
  pages: [
    { image: page1, title: "Soups, shorbas & salads" },
    { image: page2, title: "Sandwiches, rolls & starters" },
    { image: page3, title: "Tikka & kebab" },
    { image: page4, title: "European & Asian mains" },
    { image: page5, title: "Indian curries" },
    { image: page6, title: "Rice, breads & desserts" },
    { image: page7, title: "Pizza" },
  ],
} as const;
