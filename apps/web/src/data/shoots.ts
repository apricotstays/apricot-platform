/**
 * "Shoot at Apricot" (/shoots) — V1 of the Film & Shoot Locations Playbook (CK, 30 Oct 2026).
 * Soft launch: noindex, not in sitemap/llms.txt, linked from the footer and /policies only,
 * until the DLF Hyde Park society NOC is in hand. No prices; enquiries go to WhatsApp.
 * Specs use only facts already published on the site; power load, room sizes and parking
 * counts are shared at the recce (CK to supply for V2).
 */
import { photos, type Photo } from "./media";

export interface ShootType {
  title: string;
  text: string;
}

export const shootTypes: readonly ShootType[] = [
  {
    title: "Film & OTT",
    text: "Interiors and exteriors for features and series, with the whole manor locked for your days.",
  },
  {
    title: "Ads & brand campaigns",
    text: "A finished, furnished home that reads premium on camera, with no set build needed.",
  },
  {
    title: "Music videos",
    text: "A white columned facade, a marble hall and a lawn that lights up at golden hour.",
  },
  {
    title: "Pre-wedding shoots",
    text: "Gardens, a terracotta courtyard and a French-manor staircase, all inside one gated estate.",
  },
  {
    title: "Creator & product shoots",
    text: "Smaller homes with good daylight for half-day and one-day shoots.",
  },
];

export interface ShootHome {
  slug: string;
  /** Role in a larger production. */
  role: string;
  /** Best shoot uses on its own. */
  uses: string;
  /** Spaces worth knowing about, from the site's own descriptions. */
  spaces: string;
  photo: Photo;
}

/** Order: the set first, then the homes that support it (playbook "Fit check"). */
export const shootHomes: readonly ShootHome[] = [
  {
    slug: "garden-chateau",
    role: "Main set",
    uses: "Film and OTT interiors, ads, music videos, brand campaigns",
    spaces:
      "Columned facade, lawn and clipped hedges, private stone courtyard, marble hall with a snooker table, staircase, living room, dining for ten, kitchen, five bedrooms",
    photo: photos.chateauFront,
  },
  {
    slug: "garden-courtyard",
    role: "Talent rest or green room",
    uses: "Pre-wedding, creator and small brand shoots",
    spaces: "Terracotta courtyard with garden lighting, patio, living room, bedroom",
    photo: photos.courtyardEvening,
  },
  {
    slug: "garden-cottage",
    role: "Crew stay",
    uses: "Pre-wedding, intimate scenes, product shoots",
    spaces: "Private garden and stone path, porch, sunlit bedroom, kitchen",
    photo: photos.cottageSunset,
  },
  {
    slug: "garden-care",
    role: "Crew stay or production office",
    uses: "Best kept off camera",
    spaces: "Step-free ground floor, private lawn, workspace, kitchen",
    photo: photos.careExterior,
  },
];

/** Château spaces strip — a quick visual recce. */
export const chateauSpaces: readonly { label: string; photo: Photo }[] = [
  { label: "From the street", photo: photos.chateauStreet },
  { label: "Marble hall", photo: photos.chateauHall },
  { label: "Living room", photo: photos.chateauLiving },
  { label: "Dining for ten", photo: photos.chateauDining },
  { label: "Foyer and staircase", photo: photos.chateauFoyer },
  { label: "Lounge", photo: photos.chateauLounge },
];

export const shootSteps: readonly { title: string; text: string }[] = [
  {
    title: "Enquire",
    text: "Send the project, dates, crew size and the spaces you need on WhatsApp.",
  },
  {
    title: "Recce",
    text: "Visit with your director, DOP and production team. We walk you through every room, the power and the parking.",
  },
  {
    title: "Quote",
    text: "A quote for your shoot days, prep and wrap, and any crew stay in the other homes.",
  },
  {
    title: "Agreement & deposit",
    text: "A written location agreement and a refundable security deposit lock your dates.",
  },
  {
    title: "Shoot & wrap",
    text: "We're on hand through the shoot, then check the homes against the before photos together.",
  },
];

export const shootRules: readonly string[] = [
  "Crew size, shoot hours and the rooms you can use are agreed in writing before day one.",
  "Share your vehicle list and crew numbers ahead of time, and we'll arrange gate access in the estate.",
  "Permissions from the police and local authorities, and production insurance, are the production's responsibility.",
  "A refundable security deposit, with dated photos of each home before and after.",
  "No smoking indoors, and furniture moves or wall fixings only as agreed with us.",
  "Quiet hours in the estate are 10 PM – 7 AM; night shoots by arrangement.",
];

export const shootWhatsapp =
  "Hi Apricot Stays, shoot enquiry.\n\nProduction / project:\nType (film, ad, music video, pre-wedding…):\nDates:\nCrew size per day:\nHomes or spaces needed:";
