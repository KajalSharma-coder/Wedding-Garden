import Image from "next/image";
import { notFound } from "next/navigation";
import { FloatingCTA } from "@/components/floating-cta";
import { DynamicServiceListing } from "@/components/dynamic-service-listing";
import { Nav } from "@/components/nav";
import { PrimaryButton, SectionHeading } from "@/components/ui";
import { eventTypes, services } from "@/lib/data";

export function generateStaticParams() {
  return eventTypes.map((event) => ({ type: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const event = eventTypes.find((item) => item.slug === type);
  return {
    title: event ? `${event.title} Venue and Event Booking Jaipur` : "Event Booking",
    description: event ? `Book ${event.title.toLowerCase()} venues, services, vendors and packages in Jaipur.` : undefined
  };
}

export default async function EventPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const event = eventTypes.find((item) => item.slug === type);
  if (!event) notFound();

  return (
    <>
      <Nav />
      <main className="bg-ink pt-20">
        <section className="relative min-h-[68vh] overflow-hidden">
          <Image src={event.image} alt={event.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-transparent" />
          <div className="container relative z-10 flex min-h-[68vh] items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.26em] text-gold">Event Landing Page</p>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{event.title} Booking in Jaipur</h1>
              <p className="mt-5 text-lg leading-8 text-cream/78">
                Premium venue selection, decor, catering, entertainment, guest management and instant quote support for your {event.title.toLowerCase()}.
              </p>
              <div className="mt-8">
                <PrimaryButton href="#quick-inquiry">Get Event Quote</PrimaryButton>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Event Services" title={`Everything for a memorable ${event.title.toLowerCase()}`} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((service) => (
                <article key={service.title} className="glass rounded-[8px] p-6">
                  <service.icon className="mb-5 text-gold" size={32} />
                  <h3 className="font-display text-2xl">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-cream/68">{service.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section bg-silk">
          <div className="container">
            <DynamicServiceListing category={event.title} title={`${event.title} Services`} />
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
