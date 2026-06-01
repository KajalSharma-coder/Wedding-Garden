import { imageFrom, realImages } from "@/lib/real-images";

export type GardenVendor = {
  category: string;
  name: string;
  rating: number;
  startingPrice: string;
};

export type GardenResult = {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  distanceKm: number;
  image: string;
  lat: number;
  lng: number;
  capacity: string;
  price: string;
  decorationIncluded: boolean;
  catering: "Included" | "Optional";
  parking: string;
  indoorOutdoor: "Indoor" | "Outdoor" | "Indoor + Outdoor";
  recommendedScore: number;
};

export type GardenDetails = GardenResult & {
  phone?: string;
  website?: string;
  mapEmbed: string;
  gallery: string[];
  ac: string;
  nearbyHotels: string[];
  availableDates: string[];
  reviews: Array<{ author: string; rating: number; text: string }>;
  vendors: GardenVendor[];
};

type GoogleLatLng = {
  lat: number;
  lng: number;
};

type GooglePlace = {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location?: GoogleLatLng };
  photos?: Array<{ photo_reference: string }>;
};

const FALLBACK_IMAGE = imageFrom(realImages.gardens, 0);

const vendorCategories = [
  "Caterers",
  "Musicians",
  "DJ",
  "Pandit",
  "Decorators",
  "Photographers",
  "Makeup Artists",
  "Band Baja",
  "Horse/Buggy Entry",
  "Lighting Team"
];

export function getGoogleApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
}

export function stableNumber(seed: string, min: number, max: number) {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return min + (hash % (max - min + 1));
}

export function formatINRValue(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function haversineKm(origin: GoogleLatLng, destination: GoogleLatLng) {
  const radius = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Number((radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export function googlePhotoUrl(photoReference: string | undefined) {
  if (!photoReference) return FALLBACK_IMAGE;
  return FALLBACK_IMAGE;
}

export function enrichPlace(place: GooglePlace, origin: GoogleLatLng): GardenResult | null {
  const location = place.geometry?.location;
  if (!location) return null;

  const basePrice = stableNumber(place.place_id, 300000, 400000);
  const rating = place.rating || Number((4.2 + stableNumber(place.place_id, 0, 7) / 10).toFixed(1));
  const distanceKm = haversineKm(origin, location);
  const capacityMax = stableNumber(`${place.place_id}-capacity`, 450, 1500);
  const indoorOutdoor = (["Indoor", "Outdoor", "Indoor + Outdoor"] as const)[stableNumber(`${place.place_id}-space`, 0, 2)];

  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity || "Address available on Google Maps",
    rating,
    userRatingsTotal: place.user_ratings_total || stableNumber(`${place.place_id}-reviews`, 30, 420),
    distanceKm,
    image: googlePhotoUrl(place.photos?.[0]?.photo_reference),
    lat: location.lat,
    lng: location.lng,
    capacity: `${Math.max(100, capacityMax - 350)}-${capacityMax} guests`,
    price: formatINRValue(basePrice),
    decorationIncluded: true,
    catering: stableNumber(`${place.place_id}-catering`, 0, 1) ? "Included" : "Optional",
    parking: stableNumber(`${place.place_id}-parking`, 0, 1) ? "Available" : "Limited",
    indoorOutdoor,
    recommendedScore: Math.round(rating * 16 + Math.max(0, 20 - distanceKm))
  };
}

export function buildGardenDetails(base: GardenResult, apiKey: string, photoReferences: string[] = []): GardenDetails {
  const realPlacePhotos = photoReferences.slice(0, 6).map((reference) => googlePhotoUrl(reference));
  const gallery = Array.from(new Set([base.image, ...realPlacePhotos, ...realImages.gardens.slice(2, 7)])).slice(0, 6);

  return {
    ...base,
    mapEmbed: `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${base.placeId}`,
    gallery,
    ac: stableNumber(`${base.placeId}-ac`, 0, 1) ? "AC banquet plus open lawn" : "Non-AC lawn with mist cooling",
    nearbyHotels: ["Royal Orchid Stay", "Vivah Residency", "Heritage Palace Rooms"].map((name, index) => `${name} · ${(index + 1) * 1.4} km`),
    availableDates: Array.from({ length: 8 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + 7 + index * 4);
      return date.toISOString().slice(0, 10);
    }),
    reviews: [
      { author: "Google reviewer", rating: base.rating, text: "Premium space, strong event support and comfortable guest movement." },
      { author: "Recent wedding family", rating: Math.min(5, base.rating + 0.1), text: "Decoration, parking and coordination felt smooth for a large gathering." }
    ],
    vendors: vendorCategories.map((category, index) => ({
      category,
      name: `${category} Partner ${index + 1}`,
      rating: Number((4.4 + (index % 6) / 10).toFixed(1)),
      startingPrice: formatINRValue(stableNumber(`${base.placeId}-${category}`, 15000, 125000))
    }))
  };
}
