"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { LocalMedia } from "@/components/local-media";
import { SectionHeading } from "@/components/ui";

type HomeGalleryImage = {
  id: number | string;
  title?: string;
  url?: string;
  image?: string;
  image_url?: string;
  file_path?: string;
  category?: string;
  category_name?: string;
  service_name?: string;
  video_url?: string;
};

export function HomeGalleryPreview({ images }: { images: HomeGalleryImage[] }) {
  const photoImages = images.filter((item) => !item.video_url);

  useEffect(() => {
    console.info("[gallery:frontend-render:home-preview]", { images: photoImages.length });
  }, [photoImages.length]);

  if (!photoImages.length) return null;

  return (
    <section className="section bg-ink" id="gallery-preview">
      <div className="container">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
          <SectionHeading eyebrow="Gallery" title="Latest images uploads" />
          <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-gold transition hover:text-cream">
            View Full Gallery <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {photoImages.slice(0, 8).map((item, index) => {
            const src = item.url || item.image_url || item.file_path || item.image || "";
            const label = item.title || item.category_name || item.category || `Gallery image ${index + 1}`;
            return (
              <article key={`${item.id}-${index}`} className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
                <LocalMedia src={src} alt={label} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
