import { SERVICE_API, readJson } from "@/lib/api-client";
import { fallbackImage } from "@/lib/real-images";

export type MarketplaceService = {
  id: string;
  slug: string;
  name: string;
  category: string;
  businessName: string;
  vendorName: string;
  pricing: string;
  price: number;
  rating: number;
  description: string;
  location: string;
  availability: string;
  image: string;
  gallery: string[];
  features: string[];
  capacity: string;
  contactDetails: string;
  whatsappNumber: string;
  vendorId: string;
  status: string;
  source: "vendor" | "admin";
};

const categoryBySlug: Record<string, string> = {
  gardens: "Gardens",
  decoration: "Decoration",
  "dj-band": "DJ Band",
  "makeup-artists": "Makeup Artists",
  "pandit-ji": "Pandit Ji",
  anchor: "Anchor",
  caterers: "Caterers",
  transport: "Car & Bus",
  photography: "Photography",
  "mehendi-artists": "Mehendi Artists",
  "destination-wedding": "Destination Wedding",
  "corporate-events": "Corporate Events",
  "banquet-halls": "Banquet Halls",
  resorts: "Resorts"
};

const categoryFallbackImages: Record<string, string> = {
  Gardens: fallbackImage("Gardens"),
  Decoration: fallbackImage("Decoration"),
  Photography: fallbackImage("Photography"),
  Caterers: fallbackImage("Caterers"),
  "Makeup Artists": fallbackImage("Makeup Artists"),
  "Mehendi Artists": fallbackImage("Mehendi Artists"),
  "DJ Band": fallbackImage("DJ Band"),
  Anchor: fallbackImage("Anchor"),
  "Car & Bus": fallbackImage("Car & Bus"),
  "Pandit Ji": fallbackImage("Pandit Ji"),
  "Destination Wedding": fallbackImage("Destination Wedding"),
  "Corporate Events": fallbackImage("Corporate Events"),
  "Banquet Halls": fallbackImage("Banquet Halls"),
  Resorts: fallbackImage("Resorts")
};

export function categoryFromSlug(slug?: string | null) {
  if (!slug) return "";
  return categoryBySlug[slug] || slug;
}

export function slugFromCategory(category: string) {
  const found = Object.entries(categoryBySlug).find(
    ([, value]) => value.toLowerCase() === category.toLowerCase()
  );

  return (
    found?.[0] ||
    category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")
  );
}

function money(value: unknown, fallback = "On request") {
  const amount = Number(value || 0);

  return amount > 0
    ? `INR ${amount.toLocaleString("en-IN")}`
    : fallback;
}

function parseMedia(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanMedia(value: unknown) {
  return String(value || "").trim();
}

function uniqueMedia(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = cleanMedia(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function parseList(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(String(value));

    return Array.isArray(parsed)
      ? parsed.map(String).filter(Boolean)
      : [];
  } catch {
    return String(value)
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalize(
  row: Record<string, unknown>,
  source: "vendor" | "admin"
): MarketplaceService {
  const category = String(row.category || "Wedding Services");
  const uploadedCover = cleanMedia(row.uploaded_cover_image);
  const coverImage = cleanMedia(row.cover_image);
  const legacyImage = cleanMedia(row.image);
  const uploadedGallery = uniqueMedia(
    parseMedia(row.gallery || row.media || row.images)
  );
  const image = (
    uploadedCover ||
    uploadedGallery[0] ||
    coverImage ||
    legacyImage ||
    categoryFallbackImages[category] ||
    fallbackImage(category)
  );
  const gallery = uniqueMedia(
    [uploadedCover, ...uploadedGallery, coverImage, legacyImage].filter(Boolean)
  );

  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    name: String(row.name || row.service_name || "Wedding Service"),
    category,

    businessName: String(
      row.business_name ||
        row.businessName ||
        (source === "admin"
          ? "Royal Vivah Gardens"
          : "Verified Vendor")
    ),

    vendorName: String(
      row.vendor_name ||
        row.owner ||
        row.full_name ||
        "Royal Vivah Partner"
    ),

    pricing: String(
      row.pricing || money(row.price || row.price_from)
    ),

    price: Number(row.price || row.price_from || 0),

    rating: Number(row.rating || 4.8),

    description: String(row.description || ""),

    location: String(row.location || row.city || ""),

    availability: String(
      row.availability || "Available on request"
    ),

    image,

    gallery: gallery.length ? gallery : image ? [image] : [],

    features: parseList(row.features),

    capacity: String(row.capacity || ""),

    contactDetails: String(row.contact_details || ""),

    whatsappNumber: String(row.whatsapp_number || ""),

    vendorId: String(row.vendor_id || ""),

    status: String(row.status || "approved"),

    source
  };
}

async function servicesFromApi(category?: string, limit?: number) {
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (limit) query.set("limit", String(limit));

  try {
    const response = await fetch(`${SERVICE_API}?${query.toString()}`, {
      cache: "no-store"
    });
    const data = await readJson(response);
    return (data.services || []).map((row: Record<string, unknown>) =>
      normalize(row, String(row.source || "vendor") === "admin" ? "admin" : "vendor")
    );
  } catch (error) {
    console.error("Marketplace API query failed", error);
    return [];
  }
}

export async function getMarketplaceServices(options: {
  category?: string;
  limit?: number;
} = {}) {
  const category = options.category
    ? categoryFromSlug(options.category)
    : "";

  const services = await servicesFromApi(category, options.limit);

  return typeof options.limit === "number"
    ? services.slice(0, options.limit)
    : services;
}

export async function getMarketplaceServiceBySlug(slug: string) {
  if (!slug) return null;

  const services = await getMarketplaceServices();

 return (
  services.find(
    (service: MarketplaceService) =>
      service.slug === slug || service.id === slug
  ) || null
);
}
