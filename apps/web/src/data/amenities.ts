/**
 * Full amenity lists per home, grouped. Shown behind "Show all N amenities" on each stay page and
 * used for schema.org `amenityFeature`. The short highlights stay in `packages/schema`.
 *
 * Source: each home's Airbnb amenities list (checked 21 Oct 2026) plus facts already on this
 * site. Only confirmed items — never add one CK hasn't confirmed. Airbnb's "Smoking allowed"
 * is left out (site rule: no smoking indoors).
 */

export interface AmenityGroup {
  name: string;
  items: readonly string[];
}

export const amenitiesChecked = "Oct 2026";

export const amenityGroups: Record<string, readonly AmenityGroup[]> = {
  "garden-cottage": [
    { name: "Garden & outdoors", items: ["Private back garden", "Private patio", "Garden view"] },
    {
      name: "Bedroom & laundry",
      items: [
        "Cotton bed linen",
        "Room-darkening blinds",
        "Wardrobe and hangers",
        "Washing machine (in the home)",
        "Iron",
        "Clothes drying rack",
      ],
    },
    { name: "Bathroom", items: ["Hot water", "Shampoo", "Body soap", "Shower gel"] },
    {
      name: "Kitchen & dining",
      items: [
        "Kitchen to cook your own meals",
        "Fridge",
        "Freezer",
        "Cooker",
        "Kettle",
        "Blender",
        "Cooking basics",
        "Crockery and cutlery",
        "Dining table",
        "Coffee",
      ],
    },
    { name: "Work & entertainment", items: ["Fast Wi-Fi (100 Mbps)", "Dedicated workspace", "TV"] },
    {
      name: "Comfort",
      items: ["Air conditioning", "Ceiling fan", "Portable heater", "24/7 power backup"],
    },
    {
      name: "Arrival & parking",
      items: [
        "Self check-in (lockbox)",
        "Single level, no stairs",
        "Free covered parking",
        "Free street parking",
      ],
    },
    { name: "The estate", items: ["Gated security", "DLF Hyde Park clubhouse access"] },
    {
      name: "Services",
      items: ["Pets allowed", "Long stays welcome (28+ nights)", "Cleaning during your stay"],
    },
  ],
  "garden-courtyard": [
    { name: "Garden & outdoors", items: ["Private courtyard", "Garden lighting"] },
    { name: "Bathroom", items: ["Hot water", "Body soap", "Shower gel", "Bidet"] },
    { name: "Bedroom & laundry", items: ["Iron"] },
    { name: "Kitchen & dining", items: ["Kitchen to cook your own meals"] },
    { name: "Work & entertainment", items: ["Fast Wi-Fi", "Dedicated workspace", "TV"] },
    { name: "Comfort", items: ["Air conditioning", "Heating", "24/7 power backup"] },
    { name: "Arrival & parking", items: ["Free parking"] },
    { name: "The estate", items: ["Gated security", "DLF Hyde Park clubhouse access"] },
    { name: "Services", items: ["Pets allowed"] },
  ],
  "garden-chateau": [
    {
      name: "Garden & outdoors",
      items: ["Private courtyard", "Firepit", "Outdoor dining area", "BBQ grill"],
    },
    { name: "Bedroom & laundry", items: ["Washing machine"] },
    { name: "Kitchen & dining", items: ["Fully equipped kitchen"] },
    { name: "Work & entertainment", items: ["High-speed Wi-Fi", "Dedicated workspace", "TV"] },
    { name: "Comfort", items: ["Air conditioning", "24/7 power backup"] },
    { name: "Arrival & parking", items: ["Free parking"] },
    { name: "The estate", items: ["Estate security", "DLF Hyde Park clubhouse access"] },
  ],
  "garden-care": [
    { name: "Garden & outdoors", items: ["Private lawn"] },
    { name: "Bedroom & laundry", items: ["Washing machine", "Iron"] },
    { name: "Kitchen & dining", items: ["Fully equipped kitchen", "RO drinking water"] },
    { name: "Work & entertainment", items: ["Wi-Fi", "Dedicated workspace", "TV"] },
    { name: "Comfort", items: ["Air conditioning", "Heating"] },
    { name: "Arrival & parking", items: ["Step-free, ground floor", "Free parking"] },
    { name: "The estate", items: ["Gated estate"] },
    { name: "Services", items: ["Pets allowed"] },
  ],
};

/** Every amenity for a home, in display order. */
export const allAmenities = (slug: string): string[] =>
  (amenityGroups[slug] ?? []).flatMap((g) => [...g.items]);
