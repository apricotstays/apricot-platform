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
  /** Stay terms for direct bookings (CK approved, 20 Oct 2026). Shown on the stay page and /policies. */
  policy: StayPolicy;
}

/**
 * Terms for one home. The /policies page, each stay page's "Things to know" block and llms.txt
 * all read these, so the site can't contradict itself. Keep Airbnb in step when they change.
 */
export interface StayPolicy {
  /** "2 PM" */
  checkIn: string;
  /** "12 PM" */
  checkOut: string;
  pets: "Welcome" | "On request";
  /** Short form for tables and the phone bar: "Up to 14 days before". */
  freeCancellation: string;
  /** Cancellation lines for the "Things to know" block, most generous first. */
  cancellation: readonly string[];
  /** House-rule lines for the "Things to know" block. */
  rules: readonly string[];
}

/** "2 PM" → "14:00", "11 AM" → "11:00", "12 PM" → "12:00" (schema.org checkinTime/checkoutTime). */
export const to24h = (t: string): string => {
  const m = /^(\d{1,2}) (AM|PM)$/.exec(t);
  if (!m) throw new Error(`Unexpected time: ${t}`);
  const h = (Number(m[1]) % 12) + (m[2] === "PM" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:00`;
};

/** When the stay policies last changed (shown on /policies). */
export const policiesUpdated = "October 2026";

const STANDARD_CANCELLATION = [
  "Free cancellation up to 14 days before check-in",
  "7–14 days: 50% back, or 100% as stay credit",
  "Under 7 days: non-refundable",
  "One free date change",
] as const;

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
    policy: {
      checkIn: "2 PM",
      checkOut: "12 PM",
      pets: "Welcome",
      freeCancellation: "Up to 14 days before",
      cancellation: STANDARD_CANCELLATION,
      rules: [
        "Up to 2 guests · ID for each adult before arrival",
        "Pets welcome",
        "No smoking indoors · no parties",
        "Quiet hours 10 PM – 7 AM",
      ],
    },
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
    policy: {
      checkIn: "2 PM",
      checkOut: "12 PM",
      pets: "Welcome",
      freeCancellation: "Up to 14 days before",
      cancellation: STANDARD_CANCELLATION,
      rules: [
        "Up to 2 guests · ID for each adult before arrival",
        "Pets welcome",
        "No smoking indoors · no parties",
        "Quiet hours 10 PM – 7 AM",
      ],
    },
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
    policy: {
      checkIn: "3 PM",
      checkOut: "11 AM",
      pets: "On request",
      freeCancellation: "Up to 30 days before",
      cancellation: [
        "Free cancellation up to 30 days before check-in",
        "7–30 days: 50% back, or 100% as stay credit",
        "Under 7 days: non-refundable",
        "Diwali week, 24 Dec – 2 Jan and booked events: non-refundable, can be moved once",
      ],
      rules: [
        "Up to 10 guests · ID for each adult before arrival",
        "Celebrations welcome within 10 guests; larger events by arrangement",
        "No smoking indoors · pets on request",
        "Quiet hours 10 PM – 7 AM",
      ],
    },
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
    policy: {
      checkIn: "2 PM",
      checkOut: "12 PM",
      pets: "Welcome",
      freeCancellation: "Up to 48 hours before",
      cancellation: [
        "Free change or cancellation up to 48 hours before check-in",
        "Within 48 hours: the first night is kept, the rest refunded",
        "Hospital dates move, and we understand",
      ],
      rules: [
        "Up to 2 guests · ID for each adult before arrival",
        "Pets welcome",
        "No smoking anywhere on the premises",
        "Quiet hours 10 PM – 7 AM",
      ],
    },
  },
];
