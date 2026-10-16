/**
 * Shared data definitions. Booking/availability logic lives in STAIZ;
 * these types describe what the website reads from it.
 *
 * Content source: the Replit site (Oct 2026). Only facts the owner had published there are
 * included. Each home carries a starting nightly rate ("From ₹X / night"), set by the owner
 * (Oct 2026); the exact price for given dates is still confirmed on WhatsApp.
 */
export interface Property {
  slug: string;
  name: string;
  locality: string;
  /** One-line card summary. */
  summary: string;
  description: string;
  amenities: readonly string[];
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  /** Starting nightly rate in rupees — shown as "From ₹X / night". Set by the owner; update by hand. */
  fromPerNight: number;
  /** Public Airbnb listing, when one exists. */
  airbnbUrl?: string;
}

/** When the starting rates were last checked (shown next to them). Update with the rates. */
export const ratesChecked = "Oct 2026";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
/** "₹5,500" */
export const formatRupees = (n: number): string => `₹${rupee.format(n)}`;
/** "From ₹5,500 / night" */
export const fromLine = (p: Pick<Property, "fromPerNight">): string =>
  `From ${formatRupees(p.fromPerNight)} / night`;

const LOCALITY = "DLF Hyde Park, New Chandigarh";

export const properties: readonly Property[] = [
  {
    slug: "garden-cottage",
    name: "Apricot Garden Cottage",
    locality: LOCALITY,
    summary: "A sunlit garden retreat for two.",
    description:
      "A serene garden retreat nestled in the lush greenery of DLF Hyde Park, New Chandigarh. Surrounded by plants, sunshine and peaceful vibes, it's perfect for writers, remote workers or couples. Enjoy a cosy reading nook, blooming garden views, hanging plants and sunlit corners. 24/7 power backup and high-speed internet included.",
    amenities: [
      "Fast Wi-Fi (100 Mbps)",
      "Garden view",
      "24/7 power backup",
      "Gated security",
      "Clubhouse access",
    ],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    fromPerNight: 5_500,
    airbnbUrl: "https://www.airbnb.co.in/rooms/1473200853156126236",
  },
  {
    slug: "garden-courtyard",
    name: "Apricot Garden Courtyard",
    locality: LOCALITY,
    summary: "Terracotta walls, stone paths and a private courtyard.",
    description:
      "A modern courtyard retreat with terracotta walls and stone pathways. Ambient garden lighting, private lawn space and contemporary design with a warm evening glow.",
    amenities: [
      "Private courtyard",
      "Garden lighting",
      "Fast Wi-Fi",
      "24/7 power backup",
      "Gated security",
      "Clubhouse access",
    ],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    fromPerNight: 8_500,
    airbnbUrl: "https://www.airbnb.co.in/rooms/1603439898679095327",
  },
  {
    slug: "garden-chateau",
    name: "Apricot Garden Château",
    locality: LOCALITY,
    summary: "Our grandest home: a five-bedroom French-manor villa.",
    description:
      "Apricot Garden Château is our grandest home — a French-manor villa inside the 250-acre DLF Hyde Park estate, New Chandigarh, at the foothills of the Himalayas. A columned facade, curved tiled roof, wrought-iron balconies, private stone courtyard, floor-to-ceiling glass, five bedrooms, generous living and dining spaces and a fully equipped kitchen — the entire manor is yours for gatherings you'll remember.",
    amenities: [
      "Fully equipped kitchen",
      "High-speed Wi-Fi",
      "Dedicated workspace",
      "Free parking",
      "TV",
      "Washing machine",
      "Air conditioning",
      "Firepit",
      "Private courtyard",
      "DLF Hyde Park clubhouse",
      "24/7 power backup",
      "Estate security",
    ],
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 5,
    fromPerNight: 45_000,
    airbnbUrl: "https://www.airbnb.co.in/rooms/1755107663054771918",
  },
  {
    slug: "garden-care",
    name: "Apricot Garden Care",
    locality: LOCALITY,
    summary: "A calm, step-free home minutes from PGI and Homi Bhabha Cancer Hospital.",
    description:
      "A quiet ground-floor one-bedroom home for families visiting PGI Chandigarh or Homi Bhabha Cancer Hospital, both a few minutes away. No stairs, a bedroom that opens onto a private lawn, a fully equipped kitchen, RO drinking water and a washing machine — the everyday comforts that make a longer stay feel like home rather than a hotel.",
    amenities: [
      "Step-free, ground floor",
      "Private lawn",
      "Fully equipped kitchen",
      "RO drinking water",
      "Washing machine",
      "Wi-Fi",
      "Dedicated workspace",
      "Free parking",
      "Pets allowed",
      "Gated estate",
    ],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    fromPerNight: 4_500,
    airbnbUrl: "https://www.airbnb.co.in/rooms/1679764480306760606",
  },
];
