/**
 * Apricot Stays brand tokens — single source of truth.
 * Keep in sync with tokens.css (CSS custom properties used by the website).
 */
export const colors = {
  bg: "#F6EEE3",
  bg2: "#EFE3D3",
  ink: "#33241A",
  ink2: "#6B5545",
  line: "#DCCBB6",
  apricot: "#E3874B",
  apricotDeep: "#B8602C",
  /** Use for small apricot text (WCAG AA). */
  apricotText: "#A55628",
  leaf: "#5E6B48",
  white: "#FFFBF5",
} as const;

/** Fonts are self-hosted via Fontsource (no Google Fonts requests). */
export const fonts = {
  display: '"Fraunces Variable", Georgia, serif',
  body: '"DM Sans Variable", system-ui, sans-serif',
} as const;

export const brand = {
  name: "Apricot Stays",
  tagline: "Stay like you live here.",
  region: "Chandigarh Tricity",
  url: "https://apricotstays.in",
} as const;

export const contact = {
  /** WhatsApp is the only contact channel for now. */
  whatsappE164: "+919740544873",
  whatsappDisplay: "+91 97405 44873",
  whatsappLink: (text: string) => `https://wa.me/919740544873?text=${encodeURIComponent(text)}`,
  email: "hello@apricotstays.in",
} as const;
