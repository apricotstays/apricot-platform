/**
 * Apricot Stays brand tokens — single source of truth.
 * Keep in sync with theme.css (Tailwind @theme used by the website).
 * Palette: Courtyard terracotta + Garden green (design audit, Oct 2026; replaced the Replit coral/teal).
 */
export const colors = {
  apricot: "#B5452F",
  apricotDark: "#9A3A26",
  forest: "#2F4A3A",
  forestDark: "#223729",
  sage: "#2F4A3A",
  porch: "#FFFFFF",
  stone: "#484848",
  pebble: "#F7F7F7",
  gold: "#D4A574",
  bronze: "#B08960",
  cream: "#FBF8F3",
  linen: "#F7F3ED",
  blush: "#F7EDE7",
  sand: "#EEE6DB",
  ivory: "#F9F6F0",
} as const;

/** Fonts are self-hosted via Fontsource (no Google Fonts requests). */
export const fonts = {
  serif: '"Lora Variable", "Lora", Georgia, serif',
  sans: '"DM Sans Variable", "DM Sans", system-ui, sans-serif',
} as const;

/** The Apricot promise (CK chose option A, 21 Oct 2026). Every home has its own private outdoor space. */
export const promise = {
  name: "A garden of your own",
  line: "Every Apricot home comes with its own private garden, lawn or courtyard. Never shared, never a common area.",
} as const;

export const brand = {
  name: "Apricot Stays",
  tagline: "Stay like you live here.",
  region: "Chandigarh Tricity",
  url: "https://apricotstays.in",
} as const;

export const contact = {
  /** WhatsApp is the booking channel. */
  whatsappE164: "+919740544873",
  whatsappDisplay: "+91 97405 44873",
  whatsappLink: (text: string) => `https://wa.me/919740544873?text=${encodeURIComponent(text)}`,
  email: "hello@apricotstays.in",
  address: {
    locality: "DLF Hyde Park, New Chandigarh",
    region: "Punjab",
    country: "IN",
    geo: { latitude: 30.8406, longitude: 76.7249 },
  },
} as const;

/**
 * Host track record, as shown on the host's public Airbnb profile.
 * Update by hand when it changes. Shown as text only — never as schema.org
 * AggregateRating (Google disallows self-serving markup of third-party reviews).
 */
export const trust = {
  rating: "4.99",
  reviews: 93,
  superhost: true,
  checked: "Oct 2026",
} as const;

/**
 * "Powered by STAIZ" credit — STAIZ is the operating system Apricot Stays runs
 * on (our B2B product, site for operators). Only the footer credit links out
 * (`url` + `utm`, new tab, with the `hint` tooltip); the credit under the
 * availability calendar stays plain text so guests aren't sent away at the
 * booking moment (CK, 26 Oct 2026). Set `url` to null to unlink the footer.
 */
export const poweredBy = {
  name: "STAIZ",
  url: "https://staiz.apricotstays.in/" as string | null,
  utm: "utm_source=apricotstays&utm_medium=footer",
  hint: "The software we built to run our homes — for hosts and operators",
} as const;
