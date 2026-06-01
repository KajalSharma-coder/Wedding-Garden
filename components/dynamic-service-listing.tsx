"use client";

import Link from "next/link";
import { MapPinned, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LocalMedia } from "@/components/local-media";
import type { MarketplaceService } from "@/lib/marketplace-store";
import { fetchJson, serviceApiUrl } from "@/lib/api-client";

export function DynamicServiceListing({ category, title }: { category: string; title: string }) {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(serviceApiUrl({ action: "marketplace_services", category }), { cache: "no-store" })
      .then((data) => setServices(Array.isArray(data.services) ? data.services : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(
    () => services.filter((service) => `${service.name} ${service.businessName} ${service.location}`.toLowerCase().includes(query.toLowerCase())),
    [query, services]
  );
  const cardImage = (service: MarketplaceService & { cover_image?: string; uploaded_cover_image?: string }) =>
    service.uploaded_cover_image || service.cover_image || service.image;

  return (
    <main className="min-h-screen bg-ink pt-10 text-ivory">
      <section className="pt-8 pb-10">
        <div className="container">
          <label className="relative mb-8 block rounded-[8px] border border-gold/20 bg-white/[0.06] p-3">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gold" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title}`} className="h-14 w-full rounded-[8px] border border-white/12 bg-ink/75 pl-12 pr-4 text-ivory outline-none transition focus:border-gold" />
          </label>

          {loading ? <div className="rounded-[8px] border border-white/12 bg-white/[0.05] p-6 text-cream/70">Loading approved services...</div> : null}

          {!loading && !filtered.length ? (
            <div className="rounded-[8px] border border-gold/20 bg-white/[0.05] p-6">
              <p className="text-cream/74">No approved {category} services are live yet.</p>
              <a href="/admin-dashboard.html#vendorApprovals" className="mt-5 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">Open Admin Approvals</a>
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <article key={`${service.source}-${service.id}`} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.055] shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold/45">
                <div className="relative h-64">
                  <LocalMedia src={cardImage(service)} alt={service.name} className="h-full transition duration-700 group-hover:scale-105" overlay />
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h2 className="font-display text-3xl leading-tight text-ivory">{service.name}</h2>
                    <p className="mt-1 text-sm text-cream/72">{service.businessName}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold">
                      <Star className="fill-gold" size={15} /> {service.rating}
                    </span>
                    <strong className="text-sm text-gold">{service.pricing}</strong>
                  </div>
                  <p className="mt-4 min-h-14 text-sm leading-7 text-cream/72">{service.description}</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-cream/62"><MapPinned size={15} className="text-gold" /> {service.location || "Jaipur"}</p>
                  <Link href={`/services/${service.category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")}/${service.slug}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream">
                    View Gallery and Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
