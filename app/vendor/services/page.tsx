"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MapPinned, Star } from "lucide-react";
import { LocalMedia } from "@/components/local-media";
import { Nav } from "@/components/nav";
import { fetchJson, serviceApiUrl } from "@/lib/api-client";

type PublishedVendorService = {
  id: string;
  name: string;
  businessName?: string;
  category: string;
  pricing: string;
  city?: string;
  location?: string;
  availability?: string;
  description: string;
  image: string;
  status?: string;
};

function VendorServicesContent() {
  const [approvedVendorServices, setApprovedVendorServices] = useState<PublishedVendorService[]>([]);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";

  useEffect(() => {
    async function loadApprovedServices() {
      try {
        const data = await fetchJson(serviceApiUrl({ action: "marketplace_services", category }), { cache: "no-store" });
        if (Array.isArray(data.services)) {
          localStorage.setItem("rvgApprovedVendorServices", JSON.stringify(data.services));
          setApprovedVendorServices(data.services.filter((service: PublishedVendorService) => service.status !== "hidden"));
          return;
        }
      } catch {
        // Local storage keeps the demo flow usable if the API is not available.
      }

      try {
        const approved = JSON.parse(localStorage.getItem("rvgApprovedVendorServices") || "[]");
        setApprovedVendorServices(Array.isArray(approved) ? approved.filter((service) => service.status !== "hidden") : []);
      } catch {
        setApprovedVendorServices([]);
      }
    }

    loadApprovedServices();
  }, [category]);

  const publishedServices = approvedVendorServices.map((service) => ({
    ...service,
    href: "#",
    rating: 4.8
  }));

  const services = publishedServices;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-28 text-cream">
        <section className="section bg-silk">
          <div className="container">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gold">
              <ArrowLeft size={17} /> Back to Home
            </Link>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Approved Vendors</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ivory sm:text-6xl">Royal Vivah Marketplace</h1>
                <p className="mt-3 max-w-2xl text-cream/70">
                  Vendor submissions appear here only after approval from the admin dashboard.
                </p>
              </div>
              <Link href="/vendor/register" className="rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream">
                Become a Vendor
              </Link>
            </div>

            {!services.length ? (
              <div className="rounded-[8px] border border-gold/20 bg-white/[0.05] p-6">
                <p className="text-cream/74">No approved vendor services are live yet. Submit a vendor request and approve it from the admin dashboard.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/vendor/register" className="rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream">Become a Vendor</Link>
                  <a href="/admin-dashboard.html#vendorApprovals" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-ivory">Admin Approvals</a>
                </div>
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const content = (
                  <>
                    <div className="relative h-64">
                      <LocalMedia src={service.image} alt={service.name} className="h-full transition duration-700 group-hover:scale-105" overlay />
                      <div className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">{service.category}</div>
                      {approvedVendorServices.some((item) => item.id === service.id) ? (
                        <div className="absolute right-4 top-4 rounded-full border border-emerald-300/40 bg-emerald-300/20 px-3 py-1 text-xs font-black text-emerald-100">Admin Approved</div>
                      ) : null}
                      <h2 className="absolute bottom-4 left-4 right-4 font-display text-3xl leading-tight text-ivory">{service.name}</h2>
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-semibold text-gold">{service.businessName}</p>
                      <p className="mt-2 text-sm leading-6 text-cream/70">{service.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-cream/75">
                        <span className="inline-flex items-center gap-1"><MapPinned size={15} className="text-gold" /> {service.location || service.city}</span>
                        <span className="inline-flex items-center gap-1"><Star size={15} className="fill-gold text-gold" /> {service.rating}</span>
                      </div>
                      <strong className="mt-4 block text-gold">{service.pricing}</strong>
                      {service.availability ? <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-cream/50">{service.availability}</span> : null}
                    </div>
                  </>
                );

                return service.href === "#" ? (
                  <article key={service.id} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] transition hover:-translate-y-1 hover:border-gold/50">
                    {content}
                  </article>
                ) : (
                  <Link key={service.id} href={service.href} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] transition hover:-translate-y-1 hover:border-gold/50">
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function VendorServicesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-ink pt-28 text-cream" />}>
      <VendorServicesContent />
    </Suspense>
  );
}
