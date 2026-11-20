/**
 * List your home — the owner page for "Managed by Apricot" (CK, 19 Nov 2026).
 * Modelled on fairly.com/vacation-rental-management: same section order, Apricot's design and
 * photos, rewritten for Indian owners. Copy doc: project `claude/homeowners-page-copy-2026-11-19.md`.
 *
 * Items in `toConfirm` are shown on the page with a small "[confirm]" marker while
 * `DRAFT_MARKERS` is true. Confirm each one, then set it to false before going live.
 */
export const DRAFT_MARKERS = true;

export const toConfirm = {
  channels: "Booking channels Apricot will actually run",
  fee: "20% flat fee (80 owner / 15 Apricot / 5 caretaker)",
  pricingChat: "Monthly pricing chat with owners",
  lockIn: '"Often 1–3 years" lock-in for typical managers',
  tax: "NRI TDS and GST answers (CA to confirm)",
} as const;

export const ownerWhatsapp =
  "Hi Apricot, I'd like you to look after my home.\nWhere: \nBedrooms: \nAlready listed? ";

/** The fee and how each booking is split (percent of rent). */
export const fee = { total: 20, owner: 80, apricot: 15, caretaker: 5 } as const;

export const visibility = [
  {
    title: "Found everywhere",
    text: "Airbnb, Booking.com, MakeMyTrip, Agoda, Google and apricotstays.in.",
    confirm: "channels",
  },
  {
    title: "Your rates, your limits",
    text: "We price every night. You set a floor, a target, or the exact rate.",
  },
  {
    title: "Protected",
    text: "ID for every guest, C-Form for foreign nationals, a security deposit, and your society's rules followed.",
  },
] as const;

export const inTheLoop = [
  { lead: "One calendar.", text: "Every channel synced, so there are no double bookings." },
  { lead: "One WhatsApp group.", text: "You, your caretaker and our team." },
  { lead: "Every review, shared.", text: "From every channel, the good and the useful." },
  { lead: "A monthly statement.", text: "Stays, earnings, costs and payout." },
] as const;

export const earnMore = [
  {
    title: "Priced for Chandigarh",
    text: "Rates move with Mullanpur stadium match days, wedding season, hospital visits near PGI and long weekends. A monthly pricing chat with us, if you want one.",
    confirm: "pricingChat",
  },
  {
    title: "Direct bookings",
    text: "Returning guests book through apricotstays.in, with no marketplace commission eating into your share.",
  },
  {
    title: "No junk fees",
    text: "One fee. No markups on cleaning, repairs or supplies. What we spend, you see.",
  },
] as const;

export const steps = [
  { title: "A walk-through", text: "We visit and talk through what your home could earn." },
  {
    title: "Photos and listing",
    text: "A free professional shoot, and your listing written and set up.",
  },
  { title: "Ready for guests", text: "A check of power backup, water tank, linen and essentials." },
  { title: "Your caretaker", text: "Your own staff, trained by us, or someone we match you with." },
] as const;

/** Guest reviews already on the site with consent (reviews.ts): name, home, matched by name. */
export const careReviews = [
  { home: "garden-cottage", name: "Divya" },
  { home: "garden-courtyard", name: "Mohit" },
  { home: "garden-care", name: "Bansuri" },
] as const;

export const comparison = [
  { row: "Management fee", us: "20%, flat", them: "20–45%" },
  { row: "Cleaning / turnover", us: "100% to your caretaker", them: "Often marked up" },
  { row: "Extra charges", us: "None", them: "Added on top" },
  { row: "Lock-in", us: "None", them: "Often 1–3 years", confirm: "lockIn" },
  { row: "Your own use", us: "Free, any time", them: "Often restricted" },
] as const;

export const faq = [
  {
    q: "What do you charge?",
    a: "20% of the rent from each stay. 5% of that goes to your caretaker. The turnover fee guests pay goes entirely to your caretaker. Nothing else.",
  },
  {
    q: "Who looks after my home?",
    a: "One named caretaker, often your own staff, backed by the Apricot team, with someone on call whenever guests are in.",
  },
  {
    q: "Who stays in my home?",
    a: "Every guest shares ID before arrival. Foreign guests are reported as the law requires (C-Form). We take a security deposit and follow your society's rules.",
  },
  { q: "Can my family still use it?", a: "Yes. Block any dates, any time, free." },
  {
    q: "I live abroad. How do payouts work?",
    a: "Monthly, in rupees, to your Indian account. Payouts to NRI owners carry TDS, and we'll share the details.",
    confirm: "tax",
  },
  {
    q: "What about GST and taxes?",
    a: "We handle the GST on stays we collect. Your income tax stays with you, and our monthly statements make it simple.",
    confirm: "tax",
  },
  {
    q: "What happens between stays?",
    a: "Garden, plants, leaks, power backup and pests are all looked after. An empty home is checked on, not forgotten.",
  },
  {
    q: "Can I set my own prices?",
    a: "Yes. Set a floor, a target or exact nightly rates. Or leave it to us.",
  },
  { q: "Is there a lock-in?", a: "No. Leave any time. Bookings already confirmed are honoured." },
  {
    q: "My home's already on Airbnb. Can I switch?",
    a: "Yes. Your upcoming bookings come with you. Reviews stay with your current account, so we start fresh and build them back.",
  },
] as const;
