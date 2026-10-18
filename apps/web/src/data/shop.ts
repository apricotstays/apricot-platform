/**
 * The Garden Shop (/shop): printed on demand by Qikink, ordered on WhatsApp.
 * Pages: /shop (one shelf per collection, in `position` order) → /shop/<collection> (full grid)
 * → /shop/<collection>/<item> (product page). Each collection has its own price, specs and
 * numbering ("01", "02", …); an order message names the collection, the design and its number.
 *
 * Tumblers: lines are CK's own garden copy (Apricot content calendar, May–Jun 2026; No. 10 is
 * Shivani's line from Our Story). Approved by CK, 18 Oct 2026.
 * Birds of the Garden: watercolour prints of garden birds of Chandigarh, A4 framed.
 * Approved by CK, 19 Oct 2026.
 * Product descriptions: drafted by Claude 19 Oct 2026 for CK's review.
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
  /** URL part: /shop/<collection>/<slug>. */
  slug: string;
  /** Card title: the tumbler's line, or the bird's name. */
  title: string;
  /** Optional short line under the title. */
  note?: string;
  /** One or two sentences for the product page. */
  description: string;
  alt: string;
  image: ImageMetadata;
}

export interface ShopCollection {
  /** URL part: /shop/<slug>. Also the jump-link id on /shop. */
  slug: string;
  title: string;
  /** What the products are, e.g. "Framed posters". */
  kind: string;
  /** Shelf order on /shop, lowest first. */
  position: number;
  /** Optional small label on the shelf, e.g. "New". */
  badge?: string;
  /** One line under the shelf title. */
  blurb: string;
  intro: string;
  /** Singular noun used in the order message and on product pages, e.g. "tumbler". */
  unit: string;
  /** Customer price in rupees. */
  price: number;
  specs: string;
  /** Rows for the details table on product pages. */
  details: { label: string; value: string }[];
  /** Small print under the grid. */
  footnote: string;
  /** CSS aspect ratio of the product images. */
  aspect: string;
  /** Show the title in quote marks (lines) rather than as a name. */
  quoted: boolean;
  items: ShopItem[];
}

const tumbler = (
  no: string,
  slug: string,
  title: string,
  artwork: string,
  description: string,
  image: ImageMetadata,
): ShopItem => ({
  no,
  slug,
  title,
  description,
  alt: `Apricot Stays tumbler with ${artwork} and the line “${title}”`,
  image,
});

const bird = (
  no: string,
  slug: string,
  title: string,
  scene: string,
  mat: string,
  description: string,
  image: ImageMetadata,
  note?: string,
): ShopItem => ({
  no,
  slug,
  title,
  note,
  description,
  alt: `Framed A4 poster: watercolour of a ${title.toLowerCase()} ${scene}, on a ${mat} border, in a black frame`,
  image,
});

const DELIVERY = "Made to order, anywhere in India. We share the date and tracking on WhatsApp.";

