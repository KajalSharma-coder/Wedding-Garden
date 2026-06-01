import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, CircleParking, Home, MapPinned, PlugZap, Users } from "lucide-react";
import { FloatingCTA } from "@/components/floating-cta";
import { InquiryForm } from "@/components/inquiry-form";
import { Nav } from "@/components/nav";
import { GhostButton, PrimaryButton, SectionHeading } from "@/components/ui";
import AvailabilityCalendar from "@/components/availability-calendar";
import { gallery, venues } from "@/lib/data";

export function generateStaticParams() {
  return venues.map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = venues.find((item) => item.slug === slug);
  return {
    title: venue ? `${venue.name} Venue Details, Pricing and Booking` : "Venue Details",
    description: venue ? `${venue.name} in ${venue.location}: capacity, pricing, media, amenities and online booking.` : undefined
  };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = venues.find((item) => item.slug === slug);
  if (!venue) notFound();

  const facts = [
    { label: "Capacity", value: venue.capacity, icon: Users },
    { label: "Parking", value: venue.parking, icon: CircleParking },
    { label: "Rooms", value: venue.rooms, icon: Home },
    { label: "Power Backup", value: "Full event backup", icon: PlugZap }
  ];

  return (
    <>
      <Nav />
      <main className="bg-ink pt-20">
        <section className="relative min-h-[72vh] overflow-hidden">
          <Image src={venue.image} alt={venue.name} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
          <div className="container relative z-10 flex min-h-[72vh] items-center">
            <div className="max-w-3xl">
              <p className="mb-4 flex items-center gap-2 text-gold">
                <MapPinned size={18} /> {venue.location}
              </p>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{venue.name}</h1>
              <p className="mt-5 text-lg leading-8 text-cream/78">
                Venue charges, decoration support, catering policy, availability calendar and Razorpay-ready advance booking.
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <PrimaryButton href="#booking">Book Venue</PrimaryButton>
                <GhostButton href="#availability">View Calendar</GhostButton>
              </div>
            </div>
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
          <div className="container grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-maroon">Venue Information</p>
              <h2 className="font-display text-3xl leading-tight text-maroon sm:text-5xl">Designed for day, night and destination weddings</h2>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["AC / Non AC", venue.ac],
                  ["Stage setup", "Designer stage, LED and mandap support"],
                  ["Lawn size", venue.lawn],
                  ["Catering policy", venue.catering],
                  ["Decoration support", "Royal, floral, Rajasthani and custom themes"],
                  ["Additional charges", "Generator, security, late-night extension and valet"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[8px] border border-maroon/10 bg-white p-5">
                    <dt className="text-sm font-bold text-maroon">{label}</dt>
                    <dd className="mt-2 text-sm leading-6 text-ink/70">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.slice(0, 4).map((image, index) => (
                <div key={`${image}-${index}`} className="relative h-56 overflow-hidden rounded-[8px]">
                  <Image src={image} alt={`Venue media ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="availability">
          <div className="container">
            <SectionHeading eyebrow="Availability Calendar" title="Real-time booking calendar foundation" />
            <div className="grid gap-4 md:grid-cols-1">
              {/* Client-side calendar that fetches availability */}
              {/* @ts-ignore */}
              <AvailabilityCalendar slug={venue.slug} blockedDates={venue.blockedDates || []} />
            </div>
          </div>
        </section>

        <section className="section bg-silk" id="booking">
          <div className="container grid gap-8 lg:grid-cols-[1fr_.85fr]">
            <InquiryForm />
            <div className="glass rounded-[8px] p-7">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Pricing</p>
              <h2 className="mt-3 font-display text-4xl">Advance payment and invoice automation</h2>
              <div className="mt-6 space-y-4 text-sm text-cream/75">
                <p>Venue charges: {venue.price}</p>
                <p>Decoration pricing: INR 80,000 to INR 7,50,000</p>
                <p>Catering pricing: INR 950 to INR 2,800 per plate</p>
                <p>Razorpay order creation, receipt, GST invoice and WhatsApp confirmation are wired in the API structure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
