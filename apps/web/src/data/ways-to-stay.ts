/**
 * "Ways to stay": use-case pages at /ways-to-stay/<slug>, linked from a homepage row.
 * Order = CK, 21 Oct 2026: lead with the Cottage and Courtyard, then the Château, then Care.
 * Copy uses only facts already published elsewhere on the site.
 */

export interface WayToStay {
  slug: string;
  /** Card and page title. */
  title: string;
  /** One line under the card title. */
  cardLine: string;
  /** Page headline. */
  headline: string;
  intro: string;
  /** Homes this page recommends, by property slug. */
  homes: readonly string[];
  featuresTitle: string;
  features: readonly { title: string; text: string }[];
  /** Pre-filled WhatsApp message. */
  whatsapp: string;
  ctaLine: string;
}

export const waysToStay: readonly WayToStay[] = [
  {
    slug: "garden-for-two",
    title: "A garden for two",
    cardLine: "Quiet weekends and slow mornings for couples.",
    headline: "A garden of your own, for the two of you",
    intro:
      "Two small homes in DLF Hyde Park, each with its own garden: a sunlit cottage with a back lawn, and a terracotta courtyard that glows in the evening. One king bed, a kitchen, and nowhere you have to be.",
    homes: ["garden-cottage", "garden-courtyard"],
    featuresTitle: "Made for slow days",
    features: [
      {
        title: "Your own garden",
        text: "A private back garden at the Cottage, a private courtyard with garden lighting at the Courtyard.",
      },
      {
        title: "Just the two of you",
        text: "Each home sleeps two, with one king bed, and the whole home is yours.",
      },
      {
        title: "Cook, or don't",
        text: "A kitchen in both homes, and The City Club in DLF Hyde Park delivers to the door.",
      },
      {
        title: "Work if you must",
        text: "Wi-Fi and a dedicated workspace in both homes, with 24/7 power backup.",
      },
      {
        title: "Bring the dog",
        text: "Pets are welcome at both homes.",
      },
      {
        title: "Easy to change plans",
        text: "Free cancellation up to 14 days before, and one free date change when you book direct.",
      },
    ],
    whatsapp:
      "Hi Apricot Stays, we're looking for a garden stay for two.\n\nDates:\nCottage or Courtyard:",
    ctaLine: "Tell us your dates and we'll suggest the home that's free.",
  },
  {
    slug: "family-gatherings",
    title: "Family gatherings",
    cardLine: "Five bedrooms, a courtyard and a firepit for up to 10.",
    headline: "One house for the whole family",
    intro:
      "Apricot Garden Château is our grandest home: a French-manor villa in DLF Hyde Park with five bedrooms, each named for one of Punjab's rivers. Room for ten, and space to gather around one long table.",
    homes: ["garden-chateau"],
    featuresTitle: "Room for everyone",
    features: [
      {
        title: "Five bedrooms",
        text: "Chenab, Ravi, Beas, Sutlej and Jhelum: five king-bed rooms and five bathrooms.",
      },
      {
        title: "Gather outside",
        text: "A private stone courtyard, a firepit, a BBQ grill and an outdoor dining area.",
      },
      {
        title: "A table for ten",
        text: "A long dining table and a fully equipped kitchen for family meals.",
      },
      {
        title: "Celebrate together",
        text: "Birthdays, anniversaries and family dinners are welcome within 10 guests; larger events by arrangement.",
      },
      {
        title: "Easy arrivals",
        text: "Free parking, estate security and DLF Hyde Park clubhouse access.",
      },
      {
        title: "Plan ahead",
        text: "Free cancellation up to 30 days before. Festival dates book early.",
      },
    ],
    whatsapp:
      "Hi Apricot Stays, I'd like to book Apricot Garden Château for a family gathering.\n\nDates:\nGuests:\nOccasion:",
    ctaLine: "Tell us the occasion and your dates.",
  },
  {
    slug: "hospital-visits",
    title: "Hospital & treatment visits",
    cardLine: "A calm, step-free home minutes from PGI and Homi Bhabha.",
    headline: "A quiet home near PGI and Homi Bhabha, for the days that matter",
    intro:
      "When someone you love is in treatment, you need somewhere calm to come back to. Garden Care is a ground-floor home in DLF Hyde Park, a few minutes from PGI Chandigarh and Homi Bhabha Cancer Hospital.",
    homes: ["garden-care"],
    featuresTitle: "Made for longer, gentler stays",
    features: [
      {
        title: "Step-free",
        text: "Ground floor, no stairs, and a bedroom that opens onto a private lawn.",
      },
      {
        title: "Cook your own meals",
        text: "A full kitchen and RO drinking water, for diets that hospital food can't meet.",
      },
      {
        title: "Laundry at home",
        text: "A washing machine in the home, so a long stay stays easy.",
      },
      {
        title: "Plans can change",
        text: "Free date change or cancellation up to 48 hours before. Hospital dates move, and we understand.",
      },
      {
        title: "Room for a caregiver",
        text: "Two guests: the patient and one companion. Pets welcome.",
      },
      {
        title: "Calm and private",
        text: "A gated estate, free parking and no smoking anywhere on the premises.",
      },
    ],
    whatsapp:
      "Hi Apricot Stays, I'm looking for a stay at Apricot Garden Care during treatment.\n\nHospital:\nDates:",
    ctaLine: "Tell us your treatment dates and we'll help you plan the stay.",
  },
];
