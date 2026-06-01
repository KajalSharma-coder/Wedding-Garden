"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, CreditCard, Loader2, Lock, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingModal } from "@/components/booking-modal";
import { LocalMedia } from "@/components/local-media";
import type { ListingItem } from "@/lib/service-system";

type DetailProps = {
  item: ListingItem;
  title: string;
  backHref: string;
  similar: ListingItem[];
  privacyMode?: boolean;
};

export function ServiceDetailExperience({ item, title, backHref, similar, privacyMode = false }: DetailProps) {
  const [active, setActive] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(!privacyMode);
  const [unlocked, setUnlocked] = useState(!privacyMode);
  const [checkingUnlock, setCheckingUnlock] = useState(privacyMode);
  const [processingUnlock, setProcessingUnlock] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const images = item.gallery.length ? item.gallery : [item.image];

  const reveal = () => setContactRevealed(true);
  const goTo = (index: number) => setActive((index + images.length) % images.length);

  useEffect(() => {
    if (!privacyMode) return;
    const isUnlocked = window.sessionStorage.getItem(`rv_unlocked_listing_${item.slug}`) === "true";
    setUnlocked(isUnlocked);
    setContactRevealed(isUnlocked);
    setCheckingUnlock(false);
  }, [item.slug, privacyMode]);

  function unlockDetails() {
    setProcessingUnlock(true);
    window.setTimeout(() => {
      window.sessionStorage.setItem(`rv_unlocked_listing_${item.slug}`, "true");
      setUnlocked(true);
      setContactRevealed(true);
      setProcessingUnlock(false);
    }, 900);
  }

  if (checkingUnlock) {
    return <main className="min-h-screen bg-ink pt-24 text-ivory" />;
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-ink pt-20 text-ivory">
        <section className="relative min-h-[78vh] overflow-hidden">
          <LocalMedia src={item.image} alt={item.title} className="absolute inset-0 blur-sm" overlay />
          <div className="absolute inset-0 bg-ink/78" />
          <div className="container relative z-10 flex min-h-[78vh] items-center justify-center py-16">
            <div className="w-full max-w-xl rounded-[8px] border border-gold/25 bg-white/[0.06] p-6 text-center backdrop-blur">
              <Lock className="mx-auto text-gold" size={42} />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.24em] text-gold">Locked Garden Details</p>
              <h1 className="mt-3 font-display text-4xl">{item.title}</h1>
              <p className="mt-3 text-sm leading-6 text-cream/70">Pay INR 99 to unlock exact address, phone, map, gallery and booking details.</p>
              <button type="button" disabled={processingUnlock} onClick={unlockDetails} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:opacity-70">
                {processingUnlock ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                {processingUnlock ? "Processing Payment" : "Pay and Unlock Details"}
              </button>
              <Link href={backHref} className="mt-4 inline-flex text-sm font-bold text-cream/75 hover:text-gold">Back to {title}</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-ink pt-20 text-ivory">
      <section className="relative min-h-[74vh] overflow-hidden">
        <LocalMedia src={images[active]} alt={item.title} className="absolute inset-0 transition duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/24" />
        <div className="container relative z-10 flex min-h-[74vh] items-center">
          <div className="max-w-4xl py-16">
            <Link href={backHref} className="mb-6 inline-flex text-sm font-bold text-gold">Back to {title}</Link>
            <p className="flex items-center gap-2 text-gold"><MapPin size={18} /> {contactRevealed ? item.exactAddress : item.area}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{item.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-cream/78">{item.fullDescription}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => { reveal(); setBookingOpen(true); }} className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-cream">
                Book Now
              </button>
              <a onClick={reveal} href={`https://wa.me/${item.whatsapp}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-ivory transition hover:border-gold">
                <MessageCircle size={17} /> WhatsApp Inquiry
              </a>
              <a onClick={reveal} href={`tel:${item.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-ivory transition hover:border-gold">
                <Phone size={17} /> Call Now
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          <button type="button" onClick={() => goTo(active - 1)} className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/60 text-ivory backdrop-blur" aria-label="Previous image">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/60 text-ivory backdrop-blur" aria-label="Next image">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            {images.map((image, index) => (
              <button key={`${image}-${index}`} type="button" onClick={() => { setActive(index); setLightbox(image); }} className="h-44 overflow-hidden rounded-[8px] border border-white/10 text-left transition hover:border-gold">
                <LocalMedia src={image} alt={`${item.title} gallery ${index + 1}`} className="h-full" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-ivory text-ink">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">Information</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Services, amenities and pricing</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["Price", item.priceRange],
                ["Rating", `${item.rating}/5`],
                ["Timings", item.timings],
                ["Availability", item.availability],
                ["Capacity", item.capacity || "As per package"],
                ["Indoor / Outdoor", item.indoorOutdoor || "As per event setup"],
                ["Parking", item.parking || "Available on request"],
                ["Contact", contactRevealed ? `${item.phone} · ${item.contactName}` : "Revealed after details / booking"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                  <p className="text-sm font-bold text-maroon">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
            <h3 className="font-display text-3xl text-maroon">Map Section</h3>
            <p className="mt-2 text-sm leading-7 text-ink/65">
              {contactRevealed ? item.exactAddress : "Exact map location is hidden until the detail action or booking request is made."}
            </p>
            <iframe title={`${item.title} map`} src={`https://www.google.com/maps?q=${encodeURIComponent(contactRevealed ? item.mapQuery : item.area)}&output=embed`} className="mt-5 h-72 w-full rounded-[8px] border border-maroon/10" loading="lazy" />
            {!contactRevealed ? (
              <button type="button" onClick={reveal} className="mt-4 w-full rounded-full bg-maroon px-5 py-3 text-sm font-bold text-ivory">
                Reveal Contact Details
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section bg-silk">
        <div className="container grid gap-8 lg:grid-cols-3">
          <Panel title="Services Included" items={item.servicesIncluded} />
          <Panel title="Amenities / Features" items={item.amenities} />
          <div className="glass rounded-[8px] p-6">
            <h2 className="font-display text-3xl text-ivory">Price Packages</h2>
            <div className="mt-5 grid gap-3">
              {item.packages.map((pkg) => (
                <div key={pkg.name} className="rounded-[8px] border border-white/12 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-gold">{pkg.name}</strong>
                    <span className="text-sm font-bold">{pkg.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-cream/70">{pkg.includes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-ivory text-ink">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">Reviews</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Ratings and reviews</h2>
            <div className="mt-6 grid gap-4">
              {item.reviews.map((review) => (
                <article key={review.name} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-gold"><Star className="fill-gold" size={17} /> {review.rating}</div>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{review.text}</p>
                  <strong className="mt-3 block text-sm text-maroon">{review.name}</strong>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">FAQ</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Common questions</h2>
            <div className="mt-6 grid gap-4">
              {item.faqs.map((faq) => (
                <article key={faq.question} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                  <h3 className="font-display text-2xl text-maroon">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/70">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-ink">
        <div className="container">
          <h2 className="font-display text-4xl text-ivory">Similar {title}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {similar.map((similarItem) => (
              <Link key={similarItem.slug} href={`${backHref}/${similarItem.slug}`} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.05] transition hover:-translate-y-1 hover:border-gold/45">
                <LocalMedia src={similarItem.image} alt={similarItem.title} className="h-48" overlay />
                <div className="p-5">
                  <h3 className="font-display text-2xl text-ivory">{similarItem.title}</h3>
                  <p className="mt-2 text-sm text-cream/70">{similarItem.area}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => { reveal(); setBookingOpen(true); }} className="rounded-full bg-gold px-3 py-3 text-xs font-bold text-ink">Book Now</button>
          <a onClick={reveal} href={`https://wa.me/${item.whatsapp}`} className="rounded-full border border-white/15 px-3 py-3 text-center text-xs font-bold text-ivory">WhatsApp</a>
          <a onClick={reveal} href={`tel:${item.phone.replaceAll(" ", "")}`} className="rounded-full border border-white/15 px-3 py-3 text-center text-xs font-bold text-ivory">Call</a>
        </div>
      </div>

      {lightbox ? (
        <button type="button" onClick={() => setLightbox(null)} className="fixed inset-0 z-[95] grid place-items-center bg-ink/90 p-4 backdrop-blur" aria-label="Close enlarged image">
          <LocalMedia src={lightbox} alt={`${item.title} enlarged`} className="h-[80vh] w-full max-w-5xl rounded-[8px] border border-gold/25" />
        </button>
      ) : null}

      <BookingModal title={item.title} open={bookingOpen} onClose={() => setBookingOpen(false)} onReveal={reveal} />
    </main>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass rounded-[8px] p-6">
      <h2 className="font-display text-3xl text-ivory">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-[8px] border border-white/12 bg-white/8 p-4 text-sm font-semibold text-cream/78">{item}</div>
        ))}
      </div>
    </div>
  );
}
