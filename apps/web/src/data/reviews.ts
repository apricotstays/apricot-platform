/**
 * Guest reviews shown on each home's page, quoted from Airbnb with the guest's consent
 * (CK, 16 Oct 2026). First name + month only. Shown as text — never as schema.org Review or
 * AggregateRating markup (Google disallows marking up reviews collected on another platform).
 *
 * `listing` figures are typed in by hand from each Airbnb listing; update with `checked`.
 * Short excerpts; "…" marks a cut. Keep 3 per home at most, garden-led where possible.
 */

export interface Review {
  name: string;
  /** "October 2026" */
  month: string;
  text: string;
  /** Set when the guest stayed at a different home (used on the Château while it is new). */
  stayedAt?: string;
}

export interface HomeReviews {
  /** Airbnb listing figures; omit `rating` until Airbnb shows one (3+ reviews). */
  listing?: { rating?: string; count: number; guestFavourite: boolean };
  /** True while a home has no reviews of its own. */
  isNew?: boolean;
  reviews: Review[];
}

export const reviewsChecked = "Oct 2026";

const kirti: Review = {
  name: "Kirti",
  month: "March 2026",
  text: "The architecture was stunning; right in the city, yet it felt like a serene countryside escape.",
};
const falak: Review = {
  name: "Falak",
  month: "July 2026",
  text: "It’s a unique property with lush green lawns, beautiful plants all over the property! The architecture of this place isn’t something which you would usually see.",
};

export const reviews: Record<string, HomeReviews> = {
  "garden-cottage": {
    listing: { rating: "4.98", count: 64, guestFavourite: true },
    reviews: [
      {
        name: "Kshitij",
        month: "October 2026",
        text: "The garden is lush, nice barefoot walks. I saw fireflies for the first time probably as an adult.",
      },
      {
        name: "Yashika",
        month: "September 2025",
        text: "It felt private and serene – a quaint space where I could hear nothing but the wind and birds. The front garden is simple yet wonderfully calm…",
      },
      {
        name: "Divya",
        month: "October 2026",
        text: "Garden is well maintained and property seems exactly same as photos. Owners were very considerate and helpful.",
      },
    ],
  },
  "garden-courtyard": {
    listing: { rating: "5.0", count: 27, guestFavourite: true },
    reviews: [
      falak,
      kirti,
      {
        name: "Mohit",
        month: "March 2026",
        text: "The property was spotless and the stay was rejuvenating. Feels like you’re in the arms of nature.",
      },
    ],
  },
  "garden-care": {
    listing: { count: 2, guestFavourite: false },
    reviews: [
      {
        name: "Bansuri",
        month: "August 2026",
        text: "Apricot Garden Care was more than home for a week. Restful, inspiring, comfortable… One got the sense of being cared for.",
      },
      { name: "Paramjot", month: "August 2026", text: "So peaceful." },
    ],
  },
  "garden-chateau": {
    isNew: true,
    reviews: [
      { ...kirti, stayedAt: "Garden Courtyard" },
      { ...falak, stayedAt: "Garden Courtyard" },
    ],
  },
};

/** "Airbnb Guest Favourite · 4.98 from 64 reviews" / "2 reviews on Airbnb" */
export function listingLine(r: HomeReviews): string | null {
  const l = r.listing;
  if (!l) return null;
  const counted = l.rating
    ? `${l.rating} from ${l.count} reviews`
    : `${l.count} review${l.count === 1 ? "" : "s"} on Airbnb`;
  return l.guestFavourite ? `Airbnb Guest Favourite · ${counted}` : counted;
}
