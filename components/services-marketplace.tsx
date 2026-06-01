"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPinned, Star } from "lucide-react";
import { LocalMedia } from "@/components/local-media";
import type { MarketplaceService } from "@/lib/marketplace-store";
import { fetchJson, serviceApiUrl } from "@/lib/api-client";

const categories = ["", "Gardens", "Decoration", "DJ Band", "Makeup Artists", "Pandit Ji", "Anchor", "Caterers", "Car & Bus", "Photography", "Mehendi Artists", "Destination Wedding", "Corporate Events", "Banquet Halls", "Resorts"];

export function ServicesMarketplace({ initialCategory = "", initialServices = [] }: { initialCategory?: string; initialServices?: MarketplaceService[] }) {
  const [services, setServices] = useState<MarketplaceService[]>(() => Array.isArray(initialServices) ? initialServices : []);
  const [category, setCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJson(serviceApiUrl({ action: "marketplace_services", category }), { cache: "no-store" })
      .then((data) => setServices(Array.isArray(data.services) ? data.services : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [category]);

  const locations = useMemo(() => {
    return Array.from(new Set(services.map((service) => (service.location || "Other").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const filtered = useMemo(() => {
    const needle = selectedLocation.trim().toLowerCase();
    return services.filter((service) => {
      if (!needle) return true;
      return (service.location || "Other").toLowerCase().includes(needle);
    });
  }, [selectedLocation, services]);

  const cardImage = (service: MarketplaceService & { cover_image?: string; uploaded_cover_image?: string }) =>
    service.uploaded_cover_image || service.cover_image || service.image;

  return (
    <main className="min-h-screen bg-ink pt-24 text-ivory">
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(91,16,32,.92),rgba(9,5,6,.96))]">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-gold">Services Marketplace</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">Approved Royal Vivah Services</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-cream/76">
            Browse live admin-approved vendor services by location, with gallery previews, vendor details, pricing, ratings and booking access.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 grid gap-3">
            <div className="flex flex-wrap gap-2 rounded-[8px] border border-gold/20 bg-white/[0.06] p-3">
              <button type="button" onClick={() => setSelectedLocation("")} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedLocation ? "border-white/10 bg-ink text-cream" : "border-gold bg-gold/10 text-gold"}`}>
                All Locations
              </button>
              {locations.map((location) => (
                <button key={location} type="button" onClick={() => setSelectedLocation(location)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedLocation === location ? "border-gold bg-gold/10 text-gold" : "border-white/10 bg-ink text-cream"}`}>
                  {location}
                </button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
              <div className="rounded-[8px] border border-gold/20 bg-ink px-4 py-4 text-sm text-cream/80">
                Showing services for <span className="font-bold text-ivory">{selectedLocation || "all locations"}</span>. Select a location tab to filter proposals by that city or area.
              </div>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-full min-h-20 rounded-[8px] border border-gold/20 bg-ink px-4 text-ivory outline-none">
                {categories.map((item) => (
                  <option key={item || "all"} value={item}>{item || "All Categories"}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? <div className="rounded-[8px] border border-white/12 bg-white/[0.05] p-6 text-cream/70">Loading approved services...</div> : null}

          {!loading && !filtered.length ? (
            <div className="rounded-[8px] border border-gold/20 bg-white/[0.05] p-6 text-cream/74">No approved services match the selected location yet.</div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <Link key={`${service.source}-${service.id}`} href={`/services/${service.category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")}/${service.slug}`} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.055] shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold/45">
                <div className="relative h-64">
                  <LocalMedia src={cardImage(service)} alt={service.name} className="h-full transition duration-700 group-hover:scale-105" overlay />
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">{service.category}</span>
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
                  <span className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition group-hover:bg-cream">
                    View Gallery and Book
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
