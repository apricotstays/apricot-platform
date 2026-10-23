/**
 * Shared stay policies shown on /policies and given to agents (/stays.json, /llms-full.txt, /mcp).
 * Per-home terms (check-in/out, pets, cancellation lines, Things to know) live in `policy` on each
 * home in packages/schema. The cancellation and check-in paragraphs on /policies carry inline
 * emphasis and stay in that page; keep them in step with these lines.
 *
 * Plain data only: no Astro or image imports (the Worker bundles this file for /mcp).
 */
import { contact } from "@apricot/brand";

export interface FaqItem {
  q: string;
  a: string;
  link?: { href: string; text: string };
}

export interface FaqGroup {
  group: string;
  items: readonly FaqItem[];
}

/** Payment terms for direct bookings (/policies "Payment"). */
export const paymentLines: readonly string[] = [
  "50% by UPI or bank transfer confirms your booking; the rest is due 7 days before check-in. Booking within 7 days of arrival? Please pay in full.",
  "Your advance counts toward the cancellation terms above.",
  "Garden Château only: a refundable security deposit of ₹20,000, collected 48 hours before arrival and returned within 3 working days of checkout. Any deduction comes with photos and a breakdown.",
];

/** House rules for every home (/policies "House rules"), in order. */
export const houseRules: readonly string[] = [
  "Share a government photo ID for each adult before arrival; the society gate needs it too. We use it only for your stay and keep it no longer than the law requires.",
  "Only registered guests stay overnight. Visitors are welcome until 10 PM; let us know who's coming.",
  "Quiet hours are 10 PM – 7 AM, with no music outdoors after 10 PM.",
  "No parties or events. At the Garden Château, birthdays and family dinners are welcome within 10 guests; anything larger by arrangement, with a higher deposit.",
  "No smoking indoors. The garden is fine, except at Garden Care, where there's no smoking anywhere on the premises.",
  "Pets are welcome (Château on request); please keep them off beds and sofas.",
  "Please leave the flowers in the garden for the next guests.",
  "If something breaks, tell us. We'll sort it out without fuss.",
];

export const faq: readonly FaqGroup[] = [
  {
    group: "Before your stay",
    items: [
      {
        q: "How do I book?",
        a: "Message us on WhatsApp with your dates and number of guests. We confirm the price, and your dates are held once the advance is paid.",
      },
      {
        q: "Is the price on the site final?",
        a: "It's the starting weekday rate. Weekends and festivals cost more, so we confirm the exact total for your dates on WhatsApp.",
      },
      {
        q: "Can I bring my pet?",
        a: "Yes, at the Garden Cottage, Garden Courtyard and Garden Care, and at the Garden Château on request. There's a one-time cleaning fee of ₹1,000 per pet; please keep pets off beds and sofas.",
      },
      {
        q: "Is Garden Care suitable for patients and caregivers?",
        a: "Yes. It's a step-free, ground-floor one-bedroom home a few minutes from PGI and Homi Bhabha Cancer Hospital, for two guests. Longer stays are welcome, and you can change or cancel for free up to 48 hours before.",
      },
    ],
  },
  {
    group: "During your stay",
    items: [
      {
        q: "How does check-in work?",
        a: "We send directions and check-in details on WhatsApp on the day you arrive. Self check-in runs until 8 PM; arriving later is fine, just tell us.",
      },
      {
        q: "Can we order food?",
        a: "Yes. The City Club in DLF Hyde Park delivers to the door from 9:30 AM to 10 PM. Ask us for the menu link.",
      },
      {
        q: "Who do I contact if something goes wrong?",
        a: `Message us on WhatsApp at ${contact.whatsappDisplay}. You talk to us, the hosts, not a call centre.`,
      },
    ],
  },
  {
    group: "After your stay",
    items: [
      {
        q: "Can I get an invoice?",
        a: "Yes. Ask us on WhatsApp and we'll send one.",
      },
    ],
  },
  {
    group: "About Apricot",
    items: [
      {
        q: "Why is it called Apricot?",
        a: "Roses and apricots grew in our co-founder Shivani's grandmother's garden in Ludhiana. We named Apricot after that garden, and each of our homes has a garden of its own.",
        link: { href: "/our-story", text: "Read our story" },
      },
    ],
  },
];
