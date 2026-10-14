/**
 * Apricot Stays brand tokens — single source of truth.
 * Keep in sync with theme.css (Tailwind @theme used by the website).
 * Palette ported from the Replit design (owner decision, 14 Oct 2026).
 */
export const colors = {
  apricot: "#FF5A5F",
  sage: "#00A699",
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
