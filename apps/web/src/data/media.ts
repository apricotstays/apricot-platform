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
import cottageSunset from "../assets/stays/cottage/exterior-sunset.jpg";
import cottagePorch from "../assets/stays/cottage/porch.jpg";
import cottageBedroom from "../assets/stays/cottage/bedroom.jpg";
import cottageBedroomDoors from "../assets/stays/cottage/bedroom-doors.jpg";
import cottageKitchen from "../assets/stays/cottage/kitchen.jpg";
import cottageKitchenSink from "../assets/stays/cottage/kitchen-sink.jpg";
import cottageGardenDusk from "../assets/stays/cottage/garden-dusk.jpg";
import cottageGardenPath from "../assets/stays/cottage/garden-path.jpg";
import chateauExterior from "../assets/stays/chateau/exterior.jpg";
import careExterior from "../assets/stays/care/exterior-lawn.jpg";
import careLiving from "../assets/stays/care/living-room.jpg";
import careLivingWide from "../assets/stays/care/living-room-wide.jpg";
import careBedroom from "../assets/stays/care/bedroom.jpg";
import careKitchenette from "../assets/stays/care/kitchenette.jpg";
import careDining from "../assets/stays/care/dining.jpg";
import careBathroom from "../assets/stays/care/bathroom.jpg";

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
  cottageSunset: {
    src: cottageSunset,
    alt: "Apricot Garden Cottage — white facade and lit porch against a pink sunset",
  },
  cottagePorch: {
    src: cottagePorch,
    alt: "Covered porch with two wooden chairs and a table, front door open",
  },
  cottageBedroom: {
    src: cottageBedroom,
    alt: "Cottage bedroom with a tufted king bed, floral quilt and a work chair",
  },
  cottageBedroomDoors: {
    src: cottageBedroomDoors,
    alt: "King bed beside French doors and a window with day-night blinds",
  },
  cottageKitchen: {
    src: cottageKitchen,
    alt: "White kitchen with open shelves, gas hob, kettle and microwave",
  },
  cottageKitchenSink: {
    src: cottageKitchenSink,
    alt: "L-shaped kitchen counter with sink under a garden window",
  },
  cottageGardenDusk: {
    src: cottageGardenDusk,
    alt: "Private lawn and lit garden wall at dusk",
  },
  cottageGardenPath: {
    src: cottageGardenPath,
    alt: "Stone path across the lawn with garden lights under an evening sky",
  },
  chateauExterior: {
    src: chateauExterior,
    alt: "Apricot Garden Château — white columned facade at sunset",
  },
  careExterior: {
    src: careExterior,
    alt: "Apricot Garden Care — single-storey home and private lawn at sunset",
  },
  careLiving: {
    src: careLiving,
    alt: "Bright living room with a teal sofa, armchairs and a glass door to the garden",
  },
  careLivingWide: {
    src: careLivingWide,
    alt: "Living room seating with full-length curtains",
  },
  careBedroom: {
    src: careBedroom,
    alt: "Bedroom with a dark upholstered double bed and white linen",
  },
  careKitchenette: {
    src: careKitchenette,
    alt: "Kitchen counter with sink, induction hob, kettle and microwave",
  },
  careDining: {
    src: careDining,
    alt: "Wooden dining table for four with a fruit bowl",
  },
  careBathroom: {
    src: careBathroom,
    alt: "Step-in shower area, wall-hung toilet and washbasin",
  },
} satisfies Record<string, Photo>;

/** Gallery per stay, first photo is the cover. */
export const galleries: Record<string, Photo[]> = {
  "garden-cottage": [
    photos.cottageSunset,
    photos.cottagePorch,
    photos.cottageBedroom,
    photos.cottageKitchen,
    photos.cottageGardenDusk,
    photos.cottageBedroomDoors,
    photos.cottageKitchenSink,
    photos.cottageGardenPath,
    photos.cottageNight,
  ],
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
  "garden-care": [
    photos.careExterior,
    photos.careLiving,
    photos.careBedroom,
    photos.careKitchenette,
    photos.careDining,
    photos.careBathroom,
    photos.careLivingWide,
  ],
};
