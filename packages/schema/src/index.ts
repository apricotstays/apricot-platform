/**
 * Shared data definitions. Booking/availability logic lives in STAIZ;
 * these types describe what the website reads from it.
 */
export interface Property {
  slug: string;
  name: string;
  /** Optional locality tag, e.g. "DLF Hyde Park". */
  tag?: string;
}

export const properties: readonly Property[] = [
  { slug: "courtyard", name: "Apricot Courtyard" },
  { slug: "cottage", name: "Apricot Cottage" },
  { slug: "garden-chateau", name: "Apricot Garden Château", tag: "DLF Hyde Park" },
];
