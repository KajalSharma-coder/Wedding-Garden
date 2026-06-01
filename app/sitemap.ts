import type { MetadataRoute } from "next";
import { blogPosts, eventTypes, services, vendors, venues } from "@/lib/data";

function serviceSlug(title: string) {
  return title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and");
}

function vendorSlug(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://royalvivahgardens.com";
  const pages = [
    "",
    "/admin",
    "/contact",
    "/blog",
    "/vendors",
    "/privacy",
    "/terms",
    "/seo/wedding-garden-in-jaipur",
    "/seo/best-marriage-garden",
    "/seo/luxury-wedding-venue",
    "/seo/luxury-wedding-venue-rajasthan",
    "/seo/affordable-wedding-venue",
    "/seo/destination-wedding-jaipur",
    ...venues.map((venue) => `/venues/${venue.slug}`),
    ...eventTypes.map((event) => `/events/${event.slug}`),
    ...services.map((service) => `/services/${serviceSlug(service.title)}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...vendors.map((vendor) => `/vendors/${vendorSlug(vendor.name)}`)
  ];

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8
  }));
}