const unsorted: ShopCollection[] = [
  {
    slug: "words-of-the-garden",
    title: "Words of the Garden",
    kind: "Tumblers",
    position: 2,
    blurb: "20 oz stainless steel, each carrying one line from our garden.",
    intro:
      "Wrapped in our garden, each carrying one line from it. Keep one for your own slow mornings, or send one to someone who needs a quieter day.",
    unit: "tumbler",
    // CK, 18 Oct 2026; Qikink cost ≈ ₹600 incl. shipping + GST.
    price: 1199,
    specs: "20 oz, double-wall stainless steel, with a splash-proof lid and a metal straw",
    details: [
      { label: "Size", value: "20 oz (about 590 ml)" },
      { label: "Made of", value: "Double-wall stainless steel" },
      { label: "Comes with", value: "Splash-proof lid and a metal straw" },
      { label: "Delivery", value: DELIVERY },
    ],
    footnote: "Pictures are design previews; colours in print may vary slightly.",
    aspect: "3 / 4",
    quoted: true,
    items: [
      tumbler(
        "01",
        "nothing-asked",
        "Nothing has been asked of you yet.",
        "jasmine vines",
        "Jasmine vines climbing around a line for unhurried mornings.",
        nothingAsked,
      ),
      tumbler(
        "02",
        "nobody-checks-the-time",
        "Nobody checks the time here.",
        "ivy around an old garden clock",
        "Ivy growing over an old garden clock that nobody winds.",
        time,
      ),
      tumbler(
        "03",
        "the-gate",
        "The gate is where it begins.",
        "an open garden gate under climbing roses",
        "Climbing roses over an open garden gate.",
        gate,
      ),
      tumbler(
        "04",
        "no-alarm",
        "No alarm. No agenda.",
        "morning glory",
        "Morning glory just opening, with dew still on the leaves.",
        noAlarm,
      ),
      tumbler(
        "05",
        "it-blooms",
        "It blooms without being asked.",
        "bougainvillea",
        "Dusty-pink bougainvillea, spilling over without being asked.",
        blooms,
      ),
      tumbler(
        "06",
        "two-chairs",
        "Two chairs. Nothing on the schedule.",
        "two cane chairs under olive branches",
        "Two cane chairs under olive branches, waiting for nobody in particular.",
        twoChairs,
      ),
      tumbler(
        "07",
        "nowhere-to-be",
        "Nowhere to be until you're ready.",
        "lavender, wild grasses and a butterfly",
        "Lavender and wild grasses, with a butterfly passing through.",
        nowhere,
      ),
      tumbler(
        "08",
        "the-garden-knows",
        "The garden already knows.",
        "monstera and fern leaves with a sparrow",
        "Monstera and fern after rain, with a sparrow keeping watch.",
        alreadyKnows,
      ),
      tumbler(
        "09",
        "chai-on-the-step",
        "Chai on the stone step. The garden still cool from the night.",
        "a kulhad of chai on a stone step among marigolds",
        "A kulhad of chai on a mossy stone step, among marigolds.",
        chai,
      ),
      tumbler(
        "10",
        "a-garden-doesnt-ask",
        "A garden doesn't ask anything of you. You sit, and the day gets quieter.",
        "apricot branches with blossoms and fruit",
        "Apricot blossom and fruit around Shivani's line from our story.",
        apricot,
      ),
    ],
  },
  {
    slug: "birds-of-the-garden",
    title: "Birds of the Garden",
    kind: "Framed posters",
    position: 1,
    badge: "New",
    blurb: "A4 watercolour posters, framed and ready to hang.",
    intro:
      "Watercolours of the birds that visit our gardens in Chandigarh, each on its own soft English colour. Framed and ready to hang. Collect one, or hang a few together.",
    unit: "framed poster",
    // CK, 19 Oct 2026; Qikink A4 framed ≈ ₹410 incl. shipping + GST.
    price: 999,
    specs: "A4 poster on 300 gsm art paper, in a black frame, with a hanging kit",
    details: [
      { label: "Size", value: "A4 poster (21 × 29.7 cm)" },
      { label: "Frame", value: "Black, about 1 inch, with a hanging kit" },
      { label: "Paper", value: "300 gsm art paper; the coloured border is printed" },
      { label: "Delivery", value: DELIVERY },
    ],
    footnote: "Pictures are design previews; the colour border is printed as part of the poster.",
    aspect: "2 / 3",
    quoted: false,
    items: [
      bird(
        "01",
        "indian-grey-hornbill",
        "Indian grey hornbill",
        "on a neem branch",
        "powder-blue",
        "Chandigarh's state bird, painted on a neem branch in soft watercolour, on a powder-blue border. Grey, long-tailed, with a curved bill topped by a small casque.",
        hornbill,
        "Chandigarh's state bird",
      ),
      bird(
        "02",
        "rose-ringed-parakeet",
        "Rose-ringed parakeet",
        "on a guava branch",
        "old-rose",
        "The green, ring-necked parakeet of every Chandigarh garden, on a guava branch, on an old-rose border.",
        parakeet,
      ),
      bird(
        "03",
        "indian-roller",
        "Indian roller",
        "with wings half open on a bare twig",
        "oatmeal",
        "Painted with its wings half open to show the bright blues it flashes in flight, on an oatmeal border.",
        roller,
      ),
      bird(
        "04",
        "red-whiskered-bulbul",
        "Red-whiskered bulbul",
        "beside a hibiscus flower",
        "duck-egg blue",
        "Crested and red-cheeked, beside a hibiscus flower, on a duck-egg blue border.",
        bulbul,
      ),
      bird(
        "05",
        "purple-sunbird",
        "Purple sunbird",
        "at a sprig of bougainvillea",
        "sage",
        "Tiny and iridescent, sipping from bougainvillea, on a sage border.",
        sunbird,
      ),
      bird(
        "06",
        "common-hoopoe",
        "Common hoopoe",
        "on a mossy stone",
        "slate-grey",
        "Crest raised, standing on a mossy stone, on a slate-grey border.",
        hoopoe,
      ),
      bird(
        "07",
        "oriental-magpie-robin",
        "Oriental magpie-robin",
        "singing on a jasmine stem",
        "ochre",
        "One of the garden's best singers, mid-song on a jasmine stem, on an ochre border.",
        magpieRobin,
      ),
      bird(
        "08",
        "white-throated-kingfisher",
        "White-throated kingfisher",
        "on a bent reed",
        "clay-pink",
        "Chestnut head and electric-blue back, on a bent reed, on a clay-pink border.",
        kingfisher,
      ),
      bird(
        "09",
        "asian-koel",
        "Asian koel",
        "on a mango branch",
        "pale green",
        "The voice of summer mornings, on a mango branch, on a pale green border.",
        koel,
      ),
      bird(
        "10",
        "coppersmith-barbet",
        "Coppersmith barbet",
        "on apricot blossom",
        "heather-grey",
        "Named for its metallic 'tuk-tuk' call, painted on apricot blossom, on a heather-grey border.",
        barbet,
        "On apricot blossom",
      ),
    ],
  },
];

/** All collections, in shelf order. */
export const collections: ShopCollection[] = [...unsorted].sort((a, b) => a.position - b.position);

export function findCollection(slug: string): ShopCollection | undefined {
  return collections.find((c) => c.slug === slug);
}

/** "₹1,199" */
export function formatPrice(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/** "from ₹999" — every collection starts at its lowest price. */
export function fromPrice(c: Pick<ShopCollection, "price">): string {
  return `from ${formatPrice(c.price)}`;
}

/** Display title: lines in quote marks, names as they are. */
export function displayTitle(
  c: Pick<ShopCollection, "quoted">,
  item: Pick<ShopItem, "title">,
): string {
  return c.quoted ? `“${item.title}”` : item.title;
}

export const productHref = (c: Pick<ShopCollection, "slug">, item: Pick<ShopItem, "slug">) =>
  `/shop/${c.slug}/${item.slug}`;

/** The pre-filled WhatsApp message for ordering one design. */
export function orderMessage(
  c: Pick<ShopCollection, "title" | "unit" | "quoted">,
  item: Pick<ShopItem, "no" | "title">,
): string {
  const name = c.quoted ? `"${item.title}"` : item.title;
  return `Hi Apricot Stays, I'd like the ${name} ${c.unit} (${c.title}, No. ${item.no}).`;
}
