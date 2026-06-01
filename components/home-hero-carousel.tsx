"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { carouselSlides } from "@/lib/service-system";

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % carouselSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => setActive((index + carouselSlides.length) % carouselSlides.length);
  const slide = carouselSlides[active];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {carouselSlides.map((item, index) => (
        <div
          key={item.title}
          className={`absolute inset-0 transition duration-1000 ease-in-out ${
            index === active ? "translate-x-0 opacity-100 scale-100" : "-translate-x-4 opacity-0 scale-98 pointer-events-none"
          }`}
          aria-hidden={index !== active}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,9,12,.88),rgba(42,7,16,.58),rgba(17,9,12,.22))]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink to-transparent" />
      <div className="container relative z-10 flex min-h-screen items-center pt-24">
        <div className="max-w-3xl py-20">
          <p className="mb-5 inline-flex rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-gold backdrop-blur">
            Luxury Indian Wedding Venue
          </p>
          <div className="min-h-[220px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <h1 className="font-display text-4xl leading-[1.04] text-ivory sm:text-5xl md:text-7xl lg:text-8xl">{slide.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-cream/82">{slide.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
            <Link href="#quick-inquiry" className="focus-ring inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-cream">
              Book Now
            </Link>
            <Link href="#services" className="focus-ring inline-flex items-center justify-center rounded-full border border-cream/25 px-6 py-3 text-sm font-bold text-ivory transition hover:border-gold hover:bg-white/10">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <button type="button" onClick={() => goTo(active - 1)} className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/50 text-ivory backdrop-blur transition hover:border-gold" aria-label="Previous slide">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {carouselSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition ${index === active ? "w-8 bg-gold" : "w-2.5 bg-cream/45 hover:bg-cream"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => goTo(active + 1)} className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/50 text-ivory backdrop-blur transition hover:border-gold" aria-label="Next slide">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

