import type { ImageMetadata } from "astro";
import { photos, type Photo } from "./media";
import { reviews } from "./reviews";

import hornbill from "../assets/postcards/hornbill.jpg";
import parakeet from "../assets/postcards/parakeet.jpg";
import roller from "../assets/postcards/roller.jpg";
import bulbul from "../assets/postcards/bulbul.jpg";
import sunbird from "../assets/postcards/sunbird.jpg";
import hoopoe from "../assets/postcards/hoopoe.jpg";
import magpieRobin from "../assets/postcards/magpie-robin.jpg";
import kingfisher from "../assets/postcards/kingfisher.jpg";

/**
 * "Postcards from the garden" on the homepage (CK chose mockup E, 26 Nov 2026).
 * Each card quotes a consented review from `reviews.ts` (same guest, same home): `excerpt`
 * may shorten it but must be the start of that review's text (tested). The stamp is a bird
 * from the Garden Shop's "Birds of the Garden" prints, cropped from `Shop/Poster/print-files`.
 */
export interface PostcardSpec {
  home: keyof typeof reviews;
  name: string;
  /** Shorter cut of the review (must start the review's text). Defaults to the full text. */
  excerpt?: string;
  photo: Photo;
  bird: { src: ImageMetadata; name: string };
}

const birds = {
  hornbill: { src: hornbill, name: "Indian grey hornbill" },
  parakeet: { src: parakeet, name: "Rose-ringed parakeet" },
  roller: { src: roller, name: "Indian roller" },
  bulbul: { src: bulbul, name: "Red-vented bulbul" },
  sunbird: { src: sunbird, name: "Purple sunbird" },
  hoopoe: { src: hoopoe, name: "Hoopoe" },
  magpieRobin: { src: magpieRobin, name: "Oriental magpie-robin" },
  kingfisher: { src: kingfisher, name: "White-throated kingfisher" },
};

export const postcardSpecs: PostcardSpec[] = [
  {
    home: "garden-cottage",
    name: "Kshitij",
    photo: photos.cottageGardenDusk,
    bird: birds.kingfisher,
  },
  { home: "garden-courtyard", name: "Kirti", photo: photos.courtyardEvening, bird: birds.parakeet },
  { home: "garden-care", name: "Bansuri", photo: photos.careExterior, bird: birds.sunbird },
  {
    home: "garden-cottage",
    name: "Yashika",
    excerpt:
      "It felt private and serene – a quaint space where I could hear nothing but the wind and birds.",
    photo: photos.cottagePorch,
    bird: birds.magpieRobin,
  },
  {
    home: "garden-courtyard",
    name: "Falak",
    excerpt:
      "It’s a unique property with lush green lawns, beautiful plants all over the property!",
    photo: photos.courtyardPatio,
    bird: birds.hoopoe,
  },
  { home: "garden-courtyard", name: "Mohit", photo: photos.courtyardLiving, bird: birds.roller },
  { home: "garden-cottage", name: "Divya", photo: photos.cottageGardenPath, bird: birds.bulbul },
  { home: "garden-care", name: "Paramjot", photo: photos.careLivingWide, bird: birds.hornbill },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface Postcard extends PostcardSpec {
  homeName: string;
  text: string;
  /** "October 2026" */
  month: string;
  /** Postmark: "OCT 2026" */
  postmark: string;
}

/** Resolve each spec against reviews.ts; throws if a postcard has no matching consented review. */
export function buildPostcards(homeName: (slug: string) => string): Postcard[] {
  return postcardSpecs.map((s) => {
    const r = reviews[s.home]?.reviews.find((x) => x.name === s.name && !x.stayedAt);
    if (!r) throw new Error(`Postcard ${s.name} (${s.home}) has no review in reviews.ts`);
    const text = s.excerpt ?? r.text;
    if (!r.text.startsWith(text.replace(/[.!]$/, ""))) {
      throw new Error(`Postcard ${s.name}: excerpt must start the review's text`);
    }
    const [m, y] = r.month.split(" ");
    if (!MONTHS.includes(m)) throw new Error(`Postcard ${s.name}: bad month ${r.month}`);
    return {
      ...s,
      homeName: homeName(s.home),
      text,
      month: r.month,
      postmark: `${m.slice(0, 3).toUpperCase()} ${y}`,
    };
  });
}
