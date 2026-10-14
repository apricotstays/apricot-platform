import type { ImageMetadata } from "astro";

import courtyardDay from "../assets/stays/courtyard/exterior-day.jpg";
import courtyardEvening from "../assets/stays/courtyard/courtyard-evening.jpg";
import courtyardNight from "../assets/stays/courtyard/exterior-night.jpg";
import courtyardLiving from "../assets/stays/courtyard/living-room.jpg";
import courtyardPatio from "../assets/stays/courtyard/patio.jpg";
import courtyardGames from "../assets/stays/courtyard/games.jpg";
import courtyardBedroom from "../assets/stays/courtyard/bedroom.jpg";
import courtyardBedroomDetail from "../assets/stays/courtyard/bedroom-detail.jpg";
import courtyardDining from "../assets/stays/courtyard/dining.jpg";
import cottageNight from "../assets/stays/cottage/exterior-night.jpg";
import chateauExterior from "../assets/stays/chateau/exterior.jpg";

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

/** Real photos only. No AI-generated or stock images. */
export const photos = {
  courtyardDay: {
    src: courtyardDay,
    alt: "Apricot Garden Courtyard — terracotta walls and a planted ledge by day",
  },
  courtyardEvening: {
    src: courtyardEvening,
    alt: "Apricot Garden Courtyard — stone path and lit walls at dusk",
  },
  courtyardNight: { src: courtyardNight, alt: "Apricot Garden Courtyard exterior at night" },
  courtyardLiving: {
    src: courtyardLiving,
    alt: "Apricot Garden Courtyard living room with cane chairs and a cream sofa",
  },
  courtyardPatio: {
    src: courtyardPatio,
    alt: "Apricot Garden Courtyard — glass doors opening onto the patio",
  },
  courtyardGames: {
    src: courtyardGames,
    alt: "A glass chess set and stacking blocks on the coffee table",
  },
  courtyardBedroom: {
    src: courtyardBedroom,
    alt: "Apricot Garden Courtyard bedroom with a wide window and linen curtains",
  },
  courtyardBedroomDetail: {
    src: courtyardBedroomDetail,
    alt: "Bed with pendant lights and side tables",
  },
  courtyardDining: { src: courtyardDining, alt: "Dining table set for two by the garden window" },
  cottageNight: { src: cottageNight, alt: "Apricot Garden Cottage exterior lit at night" },
  chateauExterior: {
    src: chateauExterior,
    alt: "Apricot Garden Château — white columned facade at sunset",
  },
} satisfies Record<string, Photo>;

/** Gallery per stay, first photo is the cover. */
export const galleries: Record<string, Photo[]> = {
  "garden-cottage": [photos.cottageNight],
  "garden-courtyard": [
    photos.courtyardEvening,
    photos.courtyardLiving,
    photos.courtyardBedroom,
    photos.courtyardPatio,
    photos.courtyardDining,
    photos.courtyardNight,
    photos.courtyardBedroomDetail,
    photos.courtyardGames,
    photos.courtyardDay,
  ],
  "garden-chateau": [photos.chateauExterior],
};
