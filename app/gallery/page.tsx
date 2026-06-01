import { Metadata } from "next";
import { FloatingCTA } from "@/components/floating-cta";
import { GalleryBrowser } from "@/components/gallery-browser";
import { Nav } from "@/components/nav";
import { API_BASE, readJson } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wedding Gallery | Royal Vivah Gardens",
  description: "Browse wedding, reception, engagement, haldi, mehendi, corporate and birthday event gallery images and videos."
};

async function getGallery() {
  try {
    const response = await fetch(`${API_BASE}/gallery`, { cache: "no-store" });
    const data = await readJson(response);
    console.info("[gallery:frontend-fetch:/gallery]", {
      categories: Array.isArray(data.categories) ? data.categories.length : 0,
      images: Array.isArray(data.images) ? data.images.length : 0
    });
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      images: Array.isArray(data.images) ? data.images : []
    };
  } catch (error) {
    console.error("[gallery:frontend-fetch:/gallery:error]", error);
    return { categories: [], images: [] };
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink">
        <GalleryBrowser categories={gallery.categories || []} images={gallery.images || []} />
      </main>
      <FloatingCTA />
    </>
  );
}
