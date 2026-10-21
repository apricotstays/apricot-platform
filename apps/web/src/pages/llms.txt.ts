import type { APIRoute } from "astro";
import { brand, contact, promise } from "@apricot/brand";
import { fromLine, properties, ratesChecked } from "@apricot/schema";
import { waysToStay } from "../data/ways-to-stay";

// https://llmstxt.org — a plain summary for AI assistants and agents.
export const GET: APIRoute = () => {
  const homes = properties
    .map(
      (p) =>
        `- [${p.name}](${brand.url}/stays/${p.slug}): ${p.summary} Up to ${p.maxGuests} guests. ${fromLine(p)}. Check-in ${p.policy.checkIn}, checkout ${p.policy.checkOut}. Free cancellation ${p.policy.freeCancellation.toLowerCase()}. Minimum stay: ${p.policy.minStay}. Garden: ${p.garden}. Beds: ${p.beds}. Pets: ${p.policy.pets.toLowerCase()}.`,
    )
    .join("\n");
  const ways = waysToStay
    .map((w) => `- [${w.title}](${brand.url}/ways-to-stay/${w.slug}): ${w.cardLine}`)
    .join("\n");
  const body = `# ${brand.name}

> ${brand.name} is a small collection of boutique, home-style short-stay homes at ${contact.address.locality}, ${contact.address.region}, India. "${brand.tagline}"

The Apricot promise — ${promise.name}: ${promise.line}

Enquiries and direct bookings are handled on WhatsApp. Each home lists a starting weekday rate (checked ${ratesChecked}); the exact price for given dates is confirmed on WhatsApp.

## Homes

${homes}

## Ways to stay

${ways}

## How to enquire or book

- WhatsApp: ${contact.whatsappDisplay} — https://wa.me/919740544873
- Share dates, number of guests and preferred home.

## Pages

- [Home](${brand.url}/): overview and contact
- [Our Story](${brand.url}/our-story): why Apricot exists — Chandigarh's gardens, and Shivani, who keeps every home; the name comes from her grandmother's garden in Ludhiana, where roses and apricots grew
- [Stay policies & FAQ](${brand.url}/policies): cancellation, payment, check-in times, house rules, why book direct
- [Privacy](${brand.url}/privacy): what data we handle (DPDP Act, 2023)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
