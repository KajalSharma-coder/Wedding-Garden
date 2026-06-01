"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BedDouble, CalendarDays, Car, CheckCircle2, MapPin, Phone, Snowflake, Sparkles, Star, Users } from "lucide-react";
import type { GardenDetails } from "@/lib/google-gardens";
import { API_BASE, fetchJson } from "@/lib/api-client";

const GARDEN_API = `${API_BASE}/gardens`;

export function GardenDetailsExperience({ placeId }: { placeId: string }) {
  const [garden, setGarden] = useState<GardenDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson(`${GARDEN_API}/${encodeURIComponent(placeId)}`, { cache: "no-store" })
      .then((data) => {
        if (data.error) setError(data.error);
        setGarden(data.garden || null);
      })
      .catch(() => setError("Unable to load garden details."))
      .finally(() => setLoading(false));
  }, [placeId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ink pt-24 text-ivory">
        <div className="container py-12">
          <div className="h-[62vh] animate-pulse rounded-[8px] bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[8px] bg-white/10" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!garden || error) {
    return (
      <main className="min-h-screen bg-ink pt-24 text-ivory">
        <div className="container py-20">
          <div className="rounded-[8px] border border-gold/25 bg-gold/10 p-6">{error || "Garden not found."}</div>
        </div>
      </main>
    );
  }

  const facts = [
    { label: "Capacity", value: garden.capacity, icon: Users },
    { label: "Parking", value: garden.parking, icon: Car },
    { label: "AC / Non-AC", value: garden.ac, icon: Snowflake },
    { label: "Space", value: garden.indoorOutdoor, icon: Sparkles }
  ];

  return (
    <main className="bg-ink pt-20 text-ivory">
      <section className="relative min-h-[72vh] overflow-hidden">
        <Image src={garden.image} alt={garden.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="container relative z-10 flex min-h-[72vh] items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <p className="mb-4 flex items-center gap-2 text-gold"><MapPin size={18} /> {garden.address}</p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{garden.name}</h1>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-cream/78">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2">{garden.price} per event</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">{garden.rating} rating</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">{garden.distanceKm} km from searched point</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-5 md:grid-cols-4">
          {facts.map((fact) => (
            <article key={fact.label} className="glass rounded-[8px] p-6">
              <fact.icon className="text-gold" size={30} />
              <p className="mt-4 text-sm text-cream/65">{fact.label}</p>
              <strong className="mt-1 block text-lg">{fact.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-ivory text-ink">
        <div className="container grid gap-8 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">Garden Profile</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Price, availability and wedding essentials</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["Price Range", "₹3,00,000 to ₹4,00,000"],
                ["Decoration", "Included"],
                ["Catering", garden.catering],
                ["Indoor/Outdoor", garden.indoorOutdoor],
                ["Nearby Hotels", garden.nearbyHotels.join(", ")],
                ["Parking", garden.parking]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                  <p className="text-sm font-bold text-maroon">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <iframe title={`${garden.name} map`} src={garden.mapEmbed} className="min-h-[420px] w-full rounded-[8px] border border-maroon/10" loading="lazy" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            {garden.gallery.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-64 overflow-hidden rounded-[8px] border border-white/10">
                <Image src={image} alt={`${garden.name} gallery ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-silk">
        <div className="container grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Availability</p>
            <h2 className="mt-3 font-display text-4xl">Real-time availability checker</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {garden.availableDates.map((date) => (
                <div key={date} className="rounded-[8px] border border-gold/25 bg-gold/10 p-4">
                  <CalendarDays className="text-gold" size={20} />
                  <p className="mt-2 text-sm font-bold">{date}</p>
                  <p className="text-xs text-cream/60">Available</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Associated Vendors</p>
            <h2 className="mt-3 font-display text-4xl">Complete wedding service network</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {garden.vendors.map((vendor) => (
                <article key={vendor.category} className="glass rounded-[8px] p-5">
                  <p className="text-sm text-gold">{vendor.category}</p>
                  <h3 className="mt-2 font-display text-2xl">{vendor.name}</h3>
                  <div className="mt-4 flex items-center justify-between text-sm text-cream/70">
                    <span className="flex items-center gap-1"><Star className="fill-gold text-gold" size={16} /> {vendor.rating}</span>
                    <span>{vendor.startingPrice}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a href="tel:+919876543210" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink"><Phone size={15} /> Contact</a>
                    <a href={`https://wa.me/919876543210?text=${encodeURIComponent(`I want ${vendor.category} for ${garden.name}`)}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-ivory">WhatsApp</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-ivory text-ink">
        <div className="container grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">Reviews</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Ratings from Google and recent events</h2>
          </div>
          <div className="grid gap-4">
            {garden.reviews.map((review) => (
              <article key={`${review.author}-${review.text.slice(0, 12)}`} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                <div className="flex items-center gap-2 text-gold"><CheckCircle2 size={18} /> {review.rating}</div>
                <p className="mt-3 text-sm leading-6 text-ink/70">{review.text}</p>
                <strong className="mt-3 block text-sm text-maroon">{review.author}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
