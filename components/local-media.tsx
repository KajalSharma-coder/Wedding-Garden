"use client";

import Image from "next/image";
import { useState } from "react";
import { API_BASE } from "@/lib/api-client";
import { fallbackImage } from "@/lib/real-images";

type LocalMediaProps = {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
};

export function LocalMedia({ src, alt, className = "", overlay = false }: LocalMediaProps) {
  const [failed, setFailed] = useState(false);
  const fallback = fallbackImage(alt);
  const apiOrigin = API_BASE.replace(/\/api\/?$/, "");
  const resolved = !src || failed ? fallback : src.startsWith("/uploads/") ? `${apiOrigin}${src}` : src;
  const isUploadedMedia = resolved.startsWith(`${apiOrigin}/uploads/`);
  const shouldOptimize = resolved.startsWith("/") || resolved.includes("images.unsplash.com") || resolved.includes("res.cloudinary.com");

  if (!resolved) {
    return <div className={`relative overflow-hidden bg-white/[0.045] ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden bg-white/[0.045] ${className}`}>
      {isUploadedMedia ? (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          src={resolved}
          alt={alt}
          fill
          loading="lazy"
          unoptimized={!shouldOptimize}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center"
          onError={() => setFailed(true)}
        />
      )}
      {overlay ? <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent z-10" /> : null}
    </div>
  );
}
