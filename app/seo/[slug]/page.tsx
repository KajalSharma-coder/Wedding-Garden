import { Metadata } from "next";
import { FloatingCTA } from "@/components/floating-cta";
import { InquiryForm } from "@/components/inquiry-form";
import { Nav } from "@/components/nav";
import { SectionHeading } from "@/components/ui";
import { venues } from "@/lib/data";

const pages: Record<string, { title: string; description: string }> = {
  "wedding-garden-in-jaipur": {
    title: "Wedding Garden in Jaipur",
    description: "Book a premium wedding garden in Jaipur with decor, catering, parking and instant availability."
  },
  "best-marriage-garden": {
    title: "Best Marriage Garden",
    description: "Compare the best marriage gardens with capacity, pricing, amenities and booking support."
  },
  "luxury-wedding-venue-rajasthan": {
    title: "Luxury Wedding Venue Rajasthan",
    description: "Royal wedding venues in Rajasthan for destination weddings and premium celebrations."
  },
  "luxury-wedding-venue": {
    title: "Luxury Wedding Venue",
    description: "Book a luxury wedding venue with premium gardens, decor, catering, vendors and guest support."
  },
  "affordable-wedding-venue": {
    title: "Affordable Wedding Venue",
    description: "Flexible wedding venues and packages for elegant celebrations within budget."
  },
  "destination-wedding-jaipur": {
    title: "Destination Wedding Jaipur",
    description: "Plan a destination wedding in Jaipur with venues, vendors, hotels and guest management."
  }
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return {
    title: page?.title || "Wedding Venue",
    description: page?.description
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug] || pages["wedding-garden-in-jaipur"];

  return (
    <>
      <Nav />
      <main className="bg-ink pt-28">
        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.26em] text-gold">SEO Landing Page</p>
              <h1 className="font-display text-5xl leading-tight md:text-7xl">{page.title}</h1>
              <p className="mt-6 text-lg leading-8 text-cream/75">{page.description}</p>
            </div>
            <InquiryForm compact />
          </div>
        </section>
        <section className="section bg-ivory text-ink">
          <div className="container">
            <SectionHeading eyebrow="Recommended Venues" title="Premium options for your search" />
            <div className="grid gap-4 md:grid-cols-3">
              {venues.map((venue) => (
                <article key={venue.slug} className="rounded-[8px] bg-white p-6 shadow-xl">
                  <h2 className="font-display text-3xl text-maroon">{venue.name}</h2>
                  <p className="mt-3 text-sm text-ink/65">{venue.location}</p>
                  <p className="mt-2 text-sm font-bold">{venue.capacity}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
