"use client";

import Link from "next/link";
import { CreditCard, Heart, Loader2, Lock, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocalMedia } from "@/components/local-media";
import type { ListingItem, ServiceCategory } from "@/lib/service-system";

type SerializableServiceCategory = Omit<ServiceCategory, "icon">;

export function ServiceListingExperience({ service, basePath }: { service: SerializableServiceCategory; basePath: string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("rating");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockItem, setUnlockItem] = useState<ListingItem | null>(null);
  const detailsLocked = basePath === "/gardens";

  const items = useMemo(() => {
    const filtered = service.items.filter((item) =>
      `${item.title} ${item.area} ${item.shortDescription}`.toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sort === "price") return a.priceRange.localeCompare(b.priceRange);
      if (sort === "name") return a.title.localeCompare(b.title);
      return b.rating - a.rating;
    });
  }, [query, service.items, sort]);

  function toggleFavorite(slug: string) {
    setFavorites((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  return (
    <main className="min-h-screen bg-ink pt-20 text-ivory">
      <section className="relative overflow-hidden border-b border-white/10">
        <LocalMedia src={service.heroImage} alt={service.pageTitle} className="absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,9,12,.94),rgba(42,7,16,.72),rgba(17,9,12,.42))]" />
        <div className="container relative z-10 py-16 md:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-gold">Royal Vivah Services</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{service.pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-cream/76 md:text-lg">{service.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 grid gap-3 rounded-[8px] border border-gold/20 bg-white/[0.06] p-3 backdrop-blur md:grid-cols-[1fr_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${service.title.toLowerCase()}, area or style`}
                className="h-14 w-full rounded-[8px] border border-white/12 bg-ink/75 pl-12 pr-4 text-ivory outline-none transition focus:border-gold"
              />
            </label>
            <label className="relative">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-14 rounded-[8px] border border-white/12 bg-ink/75 pl-12 pr-10 text-sm font-bold text-ivory outline-none transition focus:border-gold">
                <option value="rating">Sort by rating</option>
                <option value="price">Sort by price</option>
                <option value="name">Sort by name</option>
              </select>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.slug} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.055] shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold/45">
                <div className="relative h-64">
                  <LocalMedia src={item.image} alt={item.title} className="h-full transition duration-700 group-hover:scale-105" overlay />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.slug)}
                    className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-ink/72 text-gold backdrop-blur"
                    aria-label="Add to wishlist"
                  >
                    <Heart className={favorites.includes(item.slug) ? "fill-gold" : ""} size={18} />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h2 className="font-display text-3xl leading-tight text-ivory">{item.title}</h2>
                    <p className="mt-1 text-sm text-cream/72">{item.area}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold">
                      <Star className="fill-gold" size={15} /> {item.rating}
                    </span>
                    <strong className="text-sm text-gold">{item.priceRange}</strong>
                  </div>
                  <p className="mt-4 min-h-14 text-sm leading-7 text-cream/72">{item.shortDescription}</p>
                  {detailsLocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.sessionStorage.getItem(`rv_unlocked_listing_${item.slug}`) === "true") {
                          window.location.href = `${basePath}/${item.slug}`;
                          return;
                        }
                        setUnlockItem(item);
                      }}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
                    >
                      <Lock size={15} /> View Details
                    </button>
                  ) : (
                    <Link href={`${basePath}/${item.slug}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream">
                      View Details
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {unlockItem ? <GardenUnlockModal item={unlockItem} href={`${basePath}/${unlockItem.slug}`} onClose={() => setUnlockItem(null)} /> : null}
      </AnimatePresence>
    </main>
  );
}

function GardenUnlockModal({ item, href, onClose }: { item: ListingItem; href: string; onClose: () => void }) {
  const [processing, setProcessing] = useState(false);

  function unlock() {
    setProcessing(true);
    window.setTimeout(() => {
      window.sessionStorage.setItem(`rv_unlocked_listing_${item.slug}`, "true");
      window.location.href = href;
    }, 900);
  }

  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-ink/85 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-lg rounded-[8px] border border-gold/25 bg-[#150b0f] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Locked Garden Details</p>
            <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-cream/70">Exact address, phone number, map, packages and full gallery unlock after a small access payment.</p>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/15 text-cream" onClick={onClose} aria-label="Close unlock modal">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-[8px] border border-gold/25 bg-gold/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-cream/70">Details unlock fee</p>
              <strong className="mt-1 block text-3xl text-gold">INR 99</strong>
            </div>
            <Lock className="text-gold" size={34} />
          </div>
          <p className="mt-4 text-xs leading-5 text-cream/62">Payment success unlocks this garden in the current browser session.</p>
        </div>

        <button type="button" disabled={processing} onClick={unlock} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:opacity-70">
          {processing ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
          {processing ? "Processing Payment" : "Pay and Unlock Details"}
        </button>
      </motion.div>
    </motion.div>
  );
}
