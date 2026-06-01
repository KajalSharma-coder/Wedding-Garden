"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { LocalMedia } from "@/components/local-media";
import { SectionHeading } from "@/components/ui";
import type { MarketplaceService } from "@/lib/marketplace-store";
import { fetchJson, serviceApiUrl } from "@/lib/api-client";

export function DynamicServiceSection() {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(serviceApiUrl({ action: "marketplace_services", limit: 12 }), { cache: "no-store" })
      .then((data) => setServices(Array.isArray(data.services) ? data.services : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section bg-silk" id="services">
      <div className="container">
        <SectionHeading eyebrow="Wedding Services" title="Approved services from admin and verified vendors" />
        {loading ? (
          <div className="rounded-[8px] border border-white/12 bg-white/[0.05] p-6 text-cream/70">Loading approved services...</div>
        ) : services.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={`${service.source}-${service.id}`} className="group glass overflow-hidden rounded-[8px] transition hover:-translate-y-1 hover:border-gold/45">
                <div className="relative h-48 overflow-hidden">
                  <LocalMedia src={service.image} alt={service.name} className="h-full transition duration-700 group-hover:scale-105" overlay />
                  <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">{service.category}</span>
                  <h3 className="absolute bottom-4 left-5 right-5 font-display text-2xl leading-tight text-ivory">{service.name}</h3>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{service.businessName}</p>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-cream/72">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-cream/62">
                    <span className="inline-flex items-center gap-1"><MapPinned size={14} className="text-gold" /> {service.location || "Jaipur"}</span>
                    <span className="inline-flex items-center gap-1"><Star size={14} className="fill-gold text-gold" /> {service.rating}</span>
                  </div>
                  <strong className="mt-4 block text-sm text-gold">{service.pricing}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-gold/20 bg-white/[0.05] p-6">
            <p className="text-cream/74">No approved services are published yet. Add a service from admin or approve a vendor request to show services here.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/admin-dashboard.html#vendorApprovals" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">
                Admin Vendor Requests <ArrowRight size={16} />
              </a>
              <Link href="/vendor/register" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-ivory">
                Become a Vendor
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
