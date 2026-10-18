/**
 * The Garden Shop (/shop): tumblers printed on demand by Qikink, ordered on WhatsApp.
 * Lines are CK's own garden copy (Apricot content calendar, May–Jun 2026; No. 11 is
 * Shivani's line from Our Story). Approved by CK, 18 Oct 2026.
 *
 * To add a product: drop its image in src/assets/shop/, import it below and add a row.
 * Keep `no` unique — it is how an order on WhatsApp names the design.
 * When the catalogue outgrows this file (~20+), move it to Notion like /experiences.
 */
import amenity from "../assets/shop/01-amenity.jpg";
import nothingAsked from "../assets/shop/02-nothing-asked.jpg";
import time from "../assets/shop/03-time.jpg";
import gate from "../assets/shop/04-gate.jpg";
import noAlarm from "../assets/shop/05-no-alarm.jpg";
import blooms from "../assets/shop/06-blooms.jpg";
import twoChairs from "../assets/shop/07-two-chairs.jpg";
import nowhere from "../assets/shop/08-nowhere.jpg";
import alreadyKnows from "../assets/shop/09-already-knows.jpg";
import chai from "../assets/shop/10-chai.jpg";
import apricot from "../assets/shop/11-apricot.jpg";

export interface ShopProduct {
  /** Two-digit design number, e.g. "01". Used in the WhatsApp order message. */
  no: string;
  quote: string;
  /** What the artwork shows, for alt text. */
  artwork: string;
  image: ImageMetadata;
}

export const shop = {
  product: "tumbler",
  /** Customer price in rupees (CK, 18 Oct 2026; Qikink cost ≈ ₹600 incl. shipping + GST). */
  price: 1199,
  specs: "20 oz, double-wall stainless steel, with a splash-proof lid and a metal straw",
} as const;

export const products: ShopProduct[] = [
  {
    no: "01",
    quote: "A garden is not an amenity. It is a reason.",
    artwork: "white blossoms and sage leaves",
    image: amenity,
  },
  {
    no: "02",
    quote: "Nothing has been asked of you yet.",
    artwork: "jasmine vines",
    image: nothingAsked,
  },
  {
    no: "03",
    quote: "Nobody checks the time here.",
    artwork: "ivy around an old garden clock",
    image: time,
  },
  {
    no: "04",
    quote: "The gate is where it begins.",
    artwork: "an open garden gate under climbing roses",
    image: gate,
  },
  { no: "05", quote: "No alarm. No agenda.", artwork: "morning glory", image: noAlarm },
  { no: "06", quote: "It blooms without being asked.", artwork: "bougainvillea", image: blooms },
  {
    no: "07",
    quote: "Two chairs. Nothing on the schedule.",
    artwork: "two cane chairs under olive branches",
    image: twoChairs,
  },
  {
    no: "08",
    quote: "Nowhere to be until you're ready.",
    artwork: "lavender, wild grasses and a butterfly",
    image: nowhere,
  },
  {
    no: "09",
    quote: "The garden already knows.",
    artwork: "monstera and fern leaves with a sparrow",
    image: alreadyKnows,
  },
  {
    no: "10",
    quote: "Chai on the stone step. The garden still cool from the night.",
    artwork: "a kulhad of chai on a stone step among marigolds",
    image: chai,
  },
  {
    no: "11",
    quote: "A garden doesn't ask anything of you. You sit, and the day gets quieter.",
    artwork: "apricot branches with blossoms and fruit",
    image: apricot,
  },
];

/** "₹1,199" */
export function formatPrice(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/** The pre-filled WhatsApp message for ordering one design. */
export function orderMessage(p: Pick<ShopProduct, "no" | "quote">): string {
  return `Hi Apricot Stays, I'd like the "${p.quote}" ${shop.product} (No. ${p.no}).`;
}
