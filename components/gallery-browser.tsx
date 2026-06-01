"use client";

import { useEffect, useMemo, useState } from "react";
import { LocalMedia } from "@/components/local-media";

type Category = { id: number; name: string; slug: string };
type GalleryImage = {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  image_url?: string;
  video_url?: string;
  title?: string;
  alt_text?: string;
  service_name?: string;
};

export function GalleryBrowser({ categories, images }: { categories: Category[]; images: GalleryImage[] }) {
  const [viewMode, setViewMode] = useState<"photos" | "videos">("photos");
  const photos = useMemo(() => images.filter((item) => !item.video_url), [images]);
  const videos = useMemo(() => images.filter((item) => Boolean(item.video_url)), [images]);

  useEffect(() => {
    console.info("[gallery:frontend-render:/gallery]", {
      categories: categories.length,
      images: images.length,
      viewMode,
      photos: photos.length,
      videos: videos.length
    });
  }, [viewMode, categories.length, images.length, photos.length, videos.length]);

  return (
    <section className="section bg-ink pt-32 text-ivory">
      <div className="container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Gallery</p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">Wedding Gallery</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setViewMode("photos")} className={toggleButton(viewMode === "photos")}>
              Images
            </button>
            <button type="button" onClick={() => setViewMode("videos")} className={toggleButton(viewMode === "videos")}>
              Videos
            </button>
          </div>
        </div>

        {viewMode === "photos" ? (
          <div className="mt-9">
            <h2 className="text-2xl font-bold text-ivory">Photos</h2>
            {photos.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((image) => (
                  <article key={image.id} className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
                    <LocalMedia src={image.image_url || ""} alt={image.alt_text || image.title || image.category_name} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" />
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[8px] border border-white/10 bg-white/[0.05] p-8 text-center text-cream/68">
                No photos are published yet.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-9">
            <h2 className="text-2xl font-bold text-ivory">Videos</h2>
            {videos.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
                    {item.image_url ? (
                      <LocalMedia src={item.image_url} alt={item.alt_text || item.title || item.category_name} className="aspect-video w-full transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="aspect-video w-full bg-white/[0.04] p-6 text-center text-cream/75">Video preview</div>
                    )}
                    <div className="space-y-2 p-4">
                      <p className="font-semibold text-cream">{item.title || item.category_name || "Gallery Video"}</p>
                      <p className="text-sm text-cream/70">{item.service_name || item.category_name}</p>
                      <a href={item.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-gold px-3 py-2 text-sm font-bold text-gold transition hover:bg-gold/10">
                        Watch Video
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[8px] border border-white/10 bg-white/[0.05] p-8 text-center text-cream/68">
                No videos are published yet.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function toggleButton(active: boolean) {
  return `rounded-full border px-5 py-3 text-sm font-bold transition ${active ? "border-gold bg-gold text-ink" : "border-white/14 bg-white/[0.04] text-cream/75 hover:border-gold hover:text-gold"}`;
}

function pill(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? "border-gold bg-gold text-ink" : "border-white/14 bg-white/[0.04] text-cream/75 hover:border-gold hover:text-gold"}`;
}
