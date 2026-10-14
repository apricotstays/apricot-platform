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
  leaf: "#5E6B48",
  white: "#FFFBF5",
} as const;

export const fonts = {
  display: '"Fraunces", Georgia, serif',
  body: '"DM Sans", system-ui, sans-serif',
  /** Google Fonts stylesheet used by the website. */
  googleFontsHref:
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap",
} as const;

export const brand = {
  name: "Apricot Stays",
  tagline: "Stay like you live here.",
  region: "Chandigarh Tricity",
  url: "https://apricotstays.in",
} as const;
