import type { APIRoute } from "astro";
import { brand, contact } from "@apricot/brand";
import { properties } from "@apricot/schema";

// https://llmstxt.org — a plain summary for AI assistants and agents.
export const GET: APIRoute = () => {
  const homes = properties
    .map(
      (p) =>
        `- [${p.name}](${brand.url}/stays/${p.slug}): ${p.summary} Up to ${p.maxGuests} guests.`,
    )
    .join("\n");
  const body = `# ${brand.name}

> ${brand.name} is a small collection of boutique, home-style short-stay homes at ${contact.address.locality}, ${contact.address.region}, India. "${brand.tagline}"

Enquiries and direct bookings are handled on WhatsApp. Rates are quoted on request.

## Homes

${homes}

## How to enquire or book

- WhatsApp: ${contact.whatsappDisplay} — https://wa.me/919740544873
- Share dates, number of guests and preferred home.

## Pages

- [Home](${brand.url}/): overview and contact
- [Privacy](${brand.url}/privacy): what data we handle (DPDP Act, 2023)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
