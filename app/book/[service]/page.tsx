import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { FloatingCTA } from "@/components/floating-cta";
import { LocalMedia } from "@/components/local-media";
import { Nav } from "@/components/nav";
import { ServiceBookingForm } from "@/components/service-booking-form";
import { getServiceBySlug, services } from "@/lib/data";
import { getMarketplaceServiceBySlug } from "@/lib/marketplace-store";

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);
  const marketplaceService = service ? null : await getMarketplaceServiceBySlug(slug);
  const title = service?.title || marketplaceService?.name;

  return {
    title: title ? `Book ${title}` : "Book Wedding Service",
    description: title ? `Submit a booking request for ${title} with date, location, budget, package and advance payment preference.` : undefined,
    alternates: { canonical: `/book/${slug}` }
  };
}

export default async function BookServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);
  const marketplaceService = service ? null : await getMarketplaceServiceBySlug(slug);
  if (!service && !marketplaceService) notFound();

  const bookingService = service
    ? { slug: service.slug, title: service.title, packages: service.packages, heroImage: service.heroImage, tagline: service.tagline, icon: service.icon }
    : {
        id: marketplaceService!.id,
        slug: marketplaceService!.slug,
        title: marketplaceService!.name,
        packages: [],
        heroImage: marketplaceService!.image,
        tagline: marketplaceService!.description || marketplaceService!.category,
        icon: null
      };

  return (
    <>
      <Nav />
      <main className="relative min-h-screen overflow-hidden bg-ink pt-28">
        <LocalMedia src={bookingService.heroImage} alt={bookingService.title} className="absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,5,7,.96),rgba(17,9,12,.84),rgba(17,9,12,.64))]" />
        <section className="section relative z-10">
          <div className="container">
            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-cream/70" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-gold">Home</Link>
              <ChevronRight size={15} />
              <Link href={service ? `/services/${service.slug}` : `/services/${marketplaceService!.category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")}/${marketplaceService!.slug}`} className="transition hover:text-gold">{bookingService.title}</Link>
              <ChevronRight size={15} />
              <span className="text-gold">Book</span>
            </nav>
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div className="animate-[fadeUp_.7s_ease-out_both]">
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Service Booking</p>
                <h1 className="mt-4 font-display text-5xl leading-tight text-ivory sm:text-6xl">Book {bookingService.title}</h1>
                <p className="mt-5 text-lg leading-8 text-cream/78">{bookingService.tagline}</p>
                <div className="mt-8 rounded-[8px] border border-gold/20 bg-white/[0.04] p-5">
                  {bookingService.icon ? <bookingService.icon className="text-gold" size={34} /> : null}
                  <h2 className="mt-4 font-display text-3xl text-ivory">What happens next?</h2>
                  <p className="mt-3 text-sm leading-7 text-cream/68">
                    Your booking request is saved, our concierge reviews your date and package, then shares availability, quote details and advance payment next steps.
                  </p>
                </div>
              </div>
              <ServiceBookingForm service={{ id: bookingService.id, slug: bookingService.slug, title: bookingService.title, packages: bookingService.packages }} />
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
