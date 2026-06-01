import { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, MessageCircle } from "lucide-react";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { PrimaryButton } from "@/components/ui";
import { getServiceBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Your Royal Vivah Gardens booking request has been received."
};

export default async function ConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{ bookingId?: string; service?: string }>;
}) {
  const params = await searchParams;
  const service = params.service ? getServiceBySlug(params.service) : undefined;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-28">
        <section className="section">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-gold text-ink shadow-glow">
              <BadgeCheck size={38} />
            </div>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.26em] text-gold">Booking Request Received</p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-ivory sm:text-6xl">Thank you for your booking inquiry</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-cream/75">
              {service ? `Your ${service.title} request has been saved.` : "Your request has been saved."} Our concierge team will review the details and contact you with availability, package guidance and advance payment steps.
            </p>
            {params.bookingId ? (
              <div className="mx-auto mt-8 max-w-md rounded-[8px] border border-gold/25 bg-white/[0.04] p-5">
                <p className="text-sm text-cream/60">Booking ID</p>
                <p className="mt-1 font-display text-3xl text-gold">{params.bookingId}</p>
              </div>
            ) : null}
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { title: "Request saved", icon: BadgeCheck, text: "Your details are stored in the booking system." },
                { title: "Concierge review", icon: CalendarCheck, text: "We check date, package and service availability." },
                { title: "Quick follow-up", icon: MessageCircle, text: "You receive next steps over call or WhatsApp." }
              ].map((item) => (
                <article key={item.title} className="glass rounded-[8px] p-5 text-left">
                  <item.icon className="text-gold" size={26} />
                  <h2 className="mt-4 font-display text-2xl text-ivory">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-cream/68">{item.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PrimaryButton href={service ? `/services/${service.slug}` : "/"}>Back to Service</PrimaryButton>
              <Link
                href="https://wa.me/919876543210"
                className="focus-ring inline-flex items-center justify-center rounded-full border border-cream/25 px-6 py-3 text-sm font-bold text-ivory transition hover:border-gold hover:bg-white/10"
              >
                WhatsApp Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
