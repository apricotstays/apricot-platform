/**
 * The Garden Shop (/shop): printed on demand by Qikink, ordered on WhatsApp.
 * Each collection has its own price, specs and numbering ("01", "02", …); an order message
 * names the collection, the design and its number.
 *
 * Tumblers: lines are CK's own garden copy (Apricot content calendar, May–Jun 2026; No. 10 is
 * Shivani's line from Our Story). Approved by CK, 18 Oct 2026.
 * Birds of the Garden: watercolour prints of garden birds of Chandigarh, A4 framed.
 * Approved by CK, 19 Oct 2026.
 *
 * To add a design: drop its image in src/assets/shop/ (prints in prints/), import it below
 * and add a row. Keep numbers sequential — orders on WhatsApp name the design by number.
 * When the catalogue outgrows this file (~20+), move it to Notion like /experiences.
 */
import nothingAsked from "../assets/shop/01-nothing-asked.jpg";
import time from "../assets/shop/02-time.jpg";
import gate from "../assets/shop/03-gate.jpg";
import noAlarm from "../assets/shop/04-no-alarm.jpg";
import blooms from "../assets/shop/05-blooms.jpg";
import twoChairs from "../assets/shop/06-two-chairs.jpg";
import nowhere from "../assets/shop/07-nowhere.jpg";
import alreadyKnows from "../assets/shop/08-already-knows.jpg";
import chai from "../assets/shop/09-chai.jpg";
import apricot from "../assets/shop/10-apricot.jpg";
import hornbill from "../assets/shop/prints/01-hornbill.jpg";
import parakeet from "../assets/shop/prints/02-parakeet.jpg";
import roller from "../assets/shop/prints/03-roller.jpg";
import bulbul from "../assets/shop/prints/04-bulbul.jpg";
import sunbird from "../assets/shop/prints/05-sunbird.jpg";
import hoopoe from "../assets/shop/prints/06-hoopoe.jpg";
import magpieRobin from "../assets/shop/prints/07-magpie-robin.jpg";
import kingfisher from "../assets/shop/prints/08-kingfisher.jpg";
import koel from "../assets/shop/prints/09-koel.jpg";
import barbet from "../assets/shop/prints/10-barbet.jpg";

export interface ShopItem {
  /** Two-digit design number within its collection, e.g. "01". */
  no: string;
  /** Card title: the tumbler's line, or the bird's name. */
  title: string;
  /** Optional short line under the title. */
  note?: string;
  alt: string;
  image: ImageMetadata;
}

export interface ShopCollection {
  id: string;
  title: string;
  intro: string;
  /** Singular noun used in the order message, e.g. "tumbler". */
  unit: string;
  /** Customer price in rupees. */
  price: number;
  specs: string;
  /** CSS aspect ratio of the product images. */
  aspect: string;
  /** Show the title in quote marks (lines) rather than as a name. */
  quoted: boolean;
  items: ShopItem[];
}

const tumbler = (no: string, title: string, artwork: string, image: ImageMetadata): ShopItem => ({
  no,
  title,
  alt: `Apricot Stays tumbler with ${artwork} and the line “${title}”`,
  image,
});

const bird = (
  no: string,
  title: string,
  scene: string,
  mat: string,
  image: ImageMetadata,
  note?: string,
): ShopItem => ({
  no,
  title,
  note,
  alt: `Framed watercolour of a ${title.toLowerCase()} ${scene}, on a ${mat} mat`,
  image,
});

export const collections: ShopCollection[] = [
  {
    id: "tumblers",
    title: "Tumblers",
    intro:
      "Wrapped in our garden, each carrying one line from it. Keep one for your own slow mornings, or send one to someone who needs a quieter day.",
    unit: "tumbler",
    // CK, 18 Oct 2026; Qikink cost ≈ ₹600 incl. shipping + GST.
    price: 1199,
    specs: "20 oz, double-wall stainless steel, with a splash-proof lid and a metal straw",
    aspect: "3 / 4",
    quoted: true,
    items: [
      tumbler("01", "Nothing has been asked of you yet.", "jasmine vines", nothingAsked),
      tumbler("02", "Nobody checks the time here.", "ivy around an old garden clock", time),
      tumbler(
        "03",
        "The gate is where it begins.",
        "an open garden gate under climbing roses",
        gate,
      ),
      tumbler("04", "No alarm. No agenda.", "morning glory", noAlarm),
      tumbler("05", "It blooms without being asked.", "bougainvillea", blooms),
      tumbler(
        "06",
        "Two chairs. Nothing on the schedule.",
        "two cane chairs under olive branches",
        twoChairs,
      ),
      tumbler(
        "07",
        "Nowhere to be until you're ready.",
        "lavender, wild grasses and a butterfly",
        nowhere,
      ),
      tumbler(
        "08",
        "The garden already knows.",
        "monstera and fern leaves with a sparrow",
        alreadyKnows,
      ),
      tumbler(
        "09",
        "Chai on the stone step. The garden still cool from the night.",
        "a kulhad of chai on a stone step among marigolds",
        chai,
      ),
      tumbler(
        "10",
        "A garden doesn't ask anything of you. You sit, and the day gets quieter.",
        "apricot branches with blossoms and fruit",
        apricot,
      ),
    ],
  },
  {
    id: "birds",
    title: "Birds of the Garden",
    intro:
      "Watercolours of the birds that visit our gardens in Chandigarh, each on its own soft English colour. Collect one, or hang a few together.",
    unit: "print",
    // CK, 19 Oct 2026; Qikink A4 framed ≈ ₹410 incl. shipping + GST.
    price: 999,
    specs: "A4, printed on 300 gsm art paper in a black frame, ready to hang",
    aspect: "2 / 3",
    quoted: false,
    items: [
      bird(
        "01",
        "Indian grey hornbill",
        "on a neem branch",
        "powder-blue",
        hornbill,
        "Chandigarh's state bird",
      ),
      bird("02", "Rose-ringed parakeet", "on a guava branch", "old-rose", parakeet),
      bird("03", "Indian roller", "with wings half open on a bare twig", "oatmeal", roller),
      bird("04", "Red-whiskered bulbul", "beside a hibiscus flower", "duck-egg blue", bulbul),
      bird("05", "Purple sunbird", "at a sprig of bougainvillea", "sage", sunbird),
      bird("06", "Common hoopoe", "on a mossy stone", "slate-grey", hoopoe),
      bird("07", "Oriental magpie-robin", "singing on a jasmine stem", "ochre", magpieRobin),
      bird("08", "White-throated kingfisher", "on a bent reed", "clay-pink", kingfisher),
      bird("09", "Asian koel", "on a mango branch", "pale green", koel),
      bird(
        "10",
        "Coppersmith barbet",
        "on apricot blossom",
        "heather-grey",
        barbet,
        "On apricot blossom",
      ),
    ],
  },
];

/** "₹1,199" */
export function formatPrice(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/** The pre-filled WhatsApp message for ordering one design. */
export function orderMessage(
  c: Pick<ShopCollection, "title" | "unit" | "quoted">,
  item: Pick<ShopItem, "no" | "title">,
): string {
  const name = c.quoted ? `"${item.title}"` : item.title;
  return `Hi Apricot Stays, I'd like the ${name} ${c.unit} (${c.title}, No. ${item.no}).`;
}
